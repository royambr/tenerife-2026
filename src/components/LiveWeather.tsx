import React, { useState } from 'react';
import { useWeatherData, weatherIcon, weatherLabel, toF } from '../data/weather';

export function LiveWeather() {
  const data = useWeatherData();
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const cvt = (c: number) => useFahrenheit ? toF(c) : c;
  const unit = useFahrenheit ? '°F' : '°C';

  if (!data) {
    return (
      <div className="rounded-2xl bg-[#202124] px-4 py-2.5 flex items-center gap-3 animate-pulse">
        <div className="w-6 h-6 rounded-full bg-zinc-700" />
        <div className="h-3 bg-zinc-700 rounded w-24" />
        <div className="h-3 bg-zinc-800 rounded w-32 ml-auto" />
      </div>
    );
  }

  const { current, daily } = data;
  const today = daily[0];

  return (
    <div className="rounded-2xl bg-[#202124] text-white px-4 py-2.5 flex items-center gap-3 flex-wrap">
      {/* Icon + temp */}
      <span className="text-2xl leading-none">{weatherIcon(current.code)}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-light leading-none">{cvt(current.temp)}</span>
        <button
          onClick={() => setUseFahrenheit(f => !f)}
          className="text-[12px] text-zinc-400 hover:text-white transition-colors leading-none"
        >
          {unit}
        </button>
      </div>

      {/* Condition + high/low */}
      <span className="text-[12px] text-zinc-300">{weatherLabel(current.code)}</span>
      <span className="text-[11px] text-zinc-500">
        ↑{cvt(today.tMax)}{unit} ↓{cvt(today.tMin)}{unit}
      </span>

      {/* Stats */}
      <div className="flex items-center gap-3 mr-auto text-[11px] text-zinc-400">
        <span>💧 {current.precipProb}%</span>
        <span>💨 {current.windSpeed} km/h</span>
        <span>🌡 {current.humidity}%</span>
      </div>

      {/* Location */}
      <span className="text-[10px] text-zinc-600 hidden sm:block">Tenerife, Spain</span>
    </div>
  );
}
