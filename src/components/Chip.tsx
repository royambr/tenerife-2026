import React from 'react';

export function Chip({ children, tone='ocean', className='' }:{
  children: React.ReactNode; tone?: 'ocean'|'sand'|'sunset'|'emerald'|'zinc'|'red'|'volcano'; className?: string;
}) {
  const tones: Record<string,string> = {
    ocean:   'bg-ocean-50 text-ocean-700',
    sand:    'bg-sand-100 text-sand-500',
    sunset:  'bg-sunset-300/30 text-sunset-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    zinc:    'bg-zinc-100 text-zinc-600',
    red:     'bg-red-50 text-red-600',
    volcano: 'bg-volcano-900 text-white'
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
