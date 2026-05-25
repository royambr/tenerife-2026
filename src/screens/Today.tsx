import React, { useEffect, useMemo, useState } from 'react';
import { useStore, store } from '../store';
import { activitiesFor, clampToTrip, fmtDateShort, iso, minutesFromHM, CATEGORY_ICONS, costLabel, INTENSITY_COLORS, buildMapsUrl, sortActivities } from '../utils';
import { queryForActivity } from '../data/place_queries';
import { instantImages } from '../components/Gallery';
import { ActivityCard } from '../components/ActivityCard';
import { ActivitySheet } from '../components/ActivitySheet';
import { InsertSlot } from '../components/InsertSlot';
import { TripProgress } from '../components/TripProgress';
import { Chip } from '../components/Chip';
import { detectConflicts, summarizeDay, dayPaceScore } from '../livemode';
import type { Activity } from '../data/types';
import { AlternativesSheet } from '../components/AlternativesSheet';
import { TripJournal } from '../components/TripJournal';
import { PROFILES } from '../data/profiles';
import { useWeather, weatherEmoji, findWeather } from '../data/weather';
import { dayCostForParticipant, tripCostForParticipant } from '../data/costs';
import { useGeo, requestLocation } from '../data/geo';
import { TripCountdown } from '../components/TripCountdown';
import { ActivitySpinner } from '../components/ActivitySpinner';
import { FunFact } from '../components/FunFact';
import { Phrasebook } from '../components/Phrasebook';
import { LiveWeather } from '../components/LiveWeather';
import { REGION_CENTERS, haversineKm } from '../data/regions';

