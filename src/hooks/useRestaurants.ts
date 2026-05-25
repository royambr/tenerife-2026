import { useState, useEffect } from 'react';
import { Restaurant, RESTAURANTS } from '../data/restaurants';
import { fetchOSMRestaurants } from '../services/overpassRestaurants';

export type RestaurantSource = 'static' | 'osm';

export interface EnrichedRestaurant extends Restaurant {
  source: RestaurantSource;
}

function mergeRestaurants(
  staticList: Restaurant[],
  osmList: Restaurant[],
): EnrichedRestaurant[] {
  const result: EnrichedRestaurant[] = staticList.map(r => ({ ...r, source: 'static' as const }));
  const knownNames = new Set(staticList.map(r => r.name.toLowerCase()));

  for (const r of osmList) {
    if (!knownNames.has(r.name.toLowerCase())) {
      result.push({ ...r, source: 'osm' as const });
    }
  }

  return result;
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<EnrichedRestaurant[]>(
    RESTAURANTS.map(r => ({ ...r, source: 'static' as const })),
  );
  const [loading, setLoading] = useState(true);
  const [osmCount, setOsmCount] = useState(0);

  useEffect(() => {
    fetchOSMRestaurants()
      .then(osm => {
        const merged = mergeRestaurants(RESTAURANTS, osm);
        setRestaurants(merged);
        setOsmCount(osm.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { restaurants, loading, osmCount };
}
