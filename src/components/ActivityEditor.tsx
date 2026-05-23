import React, { useState } from 'react';
import type { Activity, Category, DayPart, Region, Status } from '../data/types';

const CATEGORIES: Category[] = ['טבע','חוף','פארק מים','שייט','ספורט ימי','עיר / עיירה','מסעדה','בר','מועדון / מסיבה','שופינג','תצפית','חיות','נסיעה / לוגיסטיקה','מלון','טיסה','אחר'];
const REGIONS: Region[] = ['צפון','צפון-מזרח','צפון-מערב','מרכז','מרכז-מערב','מרכז-מזרח','דרום','דרום-מזרח','דרום-מערב','מחוץ לטנריף'];
const STATUSES: Status[] = ['מתוכנן','הוזמן','אופציונלי','דורש החלטה','בוצע','בוטל'];
const DAY_PARTS: { v: DayPart; l: string }[] = [
  { v:'morning', l:'בוקר' }, { v:'noon', l:'צהריים' }, { v:'evening', l:'ערב' }, { v:'night', l:'לילה' }, { v:'lateNight', l:'לילה מאוחר' }
];

export function ActivityEditor({ initial, onSave, onCancel }:{
  initial: Activity; onSave: (a: Activity) => void; onCancel: () => void;
}) {
  const [a, setA] = useState<Activity>({ ...initial });
  const [err, setErr] = useState<string | null>(null);
  const upd = <K extends keyof Activity>(k: K, v: Activity[K]) => setA(s => ({ ...s, [k]: v }));

  function save() {
    if (!a.name.trim()) { setErr('צריך שם לפעילות'); return; }
    if (!/^\d{2}:\d{2}$/.test(a.startTime) || !/^\d{2}:\d{2}$/.test(a.endTime)) { setErr('שעות לא תקינות'); return; }
    if (a.startTime >= a.endTime) { setErr('שעת סיום חייבת להיות אחרי שעת ההתחלה'); return; }
    onSave(a);
  }

  return (
    <div className="space-y-4">
      <Field label="שם הפעילות">
        <input value={a.name} onChange={e => upd('name', e.target.value)} className={inp} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="תאריך">
          <input type="date" value={a.dayDate} onChange={e => upd('dayDate', e.target.value)} className={inp} />
        </Field>
        <Field label="חלק יום">
          <select value={a.dayPart} onChange={e => upd('dayPart', e.target.value as DayPart)} className={inp}>
            {DAY_PARTS.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
          </select>
        </Field>
        <Field label="שעת התחלה">
          <input type="time" value={a.startTime} onChange={e => upd('startTime', e.target.value)} className={inp} />
        </Field>
        <Field label="שעת סיום">
          <input type="time" value={a.endTime} onChange={e => upd('endTime', e.target.value)} className={inp} />
        </Field>
        <Field label="קטגוריה">
          <select value={a.category} onChange={e => upd('category', e.target.value as Category)} className={inp}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="אזור">
          <select value={a.region} onChange={e => upd('region', e.target.value as Region)} className={inp}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="רמת עלות (1-4)">
          <select value={a.costLevel} onChange={e => upd('costLevel', Number(e.target.value) as Activity['costLevel'])} className={inp}>
            {[1,2,3,4].map(n => <option key={n} value={n}>{'€'.repeat(n)}</option>)}
          </select>
        </Field>
        <Field label="סטטוס">
          <select value={a.status} onChange={e => upd('status', e.target.value as Status)} className={inp}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="תיאור קצר">
        <textarea value={a.description || ''} onChange={e => upd('description', e.target.value)} className={inp + ' min-h-[80px]'} />
      </Field>
      <Field label="הערות לקבוצה">
        <textarea value={a.groupNotes || ''} onChange={e => upd('groupNotes', e.target.value)} className={inp + ' min-h-[60px]'} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!a.bookingRequired} onChange={e => upd('bookingRequired', e.target.checked)} />
        צריך הזמנה מראש
      </label>
      {err && <div className="text-red-600 text-sm font-semibold">{err}</div>}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <button onClick={save} className="rounded-2xl bg-ocean-700 text-white py-3 font-bold">שמור</button>
        <button onClick={onCancel} className="rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 font-bold">ביטול</button>
      </div>
    </div>
  );
}

const inp = 'w-full rounded-xl border border-ocean-100 bg-white px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-ocean-300';
function Field({ label, children }:{ label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-zinc-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
