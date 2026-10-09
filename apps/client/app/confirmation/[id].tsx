import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../../src/lib/app-state';
import { messageFor } from '../../src/lib/errors';
import { dateOnly, dayLong, gnf } from '../../src/lib/format';
import { fetchOrder, METHOD_LABEL, ORDER_STATUS, OrderRow, orderNo, PAYMENT_STATUS, payStatus, units } from '../../src/lib/orders';
import { supabase } from '../../src/lib/supabase';
import { color } from '../../src/lib/theme';
import { Banner, Button, Card, Loading, Pill, s, Screen, T } from '../../src/ui/kit';
import { PayCard } from '../../src/ui/pay';

export default function Confirmation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useApp();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetchOrder(String(id));
    if (r.error || !r.data) setError(messageFor(r.error ?? 'ORDER_NOT_FOUND'));
    else setOrder(r.data as unknown as OrderRow);
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!session) return;
    supabase.from('profiles').select('phone').eq('id', session.user.id).maybeSingle().then(({ data }) => {
      if (data?.phone) setPhone(data.phone.replace(/^\+224/, ''));
    });
  }, [session]);

  if (error) return <Screen><Banner tone="bad" title={error} /><Button label="Mes commandes" onPress={() => router.replace('/commandes')} /></Screen>;
  if (!order) return <Loading />;

  const ps = payStatus(order);
  const os = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
  const pss = PAYMENT_STATUS[ps] ?? PAYMENT_STATUS.pending;
  const when = order.delivery_snapshot?.starts_at ? dayLong(order.delivery_snapshot.starts_at) : order.delivery_date ? dateOnly(order.delivery_date) : '—';
  const where = [order.address_snapshot?.quartier, order.address_snapshot?.commune].filter(Boolean).join(', ');
  const canPay = order.status === 'pending' && (ps === 'pending' || ps === 'failed');

  const pay = async () => {
    setPaying(true);
    setPayMsg(null);
    try {
      const { data, error: e } = await supabase.functions.invoke('initiate-payment', {
        body: { order_id: order.id, action: 'initiate', phone: '+224' + phone.replace(/\D/g, '') },
      });
      if (e) {
        let code = '';
        try { code = (await (e as any).context?.json?.())?.error ?? ''; } catch {}
        throw new Error(code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' ? 'PAYMENT_NOT_READY' : code || 'NETWORK');
      }
      setPayMsg(data?.status === 'paid' ? 'Paiement reçu. Merci !' : 'Valide le paiement sur ton téléphone, puis reviens ici.');
      load();
    } catch (err) {
      setPayMsg(messageFor(err));
    } finally {
      setPaying(false);
    }
  };

  return (
    <Screen
      footer={
        <>
          <Button label="Suivre ma commande" onPress={() => router.replace('/commandes')} />
          <Button kind="ghost" label="Retour à l’accueil" onPress={() => router.replace('/')} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 10, paddingTop: 24 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: color.green, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={38} height={38} viewBox="0 0 24 24"><Path d="M5 12l5 5 9-10" stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </View>
        <T v="title">Commande enregistrée</T>
        <T v="small">Commande n° {orderNo(order)} · {units(order)} alvéoles</T>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Card style={{ flex: 1, padding: 14, gap: 6 }}>
          <T v="tiny">Commande</T>
          <Pill label={os.label} tone={os.tone} />
          <T v="tiny">{order.status === 'pending' ? 'L’équipe va la confirmer' : ''}</T>
        </Card>
        <Card style={{ flex: 1, padding: 14, gap: 6 }}>
          <T v="tiny">Paiement</T>
          <Pill label={pss.label} tone={pss.tone} />
          <T v="tiny">{METHOD_LABEL[order.payment_method] ?? order.payment_method} · {gnf(order.total_gnf)}</T>
        </Card>
      </View>

      <Card style={{ padding: 0, gap: 0 }}>
        <View style={[s.rowBetween, { padding: 14, borderBottomWidth: 1, borderBottomColor: color.line }]}><T v="small">Livraison</T><T v="bodyBold">{when}</T></View>
        <View style={[s.rowBetween, { padding: 14 }]}><T v="small">Adresse</T><T v="bodyBold">{where || '—'}</T></View>
      </Card>

      <PayCard order={order} onChanged={load} />
    </Screen>
  );
}
