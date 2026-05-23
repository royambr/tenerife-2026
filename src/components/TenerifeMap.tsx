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

// Real-ish Tenerife coastline projected from ~68 lat/lng points to a 1000×600 viewBox.
// Includes pronounced Anaga (NE) and Teno (NW / Punta de Teno) peninsulas plus El Médano (S).
// Projection: x = (lng + 16.95) / 0.87 * 1000, y = (28.62 - lat) / 0.65 * 600.
const COAST_PATH =
  'M 936.8,41.5 L 971.3,44.3 L 994.3,40.6 L 1011.5,32.3 L 1028.7,35.1 L 1040.2,41.5 ' +
  'L 1046.0,48.9 L 1023.0,60.0 L 994.3,66.5 L 959.8,75.7 L 931.0,83.1 L 902.3,96.9 ' +
  'L 873.6,110.8 L 839.1,124.6 L 804.6,138.5 L 758.6,147.7 L 712.6,166.2 L 655.2,198.5 ' +
  'L 609.2,235.4 L 551.7,276.9 L 505.7,323.1 L 471.3,369.2 L 431.0,415.4 L 402.3,461.5 ' +
  'L 379.3,503.1 L 373.6,535.4 L 390.8,558.5 L 408.0,572.3 L 434.5,574.2 L 454.0,567.7 ' +
  'L 454.0,553.8 L 425.3,535.4 L 373.6,512.3 L 310.3,489.2 L 252.9,466.2 L 201.1,438.5 ' +
  'L 155.2,410.8 L 132.2,383.1 L 120.7,355.4 L 109.2,327.7 L 103.4,304.6 L 92.0,286.2 ' +
  'L 74.7,272.3 L 51.7,258.5 L 34.5,251.1 L 25.3,246.5 L 34.5,241.8 L 51.7,238.2 ' +
  'L 74.7,230.8 L 92.0,219.7 L 109.2,207.7 L 128.7,193.8 L 155.2,180.0 L 195.4,170.8 ' +
  'L 229.9,166.2 L 270.1,170.8 L 310.3,177.2 L 356.3,184.6 L 396.6,193.8 L 436.8,198.5 ' +
  'L 471.3,195.7 L 523.0,184.6 L 574.7,170.8 L 632.2,156.9 L 683.9,138.5 L 724.1,120.0 ' +
  'L 758.6,101.5 L 804.6,83.1 L 862.1,60.0 L 913.8,44.3 Z';

// Region centroids projected to same viewBox — placed on/near coast per region semantics.
type RegionId = Exclude<Region, 'מחוץ לטנריף'>;
const REGION_POS: Record<RegionId, { x: number; y: number }> = {
  'צפון':         { x: 459.8, y: 189.2 },
  'צפון-מזרח':   { x: 747.1, y: 115.4 },
  'צפון-מערב':   { x: 195.4, y: 184.6 },
  'מרכז':         { x: 354.0, y: 320.3 },
  'מרכז-מערב':   { x: 132.2, y: 341.5 },
  'מרכז-מזרח':   { x: 655.2, y: 244.6 },
  'דרום':         { x: 252.9, y: 493.8 },
  'דרום-מזרח':   { x: 448.3, y: 535.4 },
  'דרום-מערב':   { x: 160.9, y: 406.2 },
};

// Optional label offset (dx, dy) for bubbles that would otherwise crowd — leader line drawn when nonzero.
const LABEL_OFFSET: Partial<Record<RegionId, { dx: number; dy: number }>> = {};

const POI = [
  { id: 'teide',   x: 354.0, y: 320.3, emoji: '🌋', label: 'טיידה',           dx: 36, dy: -2 },
  { id: 'tfn',     x: 700.0, y: 124.6, emoji: '✈️', label: 'נמל TFN',         dx: -36, dy: 0 },
  { id: 'aguilas', x: 463.2, y: 191.1, emoji: '🏨', label: 'מלון Las Aguilas', dx: 32, dy: 4 },
];

const REGION_IDS = Object.keys(REGION_POS) as RegionId[];

const BUBBLE_R = 26;

