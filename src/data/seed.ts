import type { Activity, AppState, Day, Decision, Participant, Plan } from './types';

const uid = (() => { let i = 0; return (p='a') => `${p}_${++i}`; })();

const DATES = ['2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22','2026-06-23','2026-06-24'];

// shared logistical days (mostly identical across plans, name only)
const dayMeta = (date: string, title: string, sleepingAt: string, intensity: Day['intensity'], alerts: string[] = [], notes?: string): Omit<Day,'id'> =>
  ({ date, title, sleepingAt, intensity, alerts, notes });

const mkDay = (planId: string, m: Omit<Day,'id'>): Day => ({ id: uid('d'), ...m });

// helper to build an activity
function A(planId: string, dayDate: string, dayPart: Activity['dayPart'], startTime: string, endTime: string,
           name: string, category: Activity['category'], region: Activity['region'],
           extras: Partial<Activity> = {}): Activity {
  return {
    id: uid('act'),
    planId, dayDate, dayPart, startTime, endTime, name, category, region,
    costLevel: extras.costLevel ?? 2,
    status: extras.status ?? 'מתוכנן',
    priority: extras.priority ?? 'רגיל',
    bookingRequired: extras.bookingRequired ?? false,
    ...extras
  };
}

// ========== PLAN 1: מאוזנת ==========
const P1 = 'plan_balanced';
// ========== PLAN 2: טבע ואקשן ==========
const P2 = 'plan_nature';
// ========== PLAN 3: חופים וחיי לילה ==========
const P3 = 'plan_beach';

// Shared June 17 logistics (same across plans, varied evening)
function june17(planId: string, evening: Activity[]): Activity[] {
  return [
    A(planId, DATES[0], 'noon', '14:00', '14:45', 'נחיתה ב-Tenerife North Airport', 'טיסה', 'צפון-מזרח', {
      costLevel: 1, status: 'הוזמן',
      description: 'נחיתה בשדה הצפוני. אספו מזוודות והתקדמו לאיסוף הרכב.',
      preparation: ['דרכון', 'אישור רכב שכור', 'כרטיס אשראי לפיקדון'],
    }),
    A(planId, DATES[0], 'noon', '14:45', '15:45', 'איסוף רכב שכור', 'נסיעה / לוגיסטיקה', 'צפון-מזרח', {
      costLevel: 2, bookingRequired: true, status: 'הוזמן',
      preparation: ['רישיון נהיגה בינ"ל', 'כרטיס אשראי על שם הנהג'],
    }),
    A(planId, DATES[0], 'evening', '16:15', '17:00', 'Check-in · Hotel Las Aguilas Tenerife', 'מלון', 'צפון', {
      costLevel: 3, status: 'הוזמן', bookingRequired: true,
      description: 'שני לילות ראשונים. כניסה חלקה, פריקה וריענון.',
    }),
    ...evening
  ];
}

const activities: Activity[] = [];

