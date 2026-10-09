import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { normalizeGuineaPhone, register, registerEmail, resetPassword, signIn, signInEmail } from '../src/lib/auth';
import { messageFor } from '../src/lib/errors';
import { color, font } from '../src/lib/theme';
import { BackHeader, Banner, Button, Field, Screen, T } from '../src/ui/kit';

const digits = (t: string, n: number) => t.replace(/\D/g, '').slice(0, n);
const formatPhone = (t: string) => digits(t, 9).replace(/^(\d{3})(\d{0,2})(\d{0,2})(\d{0,2}).*/, (_, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

type Method = 'phone' | 'email';
type Mode = 'login' | 'register';

function Segmented({ value, onChange }: { value: Method; onChange: (m: Method) => void }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#EFECE3', borderRadius: 14, padding: 4, gap: 4 }}>
      {(['phone', 'email'] as Method[]).map((m) => {
        const on = m === value;
        return (
          <Pressable
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(m)}
            style={{ flex: 1, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? '#FFFFFF' : 'transparent' }}
          >
            <T style={{ fontFamily: on ? font.heavy : font.bold, fontSize: 15, color: on ? color.ink : color.muted }}>
              {m === 'phone' ? 'Numéro' : 'E-mail'}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Connexion() {
  const { next, mode: initialMode } = useLocalSearchParams<{ next?: string; mode?: string }>();
  const [method, setMethod] = useState<Method>('phone');
  const [mode, setMode] = useState<Mode>(initialMode === 'register' ? 'register' : 'login');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [password, setPassword] = useState('');
  const [first, setFirst] = useState('');
  const [shop, setShop] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const phoneOk = !!normalizeGuineaPhone(phone);
  const done = () => {
    const target = typeof next === 'string' && next.startsWith('/') ? next : '/';
    router.replace(target as never);
  };
  const reset = () => { setError(null); setInfo(null); };

  const submit = async () => {
    reset();
    if (method === 'phone' && mode === 'register' && pin !== pin2) return setError('Les deux codes ne sont pas identiques.');
    setBusy(true);
    try {
      if (method === 'phone') {
        if (mode === 'login') await signIn(phone, pin);
        else await register(phone, pin, first, shop);
        return done();
      }
      if (mode === 'login') {
        await signInEmail(email, password);
        return done();
      }
      const r = await registerEmail(email, password, first, shop, phone);
      if (r === 'OK') return done();
      setInfo(`Compte créé. Ouvre le lien envoyé à ${email.trim()} pour confirmer ton adresse, puis connecte-toi.`);
      setMode('login');
    } catch (e) {
      setError(messageFor((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    reset();
    if (!emailOk(email)) return setError('Écris d’abord ton adresse e-mail.');
    try {
      await resetPassword(email);
      setInfo(`Un lien pour choisir un nouveau mot de passe a été envoyé à ${email.trim()}.`);
    } catch (e) {
      setError(messageFor(e));
    }
  };

  const canSubmit =
    method === 'phone'
      ? phoneOk && pin.length === 6 && (mode === 'login' || (first.trim().length >= 1 && pin2.length === 6))
      : emailOk(email) && password.length >= (mode === 'login' ? 1 : 8) && (mode === 'login' || (first.trim().length >= 1 && phoneOk));

  const title = mode === 'login' ? 'Me connecter' : 'Créer ton compte';
  const subtitle =
    method === 'phone'
      ? mode === 'login'
        ? 'Avec ton numéro et ton code secret. Pas besoin d’e-mail.'
        : 'Ton numéro et un code secret de 6 chiffres. Garde ce code pour toi.'
      : mode === 'login'
        ? 'Avec ton adresse e-mail et ton mot de passe.'
        : 'Ton e-mail et un mot de passe. Ton numéro reste demandé pour la livraison.';

  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader />
      <Screen padTop={false} footer={<Button label={mode === 'login' ? 'Se connecter' : 'Créer mon compte'} onPress={submit} disabled={!canSubmit} loading={busy} />}>
        <View style={{ gap: 6 }}>
          <T v="title">{title}</T>
          <T v="small">{subtitle}</T>
        </View>

        <Segmented value={method} onChange={(m) => { setMethod(m); reset(); }} />

        {method === 'email' ? (
          <Field label="E-mail" keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="nom@exemple.com" value={email} onChangeText={setEmail} />
        ) : null}

        {method === 'phone' || mode === 'register' ? (
          <Field
            label={method === 'email' ? 'Numéro (pour la livraison)' : 'Numéro'}
            prefix="+224"
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="621 00 00 00"
            value={phone}
            onChangeText={(t) => setPhone(formatPhone(t))}
            error={phone.replace(/\D/g, '').length === 9 && !phoneOk ? 'Numéro guinéen à 9 chiffres commençant par 6.' : null}
          />
        ) : null}

        {mode === 'register' ? (
          <>
            <Field label="Ton prénom" placeholder="Aissatou" value={first} onChangeText={setFirst} autoComplete="given-name" maxLength={60} />
            <Field label="Nom de ta boutique" hint="Facultatif" placeholder="Boutique Bah" value={shop} onChangeText={setShop} maxLength={80} />
          </>
        ) : null}

        {method === 'phone' ? (
          <>
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
              <Field label="Confirme ton code" keyboardType="number-pad" secureTextEntry placeholder="••••••" value={pin2} onChangeText={(t) => setPin2(digits(t, 6))} style={{ letterSpacing: 6 }} />
            ) : null}
          </>
        ) : (
          <Field
            label={mode === 'login' ? 'Mot de passe' : 'Choisis un mot de passe'}
            hint={mode === 'register' ? '8 caractères minimum' : undefined}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChangeText={setPassword}
          />
        )}

        {info ? <Banner title={info} /> : null}
        {error ? <Banner tone="bad" title={error} /> : null}

        <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); reset(); }} style={{ paddingVertical: 8 }}>
          <T v="bodyBold" style={{ color: color.green, textAlign: 'center' }}>
            {mode === 'login' ? 'Nouveau client ? Créer mon compte' : 'J’ai déjà un compte'}
          </T>
        </Pressable>
        {mode === 'login' ? (
          method === 'phone' ? (
            <T v="tiny" style={{ textAlign: 'center' }}>Code oublié ? Écris à l’équipe sur WhatsApp depuis ton numéro.</T>
          ) : (
            <Pressable onPress={forgot} hitSlop={8}>
              <T v="smallBold" style={{ textAlign: 'center', color: color.muted, textDecorationLine: 'underline' }}>Mot de passe oublié ?</T>
            </Pressable>
          )
        ) : null}
      </Screen>
    </View>
  );
}