export function Today() {
  const trip = useStore(s => s.trip);
  const plan = useStore(s => s.plans.find(p => p.id === s.trip.activePlanId)!);
  const activities = useStore(s => s.activities);
  const participants = useStore(s => s.participants);
  const currentId = useStore(s => s.currentParticipantId);
  const me = participants.find(p => p.id === currentId);
  const meProfile = PROFILES[currentId];
  const [showMe, setShowMe] = useState(false);
  const allIds = participants.map(p => p.id);

  const allDates = useMemo(() => plan.days.map(d => d.date), [plan]);
  const realToday = iso(new Date());
  const initial = clampToTrip(realToday, trip.startDate, trip.endDate);
  const [activeDate, setActiveDate] = useState(initial);
  const [showLater, setShowLater] = useState(true); // expanded by default
  const [showAlerts, setShowAlerts] = useState(true); // expanded by default
  const [sel, setSel] = useState<Activity | null>(null);
  const [altFor, setAltFor] = useState<Activity | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const userLoc = useGeo();

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
  const dayPace = useMemo(() => dayPaceScore(todays), [todays]);
  const later = remaining.filter(a => a.id !== next?.id);

  // Weather
  const weather = useWeather(trip.startDate, trip.endDate);
  const todayWeather = findWeather(weather, activeDate);
  const hasWaterOrBeach = todays.some(a => /שייט|חוף|פארק מים/.test(a.category));
  const rainyWaterWarn = todayWeather && todayWeather.rain >= 50 && hasWaterOrBeach;

  // Costs
  const dayCost = useMemo(() => dayCostForParticipant(todays, currentId, allIds), [todays, currentId, participants]);
  const allActs = useMemo(() => activitiesFor(plan.id, activities), [plan.id, activities]);
  const tripCost = useMemo(() => tripCostForParticipant(allActs, currentId, allIds), [allActs, currentId, participants]);

  // Per-day attendees average (group sum)
  const avgAttendees = useMemo(() => {
    const nonLog = todays.filter(a => a.category !== 'מלון' && a.category !== 'נסיעה / לוגיסטיקה' && a.category !== 'טיסה');
    if (nonLog.length === 0) return null;
    const total = nonLog.reduce((s,a) => s + ((a.attendees ?? allIds).length), 0);
    return Math.round(total / nonLog.length);
  }, [todays, allIds]);

  // ETA to next activity
  const etaMin = useMemo(() => {
    if (!userLoc || !next) return null;
    const c = REGION_CENTERS[next.region];
    if (!c) return null;
    const km = haversineKm({ lat: userLoc.lat, lng: userLoc.lng }, c);
    return Math.round((km / 50) * 60); // min, at 50 km/h
  }, [userLoc, next]);
  const mustLeaveNow = etaMin !== null && next && realToday === activeDate
    ? nowMin + etaMin >= minutesFromHM(next.startTime)
    : false;

  // Prefetch images
  useEffect(() => {
    for (const a of remaining.slice(0, 8)) {
      const q = queryForActivity(a);
      if (!q) continue;
      const url = instantImages(q, 1)[0]?.thumb;
      if (!url) continue;
      const img = new Image();
      img.src = url;
    }
  }, [activeDate, plan.id]);

  const hasAlertsOrConflicts = (day.alerts && day.alerts.length > 0) || conflicts.length > 0;

  return (
    <div className="p-4 pb-2 space-y-3.5 animate-fade-up lg:max-w-5xl">
      <LiveWeather />
      <div className="flex gap-2 items-stretch">
        <div className="flex-1 min-w-0"><FunFact /></div>
        <div className="flex-shrink-0 w-auto"><TripCountdown /></div>
      </div>
      {/* compact header */}
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-sunset-700">יום {dayIdx + 1} · {fmtDateShort(activeDate)}</div>
          <h1 className="text-[20px] font-extrabold text-ocean-700 leading-tight truncate">{day.title}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {todayWeather && (
            <span className="text-[11px] font-extrabold px-2.5 py-1.5 rounded-full bg-white border border-ocean-100 text-ocean-700 inline-flex items-center gap-1">
              {weatherEmoji(todayWeather.code, todayWeather.rain)} {todayWeather.tMax}°
              {todayWeather.rain >= 30 && <span className="text-sunset-700">· {todayWeather.rain}%</span>}
            </span>
          )}
          <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-full text-white bg-gradient-to-bl ${INTENSITY_COLORS[day.intensity]}`}>
            {day.intensity}
          </span>
        </div>
      </header>

      {/* Labeled chips row — explicit context, no bare numbers */}
      <div className="flex flex-wrap gap-1.5">
        <Chip tone="ocean">🎯 {summary.activitiesCount} פעילויות</Chip>
        {summary.toCloseCount > 0 && <Chip tone="sunset">📌 {summary.toCloseCount} לסגור</Chip>}
        {summary.conflictCount > 0 && <Chip tone="red">⚠️ {summary.conflictCount} התראות</Chip>}
        <Chip tone="sand">⚡ {day.intensity}</Chip>
        <Chip tone="sand">🛌 {day.sleepingAt}</Chip>
        {avgAttendees !== null && <Chip tone="emerald">👥 {avgAttendees} בממוצע</Chip>}
        <Chip tone="emerald">💶 ~€{dayCost} לאיש</Chip>
        {rainyWaterWarn && <Chip tone="sunset">🌧️ צפוי גשם — לבדוק שייט/חוף</Chip>}
        <button onClick={() => setShowJournal(true)}
                className="rounded-full bg-sunset-500 text-white px-2.5 py-1 text-[11px] font-extrabold min-h-[28px]">
          📔 היומן שלנו
        </button>
      </div>

      {/* One-line context sentence */}
      <div className="text-[12px] text-ocean-700/80 leading-5">{summary.sentence}</div>

      {/* Participant chip */}
      {me && meProfile && (
        <div>
          <button onClick={() => setShowMe(v => !v)}
                  aria-label={`פרופיל של ${me.name}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ocean-100 px-2.5 py-1 text-[12px] font-semibold text-ocean-700">
            <span>{me.emoji}</span>{me.name}<span className="text-[10px] text-zinc-400">{showMe ? '▴' : '▾'}</span>
          </button>
          {showMe && (
            <p className="mt-1.5 text-[12px] text-zinc-600 leading-5 px-1">{meProfile.blurb}</p>
          )}
        </div>
      )}

      <TripProgress dates={allDates} activeDate={activeDate} onPick={setActiveDate} />
      <ActivitySpinner activities={todays} />

      {/* Pace meter */}
      <PaceMeter score={dayPace} onSuggest={() => next && setAltFor(next)} />

      {/* Quick action: set my location */}
      {!userLoc && (
        <button onClick={async () => {
          setGeoLoading(true);
          try { await requestLocation(); } catch {} finally { setGeoLoading(false); }
        }}
                disabled={geoLoading}
                className="w-full rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-2.5 text-[13px] font-bold min-h-[44px]">
          📍 {geoLoading ? '…' : 'קבע את המיקום שלי'}
        </button>
      )}

      {/* lg+ 2-column grid: left=timeline, right=alerts/booking */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-4 lg:items-start space-y-3.5 lg:space-y-0">
        {/* LEFT COL — hero + later */}
        <div className="lg:col-span-2 space-y-3.5">
          {next && (
            <InsertSlot
              planId={plan.id}
              dayDate={activeDate}
              prev={undefined}
              next={next}
              fallbackRegion={next.region}
            />
          )}
          {next ? (
            <div className="rounded-3xl bg-gradient-to-bl from-ocean-700 to-ocean-500 text-white shadow-card overflow-hidden">
              <div className="px-4 pt-4 flex items-center justify-between gap-2">
                <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-[11px] font-extrabold">⏭️ הדבר הבא</span>
                <div className="flex items-center gap-1.5">
                  {etaMin !== null && (
                    <div className={`text-[11px] font-extrabold rounded-full px-2.5 py-1 ${mustLeaveNow ? 'bg-red-500 text-white' : 'bg-white/25 text-white'}`}>
                      {mustLeaveNow ? '⚠️ צריך לזוז כבר' : `🚗 ~${etaMin} דק׳`}
                    </div>
                  )}
                  <div className="text-[14px] font-extrabold tabular-nums bg-sunset-500 rounded-full px-3 py-1">{next.startTime}</div>
                </div>
              </div>
              <div className="px-4 pt-3 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-6xl">{CATEGORY_ICONS[next.category]}</span>
                  <div className="min-w-0">
                    <div className="text-[22px] font-extrabold leading-tight">{next.name}</div>
                    <div className="text-[12px] opacity-90 mt-0.5">{next.region} · {costLabel(next.costLevel)}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-1.5">
                  <a href={next.mapsUrl || buildMapsUrl(next.name)} target="_blank" rel="noreferrer"
                     aria-label="ניווט"
                     className="rounded-xl bg-white text-ocean-700 text-[10px] font-bold py-2 text-center min-h-[44px] flex flex-col items-center justify-center gap-0.5">
                    <span className="text-lg leading-none">🧭</span><span>ניווט</span>
                  </a>
                  <button onClick={() => store.setStatus(next.id, 'בוצע')}
                          aria-label="סמן כבוצע"
                          className="rounded-xl bg-emerald-500 text-white text-[10px] font-bold py-2 min-h-[44px] flex flex-col items-center justify-center gap-0.5">
                    <span className="text-lg leading-none">✓</span><span>בוצע</span>
                  </button>
                  <button onClick={() => store.setStatus(next.id, 'דולג')}
                          aria-label="דלג"
                          className="rounded-xl bg-white/15 backdrop-blur text-white text-[10px] font-bold py-2 min-h-[44px] flex flex-col items-center justify-center gap-0.5">
                    <span className="text-lg leading-none">⏩</span><span>דלג</span>
                  </button>
                  <button onClick={() => setAltFor(next)}
                          aria-label="החלף"
                          className="rounded-xl bg-white/15 backdrop-blur text-white text-[10px] font-bold py-2 min-h-[44px] flex flex-col items-center justify-center gap-0.5">
                    <span className="text-lg leading-none">🔄</span><span>החלף</span>
                  </button>
                  <button onClick={() => setSel(next)}
                          aria-label="פרטים"
                          className="rounded-xl bg-sunset-500 text-white text-[10px] font-bold py-2 min-h-[44px] flex flex-col items-center justify-center gap-0.5">
                    <span className="text-lg leading-none">📖</span><span>פרטים</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <InsertSlot
                planId={plan.id}
                dayDate={activeDate}
                fallbackRegion={'דרום'}
              />
              <EmptyDay />
            </>
          )}

          {/* Later today — expanded by default */}
          {later.length > 0 && (
            <div>
              <button onClick={() => setShowLater(v => !v)}
                      className="w-full flex items-center justify-between mb-2 py-1">
                <span className="text-[13px] font-extrabold text-ocean-700">ההמשך של היום</span>
                <Chip tone="ocean">{later.length} {showLater ? '▲' : '▼'}</Chip>
              </button>
              {showLater && (
                <div className="space-y-2">
                  {later.length > 0 && (
                    <InsertSlot
                      planId={plan.id}
                      dayDate={activeDate}
                      prev={undefined}
                      next={later[0]}
                      fallbackRegion={later[0].region}
                    />
                  )}
                  {later.map((a, i) => (
                    <React.Fragment key={a.id}>
                      <ActivityCard a={a}
                                    onClick={() => setSel(a)}
                                    onReplace={(x) => setAltFor(x)} compact swipeable />
                      <InsertSlot
                        planId={plan.id}
                        dayDate={activeDate}
                        prev={a}
                        next={later[i + 1]}
                        fallbackRegion={a.region}
                      />
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COL (lg) — alerts + booking + day participants */}
        <div className="space-y-3.5">
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

          {/* To book */}
          {toBook.length > 0 && (
            <div className="rounded-2xl bg-white border border-sunset-300 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-bold text-sunset-700">📌 לסגור</div>
                <Chip tone="sunset">{toBook.length}</Chip>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {toBook.map(a => (
                  <button key={a.id} onClick={() => setSel(a)}
                          className="flex items-center gap-1.5 bg-sand-100 hover:bg-sand-200 rounded-full px-3 py-1.5 text-[12px] font-bold text-ocean-700">
                    <span>{CATEGORY_ICONS[a.category]}</span>
                    <span className="truncate max-w-[140px]">{a.name}</span>
                    <span className="text-[10px] text-zinc-500">·{fmtDateShort(a.dayDate)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alerts — expanded by default if any */}
          {day.alerts && day.alerts.length > 0 && (
            <div className="rounded-2xl bg-sunset-300/10 border border-sunset-300 p-3">
              <button onClick={() => setShowAlerts(v => !v)}
                      className="text-[12px] font-bold text-sunset-700 w-full flex items-center justify-between">
                <span>⚠️ צריך לזכור ({day.alerts.length})</span>
                <span className="text-zinc-400">{showAlerts ? '▴' : '▾'}</span>
              </button>
              {showAlerts && (
                <ul className="space-y-1 mt-2">
                  {day.alerts.map((al, i) => (
                    <li key={i} className="text-[12px] text-volcano-700 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sunset-500 flex-shrink-0" />{al}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Trip total cost */}
          <div className="rounded-2xl bg-ocean-50/60 border border-ocean-100 p-3 text-[12px] text-ocean-700">
            <div className="font-bold mb-1">💶 הערכת עלות</div>
            <div>היום: <span className="font-extrabold">~€{dayCost}</span> לאיש</div>
            <div>לכל הטיול: <span className="font-extrabold">~€{tripCost}</span> לאיש</div>
          </div>

        </div>
      </div>

      <ActivitySheet activity={sel} open={!!sel} onClose={() => setSel(null)} onReplace={(a) => { setSel(null); setAltFor(a); }} />
      <AlternativesSheet target={altFor} open={!!altFor} onClose={() => setAltFor(null)} />
      <TripJournal open={showJournal} onClose={() => setShowJournal(false)} />
    </div>
  );
}

function PaceMeter({ score, onSuggest }:{ score: number; onSuggest: () => void }) {
  const color = score < 40 ? 'bg-emerald-500' : score < 70 ? 'bg-sand-500' : score < 85 ? 'bg-sunset-500' : 'bg-red-500';
  const label = score < 40 ? 'יום רגוע' : score < 70 ? 'יום נעים' : score < 85 ? 'יום עמוס' : 'יום עמוס מאוד';
  return (
    <div className="rounded-2xl bg-white border border-ocean-100 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[12px] font-extrabold text-ocean-700">⚡ עומס היום</div>
        <div className="text-[11px] font-bold text-zinc-500">{label} · {score}/100</div>
      </div>
      <div className="relative h-2.5 rounded-full bg-gradient-to-l from-red-300 via-sand-300 to-emerald-300 overflow-hidden">
        <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow ${color}`}
             style={{ right: `${score}%`, transform: 'translate(50%, -50%)' }} />
      </div>
      {score > 80 && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-sunset-700 font-semibold">יום עמוס — להעיף משהו?</span>
          <button onClick={onSuggest}
                  className="text-[11px] font-extrabold rounded-full bg-sunset-500 text-white px-3 py-1.5 min-h-[32px]">
            תציע מה לוותר
          </button>
        </div>
      )}
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
