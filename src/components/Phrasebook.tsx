import React from 'react';
import { PHRASES, PHRASE_CATEGORIES } from '../data/phrases';

export function Phrasebook() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">🇪🇸 ספרדית מהירה</h1>
      </header>
      {PHRASE_CATEGORIES.map(cat => (
        <div key={cat} className="rounded-2xl bg-white border border-ocean-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-ocean-50 border-b border-ocean-100">
            <div className="text-[12px] font-extrabold text-ocean-700">{cat}</div>
          </div>
          <div className="p-3 space-y-1.5">
            {PHRASES.filter(p => p.category === cat).map(p => (
              <div
                key={p.es}
                className="w-full text-right rounded-xl bg-ocean-50/60 border border-ocean-100 px-3 py-2"
              >
                <div className="text-[12px] font-bold text-ocean-700">{p.es}</div>
                <div className="text-[11px] text-zinc-500">{p.he} · <span className="italic">{p.phonetic}</span></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
