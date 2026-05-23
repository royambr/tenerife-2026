import React, { useState } from 'react';
import type { Activity } from '../data/types';
import { store, useStore } from '../store';
import { timeAgoHe } from '../utils';

export function ActivityChat({ activity }: { activity: Activity }) {
  const participants = useStore(s => s.participants);
  const me = useStore(s => s.currentParticipantId);
  const msgs = activity.messages || [];
  const [open, setOpen] = useState(msgs.length > 0);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    store.postMessage(activity.id, text);
    setText('');
    setOpen(true);
  };

  return (
    <div className="rounded-2xl bg-white border border-ocean-100">
      <button onClick={() => setOpen(v => !v)}
              className="w-full px-3 py-2.5 flex items-center justify-between min-h-[44px]">
        <span className="text-[13px] font-extrabold text-ocean-700">💬 שיחה ({msgs.length})</span>
        <span className="text-zinc-400 text-xs">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {msgs.length === 0 ? (
            <div className="text-[12px] text-zinc-500 text-center py-3">עוד אין הודעות. תהיה הראשון! 💬</div>
          ) : (
            <ul className="space-y-1.5 max-h-64 overflow-y-auto">
              {msgs.map(m => {
                const p = participants.find(x => x.id === m.who);
                const mine = m.who === me;
                return (
                  <li key={m.id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 ${mine ? 'bg-sunset-500 text-white' : 'bg-ocean-50 text-ocean-700'}`}>
                      <div className="text-[10px] opacity-80 flex items-center gap-1">
                        <span>{p?.emoji}</span><span className="font-bold">{p?.name || 'מישהו'}</span>
                        <span>· {timeAgoHe(m.ts)}</span>
                        {mine && (
                          <button onClick={() => { if (confirm('למחוק הודעה?')) store.deleteMessage(activity.id, m.id); }}
                                  className="mr-1 underline">מחק</button>
                        )}
                      </div>
                      <div className="text-[13px] leading-5 break-words whitespace-pre-wrap">{m.text}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex gap-1.5 pt-1 border-t border-ocean-100">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="כתוב הודעה…"
              className="flex-1 rounded-xl border border-ocean-100 bg-white px-3 py-2 text-[13px] min-h-[40px]"
            />
            <button onClick={send}
                    disabled={!text.trim()}
                    className="rounded-xl bg-ocean-700 text-white px-4 text-[13px] font-bold min-h-[40px] disabled:opacity-40">
              שלח
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
