import React, { useMemo, useState } from 'react';
import { useStore, useEditMode, editStore, store } from '../store';
import { activitiesFor, fmtDateLong, INTENSITY_COLORS, sortActivities } from '../utils';
import { detectConflicts } from '../livemode';
import { ActivityCard } from '../components/ActivityCard';
import { ActivitySheet } from '../components/ActivitySheet';
import type { Activity, DayPart } from '../data/types';
import { Sheet } from '../components/Sheet';
import { ActivityEditor } from '../components/ActivityEditor';
import { AlternativesSheet } from '../components/AlternativesSheet';

const SECTIONS: { part: DayPart; label: string }[] = [
  { part: 'morning', label: 'בוקר' },
  { part: 'noon',    label: 'צהריים' },
  { part: 'evening', label: 'ערב' },
  { part: 'night',   label: 'לילה' },
  { part: 'lateNight', label: 'לילה מאוחר' }
];

export function Schedule() {
  const plan = useStore(s => s.plans.find(p => p.id === s.trip.activePlanId)!);
  const activities = useStore(s => s.activities);
  const edit = useEditMode();
  const [sel, setSel] = useState<Activity | null>(null);
  const [addFor, setAddFor] = useState<string | null>(null);
  const [altFor, setAltFor] = useState<Activity | null>(null);

  const dates = plan.days.map(d => d.date);
  const allSorted = useMemo(() => sortActivities(activities.filter(a => a.planId === plan.id)), [activities, plan.id]);

  return (
    <div className="p-4 pb-2 space-y-5 animate-fade-up">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-ocean-700">לו״ז מלא</h1>
          <div className="text-[12px] text-zinc-500">תוכנית פעילה: {plan.name}</div>
        </div>
        <button onClick={editStore.toggle}
                className={`rounded-full text-[12px] font-bold px-3.5 py-2 border
                  ${edit ? 'bg-volcano-900 text-white border-volcano-900' : 'bg-white text-ocean-700 border-ocean-100'}`}>
          {edit ? '✓ מצב עריכה פעיל' : 'מצב עריכה'}
        </button>
      </header>

      <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5">
      {dates.map(date => {
        const day = plan.days.find(d => d.date === date)!;
        const acts = activitiesFor(plan.id, activities, date);
        const dayConflicts = detectConflicts(acts, allSorted);
        return (
          <section key={date} className="space-y-2 lg:bg-white lg:rounded-3xl lg:p-4 lg:border lg:border-ocean-100/60 lg:shadow-soft">
            <div className="flex items-center justify-between sticky top-0 lg:static bg-gradient-to-b from-[#f6fbfd] to-[#f6fbfd]/80 lg:bg-none backdrop-blur lg:backdrop-blur-0 z-10 -mx-4 lg:mx-0 px-4 lg:px-0 py-2 lg:py-0 lg:mb-2">
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-ocean-700 truncate">{day.title}</div>
                <div className="text-[11px] text-zinc-500">{fmtDateLong(date)}</div>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-bl ${INTENSITY_COLORS[day.intensity]}`}
                    aria-label={day.intensity} title={day.intensity} />
            </div>

            {dayConflicts.slice(0, 2).map(c => (
              <div key={c.id} className={`rounded-xl p-2 text-[11px] font-bold mb-1 border ${
                c.level === 'critical' ? 'bg-red-50 border-red-200 text-red-700' :
                c.level === 'warning' ? 'bg-sunset-300/15 border-sunset-300 text-sunset-700' :
                'bg-ocean-50 border-ocean-100 text-ocean-700'
              }`}>
                <div>{c.level === 'critical' ? '🚨' : c.level === 'warning' ? '⚠️' : 'ℹ️'} {c.text}</div>
                {c.hint && <div className="text-[10px] opacity-80 font-semibold mt-0.5">{c.hint}</div>}
              </div>
            ))}

            {SECTIONS.map(sec => {
              const items = acts.filter(a => a.dayPart === sec.part);
              if (items.length === 0 && !edit) return null;
              return (
                <div key={sec.part}>
                  <div className="text-[11px] font-bold text-zinc-500 mb-1.5 mt-2">{sec.label}</div>
                  <div className="space-y-2">
                    {items.map(a => <ActivityCard key={a.id} a={a} onClick={() => setSel(a)} onReplace={(x) => setAltFor(x)} />)}
                    {edit && (
                      <button onClick={() => setAddFor(date + '|' + sec.part)}
                              className="w-full rounded-2xl border-2 border-dashed border-ocean-200 text-ocean-700 py-3 text-sm font-bold hover:bg-ocean-50">
                        + הוסף פעילות ל{sec.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
      </div>

      <ActivitySheet activity={sel} open={!!sel} onClose={() => setSel(null)} onReplace={(a) => { setSel(null); setAltFor(a); }} />
      <AlternativesSheet target={altFor} open={!!altFor} onClose={() => setAltFor(null)} />

      {addFor && (() => {
        const [d, p] = addFor.split('|') as [string, DayPart];
        const blank: Activity = {
          id: 'act_' + Math.random().toString(36).slice(2, 9),
          planId: plan.id, dayDate: d, dayPart: p,
          startTime: '10:00', endTime: '12:00',
          name: '', category: 'אחר', region: 'דרום',
          costLevel: 2, status: 'מתוכנן', priority: 'רגיל', bookingRequired: false
        };
        return (
          <Sheet open onClose={() => setAddFor(null)} title="הוסף פעילות">
            <ActivityEditor initial={blank}
                            onSave={a => { store.upsertActivity(a); setAddFor(null); }}
                            onCancel={() => setAddFor(null)} />
          </Sheet>
        );
      })()}
    </div>
  );
}
