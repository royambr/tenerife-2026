import type { Region } from './types';

export type LatLng = { lat: number; lng: number };

// Region centroid defaults (used when no precise coord exists)
export const REGION_CENTROIDS: Record<Exclude<Region, 'מחוץ לטנריף'>, LatLng> = {
  'צפון':       { lat: 28.415, lng: -16.55 },
  'צפון-מזרח': { lat: 28.495, lng: -16.30 },
  'צפון-מערב': { lat: 28.420, lng: -16.78 },
  'מרכז':       { lat: 28.273, lng: -16.642 },
  'מרכז-מערב': { lat: 28.250, lng: -16.835 },
  'מרכז-מזרח': { lat: 28.355, lng: -16.380 },
  'דרום':       { lat: 28.085, lng: -16.730 },
  'דרום-מזרח': { lat: 28.040, lng: -16.560 },
  'דרום-מערב': { lat: 28.180, lng: -16.810 },
};

// Precise hard-coded coordinates for famous landmarks/places.
// Matching is done by checking if the activity name contains the key (case-insensitive).
export const PLACE_COORDS: Array<{ match: string[]; coord: LatLng }> = [
  { match: ['loro parque', 'לורו פארק'], coord: { lat: 28.4129, lng: -16.5640 } },
  { match: ['siam park', 'סיאם פארק'], coord: { lat: 28.0820, lng: -16.7236 } },
  { match: ['teide', 'טיידה', 'רכבל'], coord: { lat: 28.2715, lng: -16.6391 } },
  { match: ['anaga'], coord: { lat: 28.5530, lng: -16.2080 } },
  { match: ['masca', 'מסקה'], coord: { lat: 28.3070, lng: -16.8390 } },
  { match: ['los gigantes', 'לוס חיגנטס'], coord: { lat: 28.2469, lng: -16.8410 } },
  { match: ['la laguna', 'לה לגונה'], coord: { lat: 28.4855, lng: -16.3194 } },
  { match: ['la orotava', 'לה אורוטבה'], coord: { lat: 28.3897, lng: -16.5236 } },
  { match: ['puerto de la cruz', 'פוארטו דה לה קרוס'], coord: { lat: 28.4156, lng: -16.5470 } },
  { match: ['playa jardín', 'playa jardin', "ז'ארדן"], coord: { lat: 28.4170, lng: -16.5630 } },
  { match: ['playa de las américas', 'playa de las americas', 'לאס אמריקאס'], coord: { lat: 28.0586, lng: -16.7290 } },
  { match: ['playa del duque', 'דל דוקה'], coord: { lat: 28.0945, lng: -16.7398 } },
  { match: ['playa de las vistas', 'לאס ויסטאס'], coord: { lat: 28.0490, lng: -16.7173 } },
  { match: ['playa san juan', 'סן חואן'], coord: { lat: 28.1827, lng: -16.8090 } },
  { match: ['costa adeje', 'אדחה'], coord: { lat: 28.0980, lng: -16.7400 } },
  { match: ['garachico', 'גראצ׳יקו', 'גראצ\'יקו'], coord: { lat: 28.3737, lng: -16.7600 } },
  { match: ['benijo'], coord: { lat: 28.5732, lng: -16.1939 } },
  { match: ['martiánez', 'martianez', 'מרטיאנס'], coord: { lat: 28.4181, lng: -16.5424 } },
  { match: ['san pedro'], coord: { lat: 28.4023, lng: -16.4750 } },
  { match: ['tfn', 'tenerife north', 'נמל הצפון'], coord: { lat: 28.4827, lng: -16.3415 } },
  { match: ['las aguilas', 'אגילס', 'aguilas'], coord: { lat: 28.4060, lng: -16.5500 } },
  { match: ['el médano', 'el medano', 'מדאנו'], coord: { lat: 28.0468, lng: -16.5380 } },
];

export function coordForActivity(name: string, region: Region): LatLng | null {
  const lower = name.toLowerCase();
  for (const entry of PLACE_COORDS) {
    if (entry.match.some(k => lower.includes(k.toLowerCase()))) {
      return entry.coord;
    }
  }
  if (region === 'מחוץ לטנריף') return null;
  return REGION_CENTROIDS[region];
}
