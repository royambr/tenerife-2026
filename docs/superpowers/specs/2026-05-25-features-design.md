# Tenerife 2026 — Features Design Spec
_Date: 2026-05-25_

## Overview

Seven ambient and utility features added to the existing React/TypeScript/Tailwind trip app. All features are free, require no login, and use no commercial platforms. App is Hebrew RTL, no backend, data stored in localStorage.

---

## 1. Welcome / Landing Screen

**Component:** `src/components/WelcomeScreen.tsx`

A fullscreen entry card shown once per browser session (flag in `sessionStorage`). Displays trip title, destination, date range, and a "כנסו 🌊" CTA button. Tapping it:
1. Sets `sessionStorage` flag so it never shows again in this session
2. Calls `.play()` on the music player's `<audio>` element — this gesture unlocks browser autoplay for the session

On return visits (flag already set), welcome screen is skipped. Music player pill initialises in **paused** state and shows a play button. The first tap of that play button is the gesture that unlocks audio. Music does not autoplay without a gesture on return visits — this is a hard browser constraint.

**Integration:** Rendered in `App.tsx` above everything else, conditionally on the session flag.

---

## 2. Weather Badge

**Extends existing:** `src/data/weather.ts` (do NOT create a new hook)

The project already has `useWeather`, `findWeather`, `weatherEmoji` exported from `src/data/weather.ts` with a 6h localStorage cache. Extend this module:
- Add `uvMax`, `sunrise`, `sunset` to the `DayWeather` interface
- Add `uv_index_max,sunrise,sunset` to the fetch URL's `daily` param
- Keep the existing localStorage cache (`tnf_weather_v1`) and 6h TTL — do not switch to sessionStorage
- Fix coordinates to match the trip's primary region (verify with Roy which area — south Los Cristianos `28.05, -16.71` or north Puerto de la Cruz `28.41, -16.55`; update the single fetch in `weather.ts`)

**New component:** `src/components/WeatherBadge.tsx`

Receives `date: string` prop, calls `findWeather(date)` from the existing module. Renders a slim strip:
- Weather icon derived from rain probability (☀️ <20%, ⛅ 20–50%, 🌧️ >50%)
- Temp range: `18° – 26°`
- UV dot: colour-coded green/yellow/red
- Tap to expand: sunrise 🌅 and sunset 🌇 times

**Forecast window constraint:** Open-Meteo's free tier provides ~14 days ahead. The June 17–24 dates will show "forecast not yet available" (ממתין לתחזית) until ~June 3. `WeatherBadge` must handle `findWeather` returning `undefined` gracefully with a skeleton/placeholder state — matching the existing pattern in `Today.tsx`.

**Integration:** Injected at the top of each day section in `src/screens/Schedule.tsx`.

---

## 3. Floating Music Player

**Component:** `src/components/MusicPlayer.tsx`

Fixed position bottom-right (`z-50`). Uses a hidden SoundCloud Widget iframe pointed at the official Shpongle set:
`https://soundcloud.com/shponglemusic/sets/shpongle-static-live-at-ozora`

The iframe is hidden (`display:none` sized `1px×1px`). All UI is our own custom pill/panel — we control it via the **SoundCloud Widget API** (`SC.Widget(iframeEl)`), loaded from SoundCloud's CDN script. No login required; the set is public.

Widget API calls used: `.play()`, `.pause()`, `.setVolume()`, `.bind(SC.Widget.Events.PLAY_PROGRESS)` for track info. Track title is read from widget events and shown in the pill.

**States:**
- **Minimized (default):** Small pill `♫ Shpongle` with play/pause icon
- **Expanded:** Shows track list, current track name, prev/next buttons, volume slider

**Autoplay behaviour:**
- First visit: `WelcomeScreen` tap calls `.play()` — audio starts
- Return visits: initialise paused, show play button in pill, user taps once to start

**Persistence:** `localStorage` stores last track index and volume. Restores on reload.

**Integration:** Mounted directly in `App.tsx` outside tab routing. Expose a `ref` or callback so `WelcomeScreen` can call `.play()`.

---

## 4. Trip Countdown

**Component:** `src/components/TripCountdown.tsx`

Computes days from today to `2026-06-17` using Canary Islands timezone (`Atlantic/Canary`) for consistency with weather data:

```ts
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Atlantic/Canary' });
```

