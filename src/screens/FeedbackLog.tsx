import React from 'react';
import { useStore } from '../store';

const SCREEN_LABELS: Record<string, string> = {
  general: 'כללי', today: 'היום', schedule: 'לו״ז',
  plans: 'אפשרויות', map: 'מפה', manage: 'ניהול',
};

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400 text-[12px] tracking-tight">
      {'★'.repeat(n)}<span className="text-zinc-300">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

export function FeedbackLog() {
  const feedback = useStore(s => s.feedback);
  const participants = useStore(s => s.participants);

  function getName(who: string) {
    const p = participants.find(p => p.id === who);
    return p ? `${p.emoji} ${p.name}` : who;
  }

  function fmt(ts: number) {
    return new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="p-4 pb-24 space-y-4 animate-fade-up lg:max-w-5xl">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">💬 פידבקים</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">{feedback.length} הערות נשמרו</p>
      </header>

      {feedback.length === 0 ? (
        <div className="rounded-2xl bg-white border border-ocean-100 p-10 text-center text-zinc-400 text-[13px]">
          עדיין לא נכתבו פידבקים — לחץ על 💬 בפינה כדי להוסיף
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map(f => (
            <div key={f.id} className="rounded-2xl bg-white border border-ocean-100 px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[13px] font-extrabold text-ocean-700">{getName(f.who)}</span>
                <div className="flex items-center gap-2">
                  {f.screen && (
                    <span className="text-[10px] bg-ocean-50 text-ocean-700 font-bold rounded-full px-2 py-0.5">
                      {SCREEN_LABELS[f.screen] ?? f.screen}
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-400">{fmt(f.ts)}</span>
                </div>
              </div>
              {f.rating && <Stars n={f.rating} />}
              <p className="text-[13px] text-zinc-700 leading-5">{f.text}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
