import type { Activity, Category, Status } from './data/types';

export const HEB_DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
export const HEB_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

export function fmtDateLong(date: string) {
  const d = new Date(date + 'T00:00:00');
  return `יום ${HEB_DAYS[d.getDay()]} · ${d.getDate()} ב${HEB_MONTHS[d.getMonth()]}`;
}
export function timeAgoHe(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'עכשיו';
  if (diff < 3600) return `לפני ${Math.floor(diff/60)} דק׳`;
  if (diff < 86400) return `לפני ${Math.floor(diff/3600)} שעות`;
  if (diff < 172800) return 'אתמול';
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth()+1}`;
}
export function fmtDateShort(date: string) {
  const d = new Date(date + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth()+1}`;
}
export function todayISO(now = new Date()) {
  // pretend "today" is the trip start so demo works year-round
  return iso(now);
}
export function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function clampToTrip(today: string, start: string, end: string) {
  if (today < start) return start;
  if (today > end) return end;
  return today;
}

export function minutesFromHM(hm: string) {
  const [h,m] = hm.split(':').map(Number); return h*60+m;
}

export function sortActivities(list: Activity[]) {
  return [...list].sort((a,b) => a.dayDate.localeCompare(b.dayDate) || minutesFromHM(a.startTime) - minutesFromHM(b.startTime));
}

export function activitiesFor(planId: string, list: Activity[], date?: string) {
  let r = list.filter(a => a.planId === planId);
  if (date) r = r.filter(a => a.dayDate === date);
  return sortActivities(r);
}

export function nextActivity(planId: string, list: Activity[], nowDate: string, nowMin: number) {
  const all = activitiesFor(planId, list);
  return all.find(a => a.dayDate > nowDate || (a.dayDate === nowDate && minutesFromHM(a.startTime) >= nowMin));
}

export const CATEGORY_ICONS: Record<Category, string> = {
  'טבע':'🌿','חוף':'🏖️','פארק מים':'🌊','שייט':'⛵','ספורט ימי':'🤿',
  'עיר / עיירה':'🏘️','מסעדה':'🍽️','בר':'🍹','מועדון / מסיבה':'🎉',
  'שופינג':'🛍️','תצפית':'🌄','חיות':'🐬','נסיעה / לוגיסטיקה':'🚗',
  'מלון':'🏨','טיסה':'✈️','אחר':'✨'
};

export const STATUS_COLORS: Record<Status,{bg:string;fg:string;dot:string}> = {
  'מתוכנן':     { bg:'bg-ocean-50',   fg:'text-ocean-700',  dot:'bg-ocean-500' },
  'הוזמן':      { bg:'bg-emerald-50', fg:'text-emerald-700',dot:'bg-emerald-500' },
  'אופציונלי':  { bg:'bg-sand-100',   fg:'text-sand-500',   dot:'bg-sand-500' },
  'דורש החלטה': { bg:'bg-sunset-300/30',fg:'text-sunset-700',dot:'bg-sunset-500' },
  'בוצע':        { bg:'bg-zinc-100',   fg:'text-zinc-600',   dot:'bg-zinc-400' },
  'בוטל':        { bg:'bg-red-50',     fg:'text-red-600',    dot:'bg-red-400' },
  'בסיכון':      { bg:'bg-red-50',     fg:'text-red-700',    dot:'bg-red-500' },
  'דולג':        { bg:'bg-zinc-100',   fg:'text-zinc-500',   dot:'bg-zinc-300' }
};

export const INTENSITY_COLORS: Record<string,string> = {
  'רגוע': 'from-emerald-400 to-ocean-300',
  'בינוני': 'from-sand-300 to-sunset-300',
  'עמוס': 'from-sunset-500 to-sunset-700'
};

export function costLabel(c: number) {
  return '€'.repeat(Math.max(1, Math.min(4, c)));
}

export function dayPartLabel(p: Activity['dayPart']) {
  return ({morning:'בוקר', noon:'צהריים', evening:'ערב', night:'לילה', lateNight:'לילה מאוחר'} as const)[p];
}

export function buildMapsUrl(name: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Tenerife')}`;
}
export function buildWazeUrl(name: string) {
  return `https://waze.com/ul?q=${encodeURIComponent(name + ' Tenerife')}`;
}