// ============ PLAN 1: מאוזנת ============
activities.push(
  ...june17(P1, [
    A(P1, DATES[0], 'evening', '18:00', '20:00', 'הליכה בנמל Puerto de la Cruz', 'עיר / עיירה', 'צפון', {
      costLevel: 1, description: 'התרגלות לאי, הליכה רגועה לאורך הטיילת והנמל.',
      whyToday: 'אחרי טיסה — משהו קליל לפני ארוחת ערב.'
    }),
    A(P1, DATES[0], 'night', '20:30', '22:30', 'ארוחת ערב מקומית · Puerto de la Cruz', 'מסעדה', 'צפון', {
      costLevel: 2, description: 'טפאס, דגים טריים ובירה קנארית.'
    }),
  ]),

  // June 18 — North day
  A(P1, DATES[1], 'morning', '09:30', '12:30', 'Loro Parque', 'חיות', 'צפון', {
    costLevel: 3, bookingRequired: true, status: 'דורש החלטה',
    description: 'אחד הפארקים המפורסמים באירופה — דולפינים, אורקות, פינגווינים.',
    duration: '3-4 שעות', openingHours: '8:30-18:45',
    preparation: ['כובע', 'מים', 'כרטיס דיגיטלי בטלפון'],
    mapsUrl: 'https://maps.google.com/?q=Loro+Parque',
    alternatives: ['Lago Martiánez', 'La Orotava'],
    whyToday: 'הפארק קרוב למלון — מנצלים את היום הצפוני.'
  }),
  A(P1, DATES[1], 'noon', '13:00', '14:30', 'ארוחת צהריים קלילה · Puerto de la Cruz', 'מסעדה', 'צפון', { costLevel: 2 }),
  A(P1, DATES[1], 'noon', '15:00', '17:30', 'Lago Martiánez · בריכות מי-ים', 'חוף', 'צפון', {
    costLevel: 1, description: 'בריכות מעוצבות של ססאר מנריקה ליד הים. רגוע ומשפחתי.',
    preparation: ['בגד ים', 'מגבת']
  }),
  A(P1, DATES[1], 'evening', '18:30', '20:30', 'שקיעה ב-Mirador San Pedro', 'תצפית', 'צפון', { costLevel: 1, priority: 'גבוה' }),
  A(P1, DATES[1], 'night', '21:00', '23:00', 'ארוחת ערב · La Orotava', 'מסעדה', 'צפון', { costLevel: 2, description: 'עיירה קולוניאלית יפהפייה לארוחה איטית.' }),

  // June 19 — Transition
  A(P1, DATES[2], 'morning', '09:00', '11:30', 'La Laguna · העיר העתיקה', 'עיר / עיירה', 'צפון-מזרח', {
    costLevel: 1, description: 'מורשת יוניסקו, רחובות צבעוניים, בתי קפה.',
    whyToday: 'בדרך דרומה — עצירה מושלמת.'
  }),
  A(P1, DATES[2], 'noon', '12:00', '14:30', 'Anaga Rural Park · נסיעה תצפיתית', 'טבע', 'צפון-מזרח', {
    costLevel: 1, priority: 'גבוה',
    preparation: ['נעלי הליכה', 'מים', 'בנזין מלא ברכב'],
    description: 'יער ענן עתיק עם תצפיות דרמטיות.'
  }),
  A(P1, DATES[2], 'noon', '14:45', '16:00', 'Benijo Beach · ארוחת דגים', 'חוף', 'צפון-מזרח', { costLevel: 2 }),
  A(P1, DATES[2], 'evening', '17:00', '19:30', 'נסיעה דרומה ל-Costa Adeje', 'נסיעה / לוגיסטיקה', 'דרום', { costLevel: 1 }),
  A(P1, DATES[2], 'night', '20:30', '22:30', 'ערב פתיחה בדרום · Costa Adeje', 'מסעדה', 'דרום', { costLevel: 2 }),

  // June 20 — Teide
  A(P1, DATES[3], 'morning', '08:30', '11:00', 'נסיעה ל-Teide National Park', 'נסיעה / לוגיסטיקה', 'מרכז', { costLevel: 1 }),
  A(P1, DATES[3], 'noon', '11:30', '14:30', 'רכבל Teide + תצפיות', 'תצפית', 'מרכז', {
    costLevel: 3, bookingRequired: true, status: 'דורש החלטה', priority: 'גבוה',
    description: 'הר הגעש הגבוה בספרד. נופים מהירח.',
    preparation: ['שכבת חימום', 'משקפי שמש', 'קרם הגנה', 'מים'],
    alternatives: ['Mirador Llano de Ucanca'], whyToday: 'יום בהיר — מנצלים נראות.'
  }),
  A(P1, DATES[3], 'evening', '17:00', '19:30', 'שקיעה ב-Roques de García', 'תצפית', 'מרכז', { costLevel: 1, priority: 'גבוה' }),
  A(P1, DATES[3], 'night', '20:30', '22:30', 'ארוחת ערב · Costa Adeje', 'מסעדה', 'דרום', { costLevel: 2 }),

  // June 21 — Siam Park
  A(P1, DATES[4], 'morning', '10:00', '17:00', 'Siam Park · יום פארק מים', 'פארק מים', 'דרום', {
    costLevel: 3, bookingRequired: true, status: 'דורש החלטה',
    description: 'הפארק המים המדורג מספר 1 בעולם. מתוחזק יפה ושווה יום שלם.',
    preparation: ['בגד ים', 'קרם הגנה SPF50', 'מגבת', 'כרטיס דיגיטלי'],
    mapsUrl: 'https://maps.google.com/?q=Siam+Park',
    sourceUrl: 'https://www.siampark.net'
  }),
  A(P1, DATES[4], 'evening', '19:00', '21:00', 'מקלחת ומנוחה במלון', 'מלון', 'דרום', { costLevel: 1 }),
  A(P1, DATES[4], 'night', '21:30', '23:30', 'ארוחת ערב · Playa de las Américas', 'מסעדה', 'דרום', { costLevel: 2 }),

  // June 22 — Los Gigantes
  A(P1, DATES[5], 'morning', '09:30', '13:30', 'שייט דולפינים · Los Gigantes', 'שייט', 'מרכז-מערב', {
    costLevel: 3, bookingRequired: true, status: 'דורש החלטה', priority: 'גבוה',
    description: 'שייט לאורך צוקי Los Gigantes, פעמים מזהים דולפינים ולווייתנים.',
    preparation: ['קרם הגנה', 'מגבת', 'כדורים נגד בחילת ים אם רגישים']
  }),
  A(P1, DATES[5], 'noon', '14:00', '15:30', 'ארוחת צהריים · Los Gigantes', 'מסעדה', 'מרכז-מערב', { costLevel: 2 }),
  A(P1, DATES[5], 'noon', '16:00', '18:30', 'חוף Playa de la Arena', 'חוף', 'מרכז-מערב', { costLevel: 1 }),
  A(P1, DATES[5], 'night', '21:00', '23:30', 'ארוחת ערב · Costa Adeje', 'מסעדה', 'דרום', { costLevel: 2 }),

  // June 23 — Noche de San Juan
  A(P1, DATES[6], 'morning', '10:00', '13:00', 'חוף Playa del Duque · בוקר רגוע', 'חוף', 'דרום', { costLevel: 1 }),
  A(P1, DATES[6], 'noon', '14:00', '16:30', 'שופינג · Plaza del Duque', 'שופינג', 'דרום', { costLevel: 2 }),
  A(P1, DATES[6], 'evening', '18:00', '20:00', 'אריזה לפני היציאה', 'נסיעה / לוגיסטיקה', 'דרום', {
    costLevel: 1, priority: 'גבוה',
    description: 'מסדרים מזוודות עכשיו כדי לחזור באלגנטיות אחרי הלילה.'
  }),
  A(P1, DATES[6], 'night', '21:00', '01:30', 'Noche de San Juan · חוף San Juan', 'מועדון / מסיבה', 'דרום-מערב', {
    costLevel: 1, priority: 'גבוה',
    description: 'מדורות על החוף, מוזיקה, אווירה של פסטיבל לאומי.',
    preparation: ['מים', 'נעליים נוחות', 'לעקוב על שעות חזרה — טיסה מוקדמת']
  }),

  // June 24 — Flight home (Tenerife North TFN — ~1h15 drive from Costa Adeje)
  A(P1, DATES[7], 'morning', '06:00', '07:00', 'יציאה ו-Check-out', 'מלון', 'דרום', { costLevel: 1, priority: 'גבוה' }),
  A(P1, DATES[7], 'morning', '07:00', '08:30', 'נסיעה ל-Tenerife North Airport (TFN) + החזרת רכב', 'נסיעה / לוגיסטיקה', 'צפון-מזרח', { costLevel: 1, priority: 'גבוה', description: 'נסיעה מקוסטה אדחה לשדה הצפוני (TFN) — כ-1:15 שעות. החזרת רכב עם מיכל מלא.' }),
  A(P1, DATES[7], 'morning', '11:00', '11:30', 'טיסה הביתה · Tenerife North Airport (TFN)', 'טיסה', 'מחוץ לטנריף', { costLevel: 3, status: 'הוזמן' }),
);

