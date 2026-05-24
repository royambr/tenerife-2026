import type { Category, CostLevel, Region } from './types';

export interface CatalogEntry {
  name: string;
  suggestedCategory: Category;
  suggestedRegion: Region;
  suggestedCostLevel: CostLevel;
  description?: string;
  mapsUrl?: string;
  sourceUrl?: string;
  /** optional Wikipedia article title (English) for gallery preference */
  wikipediaTitle?: string;
}

// Curated from src/data/seed.ts — deduplicated by name.toLowerCase().trim().
// Region/category/cost reflect the seed plans. These are the "known good" places
// surfaced first when the user searches in the add-activity flow.
export const ATTRACTIONS_CATALOG: CatalogEntry[] = [
  // Logistics / airports
  {
    name: 'Tenerife North Airport (TFN)',
    suggestedCategory: 'טיסה',
    suggestedRegion: 'צפון-מזרח',
    suggestedCostLevel: 1,
    description: 'שדה התעופה הצפוני של טנריף.',
    wikipediaTitle: 'Tenerife_North_Airport',
  },
  // Hotels
  {
    name: 'Hotel Las Aguilas Tenerife',
    suggestedCategory: 'מלון',
    suggestedRegion: 'צפון',
    suggestedCostLevel: 3,
    description: 'מלון בפוארטו דה לה קרוז — נקודת הבסיס לימים הראשונים.',
  },
  // North towns
  {
    name: 'Puerto de la Cruz',
    suggestedCategory: 'עיר / עיירה',
    suggestedRegion: 'צפון',
    suggestedCostLevel: 1,
    description: 'עיר נמל קולוניאלית בצפון, טיילות, ברים ומסעדות.',
    wikipediaTitle: 'Puerto_de_la_Cruz',
  },
  {
    name: 'La Orotava',
    suggestedCategory: 'עיר / עיירה',
    suggestedRegion: 'צפון',
    suggestedCostLevel: 2,
    description: 'עיירה היסטורית עם רחובות מרוצפים, בתי קולוניה וגינות.',
    wikipediaTitle: 'La_Orotava',
  },
  {
    name: 'La Laguna (San Cristóbal de La Laguna)',
    suggestedCategory: 'עיר / עיירה',
    suggestedRegion: 'צפון-מזרח',
    suggestedCostLevel: 1,
    description: 'אתר מורשת עולמית של אונסקו, עיר אוניברסיטה.',
    wikipediaTitle: 'San_Cristóbal_de_La_Laguna',
  },
  {
    name: 'Garachico',
    suggestedCategory: 'עיר / עיירה',
    suggestedRegion: 'צפון-מערב',
    suggestedCostLevel: 1,
    description: 'כפר ציורי בצפון מערב עם בריכות לבה טבעיות.',
    wikipediaTitle: 'Garachico',
  },
  {
    name: 'Buenavista del Norte',
    suggestedCategory: 'עיר / עיירה',
    suggestedRegion: 'צפון-מערב',
    suggestedCostLevel: 1,
    wikipediaTitle: 'Buenavista_del_Norte',
  },
  {
    name: 'Costa Adeje',
    suggestedCategory: 'עיר / עיירה',
    suggestedRegion: 'דרום',
    suggestedCostLevel: 2,
    description: 'אזור הנופש הדרומי, חופי דגל כחול ואכסניות יוקרה.',
    wikipediaTitle: 'Costa_Adeje',
  },
  {
    name: 'Playa de las Américas',
    suggestedCategory: 'עיר / עיירה',
    suggestedRegion: 'דרום',
    suggestedCostLevel: 2,
    description: 'אזור התיירות התוסס בדרום, חיי לילה ערים.',
    wikipediaTitle: 'Playa_de_las_Américas',
  },
  // Nature / parks / mountains
  {
    name: 'Teide National Park',
    suggestedCategory: 'טבע',
    suggestedRegion: 'מרכז',
    suggestedCostLevel: 1,
    description: 'פארק לאומי שמסביב להר הגעש הגבוה בספרד.',
    wikipediaTitle: 'Teide_National_Park',
  },
  {
    name: 'רכבל Teide',
    suggestedCategory: 'תצפית',
    suggestedRegion: 'מרכז',
    suggestedCostLevel: 3,
    description: 'רכבל לפסגת הר הטיידה — נופים מהירח.',
    wikipediaTitle: 'Teide',
  },
  {
    name: 'Pico Viejo',
    suggestedCategory: 'טבע',
    suggestedRegion: 'מרכז',
    suggestedCostLevel: 1,
    description: 'מסלול תובעני בהרי הטיידה.',
    wikipediaTitle: 'Pico_Viejo',
  },
  {
    name: 'Roques de García',
    suggestedCategory: 'תצפית',
    suggestedRegion: 'מרכז',
    suggestedCostLevel: 1,
    description: 'תצורות סלע איקוניות בטיידה.',
    wikipediaTitle: 'Roques_de_García',
  },
  {
    name: 'Llano de Ucanca',
    suggestedCategory: 'תצפית',
    suggestedRegion: 'מרכז',
    suggestedCostLevel: 1,
    wikipediaTitle: 'Teide_National_Park',
  },
  {
    name: 'Anaga Rural Park',
    suggestedCategory: 'טבע',
    suggestedRegion: 'צפון-מזרח',
    suggestedCostLevel: 1,
    description: 'יער ענן עתיק עם תצפיות דרמטיות, מסלולי PR-TF.',
    wikipediaTitle: 'Anaga_Rural_Park',
  },
  {
    name: 'Teno Rural Park',
    suggestedCategory: 'טבע',
    suggestedRegion: 'צפון-מערב',
    suggestedCostLevel: 1,
    description: 'פארק הרים מבודד בקצה הצפון מערבי של האי.',
    wikipediaTitle: 'Teno_Rural_Park',
  },
  {
    name: 'Masca',
    suggestedCategory: 'טבע',
    suggestedRegion: 'צפון-מערב',
    suggestedCostLevel: 1,
    description: 'אחד הכפרים היפים באי, גישה הררית.',
    wikipediaTitle: 'Masca,_Spain',
  },
  {
    name: 'Los Gigantes',
    suggestedCategory: 'תצפית',
    suggestedRegion: 'מרכז-מערב',
    suggestedCostLevel: 1,
    description: 'צוקים דרמטיים שיורדים לים, נקודת זינוק לשייט דולפינים.',
    wikipediaTitle: 'Acantilados_de_Los_Gigantes',
  },
  // Viewpoints
  {
    name: 'Mirador San Pedro',
    suggestedCategory: 'תצפית',
    suggestedRegion: 'צפון',
    suggestedCostLevel: 1,
    description: 'מקום אהוב לשקיעות.',
  },
  {
    name: 'Mirador Cabezo del Tejo',
    suggestedCategory: 'תצפית',
    suggestedRegion: 'צפון-מזרח',
    suggestedCostLevel: 1,
    description: 'תצפית מהממת באנגה.',
  },
  {
    name: 'Mirador Garachico',
    suggestedCategory: 'תצפית',
    suggestedRegion: 'צפון-מערב',
    suggestedCostLevel: 1,
  },
  // Beaches
  {
    name: 'Playa Jardín',
    suggestedCategory: 'חוף',
    suggestedRegion: 'צפון',
    suggestedCostLevel: 1,
    description: 'חוף חול שחור עיצוב של ססאר מנריקה.',
    wikipediaTitle: 'Playa_Jardín',
  },
  {
    name: 'Lago Martiánez',
    suggestedCategory: 'חוף',
    suggestedRegion: 'צפון',
    suggestedCostLevel: 1,
    description: 'בריכות מי-ים מעוצבות של ססאר מנריקה.',
  },
  {
    name: 'Playa del Duque',
    suggestedCategory: 'חוף',
    suggestedRegion: 'דרום',
    suggestedCostLevel: 2,
    description: 'חוף יוקרתי בקוסטה אדחה.',
  },
  {
    name: 'Playa de las Vistas',
    suggestedCategory: 'חוף',
    suggestedRegion: 'דרום',
    suggestedCostLevel: 1,
    description: 'חוף ארוך עם חול בהיר בדרום.',
  },
  {
    name: 'Playa de la Arena',
    suggestedCategory: 'חוף',
    suggestedRegion: 'מרכז-מערב',
    suggestedCostLevel: 1,
    description: 'חוף חול שחור איכותי ליד לוס חיגנטס.',
  },
  {
    name: 'Playa de Benijo',
    suggestedCategory: 'חוף',
    suggestedRegion: 'צפון-מזרח',
    suggestedCostLevel: 1,
    description: 'חוף חול שחור פראי באנגה, גלים חזקים.',
  },
  {
    name: 'Playa San Juan',
    suggestedCategory: 'חוף',
    suggestedRegion: 'דרום-מערב',
    suggestedCostLevel: 1,
  },
  // Attractions
  {
    name: 'Loro Parque',
    suggestedCategory: 'חיות',
    suggestedRegion: 'צפון',
    suggestedCostLevel: 3,
    description: 'אחד הפארקים המפורסמים באירופה — דולפינים, אורקות, פינגווינים.',
    mapsUrl: 'https://maps.google.com/?q=Loro+Parque',
    wikipediaTitle: 'Loro_Parque',
  },
  {
    name: 'Siam Park',
    suggestedCategory: 'פארק מים',
    suggestedRegion: 'דרום',
    suggestedCostLevel: 3,
    description: 'הפארק המים המדורג מספר 1 בעולם.',
    mapsUrl: 'https://maps.google.com/?q=Siam+Park',
    sourceUrl: 'https://www.siampark.net',
    wikipediaTitle: 'Siam_Park',
  },
  // Shopping
  {
    name: 'Plaza del Duque',
    suggestedCategory: 'שופינג',
    suggestedRegion: 'דרום',
    suggestedCostLevel: 2,
    description: 'מרכז קניות יוקרתי בקוסטה אדחה.',
  },
  // Nightlife
  {
    name: 'Veronicas Strip',
    suggestedCategory: 'בר',
    suggestedRegion: 'דרום',
    suggestedCostLevel: 3,
    description: 'רצועת חיי הלילה התוססת ביותר בדרום.',
  },
  {
    name: 'Noche de San Juan',
    suggestedCategory: 'מועדון / מסיבה',
    suggestedRegion: 'דרום-מערב',
    suggestedCostLevel: 1,
    description: 'מדורות על החוף בליל סן חואן — פסטיבל לאומי.',
  },
];

