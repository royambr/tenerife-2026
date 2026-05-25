import React, { useState } from 'react';
import { RESTAURANTS, CUISINES } from '../data/restaurants';

const PRICE = ['', '€', '€€', '€€€'];

export function RestaurantList() {
  const [open, setOpen] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState<string | null>(null);

  const filtered = activeCuisine
    ? RESTAURANTS.filter(r => r.cuisine === activeCuisine)
    : RESTAURANTS;

  return (
    <div className="rounded-2xl bg-white border border-ocean-100 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="text-[13px] font-extrabold text-ocean-700">🍽️ מסעדות לפי מטבח</span>
        <span className="text-[11px] text-zinc-400">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCuisine(null)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
                activeCuisine === null
                  ? 'bg-ocean-700 text-white border-ocean-700'
                  : 'bg-white text-ocean-700 border-ocean-100'
              }`}
            >
              הכל
            </button>
            {CUISINES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCuisine(c === activeCuisine ? null : c)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
                  activeCuisine === c
                    ? 'bg-ocean-700 text-white border-ocean-700'
                    : 'bg-white text-ocean-700 border-ocean-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map(r => (
              <a
                key={r.name}
                href={r.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl bg-ocean-50/60 border border-ocean-100 px-3 py-2.5 active:bg-ocean-100"
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[13px] font-extrabold text-ocean-700">{r.name}</span>
                  <span className="text-[11px] text-zinc-400 flex-shrink-0">{PRICE[r.priceLevel]}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-0.5">
                  <span className="rounded-full bg-white border border-ocean-100 px-2 py-0.5 font-bold">{r.cuisine}</span>
                  <span>{r.region}</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-4">{r.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