// ============ PLAN 2: טבע ואקשן ============
activities.push(
  ...june17(P2, [
    A(P2, DATES[0], 'evening', '17:30', '19:30', 'תצפית במזח Puerto de la Cruz', 'תצפית', 'צפון', { costLevel: 1 }),
    A(P2, DATES[0], 'night', '20:00', '22:00', 'ארוחת ערב מקומית', 'מסעדה', 'צפון', { costLevel: 2 }),
  ]),

  A(P2, DATES[1], 'morning', '08:00', '13:00', 'Anaga · מסלול הליכה ביער ענן', 'טבע', 'צפון-מזרח', {
    costLevel: 1, priority: 'גבוה',
    description: 'מסלולי PR-TF, יער עתיק וירוק במיוחד.',
    preparation: ['נעלי הליכה', 'מים 2L', 'מעיל קל', 'נשנושים']
  }),
  A(P2, DATES[1], 'noon', '14:00', '15:30', 'דגים על החוף · Benijo', 'מסעדה', 'צפון-מזרח', { costLevel: 2 }),
  A(P2, DATES[1], 'evening', '17:00', '19:30', 'תצפית Mirador Cabezo del Tejo', 'תצפית', 'צפון-מזרח', { costLevel: 1 }),
  A(P2, DATES[1], 'night', '21:00', '23:00', 'ערב רגוע · La Orotava', 'מסעדה', 'צפון', { costLevel: 2 }),

  A(P2, DATES[2], 'morning', '08:30', '12:00', 'Masca · מסלול תצפיות', 'טבע', 'צפון-מערב', {
    costLevel: 1, priority: 'גבוה',
    preparation: ['נעלי הליכה', 'מים', 'משקפי שמש'],
    description: 'אחד הכפרים היפים באי, גישה הררית.'
  }),
  A(P2, DATES[2], 'noon', '12:30', '14:00', 'ארוחה במסעדה כפרית · Masca', 'מסעדה', 'צפון-מערב', { costLevel: 2 }),
  A(P2, DATES[2], 'evening', '15:30', '18:30', 'נסיעה דרומה ל-Costa Adeje', 'נסיעה / לוגיסטיקה', 'דרום', { costLevel: 1 }),
  A(P2, DATES[2], 'night', '20:30', '22:30', 'מנוחה וערב במלון', 'מלון', 'דרום', { costLevel: 1 }),

  A(P2, DATES[3], 'morning', '07:30', '13:30', 'Teide · מסלול הליכה Pico Viejo', 'טבע', 'מרכז', {
    costLevel: 1, priority: 'גבוה',
    description: 'יום הליכה תובעני — נופי הרי געש, אוויר דליל.',
    preparation: ['נעלי הליכה גבוהות', 'שכבות', 'מים 2L+', 'אוכל אנרגיה', 'הגנה מהשמש']
  }),
  A(P2, DATES[3], 'noon', '14:00', '15:30', 'ארוחה כפרית בדרך', 'מסעדה', 'מרכז', { costLevel: 2 }),
  A(P2, DATES[3], 'evening', '18:00', '21:00', 'שקיעה וצפיית כוכבים · Teide', 'תצפית', 'מרכז', { costLevel: 1, priority: 'גבוה' }),
  A(P2, DATES[3], 'lateNight', '22:30', '00:00', 'חזרה ל-Costa Adeje', 'נסיעה / לוגיסטיקה', 'דרום', { costLevel: 1 }),

  A(P2, DATES[4], 'morning', '08:30', '14:00', 'Los Gigantes · קיאקים וסנורקלינג', 'ספורט ימי', 'מרכז-מערב', {
    costLevel: 3, bookingRequired: true, status: 'דורש החלטה', priority: 'גבוה'
  }),
  A(P2, DATES[4], 'noon', '14:30', '16:00', 'ארוחת צהריים על המים', 'מסעדה', 'מרכז-מערב', { costLevel: 2 }),
  A(P2, DATES[4], 'evening', '17:30', '19:30', 'מנוחה בחוף Playa de la Arena', 'חוף', 'מרכז-מערב', { costLevel: 1 }),
  A(P2, DATES[4], 'night', '21:00', '23:00', 'ארוחת ערב · דייגים מקומיים', 'מסעדה', 'מרכז-מערב', { costLevel: 2 }),

  A(P2, DATES[5], 'morning', '08:00', '13:00', 'Teno Rural Park · הליכה ותצפיות', 'טבע', 'צפון-מערב', {
    costLevel: 1, priority: 'גבוה',
    preparation: ['נעלי הליכה', 'מים', 'מעיל קל']
  }),
  A(P2, DATES[5], 'noon', '13:30', '15:30', 'ארוחת צהריים · Buenavista', 'מסעדה', 'צפון-מערב', { costLevel: 2 }),
  A(P2, DATES[5], 'evening', '17:30', '20:00', 'Mirador Garachico + טבילה בבריכות הלבה', 'חוף', 'צפון-מערב', { costLevel: 1 }),
  A(P2, DATES[5], 'night', '21:30', '23:30', 'ערב בכפר · Garachico', 'מסעדה', 'צפון-מערב', { costLevel: 2 }),

  A(P2, DATES[6], 'morning', '09:00', '12:00', 'גלישה · Playa de las Américas (שיעור)', 'ספורט ימי', 'דרום', {
    costLevel: 3, bookingRequired: true, status: 'דורש החלטה'
  }),
  A(P2, DATES[6], 'noon', '13:00', '15:00', 'ארוחת צהריים על החוף', 'מסעדה', 'דרום', { costLevel: 2 }),
  A(P2, DATES[6], 'evening', '17:00', '19:00', 'אריזה לפני הערב', 'נסיעה / לוגיסטיקה', 'דרום', { costLevel: 1, priority: 'גבוה' }),
  A(P2, DATES[6], 'night', '21:00', '01:00', 'Noche de San Juan · מדורות בחוף', 'מועדון / מסיבה', 'דרום-מערב', {
    costLevel: 1, preparation: ['נעלי שטח', 'מים', 'לעקוב על שעות חזרה — טיסה מוקדמת']
  }),

  A(P2, DATES[7], 'morning', '06:00', '07:00', 'יציאה ו-Check-out', 'מלון', 'דרום', { costLevel: 1, priority: 'גבוה' }),
  A(P2, DATES[7], 'morning', '07:00', '08:30', 'נסיעה ל-Tenerife North Airport (TFN) + החזרת רכב', 'נסיעה / לוגיסטיקה', 'צפון-מזרח', { costLevel: 1, priority: 'גבוה', description: 'נסיעה מקוסטה אדחה לשדה הצפוני (TFN) — כ-1:15 שעות. החזרת רכב עם מיכל מלא.' }),
  A(P2, DATES[7], 'morning', '11:00', '11:30', 'טיסה הביתה · Tenerife North Airport (TFN)', 'טיסה', 'מחוץ לטנריף', { costLevel: 3, status: 'הוזמן' }),
);

