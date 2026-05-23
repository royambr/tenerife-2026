import React, { useMemo, useState } from 'react';
import { useStore, store } from '../store';
import { activitiesFor, clampToTrip, fmtDateLong, fmtDateShort, iso, minutesFromHM, nextActivity, CATEGORY_ICONS, costLabel, INTENSITY_COLORS, buildMapsUrl } from '../utils';
import { ActivityCard } from '../components/ActivityCard';
import { ActivitySheet } from '../components/ActivitySheet';
import { TripProgress } from '../components/TripProgress';
import { Chip } from '../components/Chip';
import type { Activity } from '../data/types';

export function Today() {
  const trip = useStore(s => s.trip);
  const plan = useStore(s => s.plans.find(p => p.id === s.trip.activePlanId)!);
  const activities = useStore(s => s.activities);

  const allDates = useMemo(() => plan.days.map(d => d.date), [plan]);
  const realToday = iso(new Date());
  const initial = clampToTrip(realToday, trip.startDate, trip.endDate);
  const [activeDate, setActiveDate] = useState(initial);

  const day = plan.days.find(d => d.date === activeDate)!;
  const todays = activitiesFor(plan.id, activities, activeDate);
  const dayIdx = allDates.indexOf(activeDate);

  const nowMin = realToday === activeDate
    ? new Date().getHours()*60 + new Date().getMinutes()
    : -1;
  const next = nowMin >= 0
    ? todays.find(a => minutesFromHM(a.startTime) >= nowMin) || todays[0]
    : todays[0];

  const toBook = activitiesFor(plan.id, activities).filter(a => a.bookingRequired && a.status !== 'הוזמן').slice(0, 4);
  const [sel, setSel] = useState<Activity | null>(null);

  return (
    <div className="p-4 pb-2 space-y-4 animate-fade-up lg:max-w-3xl">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-[12px] font-bold text-sunset-700">{trip.title}</div>
          <h1 className="text-[22px] font-extrabold text-ocean-700 leading-tight mt-0.5">מה עושים היום?</h1>
          <div className="text-[12px] text-zinc-500 mt-0.5">{fmtDateLong(activeDate)} · יום {dayIdx + 1}</div>
        </div>
        <div className={`rounded-2xl px-3 py-2 bg-gradient-to-bl ${INTENSITY_COLORS[day.intensity]} text-white shadow-soft text-center`}>
          <div className="text-[10px] font-bold opacity-90">עומס היום</div>
          <div className="text-sm font-extrabold">{day.intensity}</div>
        </div>
      </header>

      <TripProgress dates={allDates} activeDate={activeDate} onPick={setActiveDate} />

      <div className="rounded-2xl bg-gradient-to-bl from-ocean-700 to-ocean-500 text-white p-4 shadow-card">
        <div className="text-[11px] font-bold opacity-80">איפה ישנים הלילה</div>
        <div className="text-[16px] font-extrabold mt-0.5">🏨 {day.sleepingAt}</div>
        {day.notes && <div className="text-[12px] opacity-90 mt-1">{day.notes}</div>}
      </div>

      {next && (
        <div className="rounded-3xl bg-white shadow-card border border-ocean-100/60 overflow-hidden animate-pulse-soft">
          <div className="px-4 pt-4 flex items-center justify-between">
            <Chip tone="sunset">⏭️ הדבר הבא</Chip>
            <div className="text-[12px] text-zinc-500 font-bold">{next.startTime}</div>
          </div>
          <div className="px-4 pt-3 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{CATEGORY_ICONS[next.category]}</span>
              <div className="min-w-0">
                <div className="text-[18px] font-extrabold text-ocean-700 truncate">{next.name}</div>
                <div className="text-[12px] text-zinc-500 truncate">{next.region} · {next.category} · {costLabel(next.costLevel)}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <a href={next.mapsUrl || buildMapsUrl(next.name)} target="_blank" rel="noreferrer"
                 className="rounded-xl bg-ocean-700 text-white text-[12px] font-bold py-2.5 text-center">🧭 ניווט</a>
              <button onClick={() => setSel(next)}
                      className="rounded-xl bg-sand-100 text-ocean-700 text-[12px] font-bold py-2.5">ראה פרטים</button>
              <button onClick={() => store.setStatus(next.id, 'בוצע')}
                      className="rounded-xl bg-emerald-500 text-white text-[12px] font-bold py-2.5">סמן כבוצע</button>
              <button onClick={() => setSel(next)}
                      className="rounded-xl bg-white border border-ocean-100 text-ocean-700 text-[12px] font-bold py-2.5">החלף</button>
            </div>
          </div>
        </div>
      )}

      {day.alerts && day.alerts.length > 0 && (
        <div className="rounded-2xl bg-sunset-300/20 border border-sunset-300 p-3.5">
          <div className="text-[12px] font-bold text-sunset-700 mb-1.5">חשוב לזכור</div>
          <ul className="space-y-1">
            {day.alerts.map((al, i) => (
              <li key={i} className="text-[13px] text-volcano-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sunset-500 flex-shrink-0" />{al}
              </li>
            ))}
          </ul>
        </div>
      )}

      {toBook.length > 0 && (
        <div className="rounded-2xl bg-white border border-ocean-100/60 shadow-soft p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] font-extrabold text-ocean-700">📌 צריך לסגור</div>
            <div className="text-[11px] text-zinc-500">{toBook.length} פעילויות</div>
          </div>
          <div className="space-y-1.5">
            {toBook.map(a => (
              <button key={a.id} onClick={() => setSel(a)}
                      className="w-full flex items-center justify-between text-right px-2.5 py-2 rounded-xl hover:bg-ocean-50 transition">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{CATEGORY_ICONS[a.category]}</span>
                  <span className="text-[13px] font-semibold text-ocean-700 truncate">{a.name}</span>
                </div>
                <span className="text-[11px] text-zinc-500">{fmtDateShort(a.dayDate)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-[13px] font-extrabold text-ocean-700 mb-2 mt-1">ההמשך של היום</div>
        <div className="space-y-2">
          {todays.length === 0 && <EmptyDay />}
          {todays.map(a => (
            <ActivityCard key={a.id} a={a} onClick={() => setSel(a)} />
          ))}
        </div>
      </div>

      <ActivitySheet activity={sel} open={!!sel} onClose={() => setSel(null)} />
    </div>
  );
}

function EmptyDay() {
  return (
    <div className="rounded-2xl bg-white p-6 text-center border border-ocean-100/60">
      <div className="text-3xl">🌴</div>
      <div className="text-[14px] font-bold text-ocean-700 mt-2">היום פנוי לאלתור</div>
      <div className="text-[12px] text-zinc-500 mt-1">זורמים?</div>
    </div>
  );
}
