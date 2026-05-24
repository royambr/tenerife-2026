import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Activity, Region, Status } from '../data/types';
import { CATEGORY_ICONS } from '../utils';
import { coordForActivity } from '../data/place_coords';

type Props = {
  activitiesByRegion: Map<Region, Activity[]>;
  selected: Region | null;
  onSelect: (r: Region) => void;
  onSelectActivity?: (a: Activity) => void;
};

const TENERIFE_CENTER: [number, number] = [28.27, -16.62];
const DEFAULT_ZOOM = 10;

// Map status -> a CSS background color (hex) for marker circles
const STATUS_BG: Record<Status, string> = {
  'מתוכנן':     '#0ea5e9', // ocean
  'הוזמן':      '#10b981', // emerald
  'אופציונלי':  '#f59e0b', // amber
  'דורש החלטה': '#f97316', // sunset
  'בוצע':        '#6b7280', // zinc
  'בוטל':        '#ef4444', // red
  'בסיכון':      '#dc2626', // red-strong
  'דולג':        '#a1a1aa', // zinc-light
};

// Fixed POIs always shown
const POI_FIXED = [
  { id: 'teide',   coord: [28.2715, -16.6391] as [number, number], emoji: '🌋', label: 'טיידה' },
  { id: 'tfn',     coord: [28.4827, -16.3415] as [number, number], emoji: '✈️', label: 'נמל TFN' },
  { id: 'aguilas', coord: [28.4060, -16.5500] as [number, number], emoji: '🏨', label: 'מלון Las Aguilas' },
];

// Hook that polls window.L until it's defined
function useLeaflet(): any | null {
  const [L, setL] = useState<any | null>(() => (typeof window !== 'undefined' ? (window as any).L : null));
  useEffect(() => {
    if (L) return;
    let cancelled = false;
    let tries = 0;
    const id = setInterval(() => {
      tries++;
      const w = (window as any).L;
      if (w && !cancelled) {
        setL(w);
        clearInterval(id);
      } else if (tries > 100) { // ~10s timeout
        clearInterval(id);
      }
    }, 100);
    return () => { cancelled = true; clearInterval(id); };
  }, [L]);
  return L;
}

// stable small jitter per activity id
function jitterFor(id: string): [number, number] {
  let h1 = 0, h2 = 0;
  for (let i = 0; i < id.length; i++) {
    h1 = (h1 * 31 + id.charCodeAt(i)) | 0;
    h2 = (h2 * 17 + id.charCodeAt(i) * 7) | 0;
  }
  const dx = ((h1 % 1000) / 1000 - 0.5) * 0.01; // ±0.005°
  const dy = ((h2 % 1000) / 1000 - 0.5) * 0.01;
  return [dx, dy];
}