// ============ PLAN 3: חופים וחיי לילה ============
activities.push(
  ...june17(P3, [
    A(P3, DATES[0], 'evening', '17:30', '19:30', 'בריכות מי-ים · Lago Martiánez', 'חוף', 'צפון', { costLevel: 1 }),
    A(P3, DATES[0], 'night', '20:30', '23:30', 'ארוחה ובר ב-Puerto de la Cruz', 'בר', 'צפון', { costLevel: 2 }),
  ]),

  A(P3, DATES[1], 'morning', '10:30', '13:30', 'בוקר חוף · Playa Jardín', 'חוף', 'צפון', { costLevel: 1 }),
  A(P3, DATES[1], 'noon', '14:00', '16:00', 'ארוחת צהריים יוקרתית · Puerto de la Cruz', 'מסעדה', 'צפון', { costLevel: 3 }),
  A(P3, DATES[1], 'evening', '17:00', '19:00', 'שופינג · La Orotava', 'שופינג', 'צפון', { costLevel: 2 }),
  A(P3, DATES[1], 'night', '21:30', '01:00', 'מסיבה · Puerto de la Cruz', 'מועדון / מסיבה', 'צפון', { costLevel: 2 }),

  A(P3, DATES[2], 'morning', '10:00', '12:30', 'La Laguna · ארוחת בוקר ובוטיקים', 'עיר / עיירה', 'צפון-מזרח', { costLevel: 2 }),
  A(P3, DATES[2], 'noon', '13:30', '17:00', 'נסיעה דרומה + עצירת חוף', 'נסיעה / לוגיסטיקה', 'דרום', { costLevel: 1 }),
  A(P3, DATES[2], 'evening', '18:00', '20:00', 'Check-in דרום + מנוחה', 'מלון', 'דרום', { costLevel: 1 }),
  A(P3, DATES[2], 'night', '22:00', '02:00', 'יציאת לילה · Playa de las Américas', 'מועדון / מסיבה', 'דרום', { costLevel: 3 }),

  A(P3, DATES[3], 'morning', '11:00', '14:00', 'יום חוף · Playa de las Vistas', 'חוף', 'דרום', { costLevel: 1 }),
  A(P3, DATES[3], 'noon', '14:30', '16:00', 'ארוחת צהריים על הים', 'מסעדה', 'דרום', { costLevel: 2 }),
  A(P3, DATES[3], 'evening', '17:30', '21:00', 'שקיעה מהירה ב-Teide (רק תצפית)', 'תצפית', 'מרכז', { costLevel: 1 }),
  A(P3, DATES[3], 'night', '22:30', '02:00', 'בר ומסיבה · Veronicas Strip', 'בר', 'דרום', { costLevel: 3 }),

  A(P3, DATES[4], 'morning', '10:30', '17:00', 'Siam Park · יום פארק מים', 'פארק מים', 'דרום', {
    costLevel: 3, bookingRequired: true, status: 'דורש החלטה',
    preparation: ['בגד ים', 'קרם הגנה SPF50', 'מגבת']
  }),
  A(P3, DATES[4], 'evening', '18:30', '20:00', 'מקלחת ומנוחה', 'מלון', 'דרום', { costLevel: 1 }),
  A(P3, DATES[4], 'night', '22:00', '02:30', 'ערב לילה · Costa Adeje', 'מועדון / מסיבה', 'דרום', { costLevel: 3 }),

  A(P3, DATES[5], 'morning', '11:00', '14:00', 'Beach Club · Playa del Duque', 'חוף', 'דרום', { costLevel: 3 }),
  A(P3, DATES[5], 'noon', '14:30', '18:00', 'Boat Party · Costa Adeje', 'שייט', 'דרום', {
    costLevel: 3, bookingRequired: true, status: 'דורש החלטה', priority: 'גבוה'
  }),
  A(P3, DATES[5], 'evening', '19:30', '21:30', 'מקלחת וערב חופשי', 'מלון', 'דרום', { costLevel: 1 }),
  A(P3, DATES[5], 'night', '22:30', '02:30', 'בר ומועדון · Playa de las Américas', 'מועדון / מסיבה', 'דרום', { costLevel: 3 }),

  A(P3, DATES[6], 'morning', '11:30', '14:00', 'חוף יוקרה · Playa del Duque', 'חוף', 'דרום', { costLevel: 2 }),
  A(P3, DATES[6], 'noon', '14:30', '17:00', 'שופינג · Plaza del Duque', 'שופינג', 'דרום', { costLevel: 2 }),
  A(P3, DATES[6], 'evening', '17:30', '19:30', 'אריזה לפני הערב', 'נסיעה / לוגיסטיקה', 'דרום', { costLevel: 1, priority: 'גבוה' }),
  A(P3, DATES[6], 'night', '21:00', '01:30', 'Noche de San Juan · Playa San Juan', 'מועדון / מסיבה', 'דרום-מערב', {
    costLevel: 1, preparation: ['מים', 'נעליים נוחות', 'שעון חזרה — טיסה מוקדמת']
  }),

  A(P3, DATES[7], 'morning', '06:00', '07:00', 'יציאה ו-Check-out', 'מלון', 'דרום', { costLevel: 1, priority: 'גבוה' }),
  A(P3, DATES[7], 'morning', '07:00', '08:30', 'נסיעה ל-Tenerife North Airport (TFN) + החזרת רכב', 'נסיעה / לוגיסטיקה', 'צפון-מזרח', { costLevel: 1, priority: 'גבוה', description: 'נסיעה מקוסטה אדחה לשדה הצפוני (TFN) — כ-1:15 שעות. החזרת רכב עם מיכל מלא.' }),
  A(P3, DATES[7], 'morning', '11:00', '11:30', 'טיסה הביתה · Tenerife North Airport (TFN)', 'טיסה', 'מחוץ לטנריף', { costLevel: 3, status: 'הוזמן' }),
);

