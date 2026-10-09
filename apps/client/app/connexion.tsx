import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { normalizeGuineaPhone, register, signIn } from '../src/lib/auth';
import { messageFor } from '../src/lib/errors';
import { color } from '../src/lib/theme';
import { BackHeader, Banner, Button, Field, Screen, T } from '../src/ui/kit';

const digits = (t: string, n: number) => t.replace(/\D/g, '').slice(0, n);
const formatPhone = (t: string) => digits(t, 9).replace(/^(\d{3})(\d{0,2})(\d{0,2})(\d{0,2}).*/, (_, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));

export default function Connexion() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [first, setFirst] = useState('');
  const [shop, setShop] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneOk = !!normalizeGuineaPhone(phone);
  const done = () => {
    const target = typeof next === 'string' && next.startsWith('/') ? next : '/';
    router.replace(target as never);
  };

  const submit = async () => {
    setError(null);
    if (mode === 'register' && pin !== pin2) return setError('Les deux codes ne sont pas identiques.');
    setBusy(true);
    try {
      if (mode === 'login') await signIn(phone, pin);
      else await register(phone, pin, first, shop);
      done();
    } catch (e) {
      const msg = (e as Error).message;
      setError(messageFor(msg));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    phoneOk && pin.length === 6 && (mode === 'login' || (first.trim().length >= 1 && pin2.length === 6));

  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader />
      <Screen padTop={false} footer={<Button label={mode === 'login' ? 'Se connecter' : 'Créer mon compte'} onPress={submit} disabled={!canSubmit} loading={busy} />}>
        <View style={{ gap: 6 }}>
          <T v="title">{mode === 'login' ? 'Ton numéro de téléphone' : 'Créer ton compte'}</T>
          <T v="small">
            {mode === 'login'
              ? 'Il sert à suivre tes commandes et à te retrouver la prochaine fois. Pas besoin d’e-mail.'
              : 'Ton numéro et un code secret de 6 chiffres. Garde ce code pour toi.'}
          </T>
        </View>

        <Field
          label="Numéro"
          prefix="+224"
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="621 00 00 00"
          value={phone}
          onChangeText={(t) => setPhone(formatPhone(t))}
          error={phone.replace(/\D/g, '').length === 9 && !phoneOk ? 'Numéro guinéen à 9 chiffres commençant par 6.' : null}
        />

        {mode === 'register' ? (
          <>
            <Field label="Ton prénom" placeholder="Aissatou" value={first} onChangeText={setFirst} autoComplete="given-name" maxLength={60} />
            <Field label="Nom de ta boutique" hint="Facultatif" placeholder="Boutique Bah" value={shop} onChangeText={setShop} maxLength={80} />
          </>
        ) : null}

        <Field
          label={mode === 'login' ? 'Ton code secret' : 'Choisis un code secret'}
          hint="6 chiffres"
          keyboardType="number-pad"
          secureTextEntry
          placeholder="••••••"
          value={pin}
          onChangeText={(t) => setPin(digits(t, 6))}
          style={{ letterSpacing: 6 }}
        />
        {mode === 'register' ? (
          <Field
            label="Confirme ton code"
            keyboardType="number-pad"
            secureTextEntry
            placeholder="••••••"
            value={pin2}
            onChangeText={(t) => setPin2(digits(t, 6))}
            style={{ letterSpacing: 6 }}
          />
        ) : null}

        {error ? <Banner tone="bad" title={error} /> : null}

        <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }} style={{ paddingVertical: 8 }}>
          <T v="bodyBold" style={{ color: color.green, textAlign: 'center' }}>
            {mode === 'login' ? 'Nouveau client ? Créer mon compte' : 'J’ai déjà un compte'}
          </T>
        </Pressable>
        {mode === 'login' ? (
          <T v="tiny" style={{ textAlign: 'center' }}>Code oublié ? Écris à l’équipe sur WhatsApp depuis ton numéro.</T>
        ) : null}
      </Screen>
    </View>
  );
}
