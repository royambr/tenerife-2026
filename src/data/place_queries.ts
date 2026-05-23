import type { Activity } from './types';

// Map activity name patterns → Wikimedia Commons search query
// Returns null when no gallery should be shown (generic/logistical activities)
const PATTERNS: { match: RegExp; query: string }[] = [
  { match: /Loro Parque/i,          query: 'Loro Parque Tenerife' },
  { match: /Siam Park/i,            query: 'Siam Park Tenerife' },
  { match: /Teide.*Pico Viejo/i,    query: 'Pico Viejo Tenerife' },
  { match: /רכבל.*Teide|Teide.*רכבל|Teide/i, query: 'Mount Teide' },
  { match: /Roques de Garc[íi]a/i,  query: 'Roques de Garcia Tenerife' },
  { match: /Mirador Llano de Ucanca|Llano de Ucanca/i, query: 'Llano de Ucanca Tenerife' },
  { match: /Mirador San Pedro/i,    query: 'Mirador San Pedro Tenerife' },
  { match: /Mirador Cabezo del Tejo/i, query: 'Anaga Tenerife mirador' },
  { match: /Mirador Garachico|Garachico/i, query: 'Garachico Tenerife' },
  { match: /Anaga/i,                query: 'Anaga Tenerife' },
  { match: /Teno/i,                 query: 'Teno Rural Park Tenerife' },
  { match: /Masca/i,                query: 'Masca village Tenerife' },
  { match: /Los Gigantes/i,         query: 'Los Gigantes cliffs Tenerife' },
  { match: /Playa Jard[íi]n/i,      query: 'Playa Jardin Tenerife' },
  { match: /Lago Mart[íi]ánez|Lago Martianez/i, query: 'Lago Martianez Tenerife' },
  { match: /Playa del Duque/i,      query: 'Playa del Duque Tenerife' },
  { match: /Playa de las Vistas/i,  query: 'Playa de las Vistas Tenerife' },
  { match: /Playa de la Arena/i,    query: 'Playa de la Arena Tenerife' },
  { match: /Benijo/i,               query: 'Playa de Benijo Tenerife' },
  { match: /Playa.*San Juan|San Juan.*חוף/i, query: 'Playa San Juan Tenerife' },
  { match: /Plaza del Duque/i,      query: 'Plaza del Duque Tenerife' },
  { match: /Veronicas/i,            query: 'Playa de las Americas nightlife' },
  { match: /La Laguna/i,            query: 'San Cristobal de La Laguna' },
  { match: /La Orotava/i,           query: 'La Orotava Tenerife' },
  { match: /Puerto de la Cruz/i,    query: 'Puerto de la Cruz Tenerife' },
  { match: /Costa Adeje/i,          query: 'Costa Adeje Tenerife' },
  { match: /Playa de las Am[ée]ricas/i, query: 'Playa de las Americas Tenerife' },
  { match: /Buenavista/i,           query: 'Buenavista del Norte Tenerife' },
  { match: /Boat Party|שייט/i,      query: 'Tenerife boat trip' },
  { match: /קיאקים|סנורקלינג|ספורט ימי/, query: 'Tenerife kayak snorkel' },
  { match: /גלישה/,                  query: 'Tenerife surfing' },
  { match: /Noche de San Juan/i,    query: 'Noche de San Juan Tenerife' },
];

// activities to SKIP gallery for
const SKIP_CATEGORIES = new Set(['מלון', 'טיסה', 'נסיעה / לוגיסטיקה']);

export function queryForActivity(a: Activity): string | null {
  if (SKIP_CATEGORIES.has(a.category)) return null;
  // generic meal placeholders without a specific place name → skip
  if (a.category === 'מסעדה') {
    // Try to extract a place from name (after a "·")
    const m = a.name.match(/·\s*([^·]+)$/);
    if (m) {
      const place = m[1].trim();
      const matched = matchPattern(place) || matchPattern(a.name);
      if (matched) return matched;
      // fall through to generic tenerife food
      return `${place} Tenerife`;
    }
    // no place → skip generic meal cards
    if (/ארוחה|ארוחת|מסעדה|דגים|טפאס/.test(a.name) && !/·/.test(a.name)) return null;
  }
  const matched = matchPattern(a.name);
  if (matched) return matched;
  // fall back: use first chunk before bullet/parenthesis
  const stripped = a.name.replace(/\([^)]*\)/g, '').split('·')[0].trim();
  if (!stripped) return null;
  return `${stripped} Tenerife`;
}

function matchPattern(name: string): string | null {
  for (const p of PATTERNS) {
    if (p.match.test(name)) return p.query;
  }
  return null;
}
