import React, { useState } from 'react';
import { CUISINES } from '../data/restaurants';
import { useRestaurants, EnrichedRestaurant } from '../hooks/useRestaurants';

const PRICE = ['', '€', '€€', '€€€'] as const;
const REGION_ICONS: Record<string, string> = { 'צפון': '🌿', 'דרום': '☀️', 'מרכז': '🏔️' };
const CUISINE_ICONS: Record<string, string> = {
  'פירות ים': '🦐', 'בשרים': '🥩', 'טפאס': '🫒',
  'וגן': '🥗', 'ים-תיכוני': '🫙', 'בינלאומי': '🌍', 'ספרדי': '🍽️',
};
const MEAL_LABELS: Record<string, { label: string; icon: string }> = {
  breakfast: { label: 'בוקר',   icon: '🌅' },
  lunch:     { label: 'צהריים', icon: '☀️' },
  dinner:    { label: 'ערב',    icon: '🌙' },
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-[11px] text-amber-400 font-bold tracking-tight">
      {'★'.repeat(full)}{half ? '½' : ''}
      <span className="text-zinc-300">{'★'.repeat(5 - full - (half ? 1 : 0))}</span>
      <span className="text-zinc-500 mr-1"> {rating.toFixed(1)}</span>
    </span>
  );
}

function MealBadges({ meals }: { meals: string[] }) {
  return (
    <div className="flex gap-1">
      {meals.map(m => (
        <span key={m} className="text-[9px] bg-sand-50 text-sand-700 border border-sand-200 rounded-full px-1.5 py-0.5 font-semibold">
          {MEAL_LABELS[m]?.icon} {MEAL_LABELS[m]?.label}
        </span>
      ))}
    </div>
  );
}

function RestaurantCard({ r }: { r: EnrichedRestaurant }) {
  return (
    <a
      href={r.mapsUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-start gap-3 rounded-2xl bg-white border border-ocean-100 px-4 py-3 hover:border-ocean-300 active:bg-ocean-50 transition-colors"
    >
      <div className="text-2xl leading-none mt-0.5 flex-shrink-0">
        {CUISINE_ICONS[r.cuisine] ?? '🍽️'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="text-[14px] font-extrabold text-ocean-700 leading-tight">{r.name}</div>
          {r.source === 'osm' && (
            <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold rounded-full px-1.5 py-0.5 flex-shrink-0">OSM</span>
          )}
        </div>
        {r.rating > 0
          ? <div className="mt-0.5"><Stars rating={r.rating} /></div>
          : <div className="mt-0.5 text-[10px] text-zinc-400 font-medium">ללא דירוג</div>
        }
        <div className="text-[11px] text-zinc-500 mt-0.5">{r.description}</div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] font-bold bg-ocean-50 text-ocean-700 rounded-full px-2 py-0.5">{r.cuisine}</span>
          {r.region !== 'OSM' && (
            <span className="text-[10px] text-zinc-400">{REGION_ICONS[r.region]} {r.region}</span>
          )}
          <span className="text-[10px] font-bold text-emerald-600">{PRICE[r.priceLevel]}</span>
          <MealBadges meals={r.meals ?? []} />
        </div>
      </div>
      <span className="text-ocean-400 text-[18px] flex-shrink-0 mt-1">›</span>
    </a>
  );
}

export function Restaurants() {
  const { restaurants, loading, osmCount } = useRestaurants();
  const [activeCuisine, setActiveCuisine] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeMeal, setActiveMeal] = useState<string | null>(null);
  const regions = ['צפון', 'דרום', 'מרכז'];

  const applyFilters = (r: EnrichedRestaurant) => {
    if (activeCuisine && r.cuisine !== activeCuisine) return false;
    if (activeRegion && r.region !== activeRegion) return false;
    if (activeMeal && !(r.meals ?? []).includes(activeMeal as any)) return false;
    return true;
  };

  const filtered = restaurants
    .filter(applyFilters)
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));

  return (
    <div className="p-4 pb-24 space-y-4 animate-fade-up lg:max-w-5xl">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">🍽️ מסעדות מומלצות</h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[12px] text-zinc-500">
            {filtered.length} מסעדות
          </p>
          {loading ? (
            <span className="text-[10px] bg-zinc-100 text-zinc-400 rounded-full px-2 py-0.5">טוען מ-OpenStreetMap...</span>
          ) : osmCount > 0 ? (
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold rounded-full px-2 py-0.5">✓ {osmCount} מ-OSM</span>
          ) : null}
        </div>
      </header>

      {/* Meal filter */}
      <div>
        <div className="text-[11px] font-extrabold text-ocean-700 mb-2">ארוחה</div>
        <div className="flex gap-1.5">
          {Object.entries(MEAL_LABELS).map(([key, { label, icon }]) => (
            <button key={key} onClick={() => setActiveMeal(prev => prev === key ? null : key)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                activeMeal === key ? 'bg-sunset-500 text-white' : 'bg-white border border-ocean-100 text-ocean-700 hover:border-sunset-300'
              }`}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine filter */}
      <div>
        <div className="text-[11px] font-extrabold text-ocean-700 mb-2">מטבח</div>
        <div className="flex flex-wrap gap-1.5">
          {CUISINES.map(c => (
            <button key={c} onClick={() => setActiveCuisine(prev => prev === c ? null : c)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                activeCuisine === c ? 'bg-ocean-700 text-white' : 'bg-white border border-ocean-100 text-ocean-700 hover:border-ocean-300'
              }`}>
              {CUISINE_ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Region filter */}
      <div>
        <div className="text-[11px] font-extrabold text-ocean-700 mb-2">אזור</div>
        <div className="flex gap-1.5">
          {regions.map(r => (
            <button key={r} onClick={() => setActiveRegion(prev => prev === r ? null : r)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                activeRegion === r ? 'bg-ocean-500 text-white' : 'bg-white border border-ocean-100 text-ocean-700 hover:border-ocean-300'
              }`}>
              {REGION_ICONS[r]} {r}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-ocean-100 p-8 text-center text-zinc-400 text-[13px]">
          לא נמצאו מסעדות בסינון זה
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => <RestaurantCard key={`${r.source}-${r.name}`} r={r} />)}
        </div>
      )}

      <div className="rounded-2xl bg-zinc-50 border border-zinc-100 px-4 py-3 text-[11px] text-zinc-500 text-center">
        לחץ על מסעדה לניווט ב-Google Maps
      </div>
    </div>
  );
}
