import React, { useState } from 'react';
import { findWeather, weatherEmoji, useWeather } from '../data/weather';
import { useStore } from '../store';

export function WeatherBadge({ date }: { date: string }) {
  const trip = useStore(s => s.trip);
  const weather = useWeather(trip.startDate, trip.endDate);
  const w = findWeather(weather, date);
  const [expanded, setExpanded] = useState(false);

  if (!weather) {
    return (
      <div className="text-[11px] text-zinc-400 px-1 py-1.5 animate-pulse">טוען תחזית...</div>
    );
  }

  if (!w) {
    return (
      <div className="text-[11px] text-zinc-400 px-1 py-1.5">🌤️ ממתין לתחזית</div>
    );
  }

  const uvColor = w.uvMax <= 3 ? 'bg-emerald-400' : w.uvMax <= 6 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <button
      onClick={() => setExpanded(v => !v)}
      className="w-full text-right rounded-xl bg-ocean-50/60 border border-ocean-100 px-3 py-2 mb-2"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-base leading-none">{weatherEmoji(w.code, w.rain)}</span>
        <span className="text-[12px] font-extrabold text-ocean-700">{w.tMin}°–{w.tMax}°</span>
        {w.rain >= 20 && (
          <span className="text-[11px] font-bold text-ocean-600">🌧️ {w.rain}%</span>
        )}
        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
          UV <span className={`w-2 h-2 rounded-full inline-block ${uvColor}`} /> {w.uvMax}
        </span>
        <span className="text-[10px] text-zinc-400 mr-auto">{expanded ? '▴' : '▾'}</span>
      </div>
      {expanded && (
        <div className="mt-1.5 flex gap-3 text-[11px] text-zinc-600">
          <span>🌅 {w.sunrise}</span>
          <span>🌇 {w.sunset}</span>
        </div>
      )}
    </button>
  );
}
