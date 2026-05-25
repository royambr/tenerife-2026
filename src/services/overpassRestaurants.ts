import { Restaurant, RESTAURANTS } from '../data/restaurants';

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface OSMResponse {
  elements: OSMNode[];
}

const TENERIFE_BBOX = '27.97,-16.93,28.56,-16.11';
const LAT_MIN = 27.97, LAT_MAX = 28.56, LON_MIN = -16.93, LON_MAX = -16.11;

const CUISINE_MAP: Record<string, string> = {
  seafood: 'פירות ים', fish: 'פירות ים', mariscos: 'פירות ים',
  steak_house: 'בשרים', grill: 'בשרים', barbecue: 'בשרים', meat: 'בשרים',
  tapas: 'טפאס',
  spanish: 'ספרדי', regional: 'ספרדי', canarian: 'ספרדי',
  mediterranean: 'ים-תיכוני',
  vegan: 'וגן', vegetarian: 'וגן',
};

function mapCuisine(osm: string | undefined): string {
  if (!osm) return 'בינלאומי';
  const key = osm.toLowerCase().replace(/[^a-z_]/g, '');
  return CUISINE_MAP[key] ?? 'בינלאומי';
}

function buildMapsUrl(name: string, lat: number, lon: number): string {
  return `https://maps.google.com/?q=${encodeURIComponent(name)}&ll=${lat},${lon}`;
}

function matchStaticRating(name: string): number | null {
  const lower = name.toLowerCase();
  const match = RESTAURANTS.find(r => r.name.toLowerCase() === lower);
  return match ? match.rating : null;
}

const CUISINE_HE: Record<string, string> = {
  'פירות ים': 'פירות ים ודגים', 'בשרים': 'בשר וגריל', 'טפאס': 'טפאס ספרדיות',
  'ספרדי': 'מטבח ספרדי-קנרי', 'ים-תיכוני': 'מטבח ים-תיכוני',
  'וגן': 'מטבח צמחוני', 'בינלאומי': 'מטבח בינלאומי',
};

function buildHebrewDescription(tags: Record<string, string>, cuisineHe: string): string {
  const parts: string[] = [];
  const base = CUISINE_HE[cuisineHe] ?? 'מסעדה מקומית';
  parts.push(base);
  if (tags['addr:street']) parts.push(`ברחוב ${tags['addr:street']}`);
  if (tags['outdoor_seating'] === 'yes') parts.push('ישיבה בחוץ');
  if (tags['takeaway'] === 'yes') parts.push('טייק-אווי');
  if (tags['wheelchair'] === 'yes') parts.push('נגיש');
  return parts.join(' · ');
}

export async function fetchOSMRestaurants(): Promise<Restaurant[]> {
  const query = `
    [out:json][timeout:20];
    node["amenity"="restaurant"](${TENERIFE_BBOX});
    out body 200;
  `.trim();

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error('Overpass API error');

  const data: OSMResponse = await res.json();

  return data.elements
    .filter(n => n.tags?.name)
    .filter(n => n.lat >= LAT_MIN && n.lat <= LAT_MAX && n.lon >= LON_MIN && n.lon <= LON_MAX)
    .map(n => {
      const name = n.tags.name;
      const staticRating = matchStaticRating(name);
      const osmRating = n.tags['stars'] ? parseFloat(n.tags['stars']) :
                        n.tags['rating'] ? parseFloat(n.tags['rating']) : null;
      const rating = staticRating ?? osmRating ?? 0;
      const hours = n.tags['opening_hours'] ?? '';
      const hasBreakfast = /0[6-9]:|10:|11:/.test(hours) || /breakfast/i.test(hours);
      const meals: ('breakfast' | 'lunch' | 'dinner')[] = hasBreakfast
        ? ['breakfast', 'lunch', 'dinner']
        : ['lunch', 'dinner'];
      const cuisineHe = mapCuisine(n.tags.cuisine);
      return {
        name,
        cuisine: cuisineHe,
        region: 'OSM',
        priceLevel: 2 as const,
        description: buildHebrewDescription(n.tags, cuisineHe),
        mapsUrl: buildMapsUrl(name, n.lat, n.lon),
        rating,
        meals,
      };
    });
}
