import React from 'react';
import { useWeather, findWeather, weatherEmoji } from '../data/weather';

function todayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Atlantic/Canary' });
}

export function LiveWeather() {
  const today = todayISO();
  const weather = useWeather(today, today);
  const w = findWeather(weather, today);

  if (!weather) {
    return (
      <div className="rounded-2xl bg-white border border-ocean-100 px-4 py-3 flex items-center gap-3 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-ocean-100" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-ocean-100 rounded w-24" />
          <div className="h-2 bg-ocean-50 rounded w-16" />
        </div>
      </div>
    );
  }

  if (!w) return null;

  const uvLabel = w.uvMax <= 3 ? 'UV נמוך' : w.uvMax <= 6 ? 'UV בינוני' : w.uvMax <= 8 ? 'UV גבוה' : 'UV קיצוני';
  const uvColor = w.uvMax <= 3 ? 'text-emerald-600' : w.uvMax <= 6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="rounded-2xl bg-gradient-to-bl from-ocean-50 to-white border border-ocean-100 px-4 py-3">
      <div className="text-[11px] font-extrabold text-ocean-700 mb-2">מזג אוויר יומי</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{weatherEmoji(w.code, w.rain)}</span>
          <div>
            <div className="text-[18px] font-extrabold text-ocean-700 leading-tight">
              {w.tMax}° <span className="text-[13px] font-medium text-zinc-400">/ {w.tMin}°</span>
            </div>
            <div className="text-[11px] text-zinc-500">טנריף · היום</div>
          </div>
        </div>
        <div className="text-right space-y-0.5">
          {w.rain >= 20 && (
            <div className="text-[11px] font-bold text-ocean-600">🌧️ {w.rain}% גשם</div>
          )}
          <div className={`text-[11px] font-bold ${uvColor}`}>{uvLabel} {w.uvMax}</div>
          <div className="text-[10px] text-zinc-400">🌅 {w.sunrise} · 🌇 {w.sunset}</div>
        </div>
      </div>
    </div>
  );
}
