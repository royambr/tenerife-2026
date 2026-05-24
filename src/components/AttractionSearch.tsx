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

const CACHE_PREFIX = 'tnf_search_v1:';
const TTL_MS = 10 * 60 * 1000;

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

interface WikipediaSummary {
  title: string;
  extract?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
  coordinates?: { lat: number; lon: number };
}

async function fetchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&limit=6&namespace=0&format=json&origin=*&search=${encodeURIComponent(query + ' tenerife')}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const titles: string[] = data?.[1] || [];
    const descs: string[] = data?.[2] || [];
    const urls: string[] = data?.[3] || [];

    // Pre-fetch summaries (thumbnails) for the top 4 in parallel — bounded.
    const top = titles.slice(0, 4);
    const summaries = await Promise.all(
      top.map(t =>
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, '_'))}?redirect=true`)
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null) as Promise<WikipediaSummary | null>
      )
    );

    const out: SearchResult[] = titles.map((t, i) => {
      const sm = i < summaries.length ? summaries[i] : null;
      const lat = sm?.coordinates?.lat;
      const lon = sm?.coordinates?.lon;
      return {
        source: 'wikipedia' as const,
        name: t,
        description: sm?.extract || descs[i] || undefined,
        thumb: sm?.thumbnail?.source,
        url: sm?.content_urls?.desktop?.page || urls[i],
        lat, lon,
        inferredRegion: (typeof lat === 'number' && typeof lon === 'number')
          ? inferRegionFromCoords(lat, lon) : undefined,
      };
    });
    return out;
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
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' tenerife')}&limit=8&accept-language=he,en`;
    const res = await fetch(url);
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
    });
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
  const label = src === 'catalog' ? 'מהמסלול שלנו' : src === 'wikipedia' ? 'Wikipedia' : 'OSM';
  const cls = src === 'catalog'
    ? 'bg-sunset-100 text-sunset-700'
    : src === 'wikipedia'
      ? 'bg-ocean-100 text-ocean-700'
      : 'bg-zinc-100 text-zinc-600';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls} flex-shrink-0`}>{label}</span>
  );
}

export function AttractionSearch({ apply, currentName }: { apply: ApplyFn; currentName?: string }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loadingWeb, setLoadingWeb] = useState(false);
  const [webResults, setWebResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState(false);
  const lastAppliedRef = useRef<string | null>(null);

  // Debounce 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  // Catalog filter is synchronous + instant.
  const catalogResults = useMemo<SearchResult[]>(() => {
    if (!debounced) return [];
    return searchCatalog(debounced, 6).map(catalogToResult);
  }, [debounced]);

  // Live web fetch (debounced) for Wikipedia + Nominatim.
  useEffect(() => {
    if (!debounced || debounced.length < 2) {
      setWebResults([]); setError(false); setLoadingWeb(false);
      return;
    }
    const cached = readCache(debounced);
    if (cached) { setWebResults(cached); setError(false); setLoadingWeb(false); return; }

    let cancelled = false;
    setLoadingWeb(true);
    setError(false);
    (async () => {
      try {
        const [wiki, osm] = await Promise.all([fetchWikipedia(debounced), fetchNominatim(debounced)]);
        if (cancelled) return;
        // Dedupe across wiki+osm by lowercased name.
        const seen = new Set<string>();
        const merged: SearchResult[] = [];
        for (const r of [...wiki, ...osm]) {
          const k = r.name.toLowerCase().trim();
          if (seen.has(k)) continue;
          seen.add(k);
          merged.push(r);
        }
        writeCache(debounced, merged);
        setWebResults(merged);
      } catch {
        if (!cancelled) { setError(true); setWebResults([]); }
      } finally {
        if (!cancelled) setLoadingWeb(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced]);

  // Also dedupe web vs catalog (so we don't show Loro Parque twice).
  const filteredWeb = useMemo(() => {
    const cs = new Set(catalogResults.map(r => r.name.toLowerCase().trim()));
    return webResults.filter(r => !cs.has(r.name.toLowerCase().trim()));
  }, [catalogResults, webResults]);

  const all: SearchResult[] = [...catalogResults, ...filteredWeb];

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
    setWebResults([]);
    setError(false);
    if (lastAppliedRef.current) {
      // Reset the fields that we may have auto-filled.
      apply({
        name: '',
        description: undefined,
        mapsUrl: undefined,
        sourceUrl: undefined,
      });
      lastAppliedRef.current = null;
    }
  }

  const showEmpty = !!debounced && !loadingWeb && all.length === 0 && !error;

  return (
    <div className="rounded-2xl border border-ocean-100 bg-ocean-50/40 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="חפש מקום… (למשל: Teide, חוף, מסעדה)"
          className="flex-1 rounded-xl border border-ocean-200 bg-white px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-ocean-300"
        />
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
          חפשו אטרקציות מהמסלול שלנו, או חיפוש חי ב-Wikipedia ובמפות (OSM).
        </div>
      )}

      {loadingWeb && (
        <div className="flex items-center gap-2 text-[12px] text-ocean-700">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-ocean-300 border-t-ocean-700 animate-spin" />
          <span>מחפש…</span>
        </div>
      )}

      {showEmpty && (
        <div className="text-[12px] text-zinc-500">אין תוצאות, אפשר להמשיך ידנית למטה.</div>
      )}

      {all.length > 0 && (
        <ul className="space-y-1.5 max-h-64 overflow-y-auto">
          {all.map((r, i) => {
            const active = currentName && currentName.trim().toLowerCase() === r.name.trim().toLowerCase();
            return (
              <li key={`${r.source}-${i}-${r.name}`}>
                <button
                  type="button"
                  onClick={() => handlePick(r)}
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
                    </div>
                    {r.description && (
                      <div className="text-[11px] text-zinc-500 truncate">{r.description}</div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Re-export so other modules can introspect what's curated (e.g., gallery).
export { ATTRACTIONS_CATALOG };
