import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Activity, Category, Region } from '../data/types';
import {
  ATTRACTIONS_CATALOG,
  type CatalogEntry,
  inferCategoryFromOSM,
  inferRegionFromCoords,
  searchCatalog,
} from '../data/attractions_catalog';

export type SearchSource = 'catalog' | 'wikipedia' | 'osm';

export interface SearchResult {
  source: SearchSource;
  name: string;
  description?: string;
  thumb?: string;
  lat?: number;
  lon?: number;
  url?: string;
  inferredCategory?: Category;
  inferredRegion?: Region;
  // raw catalog payload (only present for catalog rows)
  catalog?: CatalogEntry;
}

/** Patch the Activity draft when a search result is tapped. */
export type ApplyFn = (patch: Partial<Activity>) => void;

const CACHE_PREFIX = 'tnf_search_v2:';
const TTL_MS = 10 * 60 * 1000;

// Tenerife bbox: lon_left, lat_top, lon_right, lat_bottom (Nominatim viewbox)
// Overpass bbox (S, W, N, E)
const TNF_LAT_MIN = 27.95;
const TNF_LAT_MAX = 28.65;
const TNF_LON_MIN = -16.95;
const TNF_LON_MAX = -16.05;
const NOMINATIM_VIEWBOX = '-16.95,28.62,-16.10,27.99';
const OVERPASS_BBOX = '27.95,-16.95,28.65,-16.05';

function inTenerife(lat?: number, lon?: number): boolean {
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
  return lat >= TNF_LAT_MIN && lat <= TNF_LAT_MAX && lon >= TNF_LON_MIN && lon <= TNF_LON_MAX;
}

interface CacheEntry { ts: number; results: SearchResult[]; }

function readCache(key: string): SearchResult[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const e = JSON.parse(raw) as CacheEntry;
    if (Date.now() - e.ts > TTL_MS) return null;
    return Array.isArray(e.results) ? e.results : null;
  } catch { return null; }
}

function writeCache(key: string, results: SearchResult[]) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), results }));
  } catch {}
}

// Normalize name for dedupe: lowercase, strip diacritics, drop common type-prefixes
function normalizeName(s: string): string {
  const lower = s.toLowerCase().trim();
  const noDiacritics = lower.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return noDiacritics
    .replace(/^(hotel|hostel|restaurant|bar|cafe|cafeteria|museum|playa|beach|parque|park|mirador)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Timeout helper
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); resolve(v); })
     .catch(e => { clearTimeout(t); reject(e); });
  });
}

interface WikipediaSummary {
  title: string;
  extract?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
  coordinates?: { lat: number; lon: number };
}

// Common type-keyword detector → Overpass query fragment
// Matches Hebrew + English. Returns null for non-type queries.
function detectOverpassFilter(query: string): string | null {
  const q = query.toLowerCase().trim();
  // Normalize Hebrew too
  const map: Array<{ keys: string[]; filter: string }> = [
    { keys: ['hotel', 'hotels', 'מלון', 'מלונות', 'בית מלון'], filter: 'nwr[tourism=hotel]' },
    { keys: ['restaurant', 'restaurants', 'מסעדה', 'מסעדות'], filter: 'nwr[amenity=restaurant]' },
    { keys: ['beach', 'beaches', 'חוף', 'חופים'], filter: 'nwr[natural=beach]' },
    { keys: ['bar', 'bars', 'בר', 'ברים'], filter: 'nwr[amenity=bar]' },
    { keys: ['cafe', 'coffee', 'בית קפה', 'בתי קפה', 'קפה'], filter: 'nwr[amenity=cafe]' },
    { keys: ['shop', 'shopping', 'שופינג', 'חנות', 'חנויות'], filter: 'nwr[shop]' },
    { keys: ['museum', 'museums', 'מוזיאון', 'מוזיאונים'], filter: 'nwr[tourism=museum]' },
    { keys: ['viewpoint', 'תצפית', 'תצפיות', 'mirador'], filter: 'nwr[tourism=viewpoint]' },
    { keys: ['park', 'parks', 'פארק', 'פארקים', 'parque'], filter: 'nwr[leisure=park]' },
    { keys: ['club', 'nightclub', 'מועדון', 'מועדונים'], filter: 'nwr[amenity=nightclub]' },
  ];
  for (const m of map) {
    if (m.keys.some(k => q === k || q.includes(k))) return m.filter;
  }
  return null;
}