const HOTEL_NORTH = 'Hotel Las Aguilas · Puerto de la Cruz';
const HOTEL_SOUTH = 'מלון בדרום · Costa Adeje';
const AT_FLIGHT   = 'בדרך הביתה';

function makePlanDays(): Day[] {
  return [
    mkDay('', dayMeta(DATES[0], 'יום נחיתה', HOTEL_NORTH, 'רגוע',  ['להזמין רכב מראש','להגיע למלון לפני 19:00'])),
    mkDay('', dayMeta(DATES[1], 'צפון האי', HOTEL_NORTH, 'בינוני', ['לסגור כרטיסי Loro Parque'])),
    mkDay('', dayMeta(DATES[2], 'מעבר דרומה', HOTEL_SOUTH, 'עמוס',  ['להעביר מזוודות לרכב בבוקר','להביא נעלי הליכה ל-Anaga'])),
    mkDay('', dayMeta(DATES[3], 'יום Teide', HOTEL_SOUTH, 'עמוס',   ['שכבת חימום לערב','בנזין מלא ברכב','להזמין רכבל מראש'])),
    mkDay('', dayMeta(DATES[4], 'יום פעילות', HOTEL_SOUTH, 'בינוני',['קרם הגנה','בגדי ים זמינים'])),
    mkDay('', dayMeta(DATES[5], 'מערב האי', HOTEL_SOUTH, 'בינוני',  ['לסגור שייט מראש'])),
    mkDay('', dayMeta(DATES[6], 'יום אחרון + San Juan', HOTEL_SOUTH, 'עמוס', ['לארוז לפני היציאה בערב','שעת חזרה מבוקרת — מחר טיסה מ-Tenerife North (TFN), יציאה ב-07:00'])),
    mkDay('', dayMeta(DATES[7], 'טיסה הביתה', AT_FLIGHT, 'בינוני',   ['Check-out מוקדם (06:00)','נסיעה ל-Tenerife North (TFN) — כ-1:15 שעות מקוסטה אדחה','להחזיר את הרכב עם מיכל מלא'])),
  ];
}

