import React from 'react';

export type Tab = 'today' | 'schedule' | 'plans' | 'map' | 'manage';

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today',    label: 'היום',     icon: '☀️' },
  { id: 'schedule', label: 'לו״ז',    icon: '📅' },
  { id: 'plans',    label: 'אפשרויות', icon: '✨' },
  { id: 'map',      label: 'מפה',      icon: '🗺️' },
  { id: 'manage',   label: 'ניהול',    icon: '🧰' },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 inset-x-0 z-30 mx-auto max-w-md px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2"
    >
      <div className="rounded-3xl bg-white/95 backdrop-blur shadow-card border border-ocean-100 grid grid-cols-5">
        {ITEMS.map(item => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              aria-label={item.label}
              className="relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold"
            >
              <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : 'opacity-70'}`}>
                {item.icon}
              </span>
              <span className={`nav-label ${active ? 'text-ocean-700' : 'text-zinc-500'}`}>{item.label}</span>
              {active && <span className="absolute -top-1 inset-x-6 h-1 rounded-full bg-sunset-500" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