async function fetchWikipedia(query: string): Promise<SearchResult[]> {
  const isType = detectOverpassFilter(query) !== null;
  // For type queries, search raw query (no +tenerife) AND with +tenerife, then merge.
  // For specific queries, just append "tenerife" for regional context.
  const queries: string[] = isType
    ? [query, `${query} tenerife`]
    : [`${query} tenerife`];

  try {
    const allTitles = new Map<string, { title: string; desc?: string; url?: string }>();
    await Promise.all(queries.map(async (qStr) => {
      const url = `https://en.wikipedia.org/w/api.php?action=opensearch&limit=15&namespace=0&format=json&origin=*&search=${encodeURIComponent(qStr)}`;
      const res = await withTimeout(fetch(url), 5000);
      if (!res.ok) return;
      const data = await res.json();
      const titles: string[] = data?.[1] || [];
      const descs: string[] = data?.[2] || [];
      const urls: string[] = data?.[3] || [];
      titles.forEach((t, i) => {
        if (!allTitles.has(t)) {
          allTitles.set(t, { title: t, desc: descs[i], url: urls[i] });
        }
      });
    }));

    const titleList = Array.from(allTitles.values()).slice(0, 15);

    // Pre-fetch summaries (thumbnails + coords) for top 12 in parallel.
    const top = titleList.slice(0, 12);
    const summaries = await Promise.all(
      top.map(t =>
        withTimeout(
          fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.title.replace(/ /g, '_'))}?redirect=true`)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null) as Promise<WikipediaSummary | null>,
          5000
        ).catch(() => null)
      )
    );

    const out: SearchResult[] = titleList.map((entry, i) => {
      const sm = i < summaries.length ? summaries[i] : null;
      const lat = sm?.coordinates?.lat;
      const lon = sm?.coordinates?.lon;
      return {
        source: 'wikipedia' as const,
        name: entry.title,
        description: sm?.extract || entry.desc || undefined,
        thumb: sm?.thumbnail?.source,
        url: sm?.content_urls?.desktop?.page || entry.url,
        lat, lon,
        inferredRegion: (typeof lat === 'number' && typeof lon === 'number')
          ? inferRegionFromCoords(lat, lon) : undefined,
      };
    });

    // Filter: if article has coords, must be inside Tenerife. If no coords, keep it.
    return out.filter(r => {
      if (typeof r.lat === 'number' && typeof r.lon === 'number') {
        return inTenerife(r.lat, r.lon);
      }
      return true; // keep coordless articles (marked as general)
    });
  } catch { return []; }
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

async function fetchNominatim(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=25&addressdetails=1&extratags=1&accept-language=he,en&viewbox=${NOMINATIM_VIEWBOX}&bounded=1`;
    const res = await withTimeout(fetch(url), 5000);
    if (!res.ok) return [];
    const data = (await res.json()) as NominatimResult[];
    return data.map(r => {
      const lat = parseFloat(r.lat);
      const lon = parseFloat(r.lon);
      const first = r.display_name.split(',')[0]?.trim() || r.display_name;
      return {
        source: 'osm' as const,
        name: first,
        description: r.display_name,
        lat, lon,
        inferredRegion: !isNaN(lat) && !isNaN(lon) ? inferRegionFromCoords(lat, lon) : undefined,
        inferredCategory: inferCategoryFromOSM(r.type, r.class, r.display_name),
      };
    }).filter(r => inTenerife(r.lat, r.lon));
  } catch { return []; }
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function fetchOverpass(query: string): Promise<SearchResult[]> {
  const filter = detectOverpassFilter(query);
  if (!filter) return [];
  try {
    const body = `[out:json][timeout:15];(${filter}(${OVERPASS_BBOX}););out center 50;`;
    const res = await withTimeout(
      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(body),
      }),
      15000
    );
    if (!res.ok) return [];
    const data = await res.json();
    const elements: OverpassElement[] = data?.elements || [];
    const out: SearchResult[] = [];
    for (const el of elements) {
      const lat = el.center?.lat ?? el.lat;
      const lon = el.center?.lon ?? el.lon;
      if (typeof lat !== 'number' || typeof lon !== 'number') continue;
      if (!inTenerife(lat, lon)) continue;
      const tags = el.tags || {};
      const name = tags['name:he'] || tags['name:en'] || tags['name'] || tags['name:es'];
      if (!name) continue;
      const descParts: string[] = [];
      if (tags['addr:city']) descParts.push(tags['addr:city']);
      if (tags['addr:street']) descParts.unshift(tags['addr:street']);
      if (tags['cuisine']) descParts.push(tags['cuisine']);
      out.push({
        source: 'osm',
        name,
        description: descParts.join(', ') || undefined,
        lat, lon,
        inferredRegion: inferRegionFromCoords(lat, lon),
        inferredCategory: inferCategoryFromOSM(undefined, undefined, name),
      });
    }
    return out;
  } catch { return []; }
}

