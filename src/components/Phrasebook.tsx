import React, { useState } from 'react';
import { PHRASES, PHRASE_CATEGORIES } from '../data/phrases';

export function Phrasebook() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="rounded-2xl bg-white border border-ocean-100 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="text-[13px] font-extrabold text-ocean-700">🇪🇸 ספרדית מהירה</span>
        <span className="text-[11px] text-zinc-400">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {PHRASE_CATEGORIES.map(cat => (
            <div key={cat}>
              <div className="text-[11px] font-extrabold text-zinc-500 mb-1.5">{cat}</div>
              <div className="space-y-1.5">
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
      )}
    </div>
  );
}
