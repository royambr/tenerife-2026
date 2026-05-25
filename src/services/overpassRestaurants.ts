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

const TENERIFE_BBOX = '27.9,-16.93,28.6,-16.1';

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
    .map(n => {
      const name = n.tags.name;
      const staticRating = matchStaticRating(name);
      const osmRating = n.tags['stars'] ? parseFloat(n.tags['stars']) :
                        n.tags['rating'] ? parseFloat(n.tags['rating']) : null;
      const rating = staticRating ?? osmRating ?? 0;
      return {
        name,
        cuisine: mapCuisine(n.tags.cuisine),
        region: 'OSM',
        priceLevel: 2 as const,
        description: n.tags['description'] ?? n.tags['cuisine'] ?? 'מסעדה מ-OpenStreetMap',
        mapsUrl: buildMapsUrl(name, n.lat, n.lon),
        rating,
      };
    });
}
