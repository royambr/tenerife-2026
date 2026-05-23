import type { Activity, CostLevel } from './types';

const COST_TABLE: Record<CostLevel, number> = { 1: 10, 2: 30, 3: 60, 4: 100 };

function parseNumeric(s?: string): number | undefined {
  if (!s) return undefined;
  const m = s.match(/(\d+)/);
  return m ? +m[1] : undefined;
}

export function activityCostPerPerson(a: Activity): number {
  const explicit = parseNumeric(a.costEstimate);
  return explicit ?? COST_TABLE[a.costLevel] ?? 0;
}

export function dayCostForParticipant(activities: Activity[], participantId: string, allParticipantIds: string[]): number {
  let sum = 0;
  for (const a of activities) {
    if (a.category === 'מלון' || a.category === 'נסיעה / לוגיסטיקה' || a.category === 'טיסה') continue;
    const attendees = a.attendees ?? allParticipantIds;
    if (!attendees.includes(participantId)) continue;
    sum += activityCostPerPerson(a);
  }
  return sum;
}

export function tripCostForParticipant(activities: Activity[], participantId: string, allParticipantIds: string[]): number {
  return dayCostForParticipant(activities, participantId, allParticipantIds);
}
