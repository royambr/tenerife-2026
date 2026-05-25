import React from 'react';
import { TENERIFE_FACTS } from '../data/facts';

function canaryDayOfYear(): number {
  const str = new Date().toLocaleDateString('en-CA', { timeZone: 'Atlantic/Canary' });
  const [y, m, d] = str.split('-').map(Number);
  const start = new Date(y, 0, 0).getTime();
  const day = new Date(y, m - 1, d).getTime();
  return Math.floor((day - start) / 86400000);
}

export function FunFact() {
  const fact = TENERIFE_FACTS[canaryDayOfYear() % TENERIFE_FACTS.length];
  return (
    <div className="rounded-2xl bg-white border border-ocean-100 p-3">
      <div className="text-[11px] font-extrabold text-ocean-700 mb-1.5">🌋 ידעת?</div>
      <p className="text-[12px] text-zinc-600 leading-5">{fact}</p>
    </div>
  );
}