export function TenerifeMap({ activitiesByRegion, selected, onSelect }: Props) {
  return (
    <div className="w-full bg-gradient-to-b from-ocean-50 to-white rounded-3xl border border-ocean-100 shadow-soft p-2 overflow-hidden">
      <div className="px-2 pt-1.5 pb-1">
        <div className="text-[13px] font-extrabold text-ocean-700">טנריף · המפה שלנו</div>
      </div>
      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" className="w-full h-auto" role="img" aria-label="מפת טנריף">
        <defs>
          <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#eaf6fb" />
            <stop offset="60%" stopColor="#d3ebf4" />
            <stop offset="100%" stopColor="#b9deeb" />
          </linearGradient>
          <linearGradient id="island" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f7eed5" />
            <stop offset="60%" stopColor="#f3e5c5" />
            <stop offset="100%" stopColor="#e6d3a4" />
          </linearGradient>
          <filter id="islandShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0b3b5c" floodOpacity="0.18" />
          </filter>
          <filter id="bubbleShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0b3b5c" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* sea backdrop */}
        <rect width="1000" height="600" fill="url(#sea)" />

        {/* "ים" hint label top-right ocean */}
        <text x="980" y="22" textAnchor="end" fontSize="12" fontWeight="800" fill="#0b3b5c" opacity="0.55">ים</text>

        {/* subtle wave hints */}
        <g stroke="#7cc1dc" strokeOpacity="0.35" strokeWidth="1.2" fill="none">
          <path d="M 60,90 Q 100,80 140,90 T 230,90" />
          <path d="M 780,540 Q 820,530 860,540 T 950,540" />
          <path d="M 50,500 Q 80,492 110,500" />
        </g>

        {/* island */}
        <g filter="url(#islandShadow)">
          <path d={COAST_PATH} fill="url(#island)" opacity="0.95" stroke="#a78a52" strokeWidth="1.2" strokeLinejoin="round" />
        </g>

        {/* subtle interior texture (mountain ridge hint) */}
        <g opacity="0.3" fill="none" stroke="#a8854a" strokeWidth="1">
          <path d="M 200,300 Q 320,260 420,330 Q 540,400 700,290" />
          <path d="M 260,360 Q 380,330 480,380 Q 600,430 740,350" />
        </g>

        {/* POIs — emoji + tiny shadow, no big white circle */}
        <g>
          {POI.map(p => {
            const px = p.x + (p.dx ?? 0);
            const py = p.y + (p.dy ?? 0);
            return (
              <g key={p.id} className="pointer-events-none" filter="url(#bubbleShadow)">
                <text x={px} y={py + 5} textAnchor="middle" fontSize="16">{p.emoji}</text>
              </g>
            );
          })}
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

            const r = isSel ? BUBBLE_R + 3 : BUBBLE_R;

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
                  <circle cx={x} cy={y} r={r}
                          fill={fill}
                          stroke={isSel ? '#ff7a3d' : '#ffffff'}
                          strokeWidth={isSel ? 4 : 2.5}
                          style={{ transition: 'all .15s' }} />
                  {isSel && (
                    <circle cx={x} cy={y} r={r + 4}
                            fill="none" stroke="#ff7a3d" strokeOpacity="0.45" strokeWidth="2" />
                  )}
                </g>
                {/* count */}
                <text x={x} y={y - 3} textAnchor="middle"
                      className="select-none pointer-events-none"
                      fontSize="19" fontWeight="900" fill="#0b3b5c">{acts.length}</text>
                {/* region name */}
                <text x={x} y={y + 12} textAnchor="middle"
                      className="select-none pointer-events-none"
                      fontSize="8.5" fontWeight="800" fill="#0b3b5c">{rid}</text>
                {/* category icons floating under the bubble */}
                {top.length > 0 && (
                  <g className="pointer-events-none">
                    {top.map((a, i) => (
                      <text key={a.id}
                            x={x - 10 + i * 20}
                            y={y + r + 12}
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

        {/* compass — moved to empty SW ocean corner, smaller */}
        <g transform="translate(50, 555)" className="pointer-events-none">
          <circle r="18" fill="#fff" stroke="#0b3b5c" strokeWidth="1.2" opacity="0.95" />
          <text textAnchor="middle" y="-5" fontSize="9" fontWeight="900" fill="#0b3b5c">N</text>
          <line x1="0" y1="-1" x2="0" y2="9" stroke="#ff7a3d" strokeWidth="1.8" />
          <text textAnchor="middle" y="17" fontSize="8" fontWeight="700" fill="#0b3b5c">S</text>
        </g>
      </svg>

      {/* legend — single line, compact */}
      <div className="flex flex-nowrap items-center gap-1.5 text-[9.5px] text-zinc-600 px-2 py-1 overflow-x-auto">
        <span className="font-bold text-ocean-700">צפיפות:</span>
        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full" style={{background:'#bfe0ed'}}/>מעט</span>
        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full" style={{background:'#7cc1dc'}}/>בינוני</span>
        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full" style={{background:'#ff7a3d'}}/>הרבה</span>
        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full" style={{background:'#d8541a'}}/>מאוד</span>
        <span className="mx-0.5 text-zinc-300">·</span>
        <span>🌋 טיידה</span>
        <span>✈️ TFN</span>
        <span>🏨 מלון</span>
      </div>
    </div>
  );
}