function buildDivIcon(L: any, emoji: string, color: string, opts?: { gold?: boolean; size?: number }) {
  const size = opts?.size ?? 34;
  const border = opts?.gold ? '3px solid #f5c518' : '2px solid #ffffff';
  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};border:${border};
      box-shadow:0 2px 6px rgba(11,59,92,0.35);
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(size * 0.55)}px;line-height:1;
    ">${emoji}</div>`;
  return L.divIcon({
    className: 'tnf-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[c]);
}

export function TenerifeMap({ activitiesByRegion, onSelectActivity }: Props) {
  const L = useLeaflet();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // Flatten the active plan activities from the map prop
  const allActivities = useMemo(() => {
    const out: Activity[] = [];
    activitiesByRegion.forEach(arr => arr.forEach(a => out.push(a)));
    return out;
  }, [activitiesByRegion]);

  // Track CDN load failure (~12s)
  useEffect(() => {
    if (L) return;
    const timeout = setTimeout(() => {
      if (!(window as any).L) setLoadFailed(true);
    }, 12000);
    return () => clearTimeout(timeout);
  }, [L]);

  // Initialize map once Leaflet + container are ready
  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: TENERIFE_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 9,
      maxZoom: 17,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Enable scroll wheel zoom on click; disable on blur
    map.on('click', () => { map.scrollWheelZoom.enable(); });
    map.on('mouseout', () => { map.scrollWheelZoom.disable(); });

    // Fixed POIs (with gold border)
    POI_FIXED.forEach(p => {
      L.marker(p.coord, { icon: buildDivIcon(L, p.emoji, '#fff7e0', { gold: true, size: 36 }), title: p.label })
        .bindPopup(`<div dir="rtl" style="font-weight:700;color:#0b3b5c">${p.emoji} ${p.label}</div>`)
        .addTo(map);
    });

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, [L]);

  // (Re)render activity markers when activities change
  useEffect(() => {
    if (!L || !mapRef.current || !markerLayerRef.current) return;
    const layer = markerLayerRef.current;
    layer.clearLayers();

    // Track exact coords to spiral if 3+ overlap
    const stackCounts = new Map<string, number>();

    allActivities.forEach(a => {
      const base = coordForActivity(a.name, a.region);
      if (!base) return;
      const [jx, jy] = jitterFor(a.id);
      let lat = base.lat + jx;
      let lng = base.lng + jy;

      const key = `${base.lat.toFixed(3)}_${base.lng.toFixed(3)}`;
      const idx = stackCounts.get(key) || 0;
      stackCounts.set(key, idx + 1);
      if (idx >= 3) {
        const angle = (idx - 3) * (Math.PI / 4);
        const r = 0.004 * (1 + Math.floor((idx - 3) / 8));
        lat += Math.cos(angle) * r;
        lng += Math.sin(angle) * r;
      }

      const emoji = CATEGORY_ICONS[a.category] || '📍';
      const color = STATUS_BG[a.status] || '#0ea5e9';
      const icon = buildDivIcon(L, emoji, color);

      const marker = L.marker([lat, lng], { icon, title: a.name });
      const popupHtml = `
        <div dir="rtl" style="min-width:180px;font-family:Heebo,system-ui,sans-serif">
          <div style="font-weight:800;color:#0b3b5c;font-size:14px;margin-bottom:4px">${emoji} ${escapeHtml(a.name)}</div>
          <div style="font-size:12px;color:#555;margin-bottom:2px">${escapeHtml(a.dayDate)} · ${escapeHtml(a.startTime)}–${escapeHtml(a.endTime)}</div>
          <div style="font-size:12px;color:#555;margin-bottom:8px">סטטוס: ${escapeHtml(a.status)} · ${escapeHtml(a.category)}</div>
          <button data-act-id="${a.id}" style="
            width:100%;background:#0b3b5c;color:#fff;border:0;
            padding:6px 10px;border-radius:8px;font-weight:700;
            font-size:12px;cursor:pointer;">פתח פרטים</button>
        </div>`;
      marker.bindPopup(popupHtml);
      marker.on('popupopen', (e: any) => {
        const btn = e.popup.getElement()?.querySelector(`[data-act-id="${a.id}"]`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectActivity?.(a);
            mapRef.current.closePopup();
          });
        }
      });
      marker.addTo(layer);
    });
  }, [L, allActivities, onSelectActivity]);

  const focusIsland = () => {
    if (!mapRef.current) return;
    mapRef.current.setView(TENERIFE_CENTER, DEFAULT_ZOOM, { animate: true });
  };

  const locateMe = () => {
    if (!mapRef.current || !L) return;
    if (!navigator.geolocation) {
      setToast('שירות מיקום לא זמין');
      setTimeout(() => setToast(null), 2500);
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      // Tenerife rough bounding box
      const onIsland = latitude > 27.9 && latitude < 28.7 && longitude > -17.0 && longitude < -16.1;
      if (!onIsland) {
        setToast('אתה לא בטנריף 😉');
        setTimeout(() => setToast(null), 2500);
        return;
      }
      if (userMarkerRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
      }
      userMarkerRef.current = L.marker([latitude, longitude], {
        icon: buildDivIcon(L, '📍', '#ef4444', { size: 32 }),
        title: 'אני כאן',
      }).addTo(mapRef.current);
      mapRef.current.setView([latitude, longitude], 13, { animate: true });
    }, () => {
      setToast('לא הצלחנו לאתר אותך');
      setTimeout(() => setToast(null), 2500);
    });
  };

  return (
    <div className="w-full bg-gradient-to-b from-ocean-50 to-white rounded-3xl border border-ocean-100 shadow-soft overflow-hidden relative">
      {/* Header row */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1.5 gap-2">
        <div className="text-[13px] font-extrabold text-ocean-700">טנריף · המפה שלנו</div>
        <div className="text-[10px] text-zinc-500 hidden sm:block">הקש למפה לזום בגלגלת</div>
      </div>

      {/* Map container */}
      <div className="relative" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
        <div
          ref={containerRef}
          className="w-full"
          style={{ height: 'clamp(420px, 60vh, 640px)' }}
          aria-label="מפת טנריף אינטראקטיבית"
        />

        {/* Loading skeleton */}
        {!L && !loadFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-ocean-50/80 text-ocean-700 text-sm font-bold pointer-events-none">
            טוען מפה…
          </div>
        )}

        {/* Error fallback */}
        {loadFailed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ocean-50 text-ocean-700 text-sm p-4 text-center">
            <div className="font-bold mb-2">המפה לא נטענה. נסו לרענן.</div>
            <a
              href="https://www.openstreetmap.org/?mlat=28.27&mlon=-16.62#map=10/28.27/-16.62"
              target="_blank" rel="noreferrer"
              className="underline text-ocean-600"
            >פתח מפת OSM בדפדפן</a>
          </div>
        )}

        {/* Floating controls (top-left in RTL means visually left) */}
        <div className="absolute top-2 left-2 z-[400] flex flex-col gap-1.5">
          <button
            onClick={focusIsland}
            className="bg-white/95 hover:bg-white text-ocean-700 text-[12px] font-bold px-2.5 py-1.5 rounded-lg shadow border border-ocean-100"
            style={{ minHeight: 44 }}
            aria-label="התמקד באי טנריף"
          >🎯 התמקד באי</button>
          <button
            onClick={locateMe}
            className="bg-white/95 hover:bg-white text-ocean-700 text-[12px] font-bold px-2.5 py-1.5 rounded-lg shadow border border-ocean-100"
            style={{ minHeight: 44 }}
            aria-label="מצא את המיקום שלי"
          >📍 איפה אני?</button>
        </div>

        {toast && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] bg-ocean-700 text-white text-[12px] font-bold px-3 py-1.5 rounded-full shadow">
            {toast}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-nowrap items-center gap-1.5 text-[10px] text-zinc-600 px-3 py-1.5 overflow-x-auto">
        <span className="font-bold text-ocean-700">סטטוס:</span>
        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background:'#0ea5e9' }} />מתוכנן</span>
        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background:'#10b981' }} />הוזמן</span>
        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background:'#f59e0b' }} />אופציונלי</span>
        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background:'#f97316' }} />החלטה</span>
        <span className="mx-0.5 text-zinc-300">·</span>
        <span>🌋 טיידה</span>
        <span>✈️ TFN</span>
        <span>🏨 מלון</span>
      </div>
    </div>
  );
}
