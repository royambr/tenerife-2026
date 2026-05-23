import type { Category } from './types';

export type Pace = 'מלא' | 'מאוזן' | 'רגוע';

export interface ParticipantProfile {
  id: string;
  blurb: string;
  loves: Category[] | 'all';
  dislikes?: Category[];
  pace: Pace;
  kosher?: boolean;
  noLongHikes?: boolean;
  notes?: string;
}

export const PROFILES: Record<string, ParticipantProfile> = {
  p_roy: {
    id: 'p_roy',
    blurb: 'אוהב הכל — חיות, טבע, חופים, מסיבות, מסעדות, שייט. רוצה לחרוש את האי.',
    loves: 'all',
    pace: 'מלא',
  },
  p_saar: {
    id: 'p_saar',
    blurb: 'כמו רועי בלי שופינג.',
    loves: 'all',
    dislikes: ['שופינג'],
    pace: 'מלא',
  },
  p_avi: {
    id: 'p_avi',
    blurb: 'אוהב הכל — בכל פעילות הוא בעניין.',
    loves: 'all',
    pace: 'מלא',
  },
  p_tzvika: {
    id: 'p_tzvika',
    blurb: 'פחות בקטע של טיולים ארוכים — לא אוהב ללכת הרבה.',
    loves: 'all',
    pace: 'מאוזן',
    kosher: true,
    noLongHikes: true,
    notes: 'בלי טיולים ארוכים',
  },
  p_asaf: {
    id: 'p_asaf',
    blurb: 'אוהב הכל. שומר כשרות — לא חזיר ולא בשר וחלב, מסעדה לא חייבת להיות כשרה.',
    loves: 'all',
    pace: 'מלא',
    kosher: true,
  },
  p_matan: {
    id: 'p_matan',
    blurb: 'קצת יותר רגוע — פחות מקומות ביום.',
    loves: 'all',
    pace: 'רגוע',
  },
  p_ganzi: {
    id: 'p_ganzi',
    blurb: 'טיפה יותר רגוע בכמות המקומות באותו היום.',
    loves: 'all',
    pace: 'רגוע',
  },
};

export function profileOf(id: string): ParticipantProfile | undefined {
  return PROFILES[id];
}

export function profileLovesCategory(p: ParticipantProfile, c: Category): boolean {
  if (p.loves === 'all') return !(p.dislikes || []).includes(c);
  return p.loves.includes(c);
}
