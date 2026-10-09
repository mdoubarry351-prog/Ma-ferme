import { router } from 'expo-router';
import { Button, Screen, T } from '../src/ui/kit';

export default function NotFound() {
  return (
    <Screen>
      <T v="title">Page introuvable</T>
      <Button label="Retour à l’accueil" onPress={() => router.replace('/')} />
    </Screen>
  );
}
