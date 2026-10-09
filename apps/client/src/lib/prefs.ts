import AsyncStorage from '@react-native-async-storage/async-storage';

// Petites préférences locales (pas de données sensibles).
const KEY_WELCOME = 'mf.welcome.seen';
export async function welcomeSeen() {
  try { return (await AsyncStorage.getItem(KEY_WELCOME)) === '1'; } catch { return true; }
}
export async function markWelcomeSeen() {
  try { await AsyncStorage.setItem(KEY_WELCOME, '1'); } catch {}
}
