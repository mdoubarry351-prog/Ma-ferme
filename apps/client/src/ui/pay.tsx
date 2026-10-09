import { useEffect, useState } from 'react';
import { useApp } from '../lib/app-state';
import { messageFor } from '../lib/errors';
import { gnf } from '../lib/format';
import { METHOD_LABEL, OrderRow, payStatus } from '../lib/orders';
import { supabase } from '../lib/supabase';
import { Banner, Button, Card, Field, T } from './kit';

// Paiement mobile d'une commande en attente (MTN / Orange, quand les comptes marchands sont actifs).
export function PayCard({ order, onChanged }: { order: OrderRow; onChanged: () => void }) {
  const { session } = useApp();
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const ps = payStatus(order);
  const canPay = order.status === 'pending' && (ps === 'pending' || ps === 'failed');

  useEffect(() => {
    if (!session) return;
    supabase.from('profiles').select('phone').eq('id', session.user.id).maybeSingle().then(({ data }) => {
      if (data?.phone) setPhone(data.phone.replace(/^\+224/, ''));
    });
  }, [session]);

  if (!canPay) return null;
  const pay = async () => {
    setPaying(true);
    setMsg(null);
    try {
      const { data, error: e } = await supabase.functions.invoke('initiate-payment', {
        body: { order_id: order.id, action: 'initiate', phone: '+224' + phone.replace(/\D/g, '') },
      });
      if (e) {
        let code = '';
        try { code = (await (e as any).context?.json?.())?.error ?? ''; } catch {}
        throw new Error(code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' ? 'PAYMENT_NOT_READY' : code || 'NETWORK');
      }
      setMsg(data?.status === 'paid' ? 'Paiement reçu. Merci !' : 'Valide le paiement sur ton téléphone, puis reviens ici.');
      onChanged();
    } catch (err) {
      setMsg(messageFor(err));
    } finally {
      setPaying(false);
    }
  };
  return (
    <Card>
      <T v="h2">Payer {gnf(order.total_gnf)}</T>
      <Field label={`Numéro ${METHOD_LABEL[order.payment_method] ?? ''}`} prefix="+224" keyboardType="phone-pad" value={phone} onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 9))} />
      <Button label="Payer maintenant" disabled={!/^6\d{8}$/.test(phone)} loading={paying} onPress={pay} />
      {order.payment_due_at ? <T v="tiny">À payer avant {new Date(order.payment_due_at).toISOString().slice(11, 16)} (heure de Conakry), sinon la réservation est libérée.</T> : null}
      {msg ? <Banner title={msg} /> : null}
    </Card>
  );
}
