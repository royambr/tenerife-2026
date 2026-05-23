import React, { useState } from 'react';
import type { Activity, DayPart, Status } from '../data/types';
import { Sheet } from './Sheet';
import { store, useStore } from '../store';
import { dayPartHebrew } from '../livemode';

const STATUSES: Status[] = ['מתוכנן','הוזמן','אופציונלי','דורש החלטה','בוצע','בוטל','בסיכון','דולג'];
const PARTS: DayPart[] = ['morning','noon','evening','night','lateNight'];

export function ActivityQuickActions({ activity, open, onClose, onReplace }:{
  activity: Activity; open: boolean; onClose: () => void; onReplace?: (a: Activity) => void;
}) {
  const participants = useStore(s => s.participants);
  const plan = useStore(s => s.plans.find(p => p.id === s.trip.activePlanId)!);
  const [view, setView] = useState<'main'|'day'|'part'|'status'|'assign'|'note'>('main');
  const [note, setNote] = useState(activity.notes || '');

  function close() { setView('main'); onClose(); }

  return (
    <Sheet open={open} onClose={close} title={`פעולות · ${activity.name}`}>
      {view === 'main' && (
        <div className="space-y-2">
          <Row icon="🔁" label="העבר ליום אחר" onClick={() => setView('day')} />
          <Row icon="🕘" label="העבר לחלק יום אחר" onClick={() => setView('part')} />
          <Row icon="🎯" label="שנה סטטוס" onClick={() => setView('status')} />
          <Row icon="👤" label="הקצה לאחראי" onClick={() => setView('assign')} />
          <Row icon="📝" label="הוסף הערה" onClick={() => setView('note')} />
          {onReplace && <Row icon="✨" label="החלף פעילות" onClick={() => { onReplace(activity); close(); }} />}
          <Row icon="📋" label="שכפל" onClick={() => { store.duplicateActivity(activity.id); close(); }} />
          <Row icon="🗑️" label="מחק" danger onClick={() => { if (confirm('למחוק את הפעילות?')) { store.deleteActivity(activity.id); close(); } }} />
        </div>
      )}

      {view === 'day' && (
        <div className="space-y-2">
          <BackBtn onClick={() => setView('main')} />
          {plan.days.map(d => (
            <Row key={d.date} icon="📅" label={`${d.title} · ${d.date.slice(5)}`}
                 active={d.date === activity.dayDate}
                 onClick={() => { store.moveActivityToDay(activity.id, d.date); close(); }} />
          ))}
        </div>
      )}

      {view === 'part' && (
        <div className="space-y-2">
          <BackBtn onClick={() => setView('main')} />
          {PARTS.map(p => (
            <Row key={p} icon="🕘" label={dayPartHebrew(p)}
                 active={p === activity.dayPart}
                 onClick={() => { store.moveActivityToPart(activity.id, p); close(); }} />
          ))}
        </div>
      )}

      {view === 'status' && (
        <div className="space-y-2">
          <BackBtn onClick={() => setView('main')} />
          {STATUSES.map(s => (
            <Row key={s} icon="🎯" label={s}
                 active={s === activity.status}
                 onClick={() => { store.setStatus(activity.id, s); close(); }} />
          ))}
        </div>
      )}

      {view === 'assign' && (
        <div className="space-y-2">
          <BackBtn onClick={() => setView('main')} />
          <Row icon="🚫" label="ללא אחראי"
               active={!activity.assignedTo}
               onClick={() => { store.assignActivity(activity.id, undefined); close(); }} />
          {participants.map(p => (
            <Row key={p.id} icon={p.emoji || '👤'} label={p.name}
                 active={p.id === activity.assignedTo}
                 onClick={() => { store.assignActivity(activity.id, p.id); close(); }} />
          ))}
        </div>
      )}

      {view === 'note' && (
        <div className="space-y-3">
          <BackBtn onClick={() => setView('main')} />
          <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="הערה לפעילות..." rows={5}
                    className="w-full rounded-xl border border-ocean-100 bg-white px-3 py-2.5 text-[14px]" />
          <button onClick={() => { store.setActivityNote(activity.id, note); close(); }}
                  className="w-full rounded-2xl bg-ocean-700 text-white py-3 font-bold">שמור הערה</button>
        </div>
      )}
    </Sheet>
  );
}

function Row({ icon, label, onClick, danger, active }:{
  icon: string; label: string; onClick: () => void; danger?: boolean; active?: boolean;
}) {
  return (
    <button onClick={onClick}
            className={`w-full text-right flex items-center gap-3 px-3 py-3 rounded-2xl border min-h-[48px]
              ${danger ? 'bg-red-50 border-red-100 text-red-600'
                : active ? 'bg-ocean-700 text-white border-ocean-700'
                : 'bg-white border-ocean-100 text-ocean-700 hover:bg-ocean-50'}`}>
      <span className="text-xl">{icon}</span>
      <span className="text-[14px] font-bold flex-1">{label}</span>
      {active && <span className="text-xs">✓</span>}
    </button>
  );
}

function BackBtn({ onClick }:{ onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-[12px] font-bold text-zinc-500 hover:text-ocean-700">← חזרה</button>
  );
}
