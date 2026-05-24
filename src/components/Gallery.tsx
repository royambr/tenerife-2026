import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ImgSrc { thumb: string; full: string; }

const CACHE_PREFIX = 'tnf_gallery_v4:';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const TARGET_COUNT = 10;

interface CacheEntry { ts: number; images: ImgSrc[]; }

function cacheKey(query: string, wikiTitle?: string): string {
  return CACHE_PREFIX + (wikiTitle ? `wiki:${wikiTitle}|` : '') + query;
}

function readCache(key: string): ImgSrc[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    if (!Array.isArray(parsed.images) || parsed.images.length === 0) return null;
    return parsed.images;
  } catch { return null; }
}

function writeCache(key: string, images: ImgSrc[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), images } as CacheEntry));
  } catch {}
}

// Instant CDN-redirect URLs (no API roundtrip)
export function instantImages(query: string, count = TARGET_COUNT): ImgSrc[] {
  const q = encodeURIComponent(query);
  const arr: ImgSrc[] = [];
  for (let i = 0; i < count; i++) {
    const sig = i + 1;
    arr.push({
      thumb: `https://source.unsplash.com/400x400/?${q}&sig=${sig}`,
      full:  `https://source.unsplash.com/1200x800/?${q}&sig=${sig}`,
    });
  }
  return arr;
}

async function fetchWikimedia(query: string): Promise<ImgSrc[]> {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=14&prop=imageinfo&iiprop=url&iiurlwidth=400&origin=*`;
    const res = await fetch(searchUrl);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return [];
    const out: ImgSrc[] = [];
    for (const k of Object.keys(pages)) {
      const p = pages[k];
      const info = p.imageinfo?.[0];
      if (!info) continue;
      const thumb = info.thumburl || info.url;
      const full = info.url || info.thumburl;
      if (!thumb || !full) continue;
      if (/\.(svg|pdf|webm|ogv|gif)$/i.test(full)) continue;
      out.push({ thumb, full });
    }
    return out.slice(0, TARGET_COUNT);
  } catch { return []; }
}

interface WikipediaSummary {
  originalimage?: { source: string };
  thumbnail?: { source: string };
}

async function fetchWikipediaHero(title: string): Promise<ImgSrc | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as WikipediaSummary;
    const full = data?.originalimage?.source;
    const thumb = data?.thumbnail?.source || full;
    if (!full || !thumb) return null;
    return { thumb, full };
  } catch { return null; }
}

interface MediaListItem {
  type?: string;
  srcset?: { src: string; scale?: string }[];
  original?: { source: string };
  title?: string;
}

async function fetchWikipediaMediaList(title: string): Promise<ImgSrc[]> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}?redirect=true`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const items: MediaListItem[] = data?.items || [];
    const out: ImgSrc[] = [];
    for (const it of items) {
      if (it.type && it.type !== 'image') continue;
      // The srcset urls are protocol-relative like //upload.wikimedia.org/...
      const top = it.srcset?.[0]?.src;
      const orig = it.original?.source;
      const thumbRaw = top || orig;
      const fullRaw = orig || top;
      if (!thumbRaw || !fullRaw) continue;
      const thumb = thumbRaw.startsWith('//') ? `https:${thumbRaw}` : thumbRaw;
      const full = fullRaw.startsWith('//') ? `https:${fullRaw}` : fullRaw;
      if (/\.(svg|pdf|webm|ogv|gif)$/i.test(full)) continue;
      out.push({ thumb, full });
      if (out.length >= TARGET_COUNT) break;
    }
    return out;
  } catch { return []; }
}

function dedupe(images: ImgSrc[]): ImgSrc[] {
  const seen = new Set<string>();
  const out: ImgSrc[] = [];
  for (const i of images) {
    // Use the full URL (including query string) as the dedupe key.
    // Stripping the query collapsed all source.unsplash.com fallback URLs
    // — which only differ by ?sig=N — into one key, leaving the
    // top-up while-loop unable to ever reach TARGET_COUNT and spinning
    // forever the moment any Wikipedia result was mixed in.
    const k = i.full;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(i);
  }
  return out;
}

