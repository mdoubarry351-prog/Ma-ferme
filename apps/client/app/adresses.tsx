import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../src/lib/app-state';
import { color } from '../src/lib/theme';
import { AddressList, useAddresses } from '../src/ui/addresses';
import { BackHeader, Banner, Loading, Screen, T } from '../src/ui/kit';

// Choix de l'adresse de livraison pour la commande en cours.
export default function Adresses() {
  const { session, preferredAddressId, setPreferredAddressId } = useApp();
  const { list, error, reload } = useAddresses(!!session);
  if (!list) return error ? <Screen><Banner tone="bad" title={error} /></Screen> : <Loading />;
  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader title="Où livrer ?" />
      <Screen padTop={false}>
        <T v="small">Choisis l’adresse pour cette commande.</T>
        <AddressList
          list={list}
          reload={reload}
          pickedId={preferredAddressId ?? list.find((a) => a.is_primary)?.id}
          onPick={(id) => { setPreferredAddressId(id); router.back(); }}
        />
      </Screen>
    </View>
  );
}
