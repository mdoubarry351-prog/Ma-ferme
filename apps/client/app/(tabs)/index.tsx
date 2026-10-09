import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { salesOpen, useApp } from '../../src/lib/app-state';
import { gnf } from '../../src/lib/format';
import { color, font } from '../../src/lib/theme';
import { Banner, Button, Card, Loading, LogoMark, Row, s, Screen, T, Wordmark } from '../../src/ui/kit';

function Tray() {
  return (
    <View style={{ height: 170, borderRadius: 18, backgroundColor: '#F1E9D8', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 236, padding: 10, borderRadius: 10, backgroundColor: '#E5D7B8', flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={{ width: 30, height: 18, borderRadius: 9, backgroundColor: '#FBF4E4' }} />
        ))}
      </View>
    </View>
  );
}

export default function Commander() {
  const { settings, offer, qty, setQty, session, catalogError, reloadCatalog } = useApp();
  const [manual, setManual] = useState(false);
  const [draft, setDraft] = useState('');

  if (catalogError)
    return (
      <Screen>
        <Banner tone="bad" title="Connexion impossible" body={catalogError} />
        <Button label="Réessayer" onPress={reloadCatalog} />
      </Screen>
    );
  if (!settings || !offer) return <Loading />;

  const open = salesOpen(settings);
  const minimum = Math.max(offer.minimum, settings.minimumUnits);
  const atMin = qty <= minimum;

  const goNext = () => {
    if (!session) router.push({ pathname: '/connexion', params: { next: '/commande' } });
    else router.push('/commande');
  };

  return (
    <Screen
      footer={
        <>
          <View style={s.rowBetween}>
            <T v="small">Sous-total</T>
            <T v="h2" style={{ fontSize: 20 }}>{gnf(qty * offer.priceGnf)}</T>
          </View>
          {open ? (
            <Button label="Continuer" onPress={goNext} />
          ) : (
            <Button label={settings.maintenance ? 'Service en maintenance' : 'Commandes bientôt disponibles'} disabled />
          )}
        </>
      }
    >
      <Row style={{ gap: 10 }}>
        <LogoMark size={34} />
        <Wordmark />
      </Row>
      <T v="big">Commander{'\n'}mes œufs</T>

      {!open ? (
        <Banner
          title={settings.maintenance ? 'Maintenance en cours' : 'Ouverture prochaine'}
          body="Les commandes seront bientôt disponibles. Tu peux déjà créer ton compte et préparer ton adresse."
        />
      ) : null}

      <Tray />

      <View style={s.rowBetween}>
        <View style={{ flex: 1 }}>
          <T v="bodyBold" style={{ fontSize: 17 }}>Alvéole de {offer.packQuantity} œufs</T>
          <T v="small">{offer.name}</T>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <T v="bodyBold" style={{ fontSize: 17 }}>{gnf(offer.priceGnf)}</T>
          <T v="tiny">par alvéole</T>
        </View>
      </View>

      <Card style={{ alignItems: 'center', gap: 12 }}>
        <Row style={{ width: '100%', justifyContent: 'space-between' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retirer une alvéole"
            disabled={atMin}
            onPress={() => setQty(qty - offer.step)}
            style={{ width: 58, height: 58, borderRadius: 16, borderWidth: 1.5, borderColor: color.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}
          >
            <T style={{ fontSize: 28, fontFamily: font.bold, color: atMin ? '#B8B4AA' : color.ink }}>−</T>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <T style={{ fontFamily: font.heavy, fontSize: 40, lineHeight: 46 }} accessibilityLabel={`${qty} alvéoles`}>{qty}</T>
            <T v="tiny">alvéoles · minimum {minimum}</T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajouter une alvéole"
            onPress={() => setQty(qty + offer.step)}
            style={{ width: 58, height: 58, borderRadius: 16, backgroundColor: color.green, alignItems: 'center', justifyContent: 'center' }}
          >
            <T style={{ fontSize: 28, fontFamily: font.bold, color: '#FFFFFF' }}>+</T>
          </Pressable>
        </Row>
        {manual ? (
          <Row style={{ width: '100%' }}>
            <TextInput
              autoFocus
              keyboardType="number-pad"
              value={draft}
              onChangeText={(t) => setDraft(t.replace(/\D/g, '').slice(0, 5))}
              placeholder={`${minimum} minimum`}
              accessibilityLabel="Nombre d'alvéoles"
              style={{ flex: 1, height: 52, borderWidth: 1.5, borderColor: color.green, borderRadius: 14, paddingHorizontal: 14, fontFamily: font.bold, fontSize: 18, color: color.ink }}
            />
            <Button
              label="OK"
              style={{ height: 52, minWidth: 72 }}
              onPress={() => {
                const n = parseInt(draft, 10);
                if (!isNaN(n)) setQty(n);
                setManual(false);
              }}
            />
          </Row>
        ) : (
          <Pressable onPress={() => { setDraft(String(qty)); setManual(true); }} hitSlop={10}>
            <T v="smallBold" style={{ color: color.green, textDecorationLine: 'underline' }}>Saisir une quantité</T>
          </Pressable>
        )}
      </Card>
    </Screen>
  );
}
