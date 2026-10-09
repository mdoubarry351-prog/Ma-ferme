import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { markWelcomeSeen } from '../src/lib/prefs';
import { color, font } from '../src/lib/theme';
import { Button, LogoMark, T } from '../src/ui/kit';

// Premier écran pour un nouveau visiteur : se connecter ou créer un compte.
export default function Bienvenue() {
  const insets = useSafeAreaInsets();
  const go = async (to: 'login' | 'register' | 'browse') => {
    await markWelcomeSeen();
    if (to === 'browse') router.replace('/');
    else router.replace({ pathname: '/connexion', params: { mode: to, next: '/' } });
  };
  return (
    <View style={{ flex: 1, backgroundColor: color.green, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
        <LogoMark size={112} reversed />
        <T style={{ fontFamily: font.bold, fontSize: 44, letterSpacing: -1.4, color: color.shell }}>ma ferme</T>
        <T style={{ fontFamily: font.medium, fontSize: 18, lineHeight: 25, color: '#DCEBE2', textAlign: 'center' }}>
          Tes œufs frais livrés à ta boutique, le jour que tu choisis.
        </T>
      </View>
      <View style={{ gap: 10, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
        <Button label="Créer mon compte" onPress={() => go('register')} style={{ backgroundColor: color.shell }} textColor={color.greenDark} />
        <Button label="J’ai déjà un compte" kind="outline" onPress={() => go('login')} style={{ borderColor: color.shell, height: 56 }} textColor={color.shell} />
        <Button label="Voir les prix d’abord" kind="ghost" onPress={() => go('browse')} textColor="#DCEBE2" />
      </View>
    </View>
  );
}
