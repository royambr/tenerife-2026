import { useEffect } from 'react';
import { supabase } from './supabase';
import { store } from '../store';
import type { FeedbackEntry } from '../data/types';

// Drop-in replacements that write to both local store and Supabase

export async function addFeedback(input: { text: string; screen?: string; rating?: 1|2|3|4|5 }) {
  store.addFeedback(input);
  const entry = store.get().feedback[0]; // just added at index 0
  await supabase.from('feedback').insert({
    id: entry.id,
    ts: entry.ts,
    who: entry.who,
    text: entry.text,
    screen: entry.screen ?? null,
    rating: entry.rating ?? null,
  });
}

export async function deleteFeedback(id: string) {
  store.deleteFeedback(id);
  await supabase.from('feedback').delete().eq('id', id);
}

export async function clearFeedback() {
  const ids = store.get().feedback.map(f => f.id);
  store.clearFeedback();
  if (ids.length) await supabase.from('feedback').delete().in('id', ids);
}

// Hook: load all feedback from Supabase + subscribe to real-time changes
export function useFeedbackSync() {
  useEffect(() => {
    supabase
      .from('feedback')
      .select('*')
      .order('ts', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const entries: FeedbackEntry[] = data.map(r => ({
          id: r.id,
          ts: r.ts,
          who: r.who,
          text: r.text,
          screen: r.screen ?? undefined,
          rating: r.rating ?? undefined,
        }));
        store.setFeedback(entries);
      });

    const channel = supabase
      .channel('feedback-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback' }, payload => {
        const r = payload.new as any;
        const current = store.get().feedback;
        if (current.find(f => f.id === r.id)) return;
        const entry: FeedbackEntry = {
          id: r.id, ts: r.ts, who: r.who, text: r.text,
          screen: r.screen ?? undefined, rating: r.rating ?? undefined,
        };
        store.setFeedback([entry, ...current]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'feedback' }, payload => {
        const id = (payload.old as any).id;
        store.setFeedback(store.get().feedback.filter(f => f.id !== id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
