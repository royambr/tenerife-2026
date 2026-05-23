import { useEffect, useSyncExternalStore } from 'react';
import type { Activity, AppState, ChecklistItem } from './data/types';
import { SEED } from './data/seed';

const KEY = 'tenerife_2026_state_v1';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED;
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function emit() { listeners.forEach(l => l()); persist(); }

export const store = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  setActivePlan(planId: string) {
    state = { ...state, trip: { ...state.trip, activePlanId: planId } }; emit();
  },
  upsertActivity(a: Activity) {
    const exists = state.activities.find(x => x.id === a.id);
    state = { ...state, activities: exists
      ? state.activities.map(x => x.id === a.id ? a : x)
      : [...state.activities, a]
    }; emit();
  },
  deleteActivity(id: string) {
    state = { ...state, activities: state.activities.filter(a => a.id !== id) }; emit();
  },
  duplicateActivity(id: string) {
    const orig = state.activities.find(a => a.id === id);
    if (!orig) return;
    const copy: Activity = { ...orig, id: 'act_' + Math.random().toString(36).slice(2,9), name: orig.name + ' (עותק)' };
    state = { ...state, activities: [...state.activities, copy] }; emit();
  },
  setStatus(id: string, status: Activity['status']) {
    state = { ...state, activities: state.activities.map(a => a.id === id ? { ...a, status } : a) }; emit();
  },
  upsertChecklist(item: ChecklistItem) {
    const exists = state.checklist.find(x => x.id === item.id);
    state = { ...state, checklist: exists
      ? state.checklist.map(x => x.id === item.id ? item : x)
      : [...state.checklist, item]
    }; emit();
  },
  toggleChecklist(id: string) {
    state = { ...state, checklist: state.checklist.map(c => c.id === id
      ? { ...c, status: c.status === 'הושלם' ? 'פתוח' : 'הושלם' } : c) }; emit();
  },
  deleteChecklist(id: string) {
    state = { ...state, checklist: state.checklist.filter(c => c.id !== id) }; emit();
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
