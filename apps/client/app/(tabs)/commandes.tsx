import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../src/lib/app-state';
import { messageFor } from '../../src/lib/errors';
import { dateOnly, dayLong, gnf } from '../../src/lib/format';
import { fetchOrders, ORDER_STATUS, OrderRow, orderNo, PAYMENT_STATUS, payStatus, units } from '../../src/lib/orders';
import { supabase } from '../../src/lib/supabase';
import { color } from '../../src/lib/theme';
import { Banner, Button, Card, Loading, Pill, Row, s, Screen, T } from '../../src/ui/kit';

export default function Commandes() {
  const { session, authReady, setQty, setPreferredAddressId } = useApp();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redoing, setRedoing] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const r = await fetchOrders();
    if (r.error) setError(messageFor(r.error));
    else { setError(null); setOrders(r.data as unknown as OrderRow[]); }
  }, [session]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // « Refaire cette commande » : le serveur revérifie produit, prix et adresse ; le client revoit tout avant de payer.
  const redo = async (o: OrderRow) => {
    setRedoing(o.id);
    setError(null);
    const r = await supabase.rpc('reorder_details', { p_order: o.id });
    setRedoing(null);
    if (r.error) return setError(messageFor(r.error));
    const d = r.data as { address_id: string | null; items: { quantity: number }[] };
    const q = d.items?.reduce((n, i) => n + i.quantity, 0);
    if (q) setQty(q);
    setPreferredAddressId(d.address_id ?? null);
    router.push('/commande');
  };

  if (authReady && !session)
    return (
      <Screen>
        <T v="title">Mes commandes</T>
        <T v="small">Connecte-toi pour voir tes commandes.</T>
        <Button label="Me connecter" onPress={() => router.push({ pathname: '/connexion', params: { next: '/commandes' } })} />
      </Screen>
    );
  if (!orders) return error ? <Screen><Banner tone="bad" title={error} /></Screen> : <Loading />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.shell }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <T v="title">Mes commandes</T>
      {error ? <Banner tone="bad" title={error} /> : null}
      {orders.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
          <T v="bodyBold">Aucune commande pour le moment</T>
          <T v="small" style={{ textAlign: 'center' }}>Tes commandes et leur suivi apparaîtront ici.</T>
        </Card>
      ) : null}
      {orders.map((o) => {
        const os = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
        const ps = PAYMENT_STATUS[payStatus(o)] ?? PAYMENT_STATUS.pending;
        const active = !['delivered', 'cancelled'].includes(o.status);
        const when = o.delivery_snapshot?.starts_at ? dayLong(o.delivery_snapshot.starts_at) : o.delivery_date ? dateOnly(o.delivery_date) : '';
        return (
          <Card key={o.id} selected={active}>
            <View style={s.rowBetween}>
              <View style={{ flex: 1 }}>
                <T v="bodyBold" style={{ fontSize: 17 }}>{when}</T>
                <T v="small">N° {orderNo(o)} · {units(o)} alvéoles</T>
              </View>
              <T v="bodyBold">{gnf(o.total_gnf)}</T>
            </View>
            <Row style={{ gap: 8, flexWrap: 'wrap' }}>
              <Pill label={`Commande : ${os.label.toLowerCase()}`} tone={os.tone} />
              <Pill label={`Paiement : ${ps.label.toLowerCase()}`} tone={ps.tone} />
            </Row>
            {active ? (
              <Button label="Voir le suivi" style={{ height: 46 }} onPress={() => router.push({ pathname: '/confirmation/[id]', params: { id: o.id } })} />
            ) : (
              <Button kind="outline" label="↻ Refaire cette commande" loading={redoing === o.id} onPress={() => redo(o)} />
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}
