import { supabase } from './supabase';

// Identifiant de connexion dérivé du numéro (aucun e-mail demandé au client).
// Doit rester identique à supabase/functions/phone-auth.
export function normalizeGuineaPhone(raw: string): string | null {
  let d = String(raw ?? '').replace(/[^\d+]/g, '');
  if (d.startsWith('+224')) d = d.slice(4);
  else if (d.startsWith('00224')) d = d.slice(5);
  else if (d.startsWith('224') && d.length === 12) d = d.slice(3);
  d = d.replace(/\D/g, '');
  return /^6\d{8}$/.test(d) ? d : null;
}
const loginEmail = (local9: string) => `224${local9}@telephone.ma-ferme.app`;
const loginPassword = (pin: string) => `MaFerme-${pin}`;

export async function signIn(phoneRaw: string, pin: string) {
  const phone = normalizeGuineaPhone(phoneRaw);
  if (!phone) throw new Error('INVALID_PHONE');
  const { error } = await supabase.auth.signInWithPassword({ email: loginEmail(phone), password: loginPassword(pin) });
  if (error) throw new Error(/invalid/i.test(error.message) ? 'BAD_LOGIN' : error.message);
}

export async function register(phoneRaw: string, pin: string, firstName: string, shop: string) {
  const phone = normalizeGuineaPhone(phoneRaw);
  if (!phone) throw new Error('INVALID_PHONE');
  const { data, error } = await supabase.functions.invoke('phone-auth', {
    body: { action: 'register', phone, pin, first_name: firstName, business_name: shop },
  });
  if (error) {
    // Le corps de la réponse porte le code (PHONE_TAKEN, WEAK_PIN…).
    let code = 'SIGNUP_FAILED';
    try {
      const body = await (error as any).context?.json?.();
      if (body?.error) code = body.error;
    } catch {}
    throw new Error(code);
  }
  if (!data?.ok) throw new Error(data?.error ?? 'SIGNUP_FAILED');
  await signIn(phone, pin);
}
