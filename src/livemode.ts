import type { Activity, DayPart, Region } from './data/types';
import { minutesFromHM } from './utils';

export interface AlternativeSuggestion {
  activity: Activity;
  score: number;
  reasons: string[];
}

const NORTH: Region[] = ['צפון','צפון-מזרח','צפון-מערב'];
const SOUTH: Region[] = ['דרום','דרום-מזרח','דרום-מערב'];
const CENTER: Region[] = ['מרכז','מרכז-מערב','מרכז-מזרח'];

function regionGroup(r: Region): 'N'|'S'|'C'|'X' {
  if (NORTH.includes(r)) return 'N';
  if (SOUTH.includes(r)) return 'S';
  if (CENTER.includes(r)) return 'C';
  return 'X';
}

function durationMin(a: Activity): number {
  return Math.max(0, minutesFromHM(a.endTime) - minutesFromHM(a.startTime));
}

export function suggestAlternatives(target: Activity, allActivities: Activity[], limit = 5): AlternativeSuggestion[] {
  const pool = allActivities.filter(a =>
    a.id !== target.id &&
    a.category !== 'טיסה' && a.category !== 'מלון' &&
    a.category !== 'נסיעה / לוגיסטיקה'
  );
  // dedupe by name
  const seen = new Set<string>();
  const dedup = pool.filter(a => {
    const k = a.name.toLowerCase();
    if (seen.has(k)) return false; seen.add(k); return true;
  });

  const dur = durationMin(target);
  const tg = regionGroup(target.region);

  const scored: AlternativeSuggestion[] = dedup.map(a => {
    const reasons: string[] = [];
    let score = 0;
    const ag = regionGroup(a.region);
    if (ag === tg) { score += 4; reasons.push('אותו אזור'); }
    else if ((ag==='N'&&tg==='C')||(ag==='C'&&tg==='N')||(ag==='S'&&tg==='C')||(ag==='C'&&tg==='S')) {
      score += 2; reasons.push('אזור סמוך');
    }
    if (a.dayPart === target.dayPart) { score += 2; reasons.push('אותו חלק יום'); }
    if (a.category === target.category) { score += 3; reasons.push('סוג דומה'); }
    const ad = durationMin(a);
    if (Math.abs(ad - dur) < 60) { score += 2; reasons.push('משך דומה'); }
    if (a.costLevel === target.costLevel) { score += 1; reasons.push('עלות דומה'); }
    if (!a.bookingRequired) { score += 1; reasons.push('בלי הזמנה'); }
    return { activity: a, score, reasons };
  });

  return scored.sort((x, y) => y.score - x.score).slice(0, limit);
}

export interface Conflict {
  id: string;
  level: 'info' | 'warning' | 'critical';
  text: string;
  hint?: string;
  relatedIds?: string[];
}

