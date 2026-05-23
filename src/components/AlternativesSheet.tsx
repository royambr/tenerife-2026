import React, { useMemo, useState } from 'react';
import type { Activity } from '../data/types';
import { Sheet } from './Sheet';
import { Chip } from './Chip';
import { suggestAlternatives, AlternativeSuggestion } from '../livemode';
import { CATEGORY_ICONS, costLabel } from '../utils';
import { store, useStore } from '../store';

export function AlternativesSheet({ target, open, onClose }:{
  target: Activity | null; open: boolean; onClose: () => void;
}) {
  const all = useStore(s => s.activities);
  const suggestions = useMemo(() =>
    target ? suggestAlternatives(target, all) : [],
    [target, all]
  );
  const [picked, setPicked] = useState<AlternativeSuggestion | null>(null);

  if (!target) return null;

  function confirmReplace() {
    if (!target || !picked) return;
    store.replaceActivity(target.id, {
      name: picked.activity.name,
      category: picked.activity.category,
      region: picked.activity.region,
      description: picked.activity.description,
      costLevel: picked.activity.costLevel,
      bookingRequired: picked.activity.bookingRequired,
      status: picked.activity.bookingRequired ? 'דורש החלטה' : 'מתוכנן',
    });
    setPicked(null);
    onClose();
  }

  if (picked) {
    return (
      <Sheet open={open} onClose={() => setPicked(null)} title="מה השתנה?">
        <div className="space-y-4">
          <div className="rounded-2xl bg-red-50 border border-red-100 p-3">
            <div className="text-[11px] font-bold text-red-600 mb-1">יוצא</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{CATEGORY_ICONS[target.category]}</span>
              <div className="text-[14px] font-bold text-ocean-700">{target.name}</div>
            </div>
          </div>
          <div className="text-center text-2xl">↓</div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3">
            <div className="text-[11px] font-bold text-emerald-700 mb-1">נכנס</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{CATEGORY_ICONS[picked.activity.category]}</span>
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-ocean-700">{picked.activity.name}</div>
                <div className="text-[11px] text-zinc-500">{picked.activity.region} · {picked.activity.category}</div>
              </div>
            </div>
          </div>
          {picked.activity.bookingRequired && (
            <div className="rounded-2xl bg-sunset-300/20 border border-sunset-300 p-3 text-[13px] text-sunset-700 font-bold">
              ⚠️ דורש הזמנה — נוסיף לרשימת "צריך לסגור"
            </div>
          )}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button onClick={confirmReplace} className="rounded-2xl bg-ocean-700 text-white py-3 font-bold">אשר שינוי</button>
            <button onClick={() => setPicked(null)} className="rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 font-bold">חזור לבחירה</button>
          </div>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title={`החלף את "${target.name}"`}>
      <div className="space-y-3">
        <p className="text-[13px] text-zinc-500">מצאנו {suggestions.length} חלופות חכמות:</p>
        {suggestions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl">🤔</div>
            <div className="text-[13px] text-zinc-500 mt-2">לא נמצאו חלופות מתאימות</div>
          </div>
        )}
        {suggestions.map(s => (
          <button key={s.activity.id} onClick={() => setPicked(s)}
                  className="w-full text-right rounded-2xl bg-white border border-ocean-100 hover:border-sunset-500 p-3 transition">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{CATEGORY_ICONS[s.activity.category]}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold text-ocean-700 truncate">{s.activity.name}</div>
                <div className="text-[11px] text-zinc-500 mb-1.5">{s.activity.region} · {s.activity.category} · {costLabel(s.activity.costLevel)}</div>
                <div className="flex flex-wrap gap-1">
                  {s.reasons.slice(0,3).map((r,i) => <Chip key={i} tone="emerald">{r}</Chip>)}
                </div>
              </div>
              <div className="text-left flex-shrink-0">
                <div className="text-[10px] text-zinc-500">ציון</div>
                <div className="text-[16px] font-extrabold text-sunset-700">{s.score}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
