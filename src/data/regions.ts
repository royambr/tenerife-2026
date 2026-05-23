import type { Region } from './types';

// Approx geographic centers for Tenerife regions (lat, lng)
export const REGION_CENTERS: Record<Region, { lat: number; lng: number }> = {
  'צפון':         { lat: 28.41, lng: -16.55 },
  'צפון-מזרח':   { lat: 28.46, lng: -16.32 },
  'צפון-מערב':   { lat: 28.37, lng: -16.76 },
  'מרכז':         { lat: 28.27, lng: -16.64 }, // Teide
  'מרכז-מערב':   { lat: 28.25, lng: -16.84 },
  'מרכז-מזרח':   { lat: 28.32, lng: -16.48 },
  'דרום':         { lat: 28.08, lng: -16.74 },
  'דרום-מזרח':   { lat: 28.04, lng: -16.55 },
  'דרום-מערב':   { lat: 28.18, lng: -16.83 },
  'מחוץ לטנריף': { lat: 28.46, lng: -16.25 },
};

// Stylized SVG polygon paths for each region in a 700×450 viewBox.
// Roughly approximates Tenerife's triangular outline divided into sub-regions.
// Anchor: Teide center near (350, 240). North coast ~y=120, south coast ~y=380.
export const REGION_PATHS: Record<Exclude<Region,'מחוץ לטנריף'>, string> = {
  // North trio
  'צפון':       'M 310,110 L 410,108 L 430,170 L 360,200 L 300,180 Z',
  'צפון-מזרח': 'M 410,108 L 540,150 L 560,210 L 470,200 L 430,170 Z',
  'צפון-מערב': 'M 310,110 L 230,150 L 220,210 L 300,210 L 300,180 Z',
  // Middle row (Teide & sides)
  'מרכז':       'M 300,180 L 360,200 L 430,170 L 470,200 L 440,290 L 360,310 L 290,290 Z',
  'מרכז-מזרח': 'M 470,200 L 560,210 L 580,290 L 500,310 L 440,290 Z',
  'מרכז-מערב': 'M 220,210 L 300,210 L 290,290 L 230,300 L 200,260 Z',
  // South trio
  'דרום-מערב': 'M 200,260 L 230,300 L 290,290 L 320,360 L 250,380 L 190,340 Z',
  'דרום':       'M 290,290 L 360,310 L 440,290 L 420,370 L 330,395 L 320,360 Z',
  'דרום-מזרח': 'M 440,290 L 500,310 L 580,290 L 560,360 L 490,395 L 420,370 Z',
};

export const REGION_LABEL_POS: Record<Exclude<Region,'מחוץ לטנריף'>, { x: number; y: number }> = {
  'צפון':       { x: 365, y: 150 },
  'צפון-מזרח': { x: 490, y: 175 },
  'צפון-מערב': { x: 265, y: 175 },
  'מרכז':       { x: 365, y: 245 },
  'מרכז-מזרח': { x: 510, y: 255 },
  'מרכז-מערב': { x: 250, y: 255 },
  'דרום-מערב': { x: 245, y: 335 },
  'דרום':       { x: 370, y: 350 },
  'דרום-מזרח': { x: 500, y: 345 },
};

// Haversine distance in km
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