const plans: Plan[] = [
  {
    id: P1, name: 'מאוזנת',
    description: 'תמהיל של טבע, חופים, פארק מים, שייט, Teide ועיירות.',
    vibe: 'זרימה נינוחה עם רגעי שיא',
    costLevel: 2, effortLevel: 3, nightlifeLevel: 2, natureLevel: 4, beachLevel: 3,
    bestFor: 'קבוצה שרוצה לחוות הכל בלי לקרוס',
    highlights: ['Teide בשקיעה', 'Siam Park', 'שייט Los Gigantes', 'La Orotava'],
    days: makePlanDays()
  },
  {
    id: P2, name: 'טבע ואקשן',
    description: 'הליכות, תצפיות, ספורט ימי. אינטנסיבי ומתגמל.',
    vibe: 'אדרנלין ונופים בלי פשרות',
    costLevel: 2, effortLevel: 5, nightlifeLevel: 1, natureLevel: 5, beachLevel: 2,
    bestFor: 'מי שאוהב להתעורר מוקדם וללכת הרבה',
    highlights: ['Anaga', 'Masca', 'Teide hiking', 'קיאקים Los Gigantes'],
    days: makePlanDays()
  },
  {
    id: P3, name: 'חופים וחיי לילה',
    description: 'חוף ביום, מסיבות בלילה. נינוח ואקטיבי בערבים.',
    vibe: 'אנרגיה ים-תיכונית עם לילות גדולים',
    costLevel: 3, effortLevel: 2, nightlifeLevel: 5, natureLevel: 2, beachLevel: 5,
    bestFor: 'פרלמנט שבא לחגוג',
    highlights: ['Siam Park', 'Boat Party', 'Veronicas Strip', 'Noche de San Juan'],
    days: makePlanDays()
  }
];

