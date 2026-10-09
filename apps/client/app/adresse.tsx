import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../src/lib/app-state';
import { messageFor } from '../src/lib/errors';
import { gnf } from '../src/lib/format';
import { supabase } from '../src/lib/supabase';
import { color, font } from '../src/lib/theme';
import { BackHeader, Banner, Button, Loading, Row, Screen, T } from '../src/ui/kit';

type Commune = { id: string; name: string; fee_gnf: number | null };
type Quartier = { id: string; commune_id: string; name: string; fee_gnf: number | null };

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center', borderWidth: on ? 2 : 1.5, borderColor: on ? color.green : color.border, backgroundColor: on ? color.green : '#FFFFFF' }}
    >
      <T style={{ fontFamily: font.bold, fontSize: 14, color: on ? '#FFFFFF' : color.ink }}>{label}</T>
    </Pressable>
  );
}

export default function Adresse() {
  const { id, pick } = useLocalSearchParams<{ id?: string; pick?: string }>();
  const { session, setPreferredAddressId } = useApp();
  const [communes, setCommunes] = useState<Commune[] | null>(null);
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [communeId, setCommuneId] = useState<string | null>(null);
  const [quartierId, setQuartierId] = useState<string | null>(null);
  const [landmark, setLandmark] = useState('');
  const [label, setLabel] = useState('');
  const [primary, setPrimary] = useState(false);
  const [wasPrimary, setWasPrimary] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [c, q] = await Promise.all([
        supabase.from('delivery_communes').select('id, name, fee_gnf').eq('active', true).order('name'),
        supabase.from('delivery_quartiers').select('id, commune_id, name, fee_gnf').eq('active', true).order('name').limit(2000),
      ]);
      if (c.error || q.error) { setError(messageFor(c.error ?? q.error)); setCommunes([]); return; }
      setCommunes(c.data as Commune[]);
      setQuartiers(q.data as Quartier[]);
      if (id) {
        const a = await supabase.from('addresses').select('quartier_id, landmark, label, is_primary, shop_photo_path').eq('id', id).maybeSingle();
        const ad = a.data;
        if (ad) {
          const qq = (q.data as Quartier[]).find((x) => x.id === ad.quartier_id);
          if (qq) { setCommuneId(qq.commune_id); setQuartierId(qq.id); }
          setLandmark(ad.landmark ?? '');
          setLabel(ad.label ?? '');
          setPrimary(!!ad.is_primary);
          setWasPrimary(!!ad.is_primary);
          setHasPhoto(!!ad.shop_photo_path);
        }
      }
    })();
  }, [id]);

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return quartiers.filter((q) => q.commune_id === communeId && (!f || q.name.toLowerCase().includes(f)));
  }, [quartiers, communeId, filter]);
  const commune = communes?.find((c) => c.id === communeId);
  const quartier = quartiers.find((q) => q.id === quartierId);
  const fee = quartier ? quartier.fee_gnf ?? commune?.fee_gnf ?? null : null;

  const choosePhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [4, 3] });
    if (!r.canceled && r.assets?.[0]?.uri) setPhoto(r.assets[0].uri);
  };

  const save = async () => {
    if (!session || !quartier || !commune) return;
    setBusy(true);
    setError(null);
    try {
      const { data: aid, error: e } = await supabase.rpc('save_local_address', {
        p_id: id ?? null,
        p_quartier: quartier.id,
        p_name: null,
        p_phone: null,
        p_line: `${quartier.name}, ${commune.name}`,
        p_landmark: landmark.trim() || null,
      } as never);
      if (e) throw e;
      const addressId = String(aid);
      if (label.trim()) await supabase.rpc('set_address_label', { p_id: addressId, p_label: label.trim() });
      if (primary && !wasPrimary) {
        const r = await supabase.rpc('manage_my_address', { p_id: addressId, p_action: 'primary' });
        if (r.error) throw r.error;
      }
      if (photo) {
        const body = await (await fetch(photo)).arrayBuffer();
        const path = `${session.user.id}/${addressId}-${Date.now()}.jpg`;
        const up = await supabase.storage.from('address-photos').upload(path, body, { contentType: 'image/jpeg', upsert: false });
        if (up.error) throw new Error('Photo non envoyée. L’adresse est enregistrée, réessaie la photo plus tard.');
        const sp = await supabase.rpc('set_address_photo', { p_address: addressId, p_path: path });
        if (sp.error) throw sp.error;
      }
      if (pick) setPreferredAddressId(addressId);
      router.back();
    } catch (e) {
      const m = (e as Error).message ?? '';
      setError(m.startsWith('Photo') ? m : messageFor(e));
    } finally {
      setBusy(false);
    }
  };

  if (!communes) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader title={id ? 'Modifier l’adresse' : 'Nouvelle adresse'} />
      <Screen padTop={false} footer={<Button label="Enregistrer l’adresse" disabled={!quartier} loading={busy} onPress={save} />}>
        <T v="smallBold">1. Ta commune</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {communes.map((c) => (
            <Chip key={c.id} label={c.name} on={c.id === communeId} onPress={() => { setCommuneId(c.id); setQuartierId(null); setFilter(''); }} />
          ))}
        </View>

        {communeId ? (
          <>
            <T v="smallBold">2. Ton quartier</T>
            {quartiers.filter((q) => q.commune_id === communeId).length > 12 ? (
              <TextInput
                value={filter}
                onChangeText={setFilter}
                placeholder="Chercher un quartier"
                placeholderTextColor="#9A968C"
                style={{ height: 48, borderWidth: 1.5, borderColor: color.border, borderRadius: 14, paddingHorizontal: 14, backgroundColor: '#FFFFFF', fontFamily: font.medium, fontSize: 15, color: color.ink }}
              />
            ) : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {list.map((q) => <Chip key={q.id} label={q.name} on={q.id === quartierId} onPress={() => setQuartierId(q.id)} />)}
              {list.length === 0 ? <T v="small">Aucun quartier trouvé.</T> : null}
            </View>
            {quartier && fee != null ? (
              <T v="smallBold" style={{ color: color.greenDark }}>✓ Livraison vers {quartier.name} : {gnf(fee)}</T>
            ) : null}
          </>
        ) : null}

        <View style={{ gap: 6 }}>
          <T v="smallBold">3. Repère</T>
          <T v="tiny">Facultatif · aide le livreur à te trouver</T>
          <TextInput
            value={landmark}
            onChangeText={setLandmark}
            multiline
            maxLength={300}
            placeholder="Ex. : boutique au portail vert, près du carrefour"
            placeholderTextColor="#9A968C"
            style={{ minHeight: 72, borderWidth: 1.5, borderColor: color.border, borderRadius: 14, padding: 14, backgroundColor: '#FFFFFF', fontFamily: font.medium, fontSize: 15, color: color.ink, textAlignVertical: 'top' }}
          />
        </View>

        <View style={{ gap: 6 }}>
          <T v="smallBold">4. Nom de l’adresse</T>
          <TextInput
            value={label}
            onChangeText={setLabel}
            maxLength={40}
            placeholder="Ma boutique, Dépôt…"
            placeholderTextColor="#9A968C"
            style={{ height: 48, borderWidth: 1.5, borderColor: color.border, borderRadius: 14, paddingHorizontal: 14, backgroundColor: '#FFFFFF', fontFamily: font.medium, fontSize: 15, color: color.ink }}
          />
        </View>

        <View style={{ gap: 6 }}>
          <T v="smallBold">5. Photo de la boutique <T v="tiny">· facultatif, visible seulement par l’équipe</T></T>
          {photo ? <Image source={{ uri: photo }} style={{ width: '100%', height: 160, borderRadius: 14 }} /> : null}
          <Pressable onPress={choosePhoto} style={{ height: 52, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color.green, alignItems: 'center', justifyContent: 'center' }}>
            <T v="bodyBold" style={{ color: color.greenDark }}>{photo ? 'Changer la photo' : hasPhoto ? 'Remplacer la photo' : 'Ajouter une photo'}</T>
          </Pressable>
        </View>

        {!wasPrimary ? (
          <Pressable onPress={() => setPrimary(!primary)} accessibilityRole="checkbox" accessibilityState={{ checked: primary }}>
            <Row>
              <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: color.green, backgroundColor: primary ? color.green : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                {primary ? <T style={{ color: '#FFFFFF', fontFamily: font.heavy, fontSize: 14 }}>✓</T> : null}
              </View>
              <T v="body">Utiliser comme adresse principale</T>
            </Row>
          </Pressable>
        ) : null}

        {error ? <Banner tone="bad" title={error} /> : null}
      </Screen>
    </View>
  );
}
