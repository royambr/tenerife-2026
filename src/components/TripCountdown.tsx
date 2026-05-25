import React from 'react';

const TRIP_START = '2026-06-17';
const TRIP_END   = '2026-06-24';
const DATES = ['2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22','2026-06-23','2026-06-24'];

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
      <div className="rounded-2xl bg-gradient-to-bl from-ocean-700 to-ocean-500 text-white px-4 py-3 text-center shadow-card">
        <span className="text-[15px] font-extrabold">✈️ עוד {days} ימים לטנריף 🌋</span>
      </div>
    );
  }

  if (today === TRIP_START) {
    return (
      <div className="rounded-2xl bg-gradient-to-bl from-sunset-700 to-sunset-500 text-white px-4 py-3 text-center shadow-card">
        <span className="text-[17px] font-extrabold">היום מתחיל המסע! ✈️🌋</span>
      </div>
    );
  }

  const dayNum = DATES.indexOf(today) + 1;
  return (
    <div className="rounded-2xl bg-gradient-to-bl from-ocean-600 to-ocean-400 text-white px-4 py-3 text-center shadow-card">
      <span className="text-[15px] font-extrabold">🌊 יום {dayNum} מתוך 8 בטנריף</span>
    </div>
  );
}
