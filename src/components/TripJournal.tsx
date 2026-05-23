import React, { useMemo, useState } from 'react';
import { Sheet } from './Sheet';
import { useStore } from '../store';
import { fmtDateShort, iso, CATEGORY_ICONS, sortActivities } from '../utils';
import { REGION_CENTERS, haversineKm } from '../data/regions';
import type { Activity, TripPhoto } from '../data/types';

interface DaySummary {
  date: string;
  total: number;
  done: number;
  skipped: number;
  photos: TripPhoto[];
  messages: number;
  topActivity?: Activity;
}

export function TripJournal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const trip = useStore(s => s.trip);
  const plan = useStore(s => s.plans.find(p => p.id === s.trip.activePlanId)!);
  const activities = useStore(s => s.activities);
  const allPhotos = useStore(s => s.photos);
  const participants = useStore(s => s.participants);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const todayIso = iso(new Date());

  const days: DaySummary[] = useMemo(() => {
    return plan.days
      .filter(d => d.date <= todayIso)
      .map(d => {
        const dayActs = activities.filter(a => a.planId === plan.id && a.dayDate === d.date);
        const done = dayActs.filter(a => a.status === 'בוצע');
        const skipped = dayActs.filter(a => a.status === 'דולג');
        const photos = allPhotos.filter(p => p.dayDate === d.date).sort((a,b) => b.ts - a.ts);
        const messages = dayActs.reduce((s, a) => s + (a.messages?.length || 0), 0);
        const highPriorityDone = done.find(a => a.priority === 'גבוה') || done[0];
        return {
          date: d.date,
          total: dayActs.filter(a => a.category !== 'מלון' && a.category !== 'נסיעה / לוגיסטיקה').length,
          done: done.length,
          skipped: skipped.length,
          photos,
          messages,
          topActivity: highPriorityDone,
        };
      });
  }, [plan, activities, allPhotos, todayIso]);

  const totals = useMemo(() => {
    const totalDone = days.reduce((s, d) => s + d.done, 0);
    const totalPhotos = allPhotos.length;
    const totalMessages = activities.reduce((s, a) => s + (a.messages?.length || 0), 0);
    // region km jumps (sum of distance between consecutive activities by start time)
    let km = 0;
    const sorted = sortActivities(activities.filter(a => a.planId === plan.id && a.dayDate <= todayIso));
    for (let i = 1; i < sorted.length; i++) {
      const a = REGION_CENTERS[sorted[i-1].region];
      const b = REGION_CENTERS[sorted[i].region];
      if (a && b) km += haversineKm(a, b);
    }
    return { totalDone, totalPhotos, totalMessages, totalKm: Math.round(km) };
  }, [days, allPhotos, activities, plan, todayIso]);

  return (
    <Sheet open={open} onClose={onClose} title="📔 היומן שלנו">
      <div className="space-y-3">
        {/* Top totals */}
        <div className="rounded-2xl bg-gradient-to-bl from-ocean-700 to-ocean-500 text-white p-4">
          <div className="text-[13px] font-extrabold opacity-90 mb-2">סיכום הטיול עד עכשיו</div>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <Tot label="פעילויות בוצעו" value={totals.totalDone} />
            <Tot label="תמונות" value={totals.totalPhotos} />
            <Tot label="הודעות" value={totals.totalMessages} />
            <Tot label="ק״מ בין אזורים" value={totals.totalKm} />
          </div>
        </div>

        {days.length === 0 && (
          <div className="text-[13px] text-zinc-500 text-center py-6">
            הטיול עוד לא התחיל — היומן ימלא את עצמו תוך כדי 🌴
          </div>
        )}

        {days.slice().reverse().map(d => {
          const expanded = expandedDate === d.date;
          const dayPlan = plan.days.find(x => x.date === d.date)!;
          const dayActs = sortActivities(activities.filter(a => a.planId === plan.id && a.dayDate === d.date));
          const doneActs = dayActs.filter(a => a.status === 'בוצע');
          return (
            <div key={d.date} className="rounded-2xl bg-white border border-ocean-100 overflow-hidden">
              <button onClick={() => setExpandedDate(expanded ? null : d.date)}
                      className="w-full text-right p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13px] font-extrabold text-ocean-700">{fmtDateShort(d.date)} · {dayPlan.title}</div>
                    <div className="text-[11px] text-zinc-500">{d.done} מתוך {d.total} בוצעו · 📸 {d.photos.length} · 💬 {d.messages}</div>
                  </div>
                  <span className="text-zinc-400 text-xs">{expanded ? '▴' : '▾'}</span>
                </div>
                {d.photos.length > 0 && (
                  <div className="mt-2 flex gap-1 overflow-x-auto">
                    {d.photos.slice(0, 5).map(p => (
                      <img key={p.id} src={p.dataUrl} alt=""
                           className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}
                {d.topActivity && (
                  <div className="mt-2 text-[12px] text-ocean-700 flex items-center gap-1.5">
                    <span>{CATEGORY_ICONS[d.topActivity.category]}</span>
                    <span className="truncate">היום בלט: <span className="font-bold">{d.topActivity.name}</span></span>
                  </div>
                )}
              </button>
              {expanded && (
                <div className="border-t border-ocean-100 p-3 space-y-2 bg-ocean-50/30">
                  {doneActs.length > 0 ? (
                    <ul className="space-y-1">
                      {doneActs.map(a => (
                        <li key={a.id} className="text-[12px] flex items-center gap-1.5">
                          <span>{CATEGORY_ICONS[a.category]}</span>
                          <span className="font-bold text-ocean-700">{a.startTime}</span>
                          <span className="text-zinc-700 truncate">{a.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-[12px] text-zinc-500">לא סומנה אף פעילות כבוצעה</div>}
                  {d.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-1">
                      {d.photos.map(p => (
                        <img key={p.id} src={p.dataUrl} alt="" className="aspect-square w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  {dayActs.some(a => a.messages?.length) && (
                    <div className="space-y-1">
                      {dayActs.flatMap(a => (a.messages || []).map(m => ({ a, m })))
                        .sort((x,y) => x.m.ts - y.m.ts)
                        .map(({ a, m }) => {
                          const who = participants.find(p => p.id === m.who);
                          return (
                            <div key={m.id} className="text-[11px] bg-white rounded-lg p-1.5 border border-ocean-100">
                              <span className="font-bold text-ocean-700">{who?.emoji} {who?.name}</span>
                              <span className="text-zinc-400"> · {a.name}</span>
                              <div className="text-zinc-700">{m.text}</div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div className="text-[10px] text-zinc-400 text-center pt-2">{trip.title}</div>
      </div>
    </Sheet>
  );
}

function Tot({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2">
      <div className="text-[18px] font-extrabold tabular-nums">{value}</div>
      <div className="text-[10px] opacity-80">{label}</div>
    </div>
  );
}
