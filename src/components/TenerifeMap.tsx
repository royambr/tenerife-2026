import React from 'react';
import type { Activity, Region } from '../data/types';
import { CATEGORY_ICONS } from '../utils';

type Props = {
  activitiesByRegion: Map<Region, Activity[]>;
  selected: Region | null;
  onSelect: (r: Region) => void;
};

// heat color stops by activity count
function heatColor(count: number): string {
  if (count === 0) return '#cfe7f0';
  if (count <= 1) return '#bfe0ed';
  if (count <= 3) return '#7cc1dc';
  if (count <= 5) return '#ffb37a';
  if (count <= 7) return '#ff7a3d';
  return '#d8541a';
}

// Real-ish Tenerife coastline path, projected from ~35 lat/lng points to a 1000×600 viewBox.
// Projection: lng [-16.95, -16.08] → x [0, 1000], lat [27.97, 28.62] → y [600, 0].
const COAST_PATH =
  'M 865.5,49.8 L 895.4,35.1 L 911.5,36.0 L 950.6,41.5 L 970.1,60.9 L 956.3,92.3 ' +
  'L 885.1,129.2 L 839.1,156.9 L 793.1,193.8 L 758.6,249.2 L 701.1,304.6 L 609.2,360.0 ' +
  'L 505.7,433.8 L 379.3,526.2 L 298.9,567.7 L 252.9,574.2 L 183.9,553.8 L 137.9,498.5 ' +
  'L 103.4,443.1 L 92.0,387.7 L 103.4,327.7 L 126.4,267.7 L 46.0,253.8 L 28.7,244.6 ' +
  'L 36.8,230.8 L 92.0,207.7 L 155.2,175.4 L 206.9,138.5 L 287.4,101.5 L 379.3,64.6 ' +
  'L 471.3,36.9 L 574.7,20.3 L 655.2,23.1 L 747.1,35.1 L 804.6,43.4 Z';

// Region centroids projected to same viewBox.
type RegionId = Exclude<Region, 'מחוץ לטנריף'>;
const REGION_POS: Record<RegionId, { x: number; y: number }> = {
  'צפון':         { x: 459.8, y: 193.8 },
  'צפון-מזרח':   { x: 747.1, y: 110.8 },
  'צפון-מערב':   { x: 218.4, y: 230.8 },
  'מרכז':         { x: 356.3, y: 323.1 },
  'מרכז-מערב':   { x: 126.4, y: 341.5 },
  'מרכז-מזרח':   { x: 540.2, y: 276.9 },
  'דרום':         { x: 241.4, y: 498.5 },
  'דרום-מזרח':   { x: 459.8, y: 535.4 },
  'דרום-מערב':   { x: 137.9, y: 406.2 },
};

// Optional label offset (dx, dy) for bubbles that would otherwise crowd — keep most at 0,0.
// Nudge bubbles that would otherwise overlap. Leader line is drawn when nonzero.
const LABEL_OFFSET: Partial<Record<RegionId, { dx: number; dy: number }>> = {
  'דרום-מערב': { dx: -10, dy: 30 },
};

const POI = [
  { id: 'teide',   x: 354.0, y: 320.3, emoji: '🌋', label: 'טיידה' },
  { id: 'tfn',     x: 700.0, y: 124.6, emoji: '✈️', label: 'נמל TFN' },
  { id: 'aguilas', x: 463.2, y: 191.1, emoji: '🏨', label: 'מלון Las Aguilas' },
];

const REGION_IDS = Object.keys(REGION_POS) as RegionId[];

const BUBBLE_R = 30;

