import React from 'react';
import { fmtDateShort } from '../utils';

export function TripProgress({ dates, activeDate, onPick }:{
  dates: string[]; activeDate: string; onPick?: (d: string) => void;
}) {
  const idx = Math.max(0, dates.indexOf(activeDate));
  const pct = ((idx) / Math.max(1, dates.length - 1)) * 100;
  return (
    <div className="rounded-2xl bg-white shadow-soft border border-ocean-100/60 p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-bold text-zinc-500">קצב הטיול</div>
        <div className="text-[11px] font-bold text-ocean-700">יום {idx + 1} מתוך {dates.length}</div>
      </div>
      <div className="relative h-2 rounded-full bg-ocean-50 overflow-hidden">
        <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-sunset-500 to-ocean-700 rounded-full transition-all"
             style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex justify-between gap-1">
        {dates.map((d, i) => (
          <button key={d} onClick={() => onPick?.(d)}
                  className={`flex-1 flex flex-col items-center py-1 rounded-lg text-[10px] font-bold
                    ${i === idx ? 'bg-ocean-700 text-white' : 'text-zinc-500 hover:bg-ocean-50'}`}>
            <span>{fmtDateShort(d)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
