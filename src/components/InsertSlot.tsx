import React, { useState } from 'react';
import type { Activity, DayPart, Region } from '../data/types';
import { Sheet } from './Sheet';
import { ActivityEditor } from './ActivityEditor';
import { AttractionSearch } from './AttractionSearch';
import { store } from '../store';
import { minutesFromHM } from '../utils';

function hmFromMinutes(min: number) {
  const m = Math.max(0, Math.min(24 * 60 - 1, Math.round(min)));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function inferDayPart(startMin: number): DayPart {
  const h = startMin / 60;
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'noon';
  if (h >= 17 && h < 21) return 'evening';
  if (h >= 21 && h < 25) return 'night';
  return 'lateNight';
}

function uid() {
  return 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function InsertSlot({
  prev,
  next,
  planId,
  dayDate,
  fallbackRegion,
}: {
  prev?: Activity;
  next?: Activity;
  planId: string;
  dayDate: string;
  fallbackRegion: Region;
}) {
  const [open, setOpen] = useState(false);

  function buildDefault(): Activity {
    let startMin: number;
    if (prev && next) {
      startMin = Math.round((minutesFromHM(prev.endTime) + minutesFromHM(next.startTime)) / 2);
    } else if (next && !prev) {
      // very top → 1h before first, floored at 06:00
      startMin = Math.max(6 * 60, minutesFromHM(next.startTime) - 60);
    } else if (prev && !next) {
      // very bottom → 1h after last, capped to 23:30 so end < 24:00
      startMin = Math.min(23 * 60 + 30, minutesFromHM(prev.endTime) + 60);
    } else {
      // empty day → default mid-morning
      startMin = 10 * 60;
    }
    // end = start + 1h, but never overflow into `next` (leave 5min buffer)
    let endMin = Math.min(23 * 60 + 59, startMin + 60);
    if (next) {
      const nextCap = minutesFromHM(next.startTime) - 5;
      if (nextCap > startMin) endMin = Math.min(endMin, nextCap);
    }
    const region: Region = (prev?.region || next?.region || fallbackRegion) as Region;
    return {
      id: uid(),
      planId,
      dayDate,
      dayPart: inferDayPart(startMin),
      startTime: hmFromMinutes(startMin),
      endTime: hmFromMinutes(endMin),
      name: '',
      category: 'אחר',
      region,
      costLevel: 1,
      status: 'מתוכנן',
    };
  }

  const [draft, setDraft] = useState<Activity | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  function handleOpen() {
    setDraft(buildDefault());
    setEditorKey(k => k + 1);
    setOpen(true);
  }

  function applyPatch(patch: Partial<Activity>) {
    setDraft(d => (d ? { ...d, ...patch } as Activity : d));
    setEditorKey(k => k + 1);
  }

  function handleSave(a: Activity) {
    // make sure dayPart stays consistent with chosen start
    const startMin = minutesFromHM(a.startTime);
    const corrected: Activity = { ...a, dayPart: inferDayPart(startMin) };
    store.upsertActivity(corrected);
    setOpen(false);
    setDraft(null);
  }

  const label = prev && next
    ? `הוסף פעילות בין ${prev.name} לבין ${next.name}`
    : prev
      ? `הוסף פעילות אחרי ${prev.name}`
      : next
        ? `הוסף פעילות לפני ${next.name}`
        : 'הוסף פעילות ראשונה';

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={label}
        className="group w-full h-8 my-0.5 flex items-center justify-center gap-2 rounded-xl
                   border border-dashed border-ocean-300/50 bg-transparent
                   text-[11px] font-bold text-ocean-700/50
                   hover:border-sunset-500 hover:text-sunset-700 hover:bg-sunset-300/5
                   focus:outline-none focus:border-sunset-500 focus:text-sunset-700
                   active:scale-[.99] transition-all"
      >
        <span className="inline-block w-4 h-4 rounded-full bg-ocean-50 text-ocean-700 text-[12px] leading-4 text-center font-extrabold group-hover:bg-sunset-500 group-hover:text-white transition-colors">+</span>
        <span>הוסף פעילות כאן</span>
      </button>
      <Sheet open={open} onClose={() => { setOpen(false); setDraft(null); }} title="הוספת פעילות חדשה">
        {draft && (
          <div className="space-y-4">
            <AttractionSearch apply={applyPatch} currentName={draft.name} />
            <ActivityEditor
              key={editorKey}
              initial={draft}
              onSave={handleSave}
              onCancel={() => { setOpen(false); setDraft(null); }}
            />
          </div>
        )}
      </Sheet>
    </>
  );
}
