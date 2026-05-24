import React, { useState } from 'react';
import type { Activity, Status } from '../data/types';
import { Sheet } from './Sheet';
import { Chip } from './Chip';
import { CATEGORY_ICONS, STATUS_COLORS, buildMapsUrl, buildWazeUrl, costLabel } from '../utils';
import { store, useEditMode } from '../store';
import { ActivityEditor } from './ActivityEditor';
import { Gallery } from './Gallery';
import { queryForActivity, wikipediaTitleForActivity } from '../data/place_queries';
import { ActivityAttendees } from './ActivityAttendees';
import { ActivityPhotos } from './ActivityPhotos';
import { ActivityExpenses } from './ActivityExpenses';
import { ActivityChat } from './ActivityChat';

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
  const galleryQuery = queryForActivity(a);
  const wikipediaTitle = wikipediaTitleForActivity(a) || undefined;

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
      <div className="space-y-4">
        {/* Header row: icon + time/cost */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{CATEGORY_ICONS[a.category]}</span>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-ocean-700 tabular-nums">
              {a.startTime}–{a.endTime}
            </div>
            <div className="text-[12px] text-zinc-500">{a.region} · {costLabel(a.costLevel)}</div>
          </div>
        </div>

        <ActivityAttendees activity={a} />

        {galleryQuery && <Gallery query={galleryQuery} wikipediaTitle={wikipediaTitle} />}

        <ActivityPhotos activity={a} />

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="ocean">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[a.status].dot}`} />{a.status}
          </Chip>
          {a.bookingRequired && <Chip tone="sunset">צריך לסגור</Chip>}
          {a.priority === 'גבוה' && <Chip tone="red">חשוב</Chip>}
          {a.category === 'מסעדה' && <Chip tone="sand">🍽️ אסף וצביקה: בלי חזיר ובלי בשר וחלב</Chip>}
        </div>

        {a.description && (
          <p className="text-[14px] leading-7 text-zinc-700">{a.description}</p>
        )}

        {a.whyToday && (
          <details className="rounded-xl bg-ocean-50/60 p-3">
            <summary className="text-[12px] font-bold text-ocean-700 cursor-pointer">למה היום?</summary>
            <p className="text-[13px] leading-6 text-zinc-700 mt-2">{a.whyToday}</p>
          </details>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Stat icon="⏱️" value={a.duration || diffStr(a.startTime, a.endTime)} />
          <Stat icon="💶" value={a.costEstimate || costLabel(a.costLevel)} />
          {a.openingHours && <Stat icon="🕘" value={a.openingHours} />}
          <Stat icon={a.bookingRequired ? '📌' : '✓'} value={a.bookingRequired ? 'להזמין' : 'בלי הזמנה'} />
        </div>

        {a.preparation && a.preparation.length > 0 && (
          <Section title="להביא">
            <ul className="space-y-1">
              {a.preparation.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-[13px] text-zinc-700">
                  <span className="w-1 h-1 rounded-full bg-sunset-500" />{p}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {a.alternatives && a.alternatives.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {a.alternatives.map((alt, i) => <Chip key={i} tone="sand">{alt}</Chip>)}
          </div>
        )}

        {a.groupNotes && (
          <p className="text-[13px] leading-6 text-zinc-600 bg-sand-100/60 rounded-xl p-3">{a.groupNotes}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a href={maps} target="_blank" rel="noreferrer" aria-label="ניווט בגוגל מפות"
             className="rounded-2xl bg-ocean-700 text-white py-3 text-center text-sm font-bold">
            🧭 ניווט
          </a>
          <a href={waze} target="_blank" rel="noreferrer" aria-label="ניווט בוויז"
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

        <details>
          <summary className="text-[12px] font-bold text-zinc-500 cursor-pointer">שנה סטטוס</summary>
          <div className="flex flex-wrap gap-1.5 mt-2">
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
        </details>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => store.setStatus(a.id, a.status === 'בוצע' ? 'מתוכנן' : 'בוצע')}
                  aria-label="סמן כבוצע"
                  className="rounded-2xl bg-emerald-500 text-white py-3 text-sm font-bold">
            ✓ בוצע
          </button>
          <button onClick={() => setEditing(true)}
                  aria-label="ערוך פעילות"
                  className="rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 text-sm font-bold">
            ✎ ערוך
          </button>
          {onReplace && (
            <button onClick={() => { onReplace(a); onClose(); }}
                    aria-label="החלף פעילות"
                    className="rounded-2xl bg-sunset-500 text-white py-3 text-sm font-bold col-span-2">
              🔄 החלף
            </button>
          )}
        </div>

        {edit && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ocean-100/60">
            <button onClick={() => { store.duplicateActivity(a.id); }}
                    aria-label="שכפל"
                    className="rounded-2xl bg-sand-100 text-ocean-700 py-3 text-sm font-bold">
              📋 שכפל
            </button>
            <button onClick={() => { if (confirm('למחוק את הפעילות?')) { store.deleteActivity(a.id); onClose(); } }}
                    aria-label="מחק"
                    className="rounded-2xl bg-red-50 text-red-600 py-3 text-sm font-bold">
              🗑️ מחק
            </button>
          </div>
        )}

        <ActivityExpenses activity={a} />
        <ActivityChat activity={a} />
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
function Stat({ icon, value }:{ icon: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-ocean-50/60 px-3 py-2 flex items-center gap-2">
      <span className="text-base leading-none">{icon}</span>
      <div className="text-[13px] font-bold text-ocean-700">{value}</div>
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
