# Tenerife 2026 · החבר׳ה

Premium mobile-first Hebrew RTL trip OS for the June 17–24, 2026 Tenerife trip.

## הרצה
```bash
npm install
npm run dev      # פיתוח
npm run build    # פרודקשן
```

הפתחו בדפדפן: `http://localhost:5173` — מומלץ במצב mobile (DevTools → iPhone 14).

## מה יש כאן
- **היום** — דאשבורד יומי עם הדבר הבא, התראות, ו"צריך לסגור"
- **לו״ז** — לוח מלא 17/6–24/6 עם מצב עריכה
- **אפשרויות** — 3 תוכניות (מאוזנת / טבע ואקשן / חופים וחיי לילה) + השוואת ימים
- **מפה** — אזורי האי עם פעילויות לכל אחד
- **ניהול** — טיסות, לינה, צ׳ק-ליסט, החלטות, קישורים

נתונים נשמרים ב-`localStorage`. כפתור "אפס נתונים" בתחתית מסך הניהול מחזיר את הסיד המקורי.

## מבנה
- `src/data/types.ts` · `src/data/seed.ts` — מודל נתונים וסיד
- `src/store.ts` — state + persistence (useSyncExternalStore)
- `src/components/` — Sheet / ActivityCard / ActivitySheet / ActivityEditor / Chip / BottomNav / TripProgress
- `src/screens/` — Today / Schedule / Plans / MapScreen / Manage
