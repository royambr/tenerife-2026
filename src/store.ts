import { useSyncExternalStore } from 'react';
import type { Activity, AppState, ChangeLogEntry, ChatMessage, ChecklistItem, DayPart, Decision, Expense, Settlement, TripPhoto } from './data/types';
import { SEED } from './data/seed';

const KEY = 'tenerife_2026_state_v2';
const OLD_KEY = 'tenerife_2026_state_v1';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return migrate(parsed);
    }
    // migrate v1 → v2
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const v1 = JSON.parse(old);
      const merged: AppState = {
        ...SEED,
        trip: v1.trip || SEED.trip,
        plans: v1.plans || SEED.plans,
        activities: v1.activities || SEED.activities,
        checklist: v1.checklist || SEED.checklist,
      };
      return merged;
    }
  } catch {}
  return SEED;
}

function migrate(s: any): AppState {
  const baseParticipants = SEED.participants;
  const validIds = new Set(baseParticipants.map(p => p.id));
  // v3: real participants replace mock list; always overwrite
  const participants = (s.schemaVersion && s.schemaVersion >= 3 && s.participants && s.participants.length)
    ? s.participants
    : baseParticipants;
  const currentParticipantId = validIds.has(s.currentParticipantId)
    ? s.currentParticipantId
    : 'p_roy';
  // v4: re-seed activities/plans (June 24 = Tenerife North TFN, not generic south airport).
  // Preserve user-mutated status/notes by id where possible.
  const needsReseed = !s.schemaVersion || s.schemaVersion < 4;
  let activitiesSource = s.activities || SEED.activities;
  if (needsReseed) {
    const prevById = new Map<string, any>((s.activities || []).map((a: any) => [a.id, a]));
    activitiesSource = SEED.activities.map((a: any) => {
      const prev = prevById.get(a.id);
      if (!prev) return a;
      // keep user-facing edits, but adopt new seed time/name/region/description fields
      return { ...a, status: prev.status || a.status, assignedTo: prev.assignedTo, notes: prev.notes };
    });
  }
  const plans = needsReseed ? SEED.plans : (s.plans || SEED.plans);
  // strip stale assignedTo
  const activities = activitiesSource.map((a: any) =>
    a && a.assignedTo && !validIds.has(a.assignedTo) ? { ...a, assignedTo: undefined } : a
  );
  // clean votes referencing stale participants
  const decisions = (s.decisions || SEED.decisions).map((d: any) => ({
    ...d,
    options: (d.options || []).map((o: any) => ({
      ...o,
      votes: (o.votes || []).filter((v: string) => validIds.has(v)),
    })),
  }));
  return {
    ...SEED,
    ...s,
    plans,
    participants,
    currentParticipantId,
    activities,
    changeLog: s.changeLog || [],
    decisions,
    photos: Array.isArray(s.photos) ? s.photos : [],
    expenses: Array.isArray(s.expenses) ? s.expenses : [],
    settlements: Array.isArray(s.settlements) ? s.settlements : [],
    schemaVersion: 5,
  };
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function emit() { listeners.forEach(l => l()); persist(); }

function uid(p = 'log') { return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`; }

function log(entry: Omit<ChangeLogEntry,'id'|'ts'|'who'> & { who?: string }) {
  const e: ChangeLogEntry = {
    id: uid('log'),
    ts: Date.now(),
    who: entry.who || state.currentParticipantId,
    action: entry.action,
    summary: entry.summary,
    beforeSnapshot: entry.beforeSnapshot,
    afterSnapshot: entry.afterSnapshot,
    scope: entry.scope || 'activity',
  };
  state = { ...state, changeLog: [e, ...state.changeLog].slice(0, 60) };
  toast(entry.summary, e.id);
  return e;
}

// ---------- toast / snackbar ----------
export interface ToastMsg { id: string; text: string; undoId?: string; ts: number; }
let toasts: ToastMsg[] = [];
const toastListeners = new Set<() => void>();
function toastEmit() { toastListeners.forEach(l => l()); }
function toast(text: string, undoId?: string) {
  const t: ToastMsg = { id: uid('t'), text, undoId, ts: Date.now() };
  toasts = [...toasts, t];
  toastEmit();
  setTimeout(() => {
    toasts = toasts.filter(x => x.id !== t.id);
    toastEmit();
  }, 4000);
}
export const toastStore = {
  get: () => toasts,
  subscribe: (l: () => void) => { toastListeners.add(l); return () => toastListeners.delete(l); },
  dismiss(id: string) { toasts = toasts.filter(x => x.id !== id); toastEmit(); }
};
export function useToasts() {
  return useSyncExternalStore(toastStore.subscribe, toastStore.get, toastStore.get);
}

// ---------- core store ----------
export const store = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  setActivePlan(planId: string) {
    const prev = state.trip.activePlanId;
    if (prev === planId) return;
    const name = state.plans.find(p => p.id === planId)?.name || planId;
    state = { ...state, trip: { ...state.trip, activePlanId: planId } };
    log({ action: 'plan', scope: 'plan', summary: `הוחלפה תוכנית פעילה ל"${name}"`, beforeSnapshot: { activePlanId: prev }, afterSnapshot: { activePlanId: planId } });
    emit();
  },
  setCurrentParticipant(id: string) {
    if (state.currentParticipantId === id) return;
    state = { ...state, currentParticipantId: id };
    // not logged — just a UI switch
    listeners.forEach(l => l()); persist();
  },
  upsertActivity(a: Activity, opts?: { silent?: boolean }) {
    const exists = state.activities.find(x => x.id === a.id);
    state = { ...state, activities: exists
      ? state.activities.map(x => x.id === a.id ? a : x)
      : [...state.activities, a]
    };
    if (!opts?.silent) {
      log({
        action: exists ? 'update' : 'create',
        summary: exists ? `עודכנה הפעילות "${a.name}"` : `נוספה פעילות "${a.name}"`,
        beforeSnapshot: exists,
        afterSnapshot: a,
      });
    }
    emit();
  },
  deleteActivity(id: string) {
    const before = state.activities.find(a => a.id === id);
    if (!before) return;
    state = { ...state, activities: state.activities.filter(a => a.id !== id) };
    log({ action: 'delete', summary: `נמחקה הפעילות "${before.name}"`, beforeSnapshot: before });
    emit();
  },
  duplicateActivity(id: string) {
    const orig = state.activities.find(a => a.id === id);
    if (!orig) return;
    const copy: Activity = { ...orig, id: 'act_' + Math.random().toString(36).slice(2,9), name: orig.name + ' (עותק)' };
    state = { ...state, activities: [...state.activities, copy] };
    log({ action: 'duplicate', summary: `שוכפלה "${orig.name}"`, afterSnapshot: copy });
    emit();
  },
  setStatus(id: string, status: Activity['status']) {
    const before = state.activities.find(a => a.id === id);
    if (!before || before.status === status) return;
    const after = { ...before, status };
    state = { ...state, activities: state.activities.map(a => a.id === id ? after : a) };
    log({ action: 'status', summary: `"${before.name}" סומנה כ"${status}"`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  moveActivityToDay(id: string, newDate: string) {
    const before = state.activities.find(a => a.id === id);
    if (!before || before.dayDate === newDate) return;
    const after = { ...before, dayDate: newDate };
    state = { ...state, activities: state.activities.map(a => a.id === id ? after : a) };
    log({ action: 'move', summary: `"${before.name}" הועברה ל-${newDate.slice(5)}`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  moveActivityToPart(id: string, newPart: DayPart) {
    const before = state.activities.find(a => a.id === id);
    if (!before || before.dayPart === newPart) return;
    const after = { ...before, dayPart: newPart };
    state = { ...state, activities: state.activities.map(a => a.id === id ? after : a) };
    const labels: Record<DayPart,string> = { morning:'בוקר', noon:'צהריים', evening:'ערב', night:'לילה', lateNight:'לילה מאוחר' };
    log({ action: 'movepart', summary: `"${before.name}" הועברה ל${labels[newPart]}`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  assignActivity(id: string, participantId?: string) {
    const before = state.activities.find(a => a.id === id);
    if (!before) return;
    const after = { ...before, assignedTo: participantId };
    state = { ...state, activities: state.activities.map(a => a.id === id ? after : a) };
    const pname = state.participants.find(p => p.id === participantId)?.name || 'אף אחד';
    log({ action: 'assign', summary: `"${before.name}" הוקצתה ל${pname}`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  toggleAttendee(activityId: string, participantId: string) {
    const before = state.activities.find(a => a.id === activityId);
    if (!before) return;
    const all = state.participants.map(p => p.id);
    const current = before.attendees ?? all;
    const isIn = current.includes(participantId);
    const next = isIn ? current.filter(x => x !== participantId) : [...current, participantId];
    // normalize: if everyone in → store undefined
    const attendees = next.length === all.length && all.every(x => next.includes(x)) ? undefined : next;
    const after = { ...before, attendees };
    state = { ...state, activities: state.activities.map(a => a.id === activityId ? after : a) };
    const pname = state.participants.find(p => p.id === participantId)?.name || '';
    log({ action: 'attend', summary: isIn ? `${pname} לא בא ל"${before.name}"` : `${pname} בא ל"${before.name}"`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  setActivityNote(id: string, notes: string) {
    const before = state.activities.find(a => a.id === id);
    if (!before) return;
    const after = { ...before, notes };
    state = { ...state, activities: state.activities.map(a => a.id === id ? after : a) };
    log({ action: 'note', summary: `נוספה הערה ל"${before.name}"`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  replaceActivity(id: string, replacement: Partial<Activity> & { name: string }) {
    const before = state.activities.find(a => a.id === id);
    if (!before) return;
    const after: Activity = { ...before, ...replacement };
    state = { ...state, activities: state.activities.map(a => a.id === id ? after : a) };
    log({ action: 'replace', summary: `"${before.name}" הוחלפה ב"${after.name}"`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  upsertChecklist(item: ChecklistItem) {
    const exists = state.checklist.find(x => x.id === item.id);
    state = { ...state, checklist: exists
      ? state.checklist.map(x => x.id === item.id ? item : x)
      : [...state.checklist, item]
    };
    log({ action: exists ? 'check_update' : 'check_create', scope: 'checklist',
          summary: exists ? `עודכן: "${item.title}"` : `נוסף לצ׳ק-ליסט: "${item.title}"`,
          beforeSnapshot: exists, afterSnapshot: item });
    emit();
  },
  toggleChecklist(id: string) {
    const before = state.checklist.find(c => c.id === id);
    if (!before) return;
    const status = before.status === 'הושלם' ? 'פתוח' : 'הושלם';
    state = { ...state, checklist: state.checklist.map(c => c.id === id ? { ...c, status } : c) };
    log({ action: 'check_toggle', scope: 'checklist',
          summary: status === 'הושלם' ? `הושלם: "${before.title}"` : `נפתח מחדש: "${before.title}"`,
          beforeSnapshot: before, afterSnapshot: { ...before, status } });
    emit();
  },
  deleteChecklist(id: string) {
    const before = state.checklist.find(c => c.id === id);
    if (!before) return;
    state = { ...state, checklist: state.checklist.filter(c => c.id !== id) };
    log({ action: 'check_delete', scope: 'checklist', summary: `נמחק: "${before.title}"`, beforeSnapshot: before });
    emit();
  },
  // decisions
  voteDecision(decisionId: string, optionId: string) {
    const me = state.currentParticipantId;
    const d = state.decisions.find(x => x.id === decisionId);
    if (!d) return;
    const newOptions = d.options.map(o => ({
      ...o,
      votes: o.id === optionId
        ? (o.votes.includes(me) ? o.votes : [...o.votes, me])
        : o.votes.filter(v => v !== me)
    }));
    const after = { ...d, options: newOptions };
    state = { ...state, decisions: state.decisions.map(x => x.id === decisionId ? after : x) };
    const optLabel = newOptions.find(o => o.id === optionId)?.label;
    log({ action: 'vote', scope: 'decision', summary: `הצבעה ב"${d.title}" → ${optLabel}`, beforeSnapshot: d, afterSnapshot: after });
    emit();
  },
  closeDecision(decisionId: string, winnerId: string) {
    const d = state.decisions.find(x => x.id === decisionId);
    if (!d) return;
    const after: Decision = { ...d, status: 'הוחלט', winnerId };
    state = { ...state, decisions: state.decisions.map(x => x.id === decisionId ? after : x) };
    const opt = after.options.find(o => o.id === winnerId);
    log({ action: 'decide', scope: 'decision', summary: `החלטה נסגרה: ${d.title} → ${opt?.label}`, beforeSnapshot: d, afterSnapshot: after });
    emit();
  },
  addDecision(title: string, options: string[]) {
    const d: Decision = {
      id: uid('dec'),
      title,
      options: options.filter(o => o.trim()).map((label, i) => ({ id: 'o' + i, label, votes: [] })),
      status: 'פתוח',
      createdBy: state.currentParticipantId,
      createdAt: Date.now()
    };
    state = { ...state, decisions: [d, ...state.decisions] };
    log({ action: 'decision_new', scope: 'decision', summary: `החלטה חדשה: "${title}"`, afterSnapshot: d });
    emit();
  },
  // ---------- chat ----------
  postMessage(activityId: string, text: string, photoIds?: string[]) {
    const before = state.activities.find(a => a.id === activityId);
    if (!before || !text.trim()) return;
    const msg: ChatMessage = {
      id: uid('msg'),
      ts: Date.now(),
      who: state.currentParticipantId,
      text: text.trim(),
      photoIds,
    };
    const after = { ...before, messages: [...(before.messages || []), msg] };
    state = { ...state, activities: state.activities.map(a => a.id === activityId ? after : a) };
    log({ action: 'msg_add', summary: `הודעה ב"${before.name}"`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  deleteMessage(activityId: string, messageId: string) {
    const before = state.activities.find(a => a.id === activityId);
    if (!before || !before.messages) return;
    const after = { ...before, messages: before.messages.filter(m => m.id !== messageId) };
    state = { ...state, activities: state.activities.map(a => a.id === activityId ? after : a) };
    log({ action: 'msg_del', summary: `נמחקה הודעה ב"${before.name}"`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  // ---------- photos ----------
  addPhoto(activityId: string, dataUrl: string, caption?: string) {
    const act = state.activities.find(a => a.id === activityId);
    if (!act) return;
    if (state.photos.length >= 30) {
      toast('הזיכרון מלא — מחק תמונות ישנות');
      return;
    }
    const p: TripPhoto = {
      id: uid('ph'),
      activityId,
      dayDate: act.dayDate,
      who: state.currentParticipantId,
      ts: Date.now(),
      dataUrl,
      caption,
    };
    const next = [...state.photos, p];
    const prev = state;
    state = { ...state, photos: next };
    try {
      persist();
    } catch {
      state = prev;
      toast('הזיכרון מלא — מחק תמונות ישנות');
      return;
    }
    log({ action: 'photo_add', summary: `נוספה תמונה ב"${act.name}"`, afterSnapshot: p });
    emit();
  },
  deletePhoto(photoId: string) {
    const before = state.photos.find(p => p.id === photoId);
    if (!before) return;
    state = { ...state, photos: state.photos.filter(p => p.id !== photoId) };
    const act = state.activities.find(a => a.id === before.activityId);
    log({ action: 'photo_del', summary: `נמחקה תמונה מ"${act?.name || ''}"`, beforeSnapshot: before });
    emit();
  },
  setPhotoCaption(photoId: string, caption: string) {
    const before = state.photos.find(p => p.id === photoId);
    if (!before) return;
    const after = { ...before, caption };
    state = { ...state, photos: state.photos.map(p => p.id === photoId ? after : p) };
    log({ action: 'photo_caption', summary: `עודכן כיתוב לתמונה`, beforeSnapshot: before, afterSnapshot: after });
    emit();
  },
  // ---------- expenses ----------
  addExpense(e: Omit<Expense, 'id' | 'ts' | 'currency'>) {
    const act = state.activities.find(a => a.id === e.activityId);
    const exp: Expense = { ...e, id: uid('exp'), ts: Date.now(), currency: '€' };
    state = { ...state, expenses: [...state.expenses, exp] };
    log({ action: 'exp_add', summary: `הוצאה €${exp.amountEUR} ב"${act?.name || ''}"`, afterSnapshot: exp });
    emit();
  },
  deleteExpense(id: string) {
    const before = state.expenses.find(e => e.id === id);
    if (!before) return;
    state = { ...state, expenses: state.expenses.filter(e => e.id !== id) };
    log({ action: 'exp_del', summary: `נמחקה הוצאה €${before.amountEUR}`, beforeSnapshot: before });
    emit();
  },
  addSettlement(fromId: string, toId: string, amountEUR: number) {
    const s: Settlement = { id: uid('set'), ts: Date.now(), fromId, toId, amountEUR };
    state = { ...state, settlements: [...state.settlements, s] };
    const fp = state.participants.find(p => p.id === fromId)?.name || '';
    const tp = state.participants.find(p => p.id === toId)?.name || '';
    log({ action: 'settle', summary: `${fp} סילק €${amountEUR} ל${tp}`, afterSnapshot: s });
    emit();
  },
  removeSettlement(id: string) {
    const before = state.settlements.find(s => s.id === id);
    if (!before) return;
    state = { ...state, settlements: state.settlements.filter(s => s.id !== id) };
    log({ action: 'settle_del', summary: `בוטל סילוק`, beforeSnapshot: before });
    emit();
  },
  undo(entryId: string) {
    const entry = state.changeLog.find(e => e.id === entryId);
    if (!entry || entry.undone) return;
    try {
      switch (entry.action) {
        case 'create':
          if (entry.afterSnapshot) {
            state = { ...state, activities: state.activities.filter(a => a.id !== entry.afterSnapshot.id) };
          }
          break;
        case 'delete':
          if (entry.beforeSnapshot) {
            state = { ...state, activities: [...state.activities, entry.beforeSnapshot] };
          }
          break;
        case 'duplicate':
          if (entry.afterSnapshot) {
            state = { ...state, activities: state.activities.filter(a => a.id !== entry.afterSnapshot.id) };
          }
          break;
        case 'msg_add': case 'msg_del':
          if (entry.beforeSnapshot) {
            const b = entry.beforeSnapshot as Activity;
            state = { ...state, activities: state.activities.map(a => a.id === b.id ? b : a) };
          }
          break;
        case 'photo_add':
          if (entry.afterSnapshot) state = { ...state, photos: state.photos.filter(p => p.id !== entry.afterSnapshot.id) };
          break;
        case 'photo_del':
          if (entry.beforeSnapshot) state = { ...state, photos: [...state.photos, entry.beforeSnapshot] };
          break;
        case 'photo_caption':
          if (entry.beforeSnapshot) {
            const b = entry.beforeSnapshot as TripPhoto;
            state = { ...state, photos: state.photos.map(p => p.id === b.id ? b : p) };
          }
          break;
        case 'exp_add':
          if (entry.afterSnapshot) state = { ...state, expenses: state.expenses.filter(e => e.id !== entry.afterSnapshot.id) };
          break;
        case 'exp_del':
          if (entry.beforeSnapshot) state = { ...state, expenses: [...state.expenses, entry.beforeSnapshot] };
          break;
        case 'settle':
          if (entry.afterSnapshot) state = { ...state, settlements: state.settlements.filter(s => s.id !== entry.afterSnapshot.id) };
          break;
        case 'settle_del':
          if (entry.beforeSnapshot) state = { ...state, settlements: [...state.settlements, entry.beforeSnapshot] };
          break;
        case 'update': case 'status': case 'move': case 'movepart': case 'assign': case 'note': case 'replace': case 'attend':
          if (entry.beforeSnapshot) {
            const b = entry.beforeSnapshot as Activity;
            state = { ...state, activities: state.activities.map(a => a.id === b.id ? b : a) };
          }
          break;
        case 'plan':
          if (entry.beforeSnapshot?.activePlanId) {
            state = { ...state, trip: { ...state.trip, activePlanId: entry.beforeSnapshot.activePlanId } };
          }
          break;
        case 'check_create':
          if (entry.afterSnapshot) state = { ...state, checklist: state.checklist.filter(c => c.id !== entry.afterSnapshot.id) };
          break;
        case 'check_delete':
          if (entry.beforeSnapshot) state = { ...state, checklist: [...state.checklist, entry.beforeSnapshot] };
          break;
        case 'check_update': case 'check_toggle':
          if (entry.beforeSnapshot) {
            const b = entry.beforeSnapshot as ChecklistItem;
            state = { ...state, checklist: state.checklist.map(c => c.id === b.id ? b : c) };
          }
          break;
        case 'vote': case 'decide':
          if (entry.beforeSnapshot) {
            const b = entry.beforeSnapshot as Decision;
            state = { ...state, decisions: state.decisions.map(d => d.id === b.id ? b : d) };
          }
          break;
        case 'decision_new':
          if (entry.afterSnapshot) state = { ...state, decisions: state.decisions.filter(d => d.id !== entry.afterSnapshot.id) };
          break;
      }
      state = { ...state, changeLog: state.changeLog.map(e => e.id === entryId ? { ...e, undone: true } : e) };
      toast(`בוטל: ${entry.summary}`);
      emit();
    } catch {}
  },
  reset() { state = SEED; emit(); }
};

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state));
}

export function useNow(intervalMs = 60_000) {
  const get = () => Date.now();
  return useSyncExternalStore(
    (cb) => { const id = setInterval(cb, intervalMs); return () => clearInterval(id); },
    get, get
  );
}

// edit mode (UI-only, not persisted)
let editMode = false;
const editListeners = new Set<() => void>();
export const editStore = {
  get: () => editMode,
  toggle: () => { editMode = !editMode; editListeners.forEach(l => l()); },
  set: (v: boolean) => { editMode = v; editListeners.forEach(l => l()); },
  subscribe: (l: () => void) => { editListeners.add(l); return () => editListeners.delete(l); }
};
export function useEditMode() {
  return useSyncExternalStore(editStore.subscribe, editStore.get, editStore.get);
}

// expose so other modules can write toasts
export const _internalToast = toast;
