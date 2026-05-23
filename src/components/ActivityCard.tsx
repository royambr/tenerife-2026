import React from 'react';
import type { Activity } from '../data/types';
import { CATEGORY_ICONS, STATUS_COLORS, costLabel } from '../utils';
import { Chip } from './Chip';
import { useEditMode } from '../store';

export function ActivityCard({ a, onClick, compact=false }:{
  a: Activity; onClick?: () => void; compact?: boolean;
}) {
  const s = STATUS_COLORS[a.status];
  const edit = useEditMode();
  const done = a.status === 'בוצע' || a.status === 'בוטל';
  return (
    <button
      onClick={onClick}
      className={`group w-full text-right rounded-2xl bg-white shadow-card border border-ocean-100/60
        ${done ? 'opacity-60' : ''} hover:shadow-lg active:scale-[.99] transition`}
    >
      <div className="flex items-stretch">
        <div className={`w-1.5 rounded-r-2xl ${s.dot}`} />
        <div className="flex-1 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl leading-none">{CATEGORY_ICONS[a.category]}</span>
              <div className="min-w-0">
                <div className="text-[15px] font-bold text-ocean-700 truncate">{a.name}</div>
                <div className="text-[12px] text-zinc-500 truncate">{a.region} · {a.category}</div>
              </div>
            </div>
            <div className="text-left flex-shrink-0">
              <div className="text-[12px] text-zinc-600 font-semibold tabular-nums">
                {a.startTime}–{a.endTime}
              </div>
              <div className="text-[11px] text-sunset-700 font-bold">{costLabel(a.costLevel)}</div>
            </div>
          </div>
          {!compact && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip tone={statusToTone(a.status)}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{a.status}
              </Chip>
              {a.bookingRequired && a.status !== 'הוזמן' && <Chip tone="sunset">צריך לסגור</Chip>}
              {a.priority === 'גבוה' && <Chip tone="red">חשוב</Chip>}
              {edit && <Chip tone="volcano">מצב עריכה</Chip>}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function statusToTone(s: Activity['status']) {
  switch (s) {
    case 'הוזמן': return 'emerald';
    case 'אופציונלי': return 'sand';
    case 'דורש החלטה': return 'sunset';
    case 'בוצע': return 'zinc';
    case 'בוטל': return 'red';
    default: return 'ocean';
  }
}
