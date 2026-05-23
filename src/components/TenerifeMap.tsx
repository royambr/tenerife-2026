import React from 'react';
import type { Activity, Region } from '../data/types';
import { REGION_PATHS, REGION_LABEL_POS } from '../data/regions';
import { CATEGORY_ICONS } from '../utils';

type Props = {
  activitiesByRegion: Map<Region, Activity[]>;
  selected: Region | null;
  onSelect: (r: Region) => void;
};

// heat color stops by activity count
function heatColor(count: number): string {
  if (count === 0) return '#e2eef4';
  if (count <= 1) return '#bfe0ed';
  if (count <= 3) return '#7cc1dc';
  if (count <= 5) return '#ffb37a';
  if (count <= 7) return '#ff7a3d';
  return '#d8541a';
}

const REGION_IDS = Object.keys(REGION_PATHS) as Exclude<Region,'מחוץ לטנריף'>[];

export function TenerifeMap({ activitiesByRegion, selected, onSelect }: Props) {
  return (
    <div className="w-full bg-gradient-to-b from-ocean-50 to-white rounded-3xl border border-ocean-100 shadow-soft p-2 overflow-hidden">
      <svg viewBox="0 0 700 450" className="w-full h-auto" role="img" aria-label="מפת טנריף">
        <defs>
          <filter id="islandShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0b3b5c" floodOpacity="0.18" />
          </filter>
        </defs>
        {/* sea backdrop */}
        <rect width="700" height="450" fill="url(#sea)" />
        <defs>
          <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#eef7fb" />
            <stop offset="100%" stopColor="#d3ebf4" />
          </linearGradient>
        </defs>
        {/* wave hints */}
        <g stroke="#7cc1dc" strokeOpacity="0.35" strokeWidth="1" fill="none">
          <path d="M 50,80 Q 80,75 110,80 T 170,80" />
          <path d="M 540,400 Q 570,395 600,400 T 660,400" />
        </g>
        <g filter="url(#islandShadow)">
          {REGION_IDS.map(rid => {
            const acts = activitiesByRegion.get(rid) || [];
            const isSel = selected === rid;
            const fill = heatColor(acts.length);
            // top 2 by priority
            const top = [...acts]
              .filter(a => a.category !== 'מלון' && a.category !== 'נסיעה / לוגיסטיקה')
              .sort((a,b) => (b.priority === 'גבוה' ? 1 : 0) - (a.priority === 'גבוה' ? 1 : 0))
              .slice(0, 2);
            const lbl = REGION_LABEL_POS[rid];
            return (
              <g key={rid} className="cursor-pointer" onClick={() => onSelect(rid)} role="button" aria-label={`${rid} — ${acts.length} פעילויות`}>
                <path d={REGION_PATHS[rid]}
                      fill={fill}
                      stroke={isSel ? '#ff7a3d' : '#ffffff'}
                      strokeWidth={isSel ? 3 : 1.5}
                      style={{ transition: 'all .15s' }} />
                <text x={lbl.x} y={lbl.y} textAnchor="middle"
                      className="select-none pointer-events-none"
                      fontSize="11" fontWeight="800" fill="#0b3b5c">{rid}</text>
                <text x={lbl.x} y={lbl.y + 12} textAnchor="middle"
                      className="select-none pointer-events-none"
                      fontSize="10" fontWeight="700" fill="#0b3b5c" opacity="0.7">{acts.length}</text>
                {top.map((a, i) => (
                  <text key={a.id} x={lbl.x - 14 + i*18} y={lbl.y + 28} textAnchor="middle"
                        fontSize="14" className="pointer-events-none select-none">
                    {CATEGORY_ICONS[a.category]}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
        {/* compass */}
        <g transform="translate(640, 50)" className="pointer-events-none">
          <circle r="18" fill="#fff" stroke="#0b3b5c" strokeWidth="1.5" />
          <text textAnchor="middle" y="-4" fontSize="9" fontWeight="800" fill="#0b3b5c">N</text>
          <text textAnchor="middle" y="12" fontSize="9" fontWeight="700" fill="#0b3b5c">S</text>
        </g>
      </svg>
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-600 px-2 py-1.5">
        <span className="font-bold text-ocean-700">צפיפות:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:'#bfe0ed'}}/>מעט</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:'#7cc1dc'}}/>בינוני</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:'#ff7a3d'}}/>הרבה</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:'#d8541a'}}/>מאוד</span>
      </div>
    </div>
  );
}
