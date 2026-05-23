import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ImgSrc { thumb: string; full: string; }

const CACHE_PREFIX = 'tnf_gallery_v1:';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const TARGET_COUNT = 10;
const WIKI_MIN = 4;

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

async function fetchWikimedia(query: string): Promise<ImgSrc[]> {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=14&prop=imageinfo&iiprop=url&iiurlwidth=800&origin=*`;
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
      // skip svg/pdf/etc
      if (/\.(svg|pdf|webm|ogv|gif)$/i.test(full)) continue;
      out.push({ thumb, full });
    }
    return out.slice(0, TARGET_COUNT);
  } catch { return []; }
}

function unsplashFill(query: string, count: number, startIdx: number): ImgSrc[] {
  const q = encodeURIComponent(query);
  const arr: ImgSrc[] = [];
  for (let i = 0; i < count; i++) {
    const sig = startIdx + i + 1;
    const url = `https://source.unsplash.com/featured/800x600/?${q}&sig=${sig}`;
    arr.push({ thumb: url, full: url });
  }
  return arr;
}

export function Gallery({ query }: { query: string }) {
  const [images, setImages] = useState<ImgSrc[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readCache(query);
    if (cached) {
      setImages(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    setImages(null);
    (async () => {
      const wiki = await fetchWikimedia(query);
      if (cancelled) return;
      let combined = wiki.slice(0, TARGET_COUNT);
      if (combined.length < WIKI_MIN) {
        const fill = unsplashFill(query, TARGET_COUNT - combined.length, combined.length);
        combined = combined.concat(fill);
      } else if (combined.length < TARGET_COUNT) {
        const fill = unsplashFill(query, TARGET_COUNT - combined.length, combined.length);
        combined = combined.concat(fill);
      }
      if (combined.length === 0) {
        // pure unsplash fallback
        combined = unsplashFill(query, TARGET_COUNT, 0);
      }
      writeCache(query, combined);
      if (!cancelled) {
        setImages(combined);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [query]);

  if (loading || !images) {
    return (
      <div className="-mx-5 px-5 overflow-x-auto no-scrollbar" aria-label="טוען תמונות">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-24 h-24 rounded-xl bg-ocean-100/60 animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="-mx-5 px-5 overflow-x-auto no-scrollbar" dir="rtl">
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setLightboxIdx(i)}
                    aria-label={`תמונה ${i + 1} מתוך ${images.length}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-ocean-50 flex-shrink-0 border border-ocean-100/60">
              <img src={img.thumb} alt=""
                   loading="lazy"
                   onError={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; (e.currentTarget.parentElement as HTMLElement).innerText = '🏝️'; }}
                   className="w-full h-full object-cover" />
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
      else if (e.key === 'ArrowLeft') next();  // RTL: left arrow goes forward visually
      else if (e.key === 'ArrowRight') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, next, prev]);

  // simple touch swipe
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
