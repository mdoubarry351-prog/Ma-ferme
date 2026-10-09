import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { color } from '../src/lib/theme';
import { BackHeader, Banner, Button, Field, Screen, T } from '../src/ui/kit';

// Ouvert depuis le lien « Mot de passe oublié » reçu par e-mail.
export default function NouveauMotDePasse() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (e) setError('Lien expiré ou invalide. Redemande un lien depuis la connexion.');
    else router.replace('/');
  };
  return (
    <View style={{ flex: 1, backgroundColor: color.shell }}>
      <BackHeader title="Nouveau mot de passe" />
      <Screen padTop={false} footer={<Button label="Enregistrer" disabled={password.length < 8} loading={busy} onPress={save} />}>
        <T v="small">Choisis un nouveau mot de passe (8 caractères minimum).</T>
        <Field label="Nouveau mot de passe" secureTextEntry autoCapitalize="none" autoComplete="new-password" value={password} onChangeText={setPassword} />
        {error ? <Banner tone="bad" title={error} /> : null}
      </Screen>
    </View>
  );
}
