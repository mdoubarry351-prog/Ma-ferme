import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Valeurs publiques uniquement (clé « anon », protégée par les règles RLS du serveur).
// Aucune clé secrète n'est jamais placée dans l'application.
export const SUPABASE_URL = 'https://ngdyuvalxwkpghayhkks.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZHl1dmFseHdrcGdoYXloa2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NDEzNjUsImV4cCI6MjEwNjExNzM2NX0.rKNuC2lAHoJfxmYGnrNUQWa4P4MF0i6aPyu2o3htUL8';

const isServer = typeof window === 'undefined';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === 'web' ? (isServer ? undefined : window.localStorage) : AsyncStorage,
    persistSession: !isServer,
    autoRefreshToken: !isServer,
    detectSessionInUrl: false,
  },
});