function catalogToResult(e: CatalogEntry): SearchResult {
  return {
    source: 'catalog',
    name: e.name,
    description: e.description,
    inferredCategory: e.suggestedCategory,
    inferredRegion: e.suggestedRegion,
    url: e.sourceUrl,
    catalog: e,
  };
}

function SourceChip({ src }: { src: SearchSource }) {
  const label = src === 'catalog' ? 'מהמסלול' : src === 'wikipedia' ? 'Wiki' : 'OSM';
  const cls = src === 'catalog'
    ? 'bg-sunset-100 text-sunset-700'
    : src === 'wikipedia'
      ? 'bg-ocean-100 text-ocean-700'
      : 'bg-zinc-100 text-zinc-600';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls} flex-shrink-0`}>{label}</span>
  );
}

interface SectionProps {
  title: string;
  results: SearchResult[];
  loading: boolean;
  currentName?: string;
  onPick: (r: SearchResult) => void;
}

function ResultRow({ r, active, onPick }: { r: SearchResult; active: boolean; onPick: (r: SearchResult) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(r)}
        className={`w-full flex items-center gap-2 rounded-xl bg-white border px-2.5 py-2 text-right hover:border-ocean-300 transition ${active ? 'border-sunset-400 ring-1 ring-sunset-300' : 'border-ocean-100'}`}
      >
        <div className="w-10 h-10 rounded-lg bg-ocean-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {r.thumb ? (
            <img src={r.thumb} alt="" className="w-full h-full object-cover"
                 onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span aria-hidden="true" className="text-base">📍</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-ocean-900 truncate">{r.name}</span>
            <SourceChip src={r.source} />
            {r.source === 'wikipedia' && typeof r.lat !== 'number' && (
              <span className="text-[9px] text-zinc-400">כללי</span>
            )}
          </div>
          {r.description && (
            <div className="text-[11px] text-zinc-500 truncate">{r.description}</div>
          )}
        </div>
      </button>
    </li>
  );
}

function Section({ title, results, loading, currentName, onPick }: SectionProps) {
  if (!loading && results.length === 0) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] font-bold text-ocean-800">{title} ({results.length})</span>
        {loading && (
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-ocean-200 border-t-ocean-600 animate-spin" />
            מחפש…
          </span>
        )}
      </div>
      {results.length > 0 && (
        <ul className="space-y-1.5">
          {results.map((r, i) => {
            const active = !!currentName && currentName.trim().toLowerCase() === r.name.trim().toLowerCase();
            return <ResultRow key={`${r.source}-${i}-${r.name}`} r={r} active={active} onPick={onPick} />;
          })}
        </ul>
      )}
    </div>
  );
}

export function AttractionSearch({ apply, currentName }: { apply: ApplyFn; currentName?: string }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loadingWiki, setLoadingWiki] = useState(false);
  const [loadingOsm, setLoadingOsm] = useState(false);
  const [wikiResults, setWikiResults] = useState<SearchResult[]>([]);
  const [osmResults, setOsmResults] = useState<SearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const lastAppliedRef = useRef<string | null>(null);

  // Debounce 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  // Catalog filter is synchronous + instant.
  const catalogResults = useMemo<SearchResult[]>(() => {
    if (!debounced) return [];
    return searchCatalog(debounced, 12).map(catalogToResult);
  }, [debounced]);

  // Live web fetch (debounced) for Wikipedia and OSM (Nominatim + Overpass).
  useEffect(() => {
    if (!debounced || debounced.length < 2) {
      setWikiResults([]); setOsmResults([]);
      setLoadingWiki(false); setLoadingOsm(false);
      setHasMore(false);
      return;
    }
    const cached = readCache(debounced);
    if (cached) {
      const wiki = cached.filter(r => r.source === 'wikipedia');
      const osm = cached.filter(r => r.source === 'osm');
      setWikiResults(wiki); setOsmResults(osm);
      setLoadingWiki(false); setLoadingOsm(false);
      setHasMore(osm.length >= 25);
      return;
    }

    let cancelled = false;
    setLoadingWiki(true); setLoadingOsm(true);
    setWikiResults([]); setOsmResults([]);

    // Wikipedia fires independently
    fetchWikipedia(debounced).then(wiki => {
      if (cancelled) return;
      // Dedupe within wiki by normalized name
      const seen = new Set<string>();
      const out: SearchResult[] = [];
      for (const r of wiki) {
        const k = normalizeName(r.name);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(r);
      }
      setWikiResults(out);
      setLoadingWiki(false);
    }).catch(() => { if (!cancelled) setLoadingWiki(false); });

    // OSM: Nominatim + (optional) Overpass in parallel
    Promise.all([fetchNominatim(debounced), fetchOverpass(debounced)]).then(([nom, ovp]) => {
      if (cancelled) return;
      // Merge, dedupe by normalized name. Prefer Overpass entries first (richer tags).
      const seen = new Set<string>();
      const merged: SearchResult[] = [];
      for (const r of [...ovp, ...nom]) {
        const k = normalizeName(r.name);
        if (!k || seen.has(k)) continue;
        seen.add(k);
        merged.push(r);
      }
      // Sort alphabetically for stability
      merged.sort((a, b) => a.name.localeCompare(b.name));
      setOsmResults(merged);
      setLoadingOsm(false);
      setHasMore(nom.length >= 25 || ovp.length >= 50);
    }).catch(() => { if (!cancelled) setLoadingOsm(false); });

    return () => { cancelled = true; };
  }, [debounced]);

  // Cache combined results after both finish.
  useEffect(() => {
    if (!debounced) return;
    if (loadingWiki || loadingOsm) return;
    if (wikiResults.length === 0 && osmResults.length === 0) return;
    writeCache(debounced, [...wikiResults, ...osmResults]);
  }, [debounced, loadingWiki, loadingOsm, wikiResults, osmResults]);

  // Dedupe wiki vs catalog and osm vs (catalog+wiki) by normalized name
  const filteredWiki = useMemo(() => {
    const cs = new Set(catalogResults.map(r => normalizeName(r.name)));
    return wikiResults.filter(r => !cs.has(normalizeName(r.name)));
  }, [catalogResults, wikiResults]);

  const filteredOsm = useMemo(() => {
    const cs = new Set([
      ...catalogResults.map(r => normalizeName(r.name)),
      ...filteredWiki.map(r => normalizeName(r.name)),
    ]);
    return osmResults.filter(r => !cs.has(normalizeName(r.name)));
  }, [catalogResults, filteredWiki, osmResults]);

  const totalCount = catalogResults.length + filteredWiki.length + filteredOsm.length;
  const anyLoading = loadingWiki || loadingOsm;
  const showEmpty = !!debounced && !anyLoading && totalCount === 0;

  function handlePick(r: SearchResult) {
    lastAppliedRef.current = r.name;
    const patch: Partial<Activity> = { name: r.name };
    if (r.catalog) {
      patch.category = r.catalog.suggestedCategory;
      patch.region = r.catalog.suggestedRegion;
      patch.costLevel = r.catalog.suggestedCostLevel;
      if (r.catalog.description) patch.description = r.catalog.description;
      if (r.catalog.mapsUrl) patch.mapsUrl = r.catalog.mapsUrl;
      if (r.catalog.sourceUrl) patch.sourceUrl = r.catalog.sourceUrl;
    } else {
      patch.category = r.inferredCategory || 'אחר';
      patch.region = r.inferredRegion || 'מחוץ לטנריף';
      patch.costLevel = 2;
      if (r.description) patch.description = r.description;
      if (r.url) patch.sourceUrl = r.url;
      if (typeof r.lat === 'number' && typeof r.lon === 'number') {
        patch.mapsUrl = `https://maps.google.com/?q=${r.lat},${r.lon}`;
      }
    }
    apply(patch);
  }

  function handleClear() {
    setQ('');
    setDebounced('');
    setWikiResults([]);
    setOsmResults([]);
    if (lastAppliedRef.current) {
      apply({
        name: '',
        description: undefined,
        mapsUrl: undefined,
        sourceUrl: undefined,
      });
      lastAppliedRef.current = null;
    }
  }

  function handleLoadMore() {
    // Bust cache and force refetch (simple — Nominatim/Overpass do not have stable offset)
    try { localStorage.removeItem(CACHE_PREFIX + debounced); } catch {}
    // re-trigger by toggling debounced
    const cur = debounced;
    setDebounced('');
    setTimeout(() => setDebounced(cur), 0);
  }

  return (
    <div className="rounded-2xl border border-ocean-100 bg-ocean-50/40 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="חפש מקום… (למשל: Teide, חוף, מסעדה)"
          className="flex-1 rounded-xl border border-ocean-200 bg-white px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-ocean-300"
        />
        {!!debounced && totalCount > 0 && (
          <span className="text-[11px] font-bold text-ocean-700 bg-ocean-100 px-2 py-1 rounded-full whitespace-nowrap">
            {totalCount} תוצאות
          </span>
        )}
        {q && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[12px] font-bold text-ocean-700 px-2 py-1"
            aria-label="נקה חיפוש"
          >נקה</button>
        )}
      </div>

      {!debounced && (
        <div className="text-[11px] text-zinc-500">
          חפשו אטרקציות מהמסלול שלנו, או חיפוש חי ב-Wikipedia ובמפות (OSM). מוגבל לטנריף.
        </div>
      )}

      {showEmpty && (
        <div className="text-[12px] text-zinc-500">אין תוצאות בטנריף, אפשר להמשיך ידנית למטה.</div>
      )}

      {!!debounced && (
        <div
          className="space-y-3 max-h-[60vh] overflow-y-auto pr-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Section
            title="מהמסלול שלנו"
            results={catalogResults}
            loading={false}
            currentName={currentName}
            onPick={handlePick}
          />
          <Section
            title="Wikipedia"
            results={filteredWiki}
            loading={loadingWiki}
            currentName={currentName}
            onPick={handlePick}
          />
          <Section
            title="OpenStreetMap"
            results={filteredOsm}
            loading={loadingOsm}
            currentName={currentName}
            onPick={handlePick}
          />

          {hasMore && !anyLoading && (
            <button
              type="button"
              onClick={handleLoadMore}
              className="w-full text-[12px] font-bold text-ocean-700 bg-white border border-ocean-200 rounded-xl py-2 hover:border-ocean-300"
            >
              טען עוד תוצאות
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Re-export so other modules can introspect what's curated (e.g., gallery).
export { ATTRACTIONS_CATALOG };