const checklist = [
  { id: uid('chk'), title: 'להזמין כרטיסי Loro Parque', owner: 'רועי',   dueDate: '2026-06-10', status: 'פתוח'  as const, priority: 'גבוה'  as const, category: 'הזמנה'   as const },
  { id: uid('chk'), title: 'לסגור רכבל Teide',           owner: 'סער',    dueDate: '2026-06-12', status: 'פתוח'  as const, priority: 'גבוה'  as const, category: 'הזמנה'   as const },
  { id: uid('chk'), title: 'לסגור Siam Park',            owner: 'אבי',    dueDate: '2026-06-14', status: 'פתוח'  as const, priority: 'גבוה'  as const, category: 'הזמנה'   as const },
  { id: uid('chk'), title: 'הזמנת שייט Los Gigantes',     owner: 'אסף',    dueDate: '2026-06-14', status: 'פתוח'  as const, priority: 'גבוה'  as const, category: 'הזמנה'   as const },
  { id: uid('chk'), title: 'נעלי הליכה לכולם',           owner: 'כל אחד', dueDate: '2026-06-16', status: 'פתוח'  as const, priority: 'רגיל'  as const, category: 'אריזה'   as const },
  { id: uid('chk'), title: 'אדפטור לשקעים אירופיים',     owner: 'מתן',    dueDate: '2026-06-16', status: 'פתוח'  as const, priority: 'רגיל'  as const, category: 'אריזה'   as const },
  { id: uid('chk'), title: 'ביטוח נסיעות לכל הפרלמנט',    owner: 'גנצי',   dueDate: '2026-06-08', status: 'בתהליך'as const, priority: 'גבוה'  as const, category: 'מסמכים' as const },
  { id: uid('chk'), title: 'להחליט: Anaga או Masca ביום 19', owner: 'הקבוצה', dueDate: '2026-06-13', status: 'פתוח'  as const, priority: 'רגיל'  as const, category: 'החלטה'   as const },
];

