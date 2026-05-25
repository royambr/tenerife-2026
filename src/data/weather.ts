// Open-Meteo weather fetching with 6h localStorage cache
import { useEffect, useState } from 'react';

export interface DayWeather {
  date: string;
  code: number;
  tMax: number;
  tMin: number;
  rain: number; // % probability
  uvMax: number;
  sunrise: string; // "06:32"
  sunset: string;  // "21:07"
}

const CACHE_KEY = 'tnf_weather_v2';
const TTL_MS = 60 * 60 * 1000; // 1h — stays fresh through the day

interface Cache { fetchedAt: number; data: DayWeather[]; }

function loadCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cache;
    if (Date.now() - c.fetchedAt > TTL_MS) return null;
    return c;
  } catch { return null; }
}
function saveCache(data: DayWeather[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data }));
  } catch {}
}

let inflight: Promise<DayWeather[]> | null = null;

async function fetchWeather(start: string, end: string): Promise<DayWeather[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=28.46&longitude=-16.25` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset` +
    `&timezone=Atlantic%2FCanary&start_date=${start}&end_date=${end}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather fetch failed');
  const j = await res.json();
  const out: DayWeather[] = [];
  const days = j.daily?.time || [];
  for (let i = 0; i < days.length; i++) {
    out.push({
      date: days[i],
      code: j.daily.weathercode[i],
      tMax: Math.round(j.daily.temperature_2m_max[i]),
      tMin: Math.round(j.daily.temperature_2m_min[i]),
      rain: j.daily.precipitation_probability_max[i] ?? 0,
      uvMax: Math.round(j.daily.uv_index_max[i] ?? 0),
      sunrise: (j.daily.sunrise[i] as string).slice(11, 16),
      sunset: (j.daily.sunset[i] as string).slice(11, 16),
    });
  }
  return out;
}

export function useWeather(start: string, end: string) {
  const [data, setData] = useState<DayWeather[] | null>(() => loadCache()?.data || null);
  useEffect(() => {
    const cached = loadCache();
    if (cached) { setData(cached.data); return; }
    if (!inflight) {
      inflight = fetchWeather(start, end)
        .then(d => { saveCache(d); return d; })
        .catch(() => [] as DayWeather[])
        .finally(() => { setTimeout(() => { inflight = null; }, 0); });
    }
    inflight.then(d => { if (d.length) setData(d); }).catch(() => {});
  }, [start, end]);
  return data;
}

export function weatherEmoji(code: number, rain: number): string {
  if (rain >= 60) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 95) return '⛈️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 2 && code <= 3) return '⛅';
  if (code === 1) return '🌤️';
  return '☀️';
}

export function findWeather(data: DayWeather[] | null, date: string): DayWeather | undefined {
  return data?.find(d => d.date === date);
}
