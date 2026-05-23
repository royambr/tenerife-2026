import React, { useMemo, useState } from 'react';
import { useStore, store } from '../store';
import { activitiesFor, clampToTrip, fmtDateShort, iso, minutesFromHM, CATEGORY_ICONS, costLabel, INTENSITY_COLORS, buildMapsUrl, sortActivities } from '../utils';
import { ActivityCard } from '../components/ActivityCard';
import { ActivitySheet } from '../components/ActivitySheet';
import { TripProgress } from '../components/TripProgress';
import { Chip } from '../components/Chip';
import { detectConflicts, summarizeDay } from '../livemode';
import type { Activity } from '../data/types';
import { AlternativesSheet } from '../components/AlternativesSheet';

export function Today() {
  const trip = useStore(s => s.trip);
  const plan = useStore(s => s.plans.find(p => p.id === s.trip.activePlanId)!);
  const activities = useStore(s => s.activities);

  const allDates = useMemo(() => plan.days.map(d => d.date), [plan]);
  const realToday = iso(new Date());
  const initial = clampToTrip(realToday, trip.startDate, trip.endDate);
  const [activeDate, setActiveDate] = useState(initial);
  const [showLater, setShowLater] = useState(false);
  const [sel, setSel] = useState<Activity | null>(null);
  const [altFor, setAltFor] = useState<Activity | null>(null);

  const day = plan.days.find(d => d.date === activeDate)!;
  const todays = activitiesFor(plan.id, activities, activeDate);
  const dayIdx = allDates.indexOf(activeDate);
  const allSorted = useMemo(() => sortActivities(activities.filter(a => a.planId === plan.id)), [activities, plan.id]);

  const nowMin = realToday === activeDate
    ? new Date().getHours()*60 + new Date().getMinutes()
    : -1;
  const remaining = nowMin >= 0
    ? todays.filter(a => minutesFromHM(a.endTime) >= nowMin)
    : todays;
  const next = remaining.find(a => a.status !== 'בוצע' && a.status !== 'דולג') || remaining[0];

  const summary = useMemo(() => summarizeDay(todays, allSorted), [todays, allSorted]);
  const conflicts = useMemo(() => detectConflicts(todays, allSorted), [todays, allSorted]);
  const toBook = activitiesFor(plan.id, activities).filter(a => a.bookingRequired && a.status !== 'הוזמן').slice(0, 6);

  const later = remaining.filter(a => a.id !== next?.id);

  return (
    <div className="p-4 pb-2 space-y-3.5 animate-fade-up lg:max-w-3xl">
      {/* compact header */}
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-sunset-700">יום {dayIdx + 1} · {fmtDateShort(activeDate)}</div>
          <h1 className="text-[20px] font-extrabold text-ocean-700 leading-tight truncate">{day.title}</h1>
        </div>
        <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-full text-white bg-gradient-to-bl ${INTENSITY_COLORS[day.intensity]}`}>
          {day.intensity}
        </span>
      </header>

      {/* Day summary banner */}
      <div className="rounded-2xl bg-white shadow-soft border border-ocean-100/60 p-3">
        <p className="text-[14px] text-ocean-700 font-semibold leading-6">{summary.sentence}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {summary.activitiesCount > 0 && <Chip tone="ocean">🎯 {summary.activitiesCount} פעילויות</Chip>}
          {summary.toCloseCount > 0 && <Chip tone="sunset">📌 {summary.toCloseCount} לסגור</Chip>}
          {summary.conflictCount > 0 && <Chip tone="red">⚠️ {summary.conflictCount} שים לב</Chip>}
          <Chip tone="sand">🛌 {day.sleepingAt}</Chip>
        </div>
      </div>

      <TripProgress dates={allDates} activeDate={activeDate} onPick={setActiveDate} />

      {/* Hero "next" card */}
      {next ? (
        <div className="rounded-3xl bg-gradient-to-bl from-ocean-700 to-ocean-500 text-white shadow-card overflow-hidden">
          <div className="px-4 pt-4 flex items-center justify-between">
            <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-[11px] font-extrabold">⏭️ הדבר הבא</span>
            <div className="text-[14px] font-extrabold tabular-nums bg-sunset-500 rounded-full px-3 py-1">{next.startTime}</div>
          </div>
          <div className="px-4 pt-3 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-6xl">{CATEGORY_ICONS[next.category]}</span>
              <div className="min-w-0">
                <div className="text-[22px] font-extrabold leading-tight">{next.name}</div>
                <div className="text-[12px] opacity-90 mt-0.5">{next.region} · {costLabel(next.costLevel)}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              <a href={next.mapsUrl || buildMapsUrl(next.name)} target="_blank" rel="noreferrer"
                 className="rounded-xl bg-white text-ocean-700 text-[11px] font-extrabold py-2.5 text-center min-h-[44px] flex flex-col items-center justify-center">
                <span className="text-lg leading-none">🧭</span>
                <span>ניווט</span>
              </a>
              <button onClick={() => store.setStatus(next.id, 'בוצע')}
                      className="rounded-xl bg-emerald-500 text-white text-[11px] font-extrabold py-2.5 min-h-[44px] flex flex-col items-center justify-center">
                <span className="text-lg leading-none">✓</span>
                <span>בוצע</span>
              </button>
              <button onClick={() => store.setStatus(next.id, 'דולג')}
                      className="rounded-xl bg-white/15 backdrop-blur text-white text-[11px] font-extrabold py-2.5 min-h-[44px] flex flex-col items-center justify-center">
                <span className="text-lg leading-none">⏩</span>
                <span>דלג</span>
              </button>
              <button onClick={() => setAltFor(next)}
                      className="rounded-xl bg-white/15 backdrop-blur text-white text-[11px] font-extrabold py-2.5 min-h-[44px] flex flex-col items-center justify-center">
                <span className="text-lg leading-none">🔄</span>
                <span>החלף</span>
              </button>
              <button onClick={() => setSel(next)}
                      className="rounded-xl bg-sunset-500 text-white text-[11px] font-extrabold py-2.5 min-h-[44px] flex flex-col items-center justify-center">
                <span className="text-lg leading-none">📖</span>
                <span>פרטים</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyDay />
      )}

      {/* Conflicts inline */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.slice(0, 3).map(c => (
            <ConflictBanner key={c.id} conflict={c}
                            onReplace={() => {
                              const a = todays.find(x => c.relatedIds?.includes(x.id));
                              if (a) setAltFor(a);
                            }}
                            onOpen={() => {
                              const a = todays.find(x => c.relatedIds?.includes(x.id));
                              if (a) setSel(a);
                            }}/>
          ))}
        </div>
      )}

      {/* To book - chips only */}
      {toBook.length > 0 && (
        <details className="rounded-2xl bg-white border border-sunset-300 shadow-soft p-3" open>
          <summary className="flex items-center justify-between cursor-pointer">
            <div className="text-[13px] font-extrabold text-sunset-700">📌 צריך לסגור</div>
            <Chip tone="sunset">{toBook.length}</Chip>
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {toBook.map(a => (
              <button key={a.id} onClick={() => setSel(a)}
                      className="flex items-center gap-1.5 bg-sand-100 hover:bg-sand-200 rounded-full px-3 py-1.5 text-[12px] font-bold text-ocean-700">
                <span>{CATEGORY_ICONS[a.category]}</span>
                <span className="truncate max-w-[140px]">{a.name}</span>
                <span className="text-[10px] text-zinc-500">·{fmtDateShort(a.dayDate)}</span>
              </button>
            ))}
          </div>
        </details>
      )}

      {/* Later today */}
      {later.length > 0 && (
        <div>
          <button onClick={() => setShowLater(v => !v)}
                  className="w-full flex items-center justify-between mb-2 py-1">
            <span className="text-[13px] font-extrabold text-ocean-700">ההמשך של היום</span>
            <Chip tone="ocean">{later.length} {showLater ? '▲' : '▼'}</Chip>
          </button>
          {showLater && (
            <div className="space-y-2">
              {later.map(a => (
                <ActivityCard key={a.id} a={a}
                              onClick={() => setSel(a)}
                              onReplace={(x) => setAltFor(x)} compact />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alerts collapsed */}
      {day.alerts && day.alerts.length > 0 && (
        <details className="rounded-2xl bg-sunset-300/10 border border-sunset-300 p-3">
          <summary className="text-[12px] font-bold text-sunset-700 cursor-pointer">⚠️ חשוב לזכור ({day.alerts.length})</summary>
          <ul className="space-y-1 mt-2">
            {day.alerts.map((al, i) => (
              <li key={i} className="text-[12px] text-volcano-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sunset-500 flex-shrink-0" />{al}
              </li>
            ))}
          </ul>
        </details>
      )}

      <ActivitySheet activity={sel} open={!!sel} onClose={() => setSel(null)} onReplace={(a) => { setSel(null); setAltFor(a); }} />
      <AlternativesSheet target={altFor} open={!!altFor} onClose={() => setAltFor(null)} />
    </div>
  );
}

function ConflictBanner({ conflict, onReplace, onOpen }:{
  conflict: { id: string; level: 'info'|'warning'|'critical'; text: string; hint?: string };
  onReplace: () => void; onOpen: () => void;
}) {
  const colors = {
    info: 'bg-ocean-50 border-ocean-100 text-ocean-700',
    warning: 'bg-sunset-300/15 border-sunset-300 text-sunset-700',
    critical: 'bg-red-50 border-red-200 text-red-700',
  }[conflict.level];
  const icon = conflict.level === 'critical' ? '🚨' : conflict.level === 'warning' ? '⚠️' : 'ℹ️';
  return (
    <div className={`rounded-2xl border p-3 ${colors}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold">{conflict.text}</div>
          {conflict.hint && <div className="text-[11px] opacity-80 mt-0.5">{conflict.hint}</div>}
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <button onClick={onOpen} className="text-[11px] font-bold bg-white/70 rounded-full px-2 py-1.5">הבנתי, נשאיר ככה</button>
        <button onClick={onReplace} className="text-[11px] font-bold bg-white/70 rounded-full px-2 py-1.5">תציע חלופה</button>
        <button onClick={onOpen} className="text-[11px] font-bold bg-white/70 rounded-full px-2 py-1.5">ערוך ידנית</button>
      </div>
    </div>
  );
}

function EmptyDay() {
  return (
    <div className="rounded-2xl bg-white p-8 text-center border border-ocean-100/60">
      <div className="text-5xl">🌴</div>
      <div className="text-[14px] font-bold text-ocean-700 mt-2">היום פנוי לאלתור</div>
      <div className="text-[12px] text-zinc-500 mt-1">זורמים?</div>
    </div>
  );
}
