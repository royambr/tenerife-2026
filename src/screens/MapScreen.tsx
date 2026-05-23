import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { activitiesFor, CATEGORY_ICONS } from '../utils';
import type { Activity, Region } from '../data/types';
import { ActivitySheet } from '../components/ActivitySheet';
import { Chip } from '../components/Chip';
import { TenerifeMap } from '../components/TenerifeMap';

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
    <div className="p-4 pb-2 space-y-4 animate-fade-up lg:max-w-4xl">
      <header>
        <h1 className="text-[22px] font-extrabold text-ocean-700">איפה זה קורה?</h1>
        <div className="text-[12px] text-zinc-500 mt-0.5">לחצו על אזור במפה כדי לראות מה יש שם</div>
      </header>

      <TenerifeMap activitiesByRegion={byRegion} selected={region}
                   onSelect={(r) => setRegion(prev => prev === r ? null : r)} />

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

      {/* Accessible fallback list of every region */}
      <details className="rounded-2xl bg-white border border-ocean-100 p-3">
        <summary className="text-[13px] font-bold text-ocean-700 cursor-pointer">📋 רשימה לפי אזור (נגיש)</summary>
        <div className="mt-2 space-y-2">
          {Array.from(byRegion.entries()).map(([r, acts]) => (
            <div key={r}>
              <div className="text-[12px] font-extrabold text-ocean-700">{r} · {acts.length}</div>
              <ul className="mr-3 space-y-0.5">
                {acts.map(a => (
                  <li key={a.id}>
                    <button onClick={() => setSel(a)} className="text-[12px] text-ocean-700 hover:underline text-right">
                      {CATEGORY_ICONS[a.category]} {a.name} · {a.dayDate.slice(5)} {a.startTime}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>

      <ActivitySheet activity={sel} open={!!sel} onClose={() => setSel(null)} />
    </div>
  );
}
