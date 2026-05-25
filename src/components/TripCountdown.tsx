import React from 'react';

const TRIP_START = '2026-06-17';
const TRIP_END   = '2026-06-24';
const DATES = ['2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22','2026-06-23','2026-06-24'];

const CARD = 'rounded-2xl bg-white border border-ocean-100 px-3 py-3 flex flex-col items-center justify-center text-center h-full';

function canaryToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Atlantic/Canary' });
}

export function TripCountdown() {
  const today = canaryToday();
  if (today > TRIP_END) return null;

  if (today < TRIP_START) {
    const days = Math.ceil(
      (new Date(TRIP_START).getTime() - new Date(today).getTime()) / 86400000
    );
    return (
      <div className={CARD}>
        <div className="text-2xl leading-none">✈️</div>
        <div className="text-[13px] font-extrabold text-ocean-700 mt-1">עוד {days} ימים</div>
        <div className="text-[10px] text-zinc-400 font-medium">לטנריף 🌋</div>
      </div>
    );
  }

  if (today === TRIP_START) {
    return (
      <div className={CARD}>
        <div className="text-2xl leading-none">🌋</div>
        <div className="text-[13px] font-extrabold text-ocean-700 mt-1">היום מתחיל</div>
        <div className="text-[10px] text-zinc-400 font-medium">המסע ✈️</div>
      </div>
    );
  }

  const dayNum = DATES.indexOf(today) + 1;
  return (
    <div className={CARD}>
      <div className="text-2xl leading-none">🌊</div>
      <div className="text-[13px] font-extrabold text-ocean-700 mt-1">יום {dayNum} מתוך 8</div>
      <div className="text-[10px] text-zinc-400 font-medium">בטנריף</div>
    </div>
  );
}