export function detectConflicts(dayActivities: Activity[], allActivitiesSorted: Activity[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const acts = [...dayActivities].sort((a,b) => minutesFromHM(a.startTime) - minutesFromHM(b.startTime));

  // gap check
  for (let i = 1; i < acts.length; i++) {
    const prev = acts[i-1], cur = acts[i];
    const gap = minutesFromHM(cur.startTime) - minutesFromHM(prev.endTime);
    if (gap < 15 && regionGroup(prev.region) !== regionGroup(cur.region)) {
      conflicts.push({
        id: 'gap_'+cur.id,
        level: 'warning',
        text: 'אין מספיק זמן בין הפעילויות',
        hint: `${prev.name} → ${cur.name}: צריך נסיעה ויש פחות מ-15 דקות`,
        relatedIds: [prev.id, cur.id]
      });
    }
    if (regionGroup(prev.region) !== regionGroup(cur.region) && i > 1) {
      const prev2 = acts[i-2];
      if (regionGroup(prev2.region) === regionGroup(cur.region)) {
        conflicts.push({
          id: 'jump_'+cur.id,
          level: 'info',
          text: 'זה רחוק מדי ביחס להמשך היום',
          hint: `קופצים בין ${prev.region} ל-${cur.region} וחזרה`,
          relatedIds: [prev.id, cur.id]
        });
      }
    }
  }

  // opening hours
  for (const a of acts) {
    if (!a.openingHours) continue;
    const m = a.openingHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (m) {
      const open = +m[1]*60 + +m[2];
      const close = +m[3]*60 + +m[4];
      const s = minutesFromHM(a.startTime), e = minutesFromHM(a.endTime);
      if (s < open || e > close) {
        conflicts.push({
          id: 'hours_'+a.id, level: 'warning',
          text: 'האטרקציה כנראה סגורה בשעה הזו',
          hint: `${a.name}: שעות פתיחה ${a.openingHours}`,
          relatedIds: [a.id]
        });
      }
    }
  }

  // booking required & not booked
  for (const a of acts) {
    if (a.bookingRequired && a.status !== 'הוזמן' && a.status !== 'בוטל' && a.status !== 'דולג') {
      conflicts.push({
        id: 'book_'+a.id, level: 'warning',
        text: 'צריך להזמין מראש',
        hint: a.name,
        relatedIds: [a.id]
      });
    }
  }

  // busy day
  const nonLogistic = acts.filter(a => a.category !== 'מלון' && a.category !== 'נסיעה / לוגיסטיקה');
  if (nonLogistic.length > 5) {
    conflicts.push({
      id: 'busy_'+(acts[0]?.dayDate||'x'),
      level: 'info',
      text: 'יום עמוס מדי — כדאי לוותר על משהו',
      hint: `${nonLogistic.length} פעילויות מתוכננות`
    });
  }

  // next-day early flight check
  if (acts.length) {
    const todayDate = acts[0].dayDate;
    const tomorrow = allActivitiesSorted.filter(a => a.dayDate > todayDate);
    if (tomorrow.length) {
      const nextDate = tomorrow[0].dayDate;
      const nextDayActs = tomorrow.filter(a => a.dayDate === nextDate);
      const earlyFlight = nextDayActs.find(a => a.category === 'טיסה' && minutesFromHM(a.startTime) < 12*60);
      if (earlyFlight) {
        // any night/lateNight activity that ends past ~01:30 (handle wrap: end<start ⇒ +24h)
        const lateAct = acts.find(a => {
          if (a.dayPart !== 'night' && a.dayPart !== 'lateNight' && minutesFromHM(a.startTime) < 22*60) return false;
          let endM = minutesFromHM(a.endTime);
          const startM = minutesFromHM(a.startTime);
          if (endM < startM) endM += 24*60; // wraps to next day
          return endM > 25*60 + 30; // past 01:30
        });
        if (lateAct) {
          conflicts.push({
            id: 'flight_'+earlyFlight.id, level: 'critical',
            text: 'מחר טיסה בבוקר, לא כדאי למשוך לילה מאוחר מדי',
            hint: `${lateAct.name} עד ${lateAct.endTime} · טיסה ב-${earlyFlight.startTime}`,
            relatedIds: [lateAct.id, earlyFlight.id]
          });
        } else {
          // softer info banner regardless, so day-23 always reminds about flight
          conflicts.push({
            id: 'flight_soft_'+earlyFlight.id, level: 'warning',
            text: 'מחר טיסה בבוקר — שעת חזרה מבוקרת',
            hint: `${earlyFlight.name} ב-${earlyFlight.startTime}`,
            relatedIds: [earlyFlight.id]
          });
        }
      }
    }
  }

  return conflicts;
}

export interface DaySummary {
  intensityWord: string;
  activitiesCount: number;
  travelCount: number;
  toCloseCount: number;
  conflictCount: number;
  sentence: string;
}

export function summarizeDay(dayActivities: Activity[], allActivitiesSorted: Activity[]): DaySummary {
  const conflicts = detectConflicts(dayActivities, allActivitiesSorted);
  const travelCount = dayActivities.filter(a => a.category === 'נסיעה / לוגיסטיקה').length;
  const longTravel = dayActivities.find(a => a.category === 'נסיעה / לוגיסטיקה' && durationMin(a) >= 90);
  const toCloseCount = dayActivities.filter(a => a.bookingRequired && a.status !== 'הוזמן').length;
  const activitiesCount = dayActivities.filter(a => a.category !== 'מלון' && a.category !== 'נסיעה / לוגיסטיקה').length;

  // Departure-day detection (today has a flight before 12:00 → calm "departure mode")
  const myFlight = dayActivities.find(a => a.category === 'טיסה' && minutesFromHM(a.startTime) < 12*60);
  if (myFlight) {
    return {
      intensityWord: 'יום יציאה',
      activitiesCount,
      travelCount,
      toCloseCount,
      conflictCount: conflicts.length,
      sentence: `יום היציאה — טיסה ב-${myFlight.startTime}. רק check-out, נסיעה לשדה, ולהיפרד מהאי בכיף.`
    };
  }

  // Tomorrow-flight detection
  const todayDate = dayActivities[0]?.dayDate;
  const flightTomorrow = todayDate
    ? allActivitiesSorted.find(a => a.dayDate > todayDate && a.category === 'טיסה' && minutesFromHM(a.startTime) < 12*60)
    : undefined;
  // only flag "tomorrow" specifically (not later)
  const isTomorrow = flightTomorrow && (() => {
    const d = new Date(todayDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return flightTomorrow.dayDate === `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  let word = 'די עמוס';
  if (activitiesCount <= 2) word = 'רגוע';
  else if (activitiesCount <= 4) word = 'נעים';
  else if (activitiesCount <= 6) word = 'די עמוס';
  else word = 'עמוס מאוד';

  const parts: string[] = [`היום ${word}`];
  parts.push(`${activitiesCount} פעילויות`);
  if (longTravel) parts.push('נסיעה אחת ארוכה');
  else if (travelCount) parts.push(`${travelCount} העברות`);
  if (toCloseCount > 0) parts.push(`${toCloseCount} דברים לסגור`);

  let sentence = parts.join(', ') + '.';
  if (isTomorrow) {
    sentence += ` מחר טיסה בבוקר (${flightTomorrow!.startTime}) — שעת חזרה מבוקרת.`;
  }

  return {
    intensityWord: word,
    activitiesCount,
    travelCount,
    toCloseCount,
    conflictCount: conflicts.length,
    sentence
  };
}

// cascade recalc — shifts later items by slipMin; marks 'בסיכון' if pushed past midnight,
// or — if a flight exists tomorrow morning — past ~05:00 of next day (treating flight as hard anchor).
export function cascadeRecalc(dayActs: Activity[], anchorId: string, slipMin: number, allActivitiesSorted?: Activity[]): Activity[] {
  if (slipMin === 0) return dayActs;
  const sorted = [...dayActs].sort((a,b) => minutesFromHM(a.startTime) - minutesFromHM(b.startTime));
  const idx = sorted.findIndex(a => a.id === anchorId);
  if (idx < 0) return dayActs;

  // Find tomorrow's early flight if any
  const todayDate = sorted[0]?.dayDate;
  let hardLimitMin = 24*60; // default: past midnight ⇒ at risk
  if (allActivitiesSorted && todayDate) {
    const flightTomorrow = allActivitiesSorted.find(a =>
      a.dayDate > todayDate && a.category === 'טיסה' && minutesFromHM(a.startTime) < 12*60);
    if (flightTomorrow) hardLimitMin = 24*60 + 5*60; // 05:00 next day
  }

  const result: Activity[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    if (i <= idx) { result.push(a); continue; }
    const sm = minutesFromHM(a.startTime) + slipMin;
    let em = minutesFromHM(a.endTime) + slipMin;
    if (em < sm) em += 24*60;
    const atRisk = em > hardLimitMin;
    const status: Activity['status'] = atRisk ? 'בסיכון' : a.status;
    result.push({
      ...a,
      startTime: minToHM(Math.min(sm, 23*60+59)),
      endTime: minToHM(Math.min(em > 24*60 ? em - 24*60 : em, 23*60+59)),
      status
    });
  }
  return result;
}

function minToHM(min: number): string {
  const h = Math.floor(min/60), m = min%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export function dayPartHebrew(p: DayPart) {
  return ({ morning:'בוקר', noon:'צהריים', evening:'ערב', night:'לילה', lateNight:'לילה מאוחר' } as const)[p];
}
