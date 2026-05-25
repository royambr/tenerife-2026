import React, { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { useStore } from '../store';
import { addFeedback as syncAddFeedback } from '../lib/feedbackSync';

const SCREEN_OPTIONS: { id: string; label: string }[] = [
  { id: 'general',  label: 'כללי' },
  { id: 'today',    label: 'היום' },
  { id: 'schedule', label: 'לו״ז' },
  { id: 'plans',    label: 'אפשרויות' },
  { id: 'map',      label: 'מפה' },
  { id: 'manage',   label: 'ניהול' },
];

const PULSE_FLAG_KEY = 'tenerife_fb_pulse_seen_v1';

export function FeedbackSheet({ open, onClose, defaultScreen }:{
  open: boolean; onClose: () => void; defaultScreen?: string;
}) {
  const [rating, setRating] = useState<0|1|2|3|4|5>(0);
  const [text, setText] = useState('');
  const [screen, setScreen] = useState<string>(defaultScreen || 'general');

  useEffect(() => {
    if (open) {
      setRating(0);
      setText('');
      setScreen(defaultScreen || 'general');
    }
  }, [open, defaultScreen]);

  function submit() {
    if (!text.trim()) return;
    syncAddFeedback({
      text: text.trim(),
      screen,
      rating: rating > 0 ? (rating as 1|2|3|4|5) : undefined,
    });
    try { localStorage.setItem(PULSE_FLAG_KEY, '1'); } catch {}
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="✍️ הפידבק שלך">
      <div className="space-y-4">
        <p className="text-[12px] text-zinc-600 leading-5">נשמע אותך — תעזור לי לשפר את האפליקציה</p>

        {/* Rating */}
        <div>
          <div className="text-[12px] font-bold text-ocean-700 mb-1.5">דירוג (לא חובה)</div>
          <div className="flex gap-1.5">
            {[1,2,3,4,5].map(n => (
              <button key={n}
                      type="button"
                      onClick={() => setRating(rating === n ? 0 : n as 1|2|3|4|5)}
                      aria-label={`${n} כוכבים`}
                      className={`min-w-[44px] min-h-[44px] text-2xl rounded-xl flex items-center justify-center transition
                        ${n <= rating ? 'bg-sunset-300/30 text-sunset-500' : 'bg-ocean-50 text-zinc-300 hover:text-sunset-300'}`}>
                {n <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* Text */}
        <div>
          <div className="text-[12px] font-bold text-ocean-700 mb-1.5">מה דעתך?</div>
          <textarea value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="מה עובד טוב? מה מעצבן? מה חסר?"
                    rows={5}
                    className="w-full rounded-xl border border-ocean-100 bg-white px-3 py-2.5 text-[14px] leading-6 resize-none focus:outline-none focus:border-ocean-300" />
        </div>

        {/* Screen tag */}
        <div>
          <div className="text-[12px] font-bold text-ocean-700 mb-1.5">איפה זה רלוונטי?</div>
          <div className="flex flex-wrap gap-1.5">
            {SCREEN_OPTIONS.map(s => (
              <button key={s.id}
                      type="button"
                      onClick={() => setScreen(s.id)}
                      className={`min-h-[36px] rounded-full px-3 py-1.5 text-[12px] font-semibold transition
                        ${screen === s.id ? 'bg-ocean-700 text-white' : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button onClick={submit}
                  disabled={!text.trim()}
                  className="rounded-2xl bg-ocean-700 text-white py-3 font-bold min-h-[44px] disabled:opacity-40">
            ✓ שלח פידבק
          </button>
          <button onClick={onClose}
                  className="rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 font-bold min-h-[44px]">
            ביטול
          </button>
        </div>
      </div>
    </Sheet>
  );
}

export function FeedbackFab({ activeTab }:{ activeTab?: string }) {
  const [open, setOpen] = useState(false);
  const feedbackCount = useStore(s => s.feedback.length);

  // pulse if never seen + no feedback yet
  const [pulseSeen, setPulseSeen] = useState<boolean>(() => {
    try { return localStorage.getItem(PULSE_FLAG_KEY) === '1'; } catch { return true; }
  });
  const shouldPulse = !pulseSeen && feedbackCount === 0;

  function handleOpen() {
    setOpen(true);
    if (!pulseSeen) {
      try { localStorage.setItem(PULSE_FLAG_KEY, '1'); } catch {}
      setPulseSeen(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="שלח פידבק"
        className={`fixed right-4 z-[90] w-12 h-12 rounded-full bg-sunset-500 text-white text-2xl shadow-2xl
                    flex items-center justify-center
                    bottom-[96px] lg:bottom-6
                    hover:bg-sunset-700 active:scale-95 transition
                    ${shouldPulse ? 'animate-pulse ring-4 ring-sunset-300/60' : ''}`}>
        💬
      </button>
      <FeedbackSheet open={open} onClose={() => setOpen(false)} defaultScreen={activeTab} />
    </>
  );
}