export function TenerifeMap({ activitiesByRegion, selected, onSelect }: Props) {
  return (
    <div className="w-full bg-gradient-to-b from-ocean-50 to-white rounded-3xl border border-ocean-100 shadow-soft p-2 overflow-hidden">
      <div className="px-2 pt-1.5 pb-1">
        <div className="text-[13px] font-extrabold text-ocean-700">טנריף · המפה שלנו</div>
      </div>
      <svg viewBox="0 0 1000 600" className="w-full h-auto" role="img" aria-label="מפת טנריף">
        <defs>
          <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#eaf6fb" />
            <stop offset="60%" stopColor="#d3ebf4" />
            <stop offset="100%" stopColor="#b9deeb" />
          </linearGradient>
          <linearGradient id="island" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f4ead6" />
            <stop offset="60%" stopColor="#e7d6ac" />
            <stop offset="100%" stopColor="#caa86f" />
          </linearGradient>
          <filter id="islandShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0b3b5c" floodOpacity="0.22" />
          </filter>
          <filter id="bubbleShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0b3b5c" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* sea backdrop */}
        <rect width="1000" height="600" fill="url(#sea)" />

        {/* subtle wave hints */}
        <g stroke="#7cc1dc" strokeOpacity="0.35" strokeWidth="1.2" fill="none">
          <path d="M 60,90 Q 100,80 140,90 T 230,90" />
          <path d="M 780,540 Q 820,530 860,540 T 950,540" />
          <path d="M 50,500 Q 80,492 110,500" />
        </g>

        {/* island */}
        <g filter="url(#islandShadow)">
          <path d={COAST_PATH} fill="url(#island)" stroke="#8a6a37" strokeWidth="1.4" strokeLinejoin="round" />
        </g>

        {/* subtle interior texture (mountain ridge hint) */}
        <g opacity="0.35" fill="none" stroke="#a8854a" strokeWidth="1">
          <path d="M 200,300 Q 320,260 420,330 Q 540,400 700,290" />
          <path d="M 260,360 Q 380,330 480,380 Q 600,430 740,350" />
        </g>

        {/* POIs */}
        <g>
          {POI.map(p => (
            <g key={p.id} className="pointer-events-none">
              <circle cx={p.x} cy={p.y} r="13" fill="#ffffff" opacity="0.85" />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="16">{p.emoji}</text>
            </g>
          ))}
        </g>

        {/* region bubbles */}
        <g>
          {REGION_IDS.map(rid => {
            const acts = activitiesByRegion.get(rid) || [];
            const isSel = selected === rid;
            const fill = heatColor(acts.length);
            const off = LABEL_OFFSET[rid] || { dx: 0, dy: 0 };
            const pos = REGION_POS[rid];
            const x = pos.x + off.dx;
            const y = pos.y + off.dy;

            // top 2 by priority for category icons
            const top = [...acts]
              .filter(a => a.category !== 'מלון' && a.category !== 'נסיעה / לוגיסטיקה')
              .sort((a,b) => (b.priority === 'גבוה' ? 1 : 0) - (a.priority === 'גבוה' ? 1 : 0))
              .slice(0, 2);

            return (
              <g key={rid}
                 className="cursor-pointer"
                 onClick={() => onSelect(rid)}
                 role="button"
                 aria-label={`${rid} — ${acts.length} פעילויות`}>
                {/* leader line if offset */}
                {(off.dx !== 0 || off.dy !== 0) && (
                  <line x1={pos.x} y1={pos.y} x2={x} y2={y}
                        stroke="#0b3b5c" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 2" />
                )}
                <g filter="url(#bubbleShadow)">
                  <circle cx={x} cy={y} r={BUBBLE_R}
                          fill={fill}
                          stroke={isSel ? '#ff7a3d' : '#ffffff'}
                          strokeWidth={isSel ? 4 : 2.5}
                          style={{ transition: 'all .15s' }} />
                </g>
                {/* count */}
                <text x={x} y={y - 4} textAnchor="middle"
                      className="select-none pointer-events-none"
                      fontSize="18" fontWeight="900" fill="#0b3b5c">{acts.length}</text>
                {/* region name */}
                <text x={x} y={y + 11} textAnchor="middle"
                      className="select-none pointer-events-none"
                      fontSize="9.5" fontWeight="800" fill="#0b3b5c">{rid}</text>
                {/* category icons floating under the bubble */}
                {top.length > 0 && (
                  <g className="pointer-events-none">
                    {top.map((a, i) => (
                      <text key={a.id}
                            x={x - 10 + i * 20}
                            y={y + BUBBLE_R + 13}
                            textAnchor="middle"
                            fontSize="13"
                            className="select-none">
                        {CATEGORY_ICONS[a.category]}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* compass */}
        <g transform="translate(940, 60)" className="pointer-events-none">
          <circle r="24" fill="#fff" stroke="#0b3b5c" strokeWidth="1.5" opacity="0.95" />
          <text textAnchor="middle" y="-6" fontSize="11" fontWeight="900" fill="#0b3b5c">N</text>
          <line x1="0" y1="-2" x2="0" y2="12" stroke="#ff7a3d" strokeWidth="2" />
          <text textAnchor="middle" y="22" fontSize="9" fontWeight="700" fill="#0b3b5c">S</text>
        </g>
      </svg>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-600 px-2 py-1.5">
        <span className="font-bold text-ocean-700">צפיפות:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#bfe0ed'}}/>מעט</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#7cc1dc'}}/>בינוני</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#ff7a3d'}}/>הרבה</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#d8541a'}}/>מאוד</span>
        <span className="mx-1 text-zinc-300">·</span>
        <span>🌋 טיידה</span>
        <span>✈️ TFN</span>
        <span>🏨 מלון</span>
      </div>
    </div>
  );
}