const participants: Participant[] = [
  { id: 'p_roy',    name: 'רועי',  emoji: '🧭' },
  { id: 'p_saar',   name: 'סער',   emoji: '🌊' },
  { id: 'p_avi',    name: 'אבי',   emoji: '🎯' },
  { id: 'p_tzvika', name: 'צביקה', emoji: '☕' },
  { id: 'p_asaf',   name: 'אסף',   emoji: '🔥' },
  { id: 'p_matan',  name: 'מתן',   emoji: '🌿' },
  { id: 'p_ganzi',  name: 'גנצי',  emoji: '🍹' },
];

const decisions: Decision[] = [
  {
    id: 'dec_morning_19',
    title: 'מה עושים מחר בבוקר?',
    options: [
      { id: 'o1', label: 'Siam Park', votes: ['p_avi','p_asaf'] },
      { id: 'o2', label: 'חוף רגוע · Playa del Duque', votes: ['p_tzvika','p_ganzi'] },
      { id: 'o3', label: 'שייט · Los Gigantes', votes: ['p_saar','p_matan'] },
      { id: 'o4', label: 'Teide בשקיעה', votes: ['p_roy'] }
    ],
    status: 'פתוח',
    createdBy: 'p_roy',
    createdAt: Date.now() - 1000*60*60*5
  },
  {
    id: 'dec_dinner_first',
    title: 'איפה אוכלים בערב הראשון?',
    options: [
      { id: 'o1', label: 'טפאס מקומי · Puerto de la Cruz', votes: ['p_roy','p_saar','p_matan'] },
      { id: 'o2', label: 'דגים על הנמל', votes: ['p_avi','p_ganzi'] },
      { id: 'o3', label: 'מסעדה איטלקית קרובה', votes: ['p_tzvika','p_asaf'] }
    ],
    status: 'פתוח',
    createdBy: 'p_saar',
    createdAt: Date.now() - 1000*60*60*22
  }
];

export const SEED: AppState = {
  trip: {
    id: 'trip_tnf_2026',
    title: 'טנריף · הפרלמנט בטנריף · יוני 2026',
    startDate: DATES[0],
    endDate: DATES[7],
    travelersCount: 7,
    activePlanId: P1
  },
  plans,
  activities,
  checklist,
  participants,
  currentParticipantId: 'p_roy',
  changeLog: [],
  decisions,
  photos: [],
  expenses: [],
  settlements: [],
  feedback: [],
  schemaVersion: 7
};

export const PLAN_IDS = { BALANCED: P1, NATURE: P2, BEACH: P3 };
