import { useEffect, useState } from 'react';

export interface CurrentWeather {
  temp: number;
  humidity: number;
  windSpeed: number;
  precipProb: number;
  code: number;
  feelsLike: number;
}

export interface HourlyPoint {
  hour: string;
  temp: number;
  code: number;
}

export interface DayForecast {
  date: string;
  dayName: string;
  code: number;
  tMax: number;
  tMin: number;
  rain: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DayForecast[];
}

const CACHE_KEY = 'tnf_weather_v4';
const TTL_MS = 30 * 60 * 1000;

interface Cache { fetchedAt: number; data: WeatherData; }

function loadCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cache;
    if (Date.now() - c.fetchedAt > TTL_MS) return null;
    return c;
  } catch { return null; }
}
function saveCache(data: WeatherData) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data })); } catch {}
}

const DAY_NAMES: Record<number, string> = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' };

async function fetchWeather(): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=28.46&longitude=-16.25` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset` +
    `&timezone=Atlantic%2FCanary&forecast_days=8`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('weather error');
  const j = await res.json();

  const current: CurrentWeather = {
    temp: Math.round(j.current.temperature_2m),
    feelsLike: Math.round(j.current.apparent_temperature),
    humidity: j.current.relative_humidity_2m,
    windSpeed: Math.round(j.current.wind_speed_10m),
    precipProb: j.current.precipitation_probability ?? 0,
    code: j.current.weather_code,
  };

  const nowHour = j.current.time as string;
  const allTimes: string[] = j.hourly.time;
  const startIdx = Math.max(0, allTimes.findIndex(t => t >= nowHour));
  const hourly: HourlyPoint[] = allTimes.slice(startIdx, startIdx + 24).map((t, i) => ({
    hour: t.slice(11, 16),
    temp: Math.round(j.hourly.temperature_2m[startIdx + i]),
    code: j.hourly.weather_code[startIdx + i],
  }));

  const daily: DayForecast[] = (j.daily.time as string[]).slice(0, 8).map((date, i) => {
    const d = new Date(date + 'T12:00:00Z');
    return {
      date,
      dayName: DAY_NAMES[d.getUTCDay()],
      code: j.daily.weather_code[i],
      tMax: Math.round(j.daily.temperature_2m_max[i]),
      tMin: Math.round(j.daily.temperature_2m_min[i]),
      rain: j.daily.precipitation_probability_max[i] ?? 0,
      uvMax: Math.round(j.daily.uv_index_max[i] ?? 0),
      sunrise: (j.daily.sunrise[i] as string).slice(11, 16),
      sunset: (j.daily.sunset[i] as string).slice(11, 16),
    };
  });

  return { current, hourly, daily };
}

let inflight: Promise<WeatherData> | null = null;

export function useWeatherData(): WeatherData | null {
  const [data, setData] = useState<WeatherData | null>(() => loadCache()?.data ?? null);
  useEffect(() => {
    const cached = loadCache();
    if (cached) { setData(cached.data); return; }
    if (!inflight) {
      inflight = fetchWeather()
        .then(d => { saveCache(d); return d; })
        .catch(() => null as unknown as WeatherData)
        .finally(() => { setTimeout(() => { inflight = null; }, 0); });
    }
    inflight.then(d => { if (d) setData(d); }).catch(() => {});
  }, []);
  return data;
}

// Legacy compatibility — used by Today.tsx and WeatherBadge.tsx
export function useWeather(_start?: string, _end?: string): DayForecast[] | null {
  const data = useWeatherData();
  return data?.daily ?? null;
}

export function findWeather(data: DayForecast[] | null, date: string): DayForecast | undefined {
  return data?.find(d => d.date === date);
}

export function weatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

export function weatherLabel(code: number): string {
  if (code === 0) return 'Sunny';
  if (code === 1) return 'Mostly Sunny';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Partly Cloudy';
}

export function toF(c: number): number { return Math.round(c * 9 / 5 + 32); }

// Alias for legacy callers
export function weatherEmoji(code: number, _rain?: number): string { return weatherIcon(code); }

// Legacy type alias
export type DayWeather = DayForecast;
