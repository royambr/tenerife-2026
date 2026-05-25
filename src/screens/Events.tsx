import React, { useState } from 'react';

const BASE = 'https://www.eventbrite.com/d/spain--tenerife';

interface EventCategory {
  label: string;
  icon: string;
  url: string;
  description: string;
}

const CATEGORIES: EventCategory[] = [
  { label: 'מוזיקה וקונצרטים', icon: '🎵', url: `${BASE}/music/`, description: 'מופעים חיים, פסטיבלי מוזיקה, DJ sets' },
  { label: 'פסטיבלים ותרבות', icon: '🎪', url: `${BASE}/festivals/`, description: 'פסטיבלים, שווקים, קרנבלים' },
  { label: 'ספורט והרפתקאות', icon: '🏄', url: `${BASE}/sports-fitness/`, description: 'גלישה, טיולים, אירועי ים' },
  { label: 'אוכל ושתייה', icon: '🍷', url: `${BASE}/food-and-drink/`, description: 'פסטיבלי אוכל, טועמי יין, שוקי גורמה' },
  { label: 'טיולים ואטרקציות', icon: '🌋', url: `${BASE}/travel-outdoor/`, description: 'סיורים מודרכים, טיידה, טבע' },
  { label: 'לילה ובילוי', icon: '🌙', url: `${BASE}/nightlife/`, description: 'מסיבות, בארים, אירועי לילה' },
];

const TRIP_DATES = { start: '2026-06-17', end: '2026-06-24' };
const EB_TRIP_URL =
  `https://www.eventbrite.com/d/spain--tenerife/events/--${TRIP_DATES.start}--${TRIP_DATES.end}/`;

interface HighlightEvent {
  name: string;
  date: string;
  venue: string;
  type: string;
  url: string;
}

const HIGHLIGHTS: HighlightEvent[] = [
  { name: 'Tenerife Sunfest', date: 'יוני 2026', venue: 'Puerto de la Cruz', type: '🎵 מוזיקה', url: 'https://www.eventbrite.com/d/spain--tenerife/music/' },
  { name: 'Mercado Artesanal del Norte', date: 'כל סוף שבוע', venue: 'La Laguna', type: '🛍️ שוק', url: 'https://www.eventbrite.com/d/spain--tenerife/fairs/' },
  { name: 'Trail Running Teide', date: 'יוני 2026', venue: 'Parque Nacional del Teide', type: '🏔️ ספורט', url: 'https://www.eventbrite.com/d/spain--tenerife/sports-fitness/' },
  { name: 'Fiesta de San Juan', date: '23 יוני 2026', venue: 'Puerto de la Cruz', type: '🔥 פסטיבל', url: 'https://www.eventbrite.com/d/spain--tenerife/festivals/' },
];

export function Events() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredHighlights = activeCategory
    ? HIGHLIGHTS.filter(e => e.type.includes(activeCategory))
    : HIGHLIGHTS;

  return (
    <div className="p-4 pb-24 space-y-4 animate-fade-up lg:max-w-5xl">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">🎉 אירועים בטנריף</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">יוני 17–24, 2026 · כל האירועים דרך Eventbrite</p>
      </header>

      {/* Primary CTA */}
      <a
        href={EB_TRIP_URL}
        target="_blank"
        rel="noreferrer"
        className="block rounded-3xl bg-gradient-to-bl from-ocean-700 to-ocean-500 text-white px-5 py-4 shadow-card"
      >
        <div className="text-[13px] font-extrabold mb-1">🔍 חפש אירועים בתאריכי הטיול</div>
        <div className="text-[11px] opacity-75">17–24 יוני 2026 · Eventbrite Tenerife</div>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-[12px] font-bold">
          פתח Eventbrite ›
        </div>
      </a>

      {/* Category filter */}
      <div>
        <div className="text-[12px] font-extrabold text-ocean-700 mb-2">סנן לפי קטגוריה</div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {CATEGORIES.map(cat => (
            <a
              key={cat.label}
              href={cat.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white border border-ocean-100 px-3 py-3 flex items-start gap-2.5 active:bg-ocean-50 hover:border-ocean-300 transition-colors"
            >
              <span className="text-2xl leading-none mt-0.5">{cat.icon}</span>
              <div className="min-w-0">
                <div className="text-[12px] font-extrabold text-ocean-700 leading-tight">{cat.label}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-4">{cat.description}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Trip highlights */}
      <div>
        <div className="text-[12px] font-extrabold text-ocean-700 mb-2">אירועים בולטים ביוני 🌋</div>
        <div className="space-y-2">
          {HIGHLIGHTS.map(ev => (
            <a
              key={ev.name}
              href={ev.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-white border border-ocean-100 px-4 py-3 active:bg-ocean-50 hover:border-ocean-300 transition-colors"
            >
              <span className="text-2xl leading-none">{ev.type.split(' ')[0]}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-ocean-700 truncate">{ev.name}</div>
                <div className="text-[11px] text-zinc-500">{ev.date} · {ev.venue}</div>
              </div>
              <span className="text-[11px] font-bold text-ocean-500 bg-ocean-50 rounded-full px-2 py-0.5 flex-shrink-0">
                {ev.type.split(' ').slice(1).join(' ')}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="rounded-2xl bg-zinc-50 border border-zinc-100 px-4 py-3 text-[11px] text-zinc-500 text-center">
        האירועים מסופקים על ידי Eventbrite · לחץ על כרטיס לפרטים ורכישה
      </div>
    </div>
  );
}
