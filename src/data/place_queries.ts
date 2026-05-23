import type { Activity, Region } from './types';

// Only logistics get no gallery — every real activity gets images.
const SKIP_CATEGORIES = new Set<string>(['נסיעה / לוגיסטיקה', 'טיסה']);

// Map Hebrew region → English search string for Unsplash/Wikimedia.
const REGION_EN: Record<Region, string> = {
  'צפון': 'North Tenerife Puerto de la Cruz',
  'צפון-מזרח': 'Tenerife North La Laguna',
  'צפון-מערב': 'Garachico Tenerife',
  'מרכז': 'Teide central Tenerife',
  'מרכז-מערב': 'Los Gigantes Tenerife',
  'מרכז-מזרח': 'Tenerife',
  'דרום': 'South Tenerife Costa Adeje',
  'דרום-מזרח': 'Southeast Tenerife',
  'דרום-מערב': 'Playa San Juan Tenerife',
  'מחוץ לטנריף': 'Tenerife',
};

export function mapRegionToEnglish(region: Region): string {
  return REGION_EN[region] || 'Tenerife';
}

// Exact-match patterns for known landmarks/hotels/places.
const PATTERNS: { match: RegExp; query: string }[] = [
  // Landmarks / parks / nature
  { match: /Loro Parque/i,             query: 'Loro Parque Tenerife' },
  { match: /Siam Park/i,                query: 'Siam Park Tenerife' },
  { match: /Pico Viejo/i,               query: 'Pico Viejo Tenerife' },
  { match: /Roques de Garc[íi]a/i,      query: 'Roques de Garcia Tenerife' },
  { match: /Llano de Ucanca/i,          query: 'Llano de Ucanca Tenerife' },
  { match: /Mirador San Pedro/i,        query: 'Mirador San Pedro Tenerife' },
  { match: /Cabezo del Tejo/i,          query: 'Anaga Tenerife mirador' },
  { match: /Mirador Garachico|Garachico/i, query: 'Garachico Tenerife' },
  { match: /Anaga/i,                    query: 'Anaga Rural Park Tenerife' },
  { match: /Teno/i,                     query: 'Teno Rural Park Tenerife' },
  { match: /Masca/i,                    query: 'Masca village Tenerife' },
  { match: /Los Gigantes/i,             query: 'Los Gigantes cliffs Tenerife' },
  { match: /Teide/i,                    query: 'Mount Teide Tenerife' },

  // Beaches
  { match: /Playa Jard[íi]n/i,          query: 'Playa Jardin Tenerife' },
  { match: /Lago Mart[íi][aá]nez|Lago Martianez/i, query: 'Lago Martianez Tenerife' },
  { match: /Playa del Duque/i,          query: 'Playa del Duque Tenerife' },
  { match: /Playa de las Vistas/i,      query: 'Playa de las Vistas Tenerife' },
  { match: /Playa de la Arena/i,        query: 'Playa de la Arena Tenerife' },
  { match: /Benijo/i,                   query: 'Playa de Benijo Tenerife' },
  { match: /Playa.*San Juan|San Juan.*חוף/i, query: 'Playa San Juan Tenerife' },

  // Hotels — exact-match overrides
  { match: /Hotel Las Aguilas|Las Aguilas/i, query: 'Hotel Las Aguilas Puerto de la Cruz Tenerife' },

  // Shopping
  { match: /Plaza del Duque/i,          query: 'Plaza del Duque Tenerife shopping' },

  // Towns
  { match: /La Laguna/i,                query: 'San Cristobal de La Laguna Tenerife' },
  { match: /La Orotava/i,               query: 'La Orotava Tenerife' },
  { match: /Puerto de la Cruz/i,        query: 'Puerto de la Cruz Tenerife' },
  { match: /Costa Adeje/i,              query: 'Costa Adeje Tenerife' },
  { match: /Playa de las Am[ée]ricas/i, query: 'Playa de las Americas Tenerife' },
  { match: /Buenavista/i,               query: 'Buenavista del Norte Tenerife' },

  // Nightlife / events
  { match: /Veronicas/i,                query: 'Veronicas strip Tenerife nightlife' },
  { match: /Noche de San Juan/i,        query: 'Noche de San Juan Tenerife bonfire beach' },
];

