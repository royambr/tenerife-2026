import React, { useMemo, useState } from 'react';
import { useStore, useEditMode, editStore, store } from '../store';
import { activitiesFor, fmtDateLong, INTENSITY_COLORS } from '../utils';
import { ActivityCard } from '../components/ActivityCard';
import { ActivitySheet } from '../components/ActivitySheet';
import type { Activity, DayPart } from '../data/types';
import { Sheet } from '../components/Sheet';
import { ActivityEditor } from '../components/ActivityEditor';

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

  const dates = plan.days.map(d => d.date);

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
        return (
          <section key={date} className="space-y-2 lg:bg-white lg:rounded-3xl lg:p-4 lg:border lg:border-ocean-100/60 lg:shadow-soft">
            <div className="flex items-center justify-between sticky top-0 lg:static bg-gradient-to-b from-[#f6fbfd] to-[#f6fbfd]/80 lg:bg-none backdrop-blur lg:backdrop-blur-0 z-10 -mx-4 lg:mx-0 px-4 lg:px-0 py-2 lg:py-0 lg:mb-2">
              <div>
                <div className="text-[15px] font-extrabold text-ocean-700">{day.title}</div>
                <div className="text-[11px] text-zinc-500">{fmtDateLong(date)} · ישנים: {day.sleepingAt}</div>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white bg-gradient-to-bl ${INTENSITY_COLORS[day.intensity]}`}>
                {day.intensity}
              </span>
            </div>

            {SECTIONS.map(sec => {
              const items = acts.filter(a => a.dayPart === sec.part);
              if (items.length === 0 && !edit) return null;
              return (
                <div key={sec.part}>
                  <div className="text-[11px] font-bold text-zinc-500 mb-1.5 mt-2">{sec.label}</div>
                  <div className="space-y-2">
                    {items.map(a => <ActivityCard key={a.id} a={a} onClick={() => setSel(a)} />)}
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

      <ActivitySheet activity={sel} open={!!sel} onClose={() => setSel(null)} />

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
