import React, { useState } from 'react';
import type { Activity } from '../data/types';
import { CATEGORY_ICONS, STATUS_COLORS, costLabel } from '../utils';
import { Chip } from './Chip';
import { useEditMode } from '../store';
import { ActivityQuickActions } from './ActivityQuickActions';

export function ActivityCard({ a, onClick, compact=false, onReplace }:{
  a: Activity; onClick?: () => void; compact?: boolean; onReplace?: (a: Activity) => void;
}) {
  const s = STATUS_COLORS[a.status];
  const edit = useEditMode();
  const done = a.status === 'בוצע' || a.status === 'בוטל' || a.status === 'דולג';
  const [menu, setMenu] = useState(false);
  return (
    <>
    <div className={`relative group w-full rounded-2xl bg-white shadow-card border
        ${edit ? 'border-volcano-900/50 ring-1 ring-volcano-900/20' : 'border-ocean-100/60'}
        ${done ? 'opacity-60' : ''} hover:shadow-lg active:scale-[.99] transition`}>
      <button
        onClick={onClick}
        type="button"
        className="w-full text-right"
      >
        <div className="flex items-stretch">
          <div className={`w-1.5 rounded-r-2xl ${s.dot}`} />
          <div className="flex-1 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl leading-none">{CATEGORY_ICONS[a.category]}</span>
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-ocean-700 truncate">{a.name}</div>
                  <div className="text-[12px] text-zinc-500 truncate flex items-center gap-1.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span>{a.region}</span>
                  </div>
                </div>
              </div>
              <div className="text-left flex-shrink-0">
                <div className="text-[12px] text-zinc-600 font-semibold tabular-nums">
                  {a.startTime}
                </div>
                <div className="text-[11px] text-sunset-700 font-bold">{costLabel(a.costLevel)}</div>
              </div>
            </div>
            {!compact && ((a.bookingRequired && a.status !== 'הוזמן') || a.priority === 'גבוה' || a.status === 'בסיכון' || a.status === 'דורש החלטה') && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.status === 'בסיכון' && <Chip tone="red">בסיכון</Chip>}
                {a.status === 'דורש החלטה' && <Chip tone="sunset">דורש החלטה</Chip>}
                {a.bookingRequired && a.status !== 'הוזמן' && a.status !== 'בסיכון' && <Chip tone="sunset">צריך לסגור</Chip>}
                {a.priority === 'גבוה' && <Chip tone="red">חשוב</Chip>}
              </div>
            )}
          </div>
        </div>
      </button>
      {edit && (
        <button onClick={(e) => { e.stopPropagation(); setMenu(true); }}
                aria-label="פעולות מהירות"
                className="absolute top-2 left-2 w-9 h-9 rounded-full bg-volcano-900 text-white text-lg font-bold shadow-card flex items-center justify-center">
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
