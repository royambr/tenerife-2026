import React, { useState } from 'react';
import type { Activity, Status } from '../data/types';
import { Sheet } from './Sheet';
import { Chip } from './Chip';
import { CATEGORY_ICONS, STATUS_COLORS, buildMapsUrl, buildWazeUrl, costLabel } from '../utils';
import { store, useEditMode } from '../store';
import { ActivityEditor } from './ActivityEditor';

const STATUSES: Status[] = ['מתוכנן','הוזמן','אופציונלי','דורש החלטה','בוצע','בוטל','בסיכון','דולג'];

export function ActivitySheet({ activity, open, onClose, onReplace }:{
  activity: Activity | null; open: boolean; onClose: () => void; onReplace?: (a: Activity) => void;
}) {
  const edit = useEditMode();
  const [editing, setEditing] = useState(false);

  if (!activity) return null;
  const a = activity;
  const maps = a.mapsUrl || buildMapsUrl(a.name);
  const waze = a.wazeUrl || buildWazeUrl(a.name);

  if (editing) {
    return (
      <Sheet open={open} onClose={() => { setEditing(false); onClose(); }} title="ערוך פעילות">
        <ActivityEditor
          initial={a}
          onSave={(v) => { store.upsertActivity(v); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title={a.name}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{CATEGORY_ICONS[a.category]}</span>
          <div>
            <div className="text-[13px] text-zinc-500">{a.region} · {a.category}</div>
            <div className="text-[14px] font-semibold text-ocean-700">
              {a.startTime}–{a.endTime} · {costLabel(a.costLevel)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip tone="ocean">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[a.status].dot}`} />{a.status}
          </Chip>
          {a.bookingRequired && <Chip tone="sunset">צריך לסגור</Chip>}
          {a.priority === 'גבוה' && <Chip tone="red">חשוב</Chip>}
        </div>

        {a.description && (
          <Section title="על הפעילות">
            <p className="text-[14px] leading-7 text-zinc-700">{a.description}</p>
          </Section>
        )}

        {a.whyToday && (
          <Section title="למה זה מתאים היום?">
            <p className="text-[14px] leading-7 text-zinc-700">{a.whyToday}</p>
          </Section>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <Stat label="משך" value={a.duration || diffStr(a.startTime, a.endTime)} />
          <Stat label="עלות משוערת" value={a.costEstimate || costLabel(a.costLevel)} />
          <Stat label="שעות פתיחה" value={a.openingHours || '—'} />
          <Stat label="צריך להזמין?" value={a.bookingRequired ? 'כן' : 'לא'} />
        </div>

        {a.preparation && a.preparation.length > 0 && (
          <Section title="צריך להביא / להכין">
            <ul className="space-y-1.5">
              {a.preparation.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-[14px] text-zinc-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sunset-500" />{p}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {a.alternatives && a.alternatives.length > 0 && (
          <Section title="אופציות חלופיות באזור">
            <div className="flex flex-wrap gap-1.5">
              {a.alternatives.map((alt, i) => <Chip key={i} tone="sand">{alt}</Chip>)}
            </div>
          </Section>
        )}

        {a.groupNotes && (
          <Section title="הערות לקבוצה">
            <p className="text-[14px] leading-7 text-zinc-700">{a.groupNotes}</p>
          </Section>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <a href={maps} target="_blank" rel="noreferrer"
             className="rounded-2xl bg-ocean-700 text-white py-3 text-center text-sm font-bold">
            🧭 פתח ניווט · Google
          </a>
          <a href={waze} target="_blank" rel="noreferrer"
             className="rounded-2xl bg-sand-50 text-ocean-700 py-3 text-center text-sm font-bold border border-ocean-100">
            Waze
          </a>
        </div>

        {a.bookingUrl && (
          <a href={a.bookingUrl} target="_blank" rel="noreferrer"
             className="block rounded-2xl bg-sunset-500 text-white py-3 text-center text-sm font-bold">
            לקישור ההזמנה
          </a>
        )}

        <Section title="עדכון סטטוס">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map(s => {
              const active = a.status === s;
              return (
                <button key={s} onClick={() => store.setStatus(a.id, s)}
                  className={`text-[12px] rounded-full px-3 py-1.5 font-semibold border
                    ${active ? 'bg-ocean-700 text-white border-ocean-700' : 'bg-white text-ocean-700 border-ocean-100'}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </Section>

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => store.setStatus(a.id, a.status === 'בוצע' ? 'מתוכנן' : 'בוצע')}
                  className="rounded-2xl bg-emerald-500 text-white py-3 text-sm font-bold">
            ✓ סמן כבוצע
          </button>
          <button onClick={() => setEditing(true)}
                  className="rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 text-sm font-bold">
            ✎ ערוך פעילות
          </button>
          {onReplace && (
            <button onClick={() => { onReplace(a); onClose(); }}
                    className="rounded-2xl bg-sunset-500 text-white py-3 text-sm font-bold col-span-2">
              🔄 החלף פעילות
            </button>
          )}
        </div>

        {edit && (
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-ocean-100/60">
            <button onClick={() => { store.duplicateActivity(a.id); }}
                    className="rounded-2xl bg-sand-100 text-ocean-700 py-3 text-sm font-bold">
              שכפל פעילות
            </button>
            <button onClick={() => { if (confirm('למחוק את הפעילות?')) { store.deleteActivity(a.id); onClose(); } }}
                    className="rounded-2xl bg-red-50 text-red-600 py-3 text-sm font-bold">
              מחק
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function Section({ title, children }:{ title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[12px] font-bold text-zinc-500 mb-1.5">{title}</h4>
      {children}
    </div>
  );
}
function Stat({ label, value }:{ label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-ocean-50/60 p-3">
      <div className="text-[11px] text-zinc-500">{label}</div>
      <div className="text-[14px] font-bold text-ocean-700 mt-0.5">{value}</div>
    </div>
  );
}
function diffStr(a: string, b: string) {
  const [ah,am] = a.split(':').map(Number); const [bh,bm] = b.split(':').map(Number);
  const min = (bh*60+bm) - (ah*60+am);
  if (min < 60) return `${min} דק'`;
  const h = Math.floor(min/60), m = min%60;
  return m ? `${h} ש' ${m} דק'` : `${h} שעות`;
}