export function Gallery({ query, wikipediaTitle }: { query: string; wikipediaTitle?: string }) {
  const key = cacheKey(query, wikipediaTitle);

  // Synchronous initial state — render immediately on first paint.
  const initial = useMemo<ImgSrc[]>(() => {
    const cached = readCache(key);
    return cached && cached.length ? cached : instantImages(query);
  }, [key, query]);
  const hadCacheRef = useRef<boolean>(!!readCache(key));

  const [images, setImages] = useState<ImgSrc[]>(initial);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const cached = readCache(key);
    if (cached && cached.length) {
      setImages(cached);
      hadCacheRef.current = true;
    } else {
      setImages(instantImages(query));
      hadCacheRef.current = false;
    }
  }, [key, query]);

  useEffect(() => {
    if (hadCacheRef.current) return;
    let cancelled = false;

    // Track the best set we've seen so far, so partial results show progressively.
    let hero: ImgSrc | null = null;
    let mediaList: ImgSrc[] = [];
    let commons: ImgSrc[] = [];

    function recomputeAndApply(final = false) {
      if (cancelled) return;
      const fallback = instantImages(query);
      const combined: ImgSrc[] = [];
      if (hero) combined.push(hero);
      for (const m of mediaList) combined.push(m);
      for (const c of commons) combined.push(c);
      let deduped = dedupe(combined);
      // Top-up with fallback images. Cap iterations defensively so a
      // future dedupe-collision can never spin forever again.
      const maxIters = TARGET_COUNT + fallback.length + 4;
      let iters = 0;
      for (const f of fallback) {
        if (deduped.length >= TARGET_COUNT) break;
        if (++iters > maxIters) break;
        deduped.push(f);
        deduped = dedupe(deduped);
      }
      const sliced = deduped.slice(0, TARGET_COUNT);
      setImages(sliced);
      if (final && (hero || mediaList.length || commons.length)) {
        writeCache(key, sliced);
      }
    }

    // Fire all sources in parallel.
    const heroPromise = wikipediaTitle ? fetchWikipediaHero(wikipediaTitle) : Promise.resolve(null);
    const mediaPromise = wikipediaTitle ? fetchWikipediaMediaList(wikipediaTitle) : Promise.resolve([] as ImgSrc[]);
    const commonsPromise = fetchWikimedia(query);

    heroPromise.then(h => {
      if (cancelled || !h) return;
      hero = h;
      recomputeAndApply();
    });

    mediaPromise.then(m => {
      if (cancelled || !m.length) return;
      mediaList = m;
      recomputeAndApply();
    });

    commonsPromise.then(c => {
      if (cancelled) return;
      commons = c;
      recomputeAndApply();
    });

    // Once everything has settled, persist to cache.
    Promise.all([heroPromise, mediaPromise, commonsPromise]).then(() => {
      if (cancelled) return;
      recomputeAndApply(true);
    });

    return () => { cancelled = true; };
  }, [key, query, wikipediaTitle]);

  return (
    <>
      <div className="-mx-5 px-5 overflow-x-auto no-scrollbar" dir="rtl">
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={`${i}-${img.thumb}`} onClick={() => setLightboxIdx(i)}
                    aria-label={`תמונה ${i + 1} מתוך ${images.length}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-ocean-50 flex-shrink-0 border border-ocean-100/60 relative">
              {/* shimmer placeholder behind image (image overlays it) */}
              <div className="absolute inset-0 bg-ocean-100/60 animate-pulse" aria-hidden="true" />
              <img src={img.thumb} alt=""
                   loading={i < 3 ? 'eager' : 'lazy'}
                   // @ts-ignore — fetchpriority is valid HTML, not yet typed in React
                   fetchpriority={i < 3 ? 'high' : 'auto'}
                   decoding="async"
                   onLoad={(e) => {
                     const ph = (e.currentTarget.previousSibling as HTMLElement | null);
                     if (ph) ph.style.display = 'none';
                   }}
                   onError={(e) => {
                     const el = e.currentTarget as HTMLImageElement;
                     el.style.display = 'none';
                     const parent = el.parentElement;
                     if (parent) parent.innerText = '🏝️';
                   }}
                   className="relative w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {lightboxIdx !== null && (
        <Lightbox images={images} idx={lightboxIdx} onClose={() => setLightboxIdx(null)} onIdx={setLightboxIdx} />
      )}
    </>
  );
}

function Lightbox({ images, idx, onClose, onIdx }:{
  images: ImgSrc[]; idx: number; onClose: () => void; onIdx: (i: number) => void;
}) {
  const prev = useCallback(() => onIdx((idx - 1 + images.length) % images.length), [idx, images.length, onIdx]);
  const next = useCallback(() => onIdx((idx + 1) % images.length), [idx, images.length, onIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') next();
      else if (e.key === 'ArrowRight') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, next, prev]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { setTouchStart(e.touches[0].clientX); }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
    setTouchStart(null);
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black flex flex-col"
         role="dialog" aria-modal="true"
         onClick={onClose}
         onTouchStart={onTouchStart}
         onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-between p-3 text-white text-sm">
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="סגור"
                className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-lg">✕</button>
        <span className="text-xs tabular-nums opacity-80">{idx + 1} / {images.length}</span>
        <span className="w-10" />
      </div>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <img src={images[idx].full} alt=""
             decoding="async"
             // @ts-ignore
             fetchpriority="high"
             onError={(e) => { (e.currentTarget as HTMLImageElement).src = images[idx].thumb; }}
             className="max-w-full max-h-full object-contain" />
        <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="הקודם"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur text-white text-2xl flex items-center justify-center">›</button>
        <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="הבא"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur text-white text-2xl flex items-center justify-center">‹</button>
      </div>
    </div>,
    document.body
  );
}
