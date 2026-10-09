import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useApp } from '../src/lib/app-state';
import { messageFor } from '../src/lib/errors';
import { ago, fetchNotifications, markAllRead, Notif } from '../src/lib/notifications';
import { color } from '../src/lib/theme';
import { BackHeader, Banner, Card, Loading, Screen, T } from '../src/ui/kit';

export default function Notifications() {
  const { session } = useApp();
  const [list, setList] = useState<Notif[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      fetchNotifications().then((r) => {
        if (r.error) return setError(messageFor(r.error));
        const rows = (r.data ?? []) as Notif[];
        setList(rows);
        // Affichées = lues (les non lues restent marquées d'un point pendant cette visite).
        markAllRead(rows.filter((n) => !n.read_at).map((n) => n.id));
      });
    }, [session]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader title="Notifications" />
      {!list && !error ? <Loading /> : (
        <Screen padTop={false}>
          {error ? <Banner tone="bad" title={error} /> : null}
          {list && list.length === 0 ? (
            <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
              <T v="bodyBold">Aucune notification</T>
              <T v="small" style={{ textAlign: 'center' }}>Tu seras prévenu ici à chaque étape de tes commandes.</T>
            </Card>
          ) : null}
          {list?.map((n) => (
            <Pressable key={n.id} disabled={!n.order_id} onPress={() => n.order_id && router.push({ pathname: '/suivi/[id]', params: { id: n.order_id } })}>
              <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 6, backgroundColor: n.read_at ? 'transparent' : color.sun }} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="bodyBold">{n.title}</T>
                  <T v="small">{n.body}</T>
                  <T v="tiny">{ago(n.created_at)}</T>
                </View>
                {n.order_id ? <T v="bodyBold" style={{ color: color.muted }}>›</T> : null}
              </Card>
            </Pressable>
          ))}
        </Screen>
      )}
    </View>
  );
}
