import React, { useState } from 'react';
import type { Activity } from '../data/types';
import { CATEGORY_ICONS, STATUS_COLORS } from '../utils';
import { useEditMode, useStore } from '../store';
import { ActivityQuickActions } from './ActivityQuickActions';

export function ActivityCard({ a, onClick, compact=false, onReplace }:{
  a: Activity; onClick?: () => void; compact?: boolean; onReplace?: (a: Activity) => void;
}) {
  const s = STATUS_COLORS[a.status];
  const edit = useEditMode();
  const participants = useStore(st => st.participants);
  const done = a.status === 'בוצע' || a.status === 'בוטל' || a.status === 'דולג';
  const [menu, setMenu] = useState(false);
  const cleanedName = a.name.replace(/^(חוף|טיול|הליכה|בוקר חוף|יום חוף)\s*·\s*/, '');
  const allIds = participants.map(p => p.id);
  const attendees = a.attendees ?? allIds;
  const partial = attendees.length < allIds.length;
  const attChips = partial
    ? attendees.slice(0, 3).map(id => participants.find(p => p.id === id)).filter(Boolean)
    : [];
  const extra = partial ? attendees.length - attChips.length : 0;

  return (
    <>
    <div className={`relative group w-full rounded-2xl bg-white border
        ${edit ? 'border-volcano-900/40' : 'border-ocean-100/50'}
        ${done ? 'opacity-55' : ''} active:scale-[.99] transition`}>
      <button
        onClick={onClick}
        type="button"
        aria-label={a.name}
        className="w-full text-right"
      >
        <div className="flex items-stretch">
          <div className={`w-1 rounded-r-2xl ${s.dot}`} />
          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-start gap-2.5">
              {/* time range pill on the LEFT (visual leading edge in RTL) */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <span className="text-[11px] font-extrabold tabular-nums bg-ocean-50 text-ocean-700 rounded-lg px-2 py-1 leading-none whitespace-nowrap">
                  {a.startTime}<span className="opacity-50 mx-0.5">–</span>{a.endTime}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  <span className="text-xl leading-none flex-shrink-0">{CATEGORY_ICONS[a.category]}</span>
                  <div className="text-[14px] font-semibold text-ocean-700 leading-snug break-words"
                       style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cleanedName}
                  </div>
                </div>
                {partial && (
                  <div className="mt-1.5 flex items-center gap-0.5 text-[10px] text-zinc-500">
                    {attChips.map(p => (
                      <span key={p!.id} className="bg-sand-100 rounded-full w-5 h-5 flex items-center justify-center" title={p!.name}>
                        {p!.emoji}
                      </span>
                    ))}
                    {extra > 0 && <span className="bg-sand-100 rounded-full w-5 h-5 flex items-center justify-center font-bold">+{extra}</span>}
                    <span className="mr-1 font-semibold">{attendees.length}/{allIds.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
      {edit && (
        <button onClick={(e) => { e.stopPropagation(); setMenu(true); }}
                aria-label="פעולות מהירות"
                className="absolute top-1.5 left-1.5 w-8 h-8 rounded-full bg-volcano-900 text-white text-base font-bold flex items-center justify-center">
          ⋮
        </button>
      )}
      {(a.messages?.length || 0) > 0 && (
        <span className="absolute top-1.5 left-1.5 text-[10px] font-extrabold bg-sunset-500 text-white rounded-full px-1.5 py-0.5 pointer-events-none"
              style={edit ? { top: '40px' } : undefined}>
          💬 {a.messages!.length}
        </span>
      )}
    </div>
    {menu && (
      <ActivityQuickActions activity={a} open={menu} onClose={() => setMenu(false)} onReplace={onReplace} />
    )}
    </>
  );
}
