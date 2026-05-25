import React, { useState } from 'react';
import { useWeatherData, weatherIcon, weatherLabel, toF } from '../data/weather';

function TempChart({ points, useFahrenheit }: { points: { hour: string; temp: number }[]; useFahrenheit: boolean }) {
  if (points.length < 2) return null;
  const temps = points.map(p => useFahrenheit ? toF(p.temp) : p.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const W = 600; const H = 90; const PAD = 20;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const step = innerW / (points.length - 1);

  const coords = temps.map((t, i) => ({
    x: PAD + i * step,
    y: PAD + innerH - ((t - min) / range) * innerH,
    t,
  }));

  const d = coords.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = coords[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
  const fill = `${d} L ${coords[coords.length - 1].x} ${H} L ${coords[0].x} ${H} Z`;

  const labelPoints = coords.filter((_, i) => i % 3 === 0 || i === coords.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#chartFill)" />
      <path d={d} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {labelPoints.map((p, i) => (
        <text key={i} x={p.x} y={p.y - 6} textAnchor="middle" fill="#9ca3af" fontSize="15" fontWeight="600">
          {p.t}
        </text>
      ))}
    </svg>
  );
}

export function LiveWeather() {
  const data = useWeatherData();
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const cvt = (c: number) => useFahrenheit ? toF(c) : c;
  const unit = useFahrenheit ? '°F' : '°C';

  if (!data) {
    return (
      <div className="rounded-2xl bg-[#202124] px-4 py-4 animate-pulse">
        <div className="h-4 bg-zinc-700 rounded w-32 mb-3" />
        <div className="h-12 bg-zinc-700 rounded w-24 mb-3" />
        <div className="h-3 bg-zinc-800 rounded w-full" />
      </div>
    );
  }

  const { current, hourly, daily } = data;
  const today = daily[0];
  const chartHours = hourly.slice(0, 24);
  const xLabels = chartHours.filter((_, i) => i % 3 === 0);

  return (
    <div className="rounded-2xl bg-[#202124] text-white overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px] text-zinc-300 font-medium">
          <span>📍</span><span>Tenerife, Spain</span>
        </div>
        <button
          onClick={() => setUseFahrenheit(f => !f)}
          className="text-[12px] font-bold text-zinc-400 hover:text-white transition-colors border border-zinc-600 rounded-full px-2 py-0.5"
        >
          {useFahrenheit ? '°F' : '°C'}
        </button>
      </div>

      {/* Current */}
      <div className="px-4 pb-2 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-5xl leading-none">{weatherIcon(current.code)}</span>
          <div>
            <div className="text-[52px] font-light leading-none tracking-tight">
              {cvt(current.temp)}<span className="text-[26px] text-zinc-400 ml-1">{unit}</span>
            </div>
            <div className="text-[12px] text-zinc-400 mt-1">
              {cvt(today.tMax)}{unit} / {cvt(today.tMin)}{unit}
            </div>
          </div>
        </div>
        <div className="text-right pt-1">
          <div className="text-[22px] font-semibold text-zinc-100">Weather</div>
          <div className="text-[13px] text-zinc-400">{today.dayName}</div>
          <div className="text-[13px] text-zinc-400">{weatherLabel(current.code)}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-zinc-400">
        <span>Precipitation: {current.precipProb}%</span>
        <span>Humidity: {current.humidity}%</span>
        <span>Wind: {current.windSpeed} km/h</span>
      </div>

      {/* Chart */}
      <div className="px-2">
        <TempChart points={chartHours} useFahrenheit={useFahrenheit} />
      </div>

      {/* Hour labels */}
      <div className="px-4 pb-3 flex justify-between text-[10px] text-zinc-500">
        {xLabels.map((p, i) => <span key={i}>{p.hour}</span>)}
      </div>

      <div className="border-t border-zinc-700 mx-3" />

      {/* 7-day forecast */}
      <div className="flex overflow-x-auto px-2 py-3 gap-1 scrollbar-none">
        {daily.slice(0, 8).map((d, i) => (
          <div
            key={d.date}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-shrink-0 min-w-[58px] ${
              i === 0 ? 'bg-zinc-700' : ''
            }`}
          >
            <span className="text-[12px] font-bold text-zinc-200">{i === 0 ? 'Today' : d.dayName}</span>
            <span className="text-xl">{weatherIcon(d.code)}</span>
            <span className="text-[13px] font-bold text-zinc-100">{cvt(d.tMax)}{unit}</span>
            <span className="text-[11px] text-zinc-400">{cvt(d.tMin)}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
