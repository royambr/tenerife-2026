export type Status = 'מתוכנן' | 'הוזמן' | 'אופציונלי' | 'דורש החלטה' | 'בוצע' | 'בוטל' | 'בסיכון' | 'דולג';
export type Category =
  | 'טבע' | 'חוף' | 'פארק מים' | 'שייט' | 'ספורט ימי'
  | 'עיר / עיירה' | 'מסעדה' | 'בר' | 'מועדון / מסיבה'
  | 'שופינג' | 'תצפית' | 'חיות' | 'נסיעה / לוגיסטיקה'
  | 'מלון' | 'טיסה' | 'אחר';
export type DayPart = 'morning' | 'noon' | 'evening' | 'night' | 'lateNight';
export type CostLevel = 1 | 2 | 3 | 4;
export type Intensity = 'רגוע' | 'בינוני' | 'עמוס';
export type Region =
  | 'צפון' | 'צפון-מזרח' | 'צפון-מערב' | 'מרכז'
  | 'מרכז-מערב' | 'מרכז-מזרח' | 'דרום'
  | 'דרום-מזרח' | 'דרום-מערב' | 'מחוץ לטנריף';

export interface Activity {
  id: string;
  planId: string;
  dayDate: string; // YYYY-MM-DD
  dayPart: DayPart;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  name: string;
  description?: string;
  whyToday?: string;
  category: Category;
  region: Region;
  costEstimate?: string;
  costLevel: CostLevel;
  openingHours?: string;
  duration?: string;
  preparation?: string[];
  bookingRequired?: boolean;
  status: Status;
  priority?: 'נמוך' | 'רגיל' | 'גבוה';
  mapsUrl?: string;
  wazeUrl?: string;
  bookingUrl?: string;
  sourceUrl?: string;
  groupNotes?: string;
  alternatives?: string[];
  assignedTo?: string; // participant id
  notes?: string;
  attendees?: string[]; // participant ids; undefined means "all in"
}

export interface Day {
  id: string;
  date: string;
  title: string;
  sleepingAt: string;
  intensity: Intensity;
  notes?: string;
  alerts?: string[];
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  vibe: string;
  costLevel: CostLevel;
  effortLevel: 1|2|3|4|5;
  nightlifeLevel: 1|2|3|4|5;
  natureLevel: 1|2|3|4|5;
  beachLevel?: 1|2|3|4|5;
  bestFor: string;
  highlights: string[];
  days: Day[];
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  travelersCount: number;
  activePlanId: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  owner?: string;
  dueDate?: string;
  status: 'פתוח' | 'בתהליך' | 'הושלם';
  priority: 'נמוך' | 'רגיל' | 'גבוה';
  relatedActivityId?: string;
  category: 'הזמנה' | 'אריזה' | 'החלטה' | 'מסמכים' | 'אחר';
}

export interface Participant {
  id: string;
  name: string;
  emoji?: string;
}

export interface ChangeLogEntry {
  id: string;
  ts: number;
  who: string; // participant id
  action: string; // short code like 'status' / 'replace' / 'move' / 'delete' / ...
  summary: string; // human-readable Hebrew summary
  beforeSnapshot?: any;
  afterSnapshot?: any;
  undone?: boolean;
  scope?: 'activity' | 'checklist' | 'decision' | 'plan' | 'other';
}

export interface DecisionOption {
  id: string;
  label: string;
  votes: string[]; // participant ids
}
export interface Decision {
  id: string;
  title: string;
  options: DecisionOption[];
  status: 'פתוח' | 'הוחלט';
  winnerId?: string;
  createdBy: string;
  createdAt: number;
  relatedActivityId?: string;
}

export interface AppState {
  trip: Trip;
  plans: Plan[];
  activities: Activity[];
  checklist: ChecklistItem[];
  participants: Participant[];
  currentParticipantId: string;
  changeLog: ChangeLogEntry[];
  decisions: Decision[];
  schemaVersion?: number;
}
