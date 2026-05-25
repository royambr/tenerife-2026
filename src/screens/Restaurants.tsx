import React, { useState } from 'react';
import { RESTAURANTS, CUISINES } from '../data/restaurants';

const PRICE = ['', '€', '€€', '€€€'] as const;
const REGION_ICONS: Record<string, string> = { 'צפון': '🌿', 'דרום': '☀️', 'מרכז': '🏔️' };

export function Restaurants() {
  const [activeCuisine, setActiveCuisine] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const regions = ['צפון', 'דרום', 'מרכז'];

  const filtered = RESTAURANTS.filter(r => {
    if (activeCuisine && r.cuisine !== activeCuisine) return false;
    if (activeRegion && r.region !== activeRegion) return false;
    return true;
  });

  function toggleCuisine(c: string) {
    setActiveCuisine(prev => prev === c ? null : c);
  }

  function toggleRegion(r: string) {
    setActiveRegion(prev => prev === r ? null : r);
  }

  return (
    <div className="p-4 pb-24 space-y-4 animate-fade-up lg:max-w-5xl">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">🍽️ מסעדות מומלצות</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          {filtered.length} מסעדות · טנריף 2026
        </p>
      </header>

      {/* Cuisine filter */}
      <div>
        <div className="text-[11px] font-extrabold text-ocean-700 mb-2">סנן לפי מטבח</div>
        <div className="flex flex-wrap gap-1.5">
          {CUISINES.map(c => (
            <button
              key={c}
              onClick={() => toggleCuisine(c)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                activeCuisine === c
                  ? 'bg-ocean-700 text-white'
                  : 'bg-white border border-ocean-100 text-ocean-700 hover:border-ocean-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Region filter */}
      <div>
        <div className="text-[11px] font-extrabold text-ocean-700 mb-2">סנן לפי אזור</div>
        <div className="flex gap-1.5">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => toggleRegion(r)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                activeRegion === r
                  ? 'bg-sunset-500 text-white'
                  : 'bg-white border border-ocean-100 text-ocean-700 hover:border-ocean-300'
              }`}
            >
              {REGION_ICONS[r]} {r}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-ocean-100 p-8 text-center text-zinc-400 text-[13px]">
          לא נמצאו מסעדות בסינון זה
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <a
              key={r.name}
              href={r.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-2xl bg-white border border-ocean-100 px-4 py-3 hover:border-ocean-300 active:bg-ocean-50 transition-colors"
            >
              <div className="text-2xl leading-none mt-0.5 flex-shrink-0">
                {r.cuisine === 'פירות ים' ? '🦐' :
                 r.cuisine === 'בשרים' ? '🥩' :
                 r.cuisine === 'טפאס' ? '🫒' :
                 r.cuisine === 'וגן' ? '🥗' :
                 r.cuisine === 'ים-תיכוני' ? '🫙' :
                 r.cuisine === 'בינלאומי' ? '🌍' : '🍽️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-extrabold text-ocean-700 leading-tight">{r.name}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{r.description}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold bg-ocean-50 text-ocean-700 rounded-full px-2 py-0.5">{r.cuisine}</span>
                  <span className="text-[10px] text-zinc-400">{REGION_ICONS[r.region]} {r.region}</span>
                  <span className="text-[10px] font-bold text-emerald-600">{PRICE[r.priceLevel]}</span>
                </div>
              </div>
              <span className="text-ocean-400 text-[18px] flex-shrink-0">›</span>
            </a>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-zinc-50 border border-zinc-100 px-4 py-3 text-[11px] text-zinc-500 text-center">
        לחץ על מסעדה לניווט ב-Google Maps
      </div>
    </div>
  );
}
