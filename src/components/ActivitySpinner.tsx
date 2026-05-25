import React, { useState } from 'react';
import type { Activity } from '../data/types';
import { Sheet } from './Sheet';
import { CATEGORY_ICONS } from '../utils';

interface Props {
  activities: Activity[];
}

export function ActivitySpinner({ activities }: Props) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Activity | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [displayName, setDisplayName] = useState('');

  if (activities.length === 0) return null;

  function spin() {
    setOpen(true);
    setSpinning(true);
    setPicked(null);
    const names = activities.map(a => a.name);
    let tick = 0;
    const maxTicks = 20;
    function step() {
      setDisplayName(names[Math.floor(Math.random() * names.length)]);
      tick++;
      if (tick >= maxTicks) {
        const winner = activities[Math.floor(Math.random() * activities.length)];
        setPicked(winner);
        setDisplayName(winner.name);
        setSpinning(false);
      } else {
        setTimeout(step, 60 + tick * 8);
      }
    }
    step();
  }

  return (
    <>
      <button
        onClick={spin}
        className="w-full rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 text-[13px] font-extrabold min-h-[44px] shadow-soft"
      >
        🎰 תפתיע אותי
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="🎰 הגורל מחליט">
        <div className="p-6 text-center">
          {spinning ? (
            <div className="text-[20px] font-extrabold text-ocean-700 min-h-[60px] flex items-center justify-center animate-pulse">
              {displayName}
            </div>
          ) : picked ? (
            <>
              <div className="text-6xl mb-3">{CATEGORY_ICONS[picked.category]}</div>
              <div className="text-[22px] font-extrabold text-ocean-700 mb-1">{picked.name}</div>
              <div className="text-[13px] text-zinc-500 mb-1">{picked.startTime} – {picked.endTime}</div>
              <div className="text-[12px] text-zinc-400 mb-6">{picked.region}</div>
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-2xl bg-gradient-to-bl from-ocean-700 to-ocean-500 text-white font-extrabold py-3 text-[15px]"
              >
                בואו נעשה את זה! 🙌
              </button>
            </>
          ) : null}
        </div>
      </Sheet>
    </>
  );
}
