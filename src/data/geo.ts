// In-memory only — never persisted
import { useEffect, useState } from 'react';

export interface UserLoc { lat: number; lng: number; ts: number; }

let _loc: UserLoc | null = null;
const listeners = new Set<() => void>();

export const geoStore = {
  get: () => _loc,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  set: (l: UserLoc | null) => { _loc = l; listeners.forEach(x => x()); },
};

export function useGeo() {
  const [, setN] = useState(0);
  useEffect(() => { const off = geoStore.subscribe(() => setN(n => n + 1)); return () => { off(); }; }, []);
  return _loc;
}

export function requestLocation(): Promise<UserLoc> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) { reject(new Error('no geolocation')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() };
        geoStore.set(loc);
        resolve(loc);
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  });
}
