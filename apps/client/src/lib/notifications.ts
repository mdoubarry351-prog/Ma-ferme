import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from './supabase';

export type Notif = { id: string; order_id: string | null; title: string; body: string; read_at: string | null; created_at: string };

export function useUnreadCount(enabled: boolean) {
  const [count, setCount] = useState(0);
  const refresh = useCallback(async () => {
    if (!enabled) return setCount(0);
    const r = await supabase.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
    if (!r.error) setCount(r.count ?? 0);
  }, [enabled]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [enabled, refresh]);
  return count;
}

export async function fetchNotifications() {
  return supabase.from('notifications').select('id, order_id, title, body, read_at, created_at').order('created_at', { ascending: false }).limit(100);
}

export async function markAllRead(ids: string[]) {
  if (!ids.length) return;
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).in('id', ids);
}

export const ago = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return 'à l’instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'hier' : `il y a ${d} jours`;
};
