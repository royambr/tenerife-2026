import React, { useState } from 'react';
import { useStore, store } from '../store';
import { activitiesFor, CATEGORY_ICONS, fmtDateShort } from '../utils';
import { Chip } from '../components/Chip';
import type { Plan } from '../data/types';

export function Plans() {
  const trip = useStore(s => s.trip);
  const plans = useStore(s => s.plans);
  const activities = useStore(s => s.activities);
  const [compareDate, setCompareDate] = useState<string | null>(null);

  const dates = plans[0].days.map(d => d.date);

  return (
    <div className="p-4 pb-2 space-y-5 animate-fade-up">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">איך נראה הטיול?</h1>
        <div className="text-[12px] text-zinc-500 mt-0.5">בחרו אופציה — תמיד אפשר להתחרט</div>
      </header>

      <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
        {plans.map(p => <PlanCard key={p.id} plan={p} active={p.id === trip.activePlanId}
                                  onSelect={() => store.setActivePlan(p.id)} />)}
      </div>

      <div className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-extrabold text-ocean-700">השוואה לפי יום</div>
          <select value={compareDate || ''} onChange={e => setCompareDate(e.target.value || null)}
                  className="text-[12px] rounded-lg border border-ocean-100 px-2 py-1">
            <option value="">בחר תאריך</option>
            {dates.map(d => <option key={d} value={d}>{fmtDateShort(d)}</option>)}
          </select>
        </div>
        {compareDate ? (
          <div className="space-y-2.5">
            {plans.map(p => {
              const acts = activitiesFor(p.id, activities, compareDate);
              return (
                <div key={p.id} className="rounded-xl bg-ocean-50/60 p-2.5">
                  <div className="text-[12px] font-extrabold text-ocean-700 mb-1">{p.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {acts.slice(0,6).map(a => (
                      <span key={a.id} className="text-[11px] bg-white rounded-full px-2 py-1 text-zinc-700">
                        {CATEGORY_ICONS[a.category]} {a.name}
                      </span>
                    ))}
                    {acts.length === 0 && <span className="text-[11px] text-zinc-500">אין פעילויות מתוכננות</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[12px] text-zinc-500">בחרו תאריך כדי להשוות בין שלוש האופציות.</div>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3.5">
        <div className="text-[13px] font-extrabold text-ocean-700 mb-2">📈 תזרים מהיר</div>
        <div className="space-y-2">
          {plans.map(p => (
            <div key={p.id} className="rounded-xl bg-ocean-50/40 p-2">
              <div className="text-[11px] font-bold text-ocean-700 mb-1">{p.name}</div>
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {p.days.map(d => {
                  const top = activitiesFor(p.id, activities, d.date)[0];
                  return (
                    <div key={d.date} className="flex-shrink-0 w-16 text-center">
                      <div className="text-[10px] text-zinc-500">{fmtDateShort(d.date)}</div>
                      <div className="text-xl">{top ? CATEGORY_ICONS[top.category] : '🌴'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, active, onSelect }:{ plan: Plan; active: boolean; onSelect: () => void }) {
  return (
    <div className={`rounded-3xl p-4 shadow-card border transition
      ${active ? 'border-sunset-500 bg-gradient-to-bl from-white to-sand-50' : 'border-ocean-100 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] font-extrabold text-ocean-700">{plan.name}</h3>
            {active && <Chip tone="sunset">פעיל</Chip>}
          </div>
          <div className="text-[12px] text-zinc-500 mt-0.5">{plan.vibe}</div>
        </div>
        <button onClick={onSelect}
                className={`text-[12px] font-bold px-3 py-2 rounded-full whitespace-nowrap
                  ${active ? 'bg-ocean-100 text-ocean-700' : 'bg-ocean-700 text-white'}`}>
          {active ? '✓ נבחר' : 'הפוך לפעיל'}
        </button>
      </div>
      <p className="text-[13px] text-zinc-700 leading-6 mt-2">{plan.description}</p>
      <div className="grid grid-cols-4 gap-2 mt-3">
        <Meter label="טבע" v={plan.natureLevel} />
        <Meter label="חיי לילה" v={plan.nightlifeLevel} />
        <Meter label="עומס" v={plan.effortLevel} />
        <Meter label="עלות" v={plan.costLevel} max={4} />
      </div>
      <div className="mt-3">
        <div className="text-[11px] font-bold text-zinc-500 mb-1">מתאים ל</div>
        <div className="text-[13px] text-ocean-700 font-semibold">{plan.bestFor}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {plan.highlights.map((h, i) => <Chip key={i} tone="sand">⭐ {h}</Chip>)}
      </div>
    </div>
  );
}

function Meter({ label, v, max=5 }:{ label: string; v: number; max?: number }) {
  return (
    <div className="rounded-xl bg-white border border-ocean-100 p-2 text-center">
      <div className="text-[10px] text-zinc-500 mb-1">{label}</div>
      <div className="flex justify-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={`w-1.5 h-3 rounded-full ${i < v ? 'bg-sunset-500' : 'bg-zinc-200'}`} />
        ))}
      </div>
    </div>
  );
}
