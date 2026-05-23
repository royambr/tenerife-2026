import React from 'react';
import type { Activity } from '../data/types';
import { store, useStore } from '../store';

export function ActivityAttendees({ activity }: { activity: Activity }) {
  const participants = useStore(s => s.participants);
  const allIds = participants.map(p => p.id);
  const attendees = activity.attendees ?? allIds;

  return (
    <div className="rounded-2xl bg-ocean-50/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13px] font-extrabold text-ocean-700">👥 מי בא?</div>
        <div className="text-[11px] font-bold text-ocean-700 tabular-nums">{attendees.length} מתוך {allIds.length}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {participants.map(p => {
          const inIt = attendees.includes(p.id);
          return (
            <button key={p.id} onClick={() => store.toggleAttendee(activity.id, p.id)}
                    aria-pressed={inIt}
                    className={`min-h-[36px] rounded-full px-3 py-1.5 text-[12px] font-semibold border transition flex items-center gap-1
                      ${inIt ? 'bg-ocean-700 text-white border-ocean-700' : 'bg-white text-zinc-400 border-zinc-200 line-through'}`}>
              <span>{p.emoji}</span><span>{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
