import React, { useState } from 'react';
import { PHRASES, PHRASE_CATEGORIES } from '../data/phrases';

export function Phrasebook() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">🇪🇸 ספרדית מהירה</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">לחץ על ביטוי להעתקה</p>
      </header>
      {PHRASE_CATEGORIES.map(cat => (
        <div key={cat} className="rounded-2xl bg-white border border-ocean-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-ocean-50 border-b border-ocean-100">
            <div className="text-[12px] font-extrabold text-ocean-700">{cat}</div>
          </div>
          <div className="p-3 space-y-1.5">
            {PHRASES.filter(p => p.category === cat).map(p => (
              <button
                key={p.es}
                onClick={() => copy(p.es)}
                className="w-full text-right rounded-xl bg-ocean-50/60 border border-ocean-100 px-3 py-2 active:bg-ocean-100"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-bold text-ocean-700">{p.es}</span>
                  {copied === p.es && <span className="text-[10px] text-emerald-600 font-bold">הועתק ✓</span>}
                </div>
                <div className="text-[11px] text-zinc-500">{p.he} · <span className="italic">{p.phonetic}</span></div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