States:
- Before trip: `"23 ימים לטנריף 🌋"`
- Day of departure: `"היום מתחיל המסע! ✈️"`
- During trip (days 1–8): `"יום X מתוך 8 🌊"`
- After trip: hidden

**Integration:** Injected at top of `src/screens/Today.tsx`.

---

## 5. Activity Spinner

**Component:** `src/components/ActivitySpinner.tsx`

**Props:** `activities: Activity[]` — passed from `Today.tsx` as the already-filtered `todays` list for the active date. This keeps the spinner in sync with whatever day `Today.tsx` is currently displaying, not hardcoded to real-today.

A "🎰 תפתיע אותי" button. Tapping it animates through activity names rapidly for 1.2s (decelerating `setInterval`) then lands on a random one — displayed in a modal Sheet with the activity name, time, and region. Includes a cosmetic "בואו נעשה את זה!" button.

If `activities` is empty, button is hidden.

**Integration:** Button added to `src/screens/Today.tsx`, receives `todays` prop.

---

## 6. Tenerife Fun Facts

**Data:** `src/data/facts.ts` — array of ~15 Tenerife facts

**Component:** `src/components/FunFact.tsx`

Picks fact by date string: `date → dayOfYear` computed against `Atlantic/Canary` timezone (consistent with countdown and weather) to avoid midnight-boundary drift for Israeli users (UTC+2/+3 vs Canary UTC+1):

```ts
const canaryDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Atlantic/Canary' });
const [y, m, d] = canaryDate.split('-').map(Number);
const start = new Date(y, 0, 0);
const dayOfYear = Math.floor((new Date(y, m - 1, d).getTime() - start.getTime()) / 86400000);
const fact = facts[dayOfYear % facts.length];
```

Renders as a small card with 🌋 icon on the Today screen.

**Integration:** Below countdown in `src/screens/Today.tsx`.

---

## 7. Spanish Phrasebook

**Data:** `src/data/phrases.ts` — 20 essential phrases with Hebrew translation and phonetic pronunciation. Categories: greetings, food/drink, transport, emergency.

**Component:** `src/components/Phrasebook.tsx`

Collapsible card on Today screen. Tap a phrase to copy to clipboard (toast confirmation via existing `ToastHost`).

**Integration:** Bottom of `src/screens/Today.tsx`.

---

## Data Flow

```
src/data/weather.ts (extended) ──► sessionStorage cache ──► WeatherBadge (per day in Schedule)
                                                         └──► TripCountdown (sunrise/sunset)

SoundCloud Widget iframe (hidden) ──► SC.Widget API ──► MusicPlayer custom UI
                                                      └──► localStorage (volume)

WelcomeScreen tap ──► .play() on MusicPlayer ref ──► audio unlocked for session
                  └──► sessionStorage flag set

src/data/facts.ts ──► FunFact (Canary-timezone date-seeded)
src/data/phrases.ts ──► Phrasebook (collapsible, copy-to-clipboard)
Today.tsx `todays` list ──► ActivitySpinner (prop, not direct store access)
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/WelcomeScreen.tsx` | Landing screen + audio unlock |
| `src/components/MusicPlayer.tsx` | Floating audio player |
| `src/components/WeatherBadge.tsx` | Per-day weather strip (uses existing hook) |
| `src/components/TripCountdown.tsx` | Countdown banner |
| `src/components/ActivitySpinner.tsx` | Random activity picker |
| `src/components/FunFact.tsx` | Daily fun fact card |
| `src/components/Phrasebook.tsx` | Spanish phrases card |
| `src/data/facts.ts` | Tenerife facts array |
| `src/data/phrases.ts` | Spanish phrases array |

## Files to Modify

| File | Change |
|------|--------|
| `src/data/weather.ts` | Add uvMax, sunrise, sunset fields + fix coordinates |
| `src/App.tsx` | Mount WelcomeScreen + MusicPlayer with ref |
| `src/screens/Today.tsx` | Add Countdown, Spinner (with todays prop), FunFact, Phrasebook |
| `src/screens/Schedule.tsx` | Inject WeatherBadge per day |

---

## Constraints

- No new external libraries
- No commercial platforms (no YouTube, Spotify, SoundCloud)
- No API keys required
- SoundCloud widget controlled via SC.Widget API only — no fetch() of audio URLs
- All features degrade gracefully (weather shows placeholder, music shows error state)
- RTL layout maintained throughout
- Existing Tailwind theme tokens used (`ocean-*`, `volcano-*`)
- All timezone-sensitive computations use `Atlantic/Canary`
