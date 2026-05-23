import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ImgSrc { thumb: string; full: string; }

const CACHE_PREFIX = 'tnf_gallery_v2:';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const TARGET_COUNT = 10;

interface CacheEntry { ts: number; images: ImgSrc[]; }

function readCache(query: string): ImgSrc[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + query);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    if (!Array.isArray(parsed.images) || parsed.images.length === 0) return null;
    return parsed.images;
  } catch { return null; }
}

function writeCache(query: string, images: ImgSrc[]) {
  try {
    const entry: CacheEntry = { ts: Date.now(), images };
    localStorage.setItem(CACHE_PREFIX + query, JSON.stringify(entry));
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

export function Gallery({ query }: { query: string }) {
  // Synchronous initial state — render immediately on first paint.
  const initial = useMemo<ImgSrc[]>(() => {
    const cached = readCache(query);
    return cached && cached.length ? cached : instantImages(query);
  }, [query]);
  const hadCacheRef = useRef<boolean>(!!readCache(query));

  const [images, setImages] = useState<ImgSrc[]>(initial);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    // re-init when query changes
    const cached = readCache(query);
    if (cached && cached.length) {
      setImages(cached);
      hadCacheRef.current = true;
    } else {
      setImages(instantImages(query));
      hadCacheRef.current = false;
    }
  }, [query]);

  useEffect(() => {
    if (hadCacheRef.current) return; // already have a good cached set
    let cancelled = false;
    (async () => {
      const wiki = await fetchWikimedia(query);
      if (cancelled || wiki.length === 0) return;
      // Merge: prefer wiki thumbs, top up to TARGET_COUNT with current instant fallback.
      const fallback = instantImages(query);
      const combined: ImgSrc[] = [...wiki];
      while (combined.length < TARGET_COUNT && combined.length < fallback.length + wiki.length) {
        combined.push(fallback[combined.length - wiki.length] ?? fallback[combined.length % fallback.length]);
      }
      const sliced = combined.slice(0, TARGET_COUNT);
      writeCache(query, sliced);
      if (!cancelled) setImages(sliced);
    })();
    return () => { cancelled = true; };
  }, [query]);

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
