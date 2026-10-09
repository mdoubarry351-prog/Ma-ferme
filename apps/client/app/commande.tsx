import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { salesOpen, useApp } from '../src/lib/app-state';
import { messageFor } from '../src/lib/errors';
import { dayShort, gnf, weekLabel } from '../src/lib/format';
import { supabase } from '../src/lib/supabase';
import { color, font } from '../src/lib/theme';
import { BackHeader, Banner, Button, Card, Loading, Pill, Row, s, Screen, T } from '../src/ui/kit';

type Address = { id: string; label: string | null; recipient_name: string | null; commune: string | null; quartier: string | null; landmark: string | null; zone_id: string | null; is_primary: boolean };
type Slot = { id: string; zone_id: string; starts_at: string; remaining: number };
type Method = { code: string; label: string; enabled: boolean };
type Quote = { id: string; can_submit: boolean; blocked_reason: string | null; payload: { subtotal_gnf: number; delivery_fee_gnf: number; total_gnf: number; discount_gnf?: number } };

const METHOD_LABEL: Record<string, string> = { orange_money: 'Orange Money', mtn_momo: 'MTN MoMo' };

export default function Commande() {
  const { session, authReady, cityId, offer, qty, settings, preferredAddressId, setPreferredAddressId } = useApp();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const idem = useRef<{ quote: string; key: string } | null>(null);

  useEffect(() => {
    if (authReady && !session) router.replace({ pathname: '/connexion', params: { next: '/commande' } });
  }, [authReady, session]);

  const load = useCallback(async () => {
    if (!session || !cityId) return;
    setError(null);
    const [a, o] = await Promise.all([
      supabase.from('addresses').select('id, label, recipient_name, commune, quartier, landmark, zone_id, is_primary').order('is_primary', { ascending: false }).order('created_at'),
      supabase.rpc('checkout_options', { p_city_id: cityId }),
    ]);
    if (a.error || o.error) {
      setError(messageFor(a.error ?? o.error));
      setAddresses([]);
      return;
    }
    const list = (a.data ?? []) as Address[];
    setAddresses(list);
    const opts = o.data as { slots: Slot[]; payment_methods: Method[] };
    setSlots(opts.slots ?? []);
    const m = (opts.payment_methods ?? []).filter((x) => METHOD_LABEL[x.code]);
    setMethods(m);
    setMethod((cur) => cur ?? (m.find((x) => x.enabled) ?? m[0])?.code ?? null);
    setAddressId((cur) => {
      if (preferredAddressId && list.some((x) => x.id === preferredAddressId)) return preferredAddressId;
      if (cur && list.some((x) => x.id === cur)) return cur;
      return list[0]?.id ?? null;
    });
  }, [session, cityId, preferredAddressId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const address = addresses?.find((x) => x.id === addressId) ?? null;
  const daySlots = useMemo(() => slots.filter((x) => address && x.zone_id === address.zone_id), [slots, address]);
  useEffect(() => {
    if (slotId && !daySlots.some((x) => x.id === slotId)) setSlotId(null);
  }, [daySlots, slotId]);

  // Le serveur calcule chaque montant : on redemande un devis à chaque changement.
  useEffect(() => {
    let alive = true;
    setQuote(null);
    if (!offer || !addressId || !slotId || !method) return;
    setQuoting(true);
    supabase
      .rpc('quote_checkout', { p_address_id: addressId, p_slot_id: slotId, p_method: method, p_items: [{ offer_id: offer.offerId, quantity: qty }] })
      .then(({ data, error: e }) => {
        if (!alive) return;
        setQuoting(false);
        if (e) setError(messageFor(e));
        else { setError(null); setQuote(data as Quote); }
      });
    return () => { alive = false; };
  }, [offer, addressId, slotId, method, qty]);

  const place = async () => {
    if (!quote?.can_submit) return;
    setPlacing(true);
    setError(null);
    try {
      if (!idem.current || idem.current.quote !== quote.id) idem.current = { quote: quote.id, key: Crypto.randomUUID() };
      const { data: orderId, error: e } = await supabase.rpc('place_checkout_order', { p_quote_id: quote.id, p_idempotency_key: idem.current.key });
      if (e) throw e;
      setPreferredAddressId(null);
      router.replace({ pathname: '/confirmation/[id]', params: { id: String(orderId) } });
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setPlacing(false);
    }
  };

  if (!session || !offer || addresses === null) return <Loading />;

  const open = salesOpen(settings);
  const blocked = quote && !quote.can_submit ? messageFor(quote.blocked_reason ?? '') : null;
  const fee = quote ? gnf(quote.payload.delivery_fee_gnf) : null;

  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader title="Ma commande" />
      <Screen
        padTop={false}
        footer={
          <Button
            label={quote ? (quote.can_submit ? `Commander · ${gnf(quote.payload.total_gnf)}` : open ? 'Paiement bientôt disponible' : 'Commandes bientôt disponibles') : 'Commander'}
            disabled={!quote?.can_submit}
            loading={placing}
            onPress={place}
          />
        }
      >
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <View style={{ flex: 1 }}>
            <T v="bodyBold" style={{ fontSize: 16 }}>{qty} alvéoles</T>
            <T v="tiny">{gnf(offer.priceGnf)} l’alvéole</T>
          </View>
          <Pressable onPress={() => router.navigate('/')} hitSlop={10}><T v="smallBold" style={{ color: color.green }}>Modifier</T></Pressable>
        </Card>

        <T v="h2">Où livrer ?</T>
        {address ? (
          <Card selected style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Row style={{ gap: 6 }}>
                <T v="bodyBold">{address.label || 'Ma boutique'}</T>
                {address.is_primary ? <Pill label="Principale" /> : null}
              </Row>
              <T v="small">{[address.quartier, address.commune].filter(Boolean).join(', ')}{address.landmark ? ` · ${address.landmark}` : ''}</T>
            </View>
            <Pressable onPress={() => router.push('/adresses')} hitSlop={10}><T v="smallBold" style={{ color: color.green, textDecorationLine: 'underline' }}>Changer</T></Pressable>
          </Card>
        ) : (
          <Button kind="outline" label="+ Ajouter mon adresse" onPress={() => router.push({ pathname: '/adresse', params: { pick: '1' } })} />
        )}

        <T v="h2">Quel jour ?</T>
        {!address ? (
          <T v="small">Ajoute ton adresse pour voir les jours de livraison.</T>
        ) : daySlots.length === 0 ? (
          <Banner title="Aucun jour disponible" body="Aucune livraison réservable cette semaine ni la suivante pour ton adresse." />
        ) : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {daySlots.map((d) => {
                const on = d.id === slotId;
                return (
                  <Pressable
                    key={d.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setSlotId(d.id)}
                    style={{ flexBasis: '47%', flexGrow: 1, minHeight: 64, padding: 12, borderRadius: 14, borderWidth: on ? 2 : 1.5, borderColor: on ? color.green : color.border, backgroundColor: on ? color.green : '#FFFFFF', justifyContent: 'center' }}
                  >
                    <T v="tiny" style={{ color: on ? '#DCEBE2' : color.muted }}>{weekLabel(d.starts_at)}</T>
                    <T v="bodyBold" style={{ color: on ? '#FFFFFF' : color.ink }}>{dayShort(d.starts_at)}</T>
                  </Pressable>
                );
              })}
            </View>
            <T v="tiny">Seuls les jours encore disponibles sont affichés.</T>
          </>
        )}

        <T v="h2">Payer avec</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {methods.map((m) => {
            const on = m.code === method;
            return (
              <Pressable
                key={m.code}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setMethod(m.code)}
                style={{ flex: 1, minHeight: 56, paddingHorizontal: 12, borderRadius: 14, borderWidth: on ? 2 : 1.5, borderColor: on ? color.green : color.border, backgroundColor: on ? color.tint : '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: on ? 6 : 2, borderColor: on ? color.green : '#9A968C', backgroundColor: '#FFFFFF' }} />
                <View style={{ flex: 1 }}>
                  <T v="bodyBold" style={{ color: on ? color.greenDark : color.ink }}>{METHOD_LABEL[m.code]}</T>
                  {!m.enabled ? <T v="tiny">Bientôt</T> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Card>
          <View style={s.rowBetween}><T v="small">Sous-total</T><T v="smallBold">{quote ? gnf(quote.payload.subtotal_gnf) : gnf(qty * offer.priceGnf)}</T></View>
          {quote?.payload.discount_gnf ? <View style={s.rowBetween}><T v="small">Remise</T><T v="smallBold">− {gnf(quote.payload.discount_gnf)}</T></View> : null}
          <View style={s.rowBetween}>
            <T v="small">Livraison</T>
            <T v="smallBold" style={!fee ? { color: color.muted, fontFamily: font.semibold } : null}>
              {quoting ? 'Calcul…' : fee ?? (address ? 'Choisis un jour' : 'Calculés selon ton adresse')}
            </T>
          </View>
          <View style={{ height: 1, backgroundColor: color.line }} />
          <View style={s.rowBetween}>
            <T v="bodyBold">Total à payer</T>
            <T v="h2" style={{ fontSize: 22 }}>{quote ? gnf(quote.payload.total_gnf) : '—'}</T>
          </View>
        </Card>

        {blocked ? <Banner title={blocked} /> : null}
        {error ? <Banner tone="bad" title={error} /> : null}
      </Screen>
    </View>
  );
}
