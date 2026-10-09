import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../src/lib/app-state';
import { normalizeGuineaPhone } from '../src/lib/auth';
import { supabase } from '../src/lib/supabase';
import { color } from '../src/lib/theme';
import { BackHeader, Banner, Button, Field, Loading, Screen, T } from '../src/ui/kit';

const formatPhone = (t: string) => t.replace(/\D/g, '').slice(0, 9).replace(/^(\d{3})(\d{0,2})(\d{0,2})(\d{0,2}).*/, (_, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));

export default function ProfilModifier() {
  const { session } = useApp();
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [shop, setShop] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase.from('profiles').select('full_name, first_name, business_name, phone').eq('id', session.user.id).maybeSingle().then(({ data }) => {
      setName(data?.full_name || data?.first_name || '');
      setShop(data?.business_name ?? '');
      setPhone(formatPhone((data?.phone ?? '').replace(/^\+224/, '')));
      setLoaded(true);
    });
  }, [session]);

  const phoneOk = !phone || !!normalizeGuineaPhone(phone);
  const save = async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    const p = normalizeGuineaPhone(phone);
    const { error: e } = await supabase.from('profiles').update({
      full_name: name.trim(),
      business_name: shop.trim() || null,
      phone: p ? `+224${p}` : null,
    }).eq('id', session.user.id);
    setBusy(false);
    if (e) setError('Enregistrement impossible. Vérifie les informations.');
    else router.back();
  };

  if (!loaded) return <Loading />;
  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader title="Mes informations" />
      <Screen padTop={false} footer={<Button label="Enregistrer" disabled={name.trim().length < 1 || !phoneOk} loading={busy} onPress={save} />}>
        <Field label="Ton nom" value={name} onChangeText={setName} maxLength={100} autoComplete="name" />
        <Field label="Nom de ta boutique" hint="Facultatif" value={shop} onChangeText={setShop} maxLength={100} />
        <Field label="Numéro" prefix="+224" keyboardType="phone-pad" value={phone} onChangeText={(t) => setPhone(formatPhone(t))} error={!phoneOk ? 'Numéro guinéen à 9 chiffres commençant par 6.' : null} />
        <T v="tiny">Ce numéro est donné au livreur. Pour te connecter, utilise toujours le numéro ou l’e-mail de création du compte.</T>
        {error ? <Banner tone="bad" title={error} /> : null}
      </Screen>
    </View>
  );
}