function matchPattern(name: string): string | null {
  for (const p of PATTERNS) {
    if (p.match.test(name)) return p.query;
  }
  return null;
}

// Extract the segment after the last "·" if present.
function tailSegment(name: string): string | null {
  const m = name.match(/·\s*([^·]+)$/);
  return m ? m[1].trim() : null;
}

// Detect Hebrew chars — used to decide if a tail segment is English-y enough to use as-is.
function hasHebrew(s: string): boolean { return /[֐-׿]/.test(s); }

function buildForCategory(a: Activity, tail: string | null): string {
  const cat = a.category;
  const regionEn = mapRegionToEnglish(a.region);

  // Tail segment (after "·") often holds the English place name.
  const tailEn = tail && !hasHebrew(tail) ? tail : null;

  switch (cat) {
    case 'מסעדה': {
      if (tailEn) return `restaurant ${tailEn} Tenerife`;
      return `restaurant tapas ${regionEn}`;
    }
    case 'בר': {
      if (tailEn) return `bar nightlife ${tailEn} Tenerife`;
      return `bar nightlife ${regionEn}`;
    }
    case 'מועדון / מסיבה': {
      if (tailEn) return `nightclub party ${tailEn} Tenerife`;
      return `nightclub party ${regionEn}`;
    }
    case 'מלון': {
      // Use the day's sleepingAt info via tail if present
      if (tailEn) return `hotel ${tailEn} Tenerife`;
      // Region-specific hotel fallback
      if (a.region === 'דרום' || a.region === 'דרום-מערב' || a.region === 'דרום-מזרח') {
        return 'hotel resort Costa Adeje Tenerife';
      }
      return 'hotel Puerto de la Cruz Tenerife';
    }
    case 'שופינג': {
      if (tailEn) return `${tailEn} Tenerife shopping`;
      return `shopping ${regionEn}`;
    }
    case 'חוף': {
      if (tailEn) return `${tailEn} beach Tenerife`;
      return `beach ${regionEn}`;
    }
    case 'פארק מים': {
      if (tailEn) return `${tailEn} Tenerife waterpark`;
      return `waterpark Tenerife`;
    }
    case 'שייט': {
      if (tailEn) return `boat trip ${tailEn} Tenerife`;
      return `boat trip Tenerife ocean`;
    }
    case 'ספורט ימי': {
      if (tailEn) return `${tailEn} watersports Tenerife`;
      return `kayak snorkel surfing Tenerife`;
    }
    case 'עיר / עיירה': {
      if (tailEn) return `${tailEn} Tenerife town`;
      return `${regionEn} town`;
    }
    case 'תצפית': {
      if (tailEn) return `${tailEn} viewpoint Tenerife`;
      return `viewpoint mirador ${regionEn}`;
    }
    case 'טבע': {
      if (tailEn) return `${tailEn} Tenerife nature`;
      return `nature ${regionEn}`;
    }
    case 'חיות': {
      if (tailEn) return `${tailEn} Tenerife`;
      return `wildlife Tenerife`;
    }
    default: {
      if (tailEn) return `${tailEn} Tenerife`;
      return `Tenerife ${regionEn}`;
    }
  }
}

export function buildQuery(a: Activity): string | null {
  if (SKIP_CATEGORIES.has(a.category)) return null;

  // 1) Try exact-match landmarks on the full name first
  const direct = matchPattern(a.name);
  if (direct) return direct;

  const tail = tailSegment(a.name);

  // 2) Try exact-match on the tail segment (e.g., "ארוחת ערב · La Orotava")
  if (tail) {
    const tailMatch = matchPattern(tail);
    if (tailMatch) return tailMatch;
  }

  // 3) Category-aware smart query
  return buildForCategory(a, tail);
}

// Back-compat export (was used by Gallery/ActivitySheet before).
export const queryForActivity = buildQuery;
