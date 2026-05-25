import React from 'react';
import type { Tab } from './BottomNav';
import { MusicControls } from './MusicPlayer';

const ITEMS: { id: Tab; label: string; icon: string; hint: string }[] = [
  { id: 'today',       label: 'היום',     icon: '☀️', hint: 'מה קורה עכשיו' },
  { id: 'schedule',    label: 'לו״ז',    icon: '📅', hint: '8 ימים מלאים' },
  { id: 'plans',       label: 'אפשרויות', icon: '✨', hint: '3 סגנונות טיול' },
  { id: 'map',         label: 'מפה',      icon: '🗺️', hint: 'לפי אזורי האי' },
  { id: 'restaurants', label: 'מסעדות',   icon: '🍽️', hint: 'מסעדות מומלצות' },
  { id: 'events',      label: 'אירועים',  icon: '🎉', hint: 'אירועים בטנריף' },
  { id: 'manage',      label: 'ניהול',    icon: '🧰', hint: 'צ׳ק-ליסט והזמנות' },
  { id: 'phrasebook',  label: 'ספרדית',   icon: '🗣️', hint: 'ביטויים שימושיים' },
];

export function SideNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="rounded-3xl bg-white shadow-card border border-ocean-100/60 p-3">
      <div className="px-3 py-2 mb-1 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-sunset-700">TENERIFE · 2026</div>
          <div className="text-lg font-extrabold text-ocean-700 leading-tight">הפרלמנט בטנריף</div>
        </div>
        <MusicControls className="bg-ocean-50 rounded-full px-2.5 py-1.5" />
      </div>
      <div className="space-y-1">
        {ITEMS.map(item => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full text-right flex items-center gap-3 px-3 py-2.5 rounded-2xl transition
                ${active ? 'bg-gradient-to-l from-ocean-700 to-ocean-500 text-white shadow-soft' : 'hover:bg-ocean-50 text-ocean-700'}`}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold">{item.label}</div>
                <div className={`text-[11px] ${active ? 'text-white/85' : 'text-zinc-500'}`}>{item.hint}</div>
              </div>
              {active && <span className="text-xs">›</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-3 px-3 py-2 rounded-2xl bg-sand-50 text-[11px] text-ocean-700/80">
        💡 הכל נשמר מקומית בדפדפן. שתפו את הקישור — כל אחד רואה את הסיד המקורי.
      </div>
    </nav>
  );
}
