import React, { useState } from 'react';
import { useStore, store } from '../store';
import { activitiesFor, CATEGORY_ICONS, fmtDateShort } from '../utils';
import { Chip } from '../components/Chip';
import type { Plan } from '../data/types';

type Axis = { id: string; label: string; icon: string; get: (p: Plan) => number; max: number };
const AXES: Axis[] = [
  { id: 'vibe',      label: 'אנרגיה',   icon: '⚡', get: p => p.effortLevel,    max: 5 },
  { id: 'cost',      label: 'עלות',     icon: '💶', get: p => p.costLevel,      max: 4 },
  { id: 'nature',    label: 'טבע',      icon: '🌿', get: p => p.natureLevel,    max: 5 },
  { id: 'beach',     label: 'חופים',    icon: '🏖️', get: p => p.beachLevel || 3,max: 5 },
  { id: 'nightlife', label: 'לילה',     icon: '🎉', get: p => p.nightlifeLevel, max: 5 },
];

const PLAN_GRADIENTS: Record<string,string> = {
  'plan_balanced': 'from-ocean-700 to-ocean-500',
  'plan_nature':   'from-emerald-600 to-emerald-400',
  'plan_beach':    'from-sunset-500 to-sand-300',
};

export function Plans() {
  const trip = useStore(s => s.trip);
  const plans = useStore(s => s.plans);
  const activities = useStore(s => s.activities);
  const [compareDate, setCompareDate] = useState<string | null>(null);
  const [view, setView] = useState<'cards'|'compare'|'flow'>('cards');

  const dates = plans[0].days.map(d => d.date);

  return (
    <div className="p-4 pb-2 space-y-4 animate-fade-up">
      <header>
        <h1 className="text-[20px] font-extrabold text-ocean-700">איך נראה הטיול?</h1>
        <div className="text-[12px] text-zinc-500 mt-0.5">בחרו אופציה — תמיד אפשר להתחרט</div>
      </header>

      {/* View switcher */}
      <div className="grid grid-cols-3 gap-1.5 bg-white rounded-2xl p-1 border border-ocean-100">
        <ViewBtn active={view==='cards'} onClick={() => setView('cards')} icon="🃏" label="כרטיסים" />
        <ViewBtn active={view==='compare'} onClick={() => setView('compare')} icon="⚖️" label="השוואה" />
        <ViewBtn active={view==='flow'} onClick={() => setView('flow')} icon="📈" label="זרימה" />
      </div>

      {view === 'cards' && (
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
          {plans.map(p => <PlanCard key={p.id} plan={p} active={p.id === trip.activePlanId}
                                    onSelect={() => store.setActivePlan(p.id)} />)}
        </div>
      )}

      {view === 'compare' && (
        <div className="space-y-4">
          {/* Side-by-side icon meters */}
          <div className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3 overflow-x-auto">
            <table className="w-full text-center min-w-[400px]">
              <thead>
                <tr>
                  <th className="text-[11px] text-zinc-500 font-bold py-2"></th>
                  {plans.map(p => (
                    <th key={p.id} className="text-[12px] font-extrabold text-ocean-700 py-2 px-1">
                      <button onClick={() => store.setActivePlan(p.id)}
                              className={`block w-full rounded-xl px-2 py-1.5 text-white bg-gradient-to-bl ${PLAN_GRADIENTS[p.id]}
                                ${trip.activePlanId === p.id ? 'ring-2 ring-sunset-500' : 'opacity-80'}`}>
                        {p.name}
                        {trip.activePlanId === p.id && <span className="block text-[9px] mt-0.5">✓ פעיל</span>}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AXES.map(ax => (
                  <tr key={ax.id} className="border-t border-ocean-100">
                    <td className="text-[12px] font-bold text-ocean-700 py-2.5 text-right pr-1">
                      <span className="text-lg ml-1">{ax.icon}</span>{ax.label}
                    </td>
                    {plans.map(p => (
                      <td key={p.id} className="py-2.5 px-1">
                        <IconMeter value={ax.get(p)} max={ax.max} icon={ax.icon} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Day-level comparison */}
          <div className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-extrabold text-ocean-700">השוואת יום</div>
              <select value={compareDate || ''} onChange={e => setCompareDate(e.target.value || null)}
                      className="text-[12px] rounded-lg border border-ocean-100 px-2 py-1">
                <option value="">בחר תאריך</option>
                {dates.map(d => <option key={d} value={d}>{fmtDateShort(d)}</option>)}
              </select>
            </div>
            {compareDate ? (
              <div className="space-y-2">
                {plans.map(p => {
                  const acts = activitiesFor(p.id, activities, compareDate);
                  return (
                    <div key={p.id} className="rounded-xl bg-ocean-50/60 p-2">
                      <div className={`inline-block text-[11px] font-extrabold text-white rounded-full px-2 py-0.5 mb-1.5 bg-gradient-to-bl ${PLAN_GRADIENTS[p.id]}`}>
                        {p.name}
                      </div>
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {acts.length === 0 && <span className="text-[11px] text-zinc-500">— ריק —</span>}
                        {acts.map((a, i) => (
                          <React.Fragment key={a.id}>
                            <div className="flex-shrink-0 text-center" title={`${a.startTime} · ${a.name}`}>
                              <div className="text-2xl">{CATEGORY_ICONS[a.category]}</div>
                              <div className="text-[9px] text-zinc-500 tabular-nums">{a.startTime}</div>
                            </div>
                            {i < acts.length - 1 && <span className="text-zinc-300 text-xs">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[12px] text-zinc-500 text-center py-6">
                <div className="text-3xl">📅</div>
                <div className="mt-1">בחרו תאריך כדי להשוות</div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'flow' && (
        <div className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3">
          <div className="text-[13px] font-extrabold text-ocean-700 mb-3">📈 כל הטיול — ציר זמן</div>
          <div className="space-y-3">
            {plans.map(p => (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold text-white rounded-full px-2.5 py-1 bg-gradient-to-bl ${PLAN_GRADIENTS[p.id]}`}>
                    {p.name}
                    {trip.activePlanId === p.id && <span>✓</span>}
                  </div>
                  {trip.activePlanId !== p.id && (
                    <button onClick={() => store.setActivePlan(p.id)}
                            className="text-[10px] font-bold text-ocean-700 underline">הפוך לפעיל</button>
                  )}
                </div>
                <div className="grid grid-cols-8 gap-1 lg:gap-2">
                  {p.days.map(d => {
                    const acts = activitiesFor(p.id, activities, d.date);
                    const top = acts.find(a => a.category !== 'מלון' && a.category !== 'נסיעה / לוגיסטיקה') || acts[0];
                    return (
                      <div key={d.date} className="rounded-lg bg-ocean-50/60 p-1.5 text-center">
                        <div className="text-[9px] text-zinc-500">{fmtDateShort(d.date)}</div>
                        <div className="text-2xl lg:text-3xl my-0.5">{top ? CATEGORY_ICONS[top.category] : '🌴'}</div>
                        <div className={`mx-auto w-1.5 h-1.5 rounded-full ${
                          d.intensity === 'עמוס' ? 'bg-sunset-500' : d.intensity === 'בינוני' ? 'bg-sand-500' : 'bg-emerald-400'
                        }`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 text-[10px] text-zinc-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />רגוע</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sand-500" />בינוני</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sunset-500" />עמוס</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }:{ active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button onClick={onClick}
            className={`rounded-xl py-2 text-[12px] font-bold flex items-center justify-center gap-1.5 min-h-[40px]
              ${active ? 'bg-ocean-700 text-white shadow-soft' : 'text-ocean-700 hover:bg-ocean-50'}`}>
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}

function IconMeter({ value, max, icon }:{ value: number; max: number; icon: string }) {
  return (
    <div className="flex justify-center gap-0.5" title={`${value}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-base leading-none ${i < value ? '' : 'opacity-20 grayscale'}`}>{icon}</span>
      ))}
    </div>
  );
}

function PlanCard({ plan, active, onSelect }:{ plan: Plan; active: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-3xl overflow-hidden border transition
      ${active ? 'border-sunset-500' : 'border-ocean-100'}`}>
      <div className={`bg-gradient-to-bl ${PLAN_GRADIENTS[plan.id]} text-white p-4`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[18px] font-extrabold min-w-0 truncate">{plan.name}{active && <span className="mr-1.5 text-[10px] bg-white/25 rounded-full px-2 py-0.5">✓</span>}</h3>
          <button onClick={onSelect}
                  aria-label={active ? 'תוכנית נבחרה' : 'הפוך לפעיל'}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap min-h-[36px]
                    ${active ? 'bg-white/25 text-white' : 'bg-white text-ocean-700'}`}>
            {active ? '✓ נבחר' : 'בחר'}
          </button>
        </div>
      </div>
      <div className="bg-white p-3 space-y-2.5">
        <div className="grid grid-cols-5 gap-1.5">
          {AXES.map(ax => (
            <div key={ax.id} className="text-center" title={ax.label}>
              <IconMeter value={ax.get(plan)} max={ax.max} icon={ax.icon} />
            </div>
          ))}
        </div>
        <button onClick={() => setOpen(v => !v)} aria-label="פרטים נוספים"
                className="text-[11px] text-ocean-700 font-bold w-full text-right">
          {open ? '▴ פחות' : '▾ עוד'}
        </button>
        {open && (
          <>
            <div className="text-[12px] text-zinc-600 leading-5">{plan.description}</div>
            <div className="text-[12px] text-ocean-700 italic">"{plan.vibe}"</div>
            <div className="flex flex-wrap gap-1.5">
              {plan.highlights.map((h, i) => <Chip key={i} tone="sand">⭐ {h}</Chip>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
