import React, { useState } from 'react';
import type { Activity } from '../data/types';
import { CATEGORY_ICONS, STATUS_COLORS } from '../utils';
import { useEditMode } from '../store';
import { ActivityQuickActions } from './ActivityQuickActions';

export function ActivityCard({ a, onClick, compact=false, onReplace }:{
  a: Activity; onClick?: () => void; compact?: boolean; onReplace?: (a: Activity) => void;
}) {
  const s = STATUS_COLORS[a.status];
  const edit = useEditMode();
  const done = a.status === 'בוצע' || a.status === 'בוטל' || a.status === 'דולג';
  const [menu, setMenu] = useState(false);
  // strip leading "category · " duplication if the icon already says it
  const cleanedName = a.name.replace(/^(חוף|טיול|הליכה|בוקר חוף|יום חוף)\s*·\s*/, '');
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
          <div className="flex-1 p-3 flex items-center gap-2.5 min-w-0">
            <span className="text-xl leading-none flex-shrink-0">{CATEGORY_ICONS[a.category]}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-ocean-700 truncate">{cleanedName}</div>
            </div>
            <div className="text-[12px] text-zinc-500 font-semibold tabular-nums flex-shrink-0">
              {a.startTime}
            </div>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} aria-hidden />
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
    </div>
    {menu && (
      <ActivityQuickActions activity={a} open={menu} onClose={() => setMenu(false)} onReplace={onReplace} />
    )}
    </>
  );
}
