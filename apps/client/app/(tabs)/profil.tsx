import { useCallback, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useApp } from '../../src/lib/app-state';
import { phoneDisplay } from '../../src/lib/format';
import { supabase } from '../../src/lib/supabase';
import { color } from '../../src/lib/theme';
import { AddressList, useAddresses } from '../../src/ui/addresses';
import { Banner, Button, Card, Loading, Row, Screen, T } from '../../src/ui/kit';

type Profile = { first_name: string; full_name: string; business_name: string | null; phone: string | null };

export default function Profil() {
  const { session, authReady, supportPhone } = useApp();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { list, error, reload } = useAddresses(!!session);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      supabase.from('profiles').select('first_name, full_name, business_name, phone').eq('id', session.user.id).maybeSingle().then(({ data }) => setProfile(data as Profile));
    }, [session]),
  );

  const whatsapp = () => {
    const n = (supportPhone ?? '').replace(/\D/g, '');
    if (n) Linking.openURL(`https://wa.me/${n}`);
  };

  if (authReady && !session)
    return (
      <Screen>
        <T v="title">Profil</T>
        <T v="small">Connecte-toi pour gérer ton compte et tes adresses.</T>
        <Button label="Me connecter" onPress={() => router.push({ pathname: '/connexion', params: { next: '/profil' } })} />
      </Screen>
    );
  if (!profile) return <Loading />;

  const name = profile.first_name || profile.full_name || 'Mon compte';
  const initials = (name[0] ?? '?').toUpperCase() + (profile.business_name?.[0] ?? '').toUpperCase();

  return (
    <Screen>
      <T v="title">Profil</T>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: color.tint, alignItems: 'center', justifyContent: 'center' }}>
          <T v="bodyBold" style={{ fontSize: 18, color: color.greenDark }}>{initials}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T v="bodyBold" style={{ fontSize: 17 }}>{name}</T>
          <T v="small">{[profile.business_name, phoneDisplay(profile.phone)].filter(Boolean).join(' · ')}</T>
        </View>
      </Card>

      <T v="h2">Mes adresses</T>
      {error ? <Banner tone="bad" title={error} /> : null}
      {list ? <AddressList list={list} reload={reload} /> : <Loading />}

      <T v="h2">Besoin d’aide ?</T>
      <Pressable onPress={whatsapp} disabled={!supportPhone}>
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <T v="bodyBold" style={{ flex: 1 }}>Écrire à l’équipe sur WhatsApp</T>
          <T v="bodyBold" style={{ color: color.muted }}>›</T>
        </Card>
      </Pressable>
      {!supportPhone ? <T v="tiny">Numéro WhatsApp de l’équipe à renseigner dans l’administration.</T> : null}

      <Row style={{ justifyContent: 'center' }}>
        <Pressable onPress={() => supabase.auth.signOut().then(() => router.replace('/'))} style={{ padding: 12 }}>
          <T v="smallBold" style={{ color: color.muted, textDecorationLine: 'underline' }}>Se déconnecter</T>
        </Pressable>
      </Row>
    </Screen>
  );
}
