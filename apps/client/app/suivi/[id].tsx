import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { messageFor } from '../../src/lib/errors';
import { dateOnly, dayLong, gnf } from '../../src/lib/format';
import { METHOD_LABEL, ORDER_SELECT, ORDER_STATUS, OrderRow, orderNo, PAYMENT_STATUS, payStatus } from '../../src/lib/orders';
import { supabase } from '../../src/lib/supabase';
import { color } from '../../src/lib/theme';
import { BackHeader, Banner, Card, Loading, Pill, Row, s, Screen, T } from '../../src/ui/kit';
import { PayCard } from '../../src/ui/pay';

type Detail = OrderRow & {
  order_status_history: { status: string; created_at: string }[];
  order_items_full: { product_name: string; quantity: number; unit_price_gnf: number; line_total_gnf: number }[];
  subtotal_gnf: number; delivery_fee_gnf: number; discount_gnf: number | null;
};
const STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
const STEP_LABEL: Record<string, string> = {
  pending: 'Commande reçue', confirmed: 'Confirmée par l’équipe', preparing: 'En préparation', ready: 'Prête', delivering: 'En livraison', delivered: 'Livrée',
};
const time = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')} à ${d.toISOString().slice(11, 16)}`;
};

export default function Suivi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [o, setO] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await supabase
      .from('orders')
      .select(`${ORDER_SELECT}, subtotal_gnf, delivery_fee_gnf, discount_gnf, order_status_history(status, created_at), order_items_full:order_items(product_name, quantity, unit_price_gnf, line_total_gnf)`)
      .eq('id', String(id))
      .maybeSingle();
    if (r.error || !r.data) setError(messageFor(r.error ?? 'ORDER_NOT_FOUND'));
    else setO(r.data as unknown as Detail);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (error) return <View style={{ flex: 1, backgroundColor: color.shell }}><BackHeader title="Suivi" /><Screen padTop={false}><Banner tone="bad" title={error} /></Screen></View>;
  if (!o) return <Loading />;

  const reached = new Map(o.order_status_history.map((h) => [h.status, h.created_at]));
  const cancelled = o.status === 'cancelled';
  const currentIdx = STEPS.indexOf(o.status);
  const when = o.delivery_snapshot?.starts_at ? dayLong(o.delivery_snapshot.starts_at) : o.delivery_date ? dateOnly(o.delivery_date) : '—';
  const os = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
  const ps = PAYMENT_STATUS[payStatus(o)] ?? PAYMENT_STATUS.pending;

  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader title={`Commande n° ${orderNo(o)}`} subtitle={`Livraison ${when}`} />
      <Screen padTop={false}>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          <Pill label={`Commande : ${os.label.toLowerCase()}`} tone={os.tone} />
          <Pill label={`Paiement : ${ps.label.toLowerCase()}`} tone={ps.tone} />
        </Row>

        <PayCard order={o} onChanged={load} />

        <Card>
          <T v="h2">Suivi</T>
          {cancelled ? (
            <Banner tone="bad" title="Commande annulée" body={reached.get('cancelled') ? `Le ${time(reached.get('cancelled')!)}` : undefined} />
          ) : (
            STEPS.map((st, i) => {
              const done = i <= currentIdx;
              const at = reached.get(st) ?? (st === 'pending' ? o.created_at : undefined);
              return (
                <View key={st} style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ alignItems: 'center', width: 22 }}>
                    <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: done ? color.green : '#FFFFFF', borderWidth: 2, borderColor: done ? color.green : color.border }} />
                    {i < STEPS.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 22, backgroundColor: i < currentIdx ? color.green : color.border }} /> : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 10 }}>
                    <T v={i === currentIdx ? 'bodyBold' : 'body'} style={{ color: done ? color.ink : color.muted }}>{STEP_LABEL[st]}</T>
                    {done && at ? <T v="tiny">{time(at)}</T> : null}
                  </View>
                </View>
              );
            })
          )}
        </Card>

        <Card>
          <T v="h2">Détail</T>
          {o.order_items_full.map((it, i) => (
            <View key={i} style={s.rowBetween}><T v="small">{it.quantity} × {it.product_name}</T><T v="smallBold">{gnf(it.line_total_gnf)}</T></View>
          ))}
          {o.discount_gnf ? <View style={s.rowBetween}><T v="small">Remise</T><T v="smallBold">− {gnf(o.discount_gnf)}</T></View> : null}
          <View style={s.rowBetween}><T v="small">Livraison</T><T v="smallBold">{o.delivery_fee_gnf ? gnf(o.delivery_fee_gnf) : 'Offerte'}</T></View>
          <View style={{ height: 1, backgroundColor: color.line }} />
          <View style={s.rowBetween}><T v="bodyBold">Total</T><T v="bodyBold">{gnf(o.total_gnf)}</T></View>
          <T v="tiny">{METHOD_LABEL[o.payment_method] ?? o.payment_method} · {[o.address_snapshot?.quartier, o.address_snapshot?.commune].filter(Boolean).join(', ')}</T>
        </Card>
      </Screen>
    </View>
  );
}