// Quick lookup by lowercased name.
export const CATALOG_BY_NAME: Record<string, CatalogEntry> = ATTRACTIONS_CATALOG.reduce(
  (acc, e) => {
    acc[e.name.toLowerCase().trim()] = e;
    return acc;
  },
  {} as Record<string, CatalogEntry>
);

// Simple relevance scoring: exact prefix > substring > token-match.
export function searchCatalog(query: string, limit = 8): CatalogEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { e: CatalogEntry; score: number }[] = [];
  for (const e of ATTRACTIONS_CATALOG) {
    const name = e.name.toLowerCase();
    const desc = (e.description || '').toLowerCase();
    let score = 0;
    if (name === q) score = 1000;
    else if (name.startsWith(q)) score = 500;
    else if (name.includes(q)) score = 250;
    else {
      let hits = 0;
      for (const t of tokens) {
        if (name.includes(t)) hits += 10;
        else if (desc.includes(t)) hits += 3;
      }
      score = hits;
    }
    if (score > 0) scored.push({ e, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.e);
}

// Region centroids for nearest-region inference from Nominatim lat/lon.
export const REGION_CENTROIDS: { region: Region; lat: number; lon: number }[] = [
  { region: 'צפון',        lat: 28.415, lon: -16.55 },
  { region: 'צפון-מזרח',   lat: 28.495, lon: -16.30 },
  { region: 'צפון-מערב',   lat: 28.420, lon: -16.78 },
  { region: 'מרכז',        lat: 28.273, lon: -16.642 },
  { region: 'מרכז-מערב',   lat: 28.250, lon: -16.835 },
  { region: 'מרכז-מזרח',   lat: 28.355, lon: -16.380 },
  { region: 'דרום',        lat: 28.085, lon: -16.730 },
  { region: 'דרום-מזרח',   lat: 28.040, lon: -16.560 },
  { region: 'דרום-מערב',   lat: 28.180, lon: -16.810 },
];

function toRad(d: number): number { return (d * Math.PI) / 180; }

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function inferRegionFromCoords(lat: number, lon: number): Region {
  let best: { region: Region; d: number } | null = null;
  for (const c of REGION_CENTROIDS) {
    const d = haversineKm(lat, lon, c.lat, c.lon);
    if (!best || d < best.d) best = { region: c.region, d };
  }
  if (!best || best.d > 30) return 'מחוץ לטנריף';
  return best.region;
}

export function inferCategoryFromOSM(osmType?: string, osmClass?: string, displayName?: string): Category {
  const s = `${osmType || ''} ${osmClass || ''} ${displayName || ''}`.toLowerCase();
  if (/\bbeach\b/.test(s)) return 'חוף';
  if (/restaurant|cafe|food|fast_food/.test(s)) return 'מסעדה';
  if (/hotel|hostel|guest_house|apartment/.test(s)) return 'מלון';
  if (/nightclub/.test(s)) return 'מועדון / מסיבה';
  if (/\bbar\b|pub/.test(s)) return 'בר';
  if (/zoo|aquarium/.test(s)) return 'חיות';
  if (/water_park|waterpark/.test(s)) return 'פארק מים';
  if (/viewpoint|vista|mirador/.test(s)) return 'תצפית';
  if (/park|natural|forest|peak|volcano/.test(s)) return 'טבע';
  if (/mall|shop|supermarket/.test(s)) return 'שופינג';
  if (/village|town|city|suburb|hamlet/.test(s)) return 'עיר / עיירה';
  return 'אחר';
}

export function inferCategoryFromText(text: string): Category {
  return inferCategoryFromOSM(undefined, undefined, text);
}
