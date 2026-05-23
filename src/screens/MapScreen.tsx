import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { activitiesFor, CATEGORY_ICONS } from '../utils';
import type { Activity, Region } from '../data/types';
import { ActivitySheet } from '../components/ActivitySheet';
import { Chip } from '../components/Chip';

const REGIONS: { id: Region; emoji: string; tone: string }[] = [
  { id: 'צפון',         emoji: '🌋', tone: 'from-ocean-700 to-ocean-500' },
  { id: 'צפון-מזרח',   emoji: '🌿', tone: 'from-emerald-600 to-emerald-400' },
  { id: 'צפון-מערב',   emoji: '🗻', tone: 'from-ocean-500 to-emerald-400' },
  { id: 'מרכז',         emoji: '🌋', tone: 'from-volcano-700 to-sunset-700' },
  { id: 'מרכז-מערב',   emoji: '⛵', tone: 'from-ocean-500 to-sand-300' },
  { id: 'מרכז-מזרח',   emoji: '🏞️', tone: 'from-emerald-400 to-sand-300' },
  { id: 'דרום',         emoji: '🏖️', tone: 'from-sand-300 to-sunset-500' },
  { id: 'דרום-מזרח',   emoji: '🌅', tone: 'from-sunset-300 to-sunset-700' },
  { id: 'דרום-מערב',   emoji: '🐬', tone: 'from-ocean-300 to-ocean-700' },
  { id: 'מחוץ לטנריף', emoji: '✈️', tone: 'from-zinc-400 to-zinc-700' },
];

export function MapScreen() {
  const plan = useStore(s => s.plans.find(p => p.id === s.trip.activePlanId)!);
  const activities = useStore(s => s.activities);
  const [region, setRegion] = useState<Region | null>(null);
  const [sel, setSel] = useState<Activity | null>(null);

  const byRegion = useMemo(() => {
    const map = new Map<Region, Activity[]>();
    activitiesFor(plan.id, activities).forEach(a => {
      const arr = map.get(a.region) || [];
      arr.push(a); map.set(a.region, arr);
    });
    return map;
  }, [plan.id, activities]);

  const list = region ? (byRegion.get(region) || []) : [];

  return (
    <div className="p-4 pb-2 space-y-4 animate-fade-up">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">איפה זה קורה?</h1>
        <div className="text-[12px] text-zinc-500 mt-0.5">לחצו על אזור כדי לראות מה יש שם</div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {REGIONS.map(r => {
          const count = byRegion.get(r.id)?.length || 0;
          const active = region === r.id;
          return (
            <button key={r.id} onClick={() => setRegion(active ? null : r.id)}
                    className={`rounded-2xl p-3 text-right shadow-soft border border-white/40 text-white
                      bg-gradient-to-bl ${r.tone} ${active ? 'ring-2 ring-sunset-500 scale-[1.02]' : ''} transition`}>
              <div className="text-2xl">{r.emoji}</div>
              <div className="text-[14px] font-extrabold mt-1">{r.id}</div>
              <div className="text-[11px] opacity-90">{count} פעילויות</div>
            </button>
          );
        })}
      </div>

      {region && (
        <div className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[14px] font-extrabold text-ocean-700">{region}</div>
            <Chip tone="ocean">{list.length} פעילויות</Chip>
          </div>
          {list.length === 0 ? (
            <div className="text-[13px] text-zinc-500">אין כאן עדיין כלום בתוכנית הפעילה.</div>
          ) : (
            <div className="space-y-1.5">
              {list.map(a => (
                <button key={a.id} onClick={() => setSel(a)}
                        className="w-full flex items-center justify-between text-right px-2.5 py-2 rounded-xl hover:bg-ocean-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{CATEGORY_ICONS[a.category]}</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-ocean-700 truncate">{a.name}</div>
                      <div className="text-[11px] text-zinc-500">{a.category} · {a.dayDate.slice(5)}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500 tabular-nums">{a.startTime}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ActivitySheet activity={sel} open={!!sel} onClose={() => setSel(null)} />
    </div>
  );
}
