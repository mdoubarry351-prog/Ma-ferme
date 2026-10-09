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

// --- Connexion par e-mail (facultative, en plus du numéro) ---
export const SITE_URL = 'https://mdoubarry351-prog.github.io/Ma-ferme/';

export async function signInEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) {
    if (/confirm/i.test(error.message)) throw new Error('EMAIL_NOT_CONFIRMED');
    throw new Error(/invalid/i.test(error.message) ? 'BAD_EMAIL_LOGIN' : error.message);
  }
}

// Inscription par e-mail : Supabase envoie un lien de confirmation. Le numéro reste
// demandé car il sert au livreur et au paiement mobile.
export async function registerEmail(email: string, password: string, firstName: string, shop: string, phoneRaw: string) {
  const phone = normalizeGuineaPhone(phoneRaw);
  if (!phone) throw new Error('INVALID_PHONE');
  if (password.length < 8) throw new Error('WEAK_PASSWORD');
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: SITE_URL,
      data: { first_name: firstName.trim(), business_name: shop.trim(), phone: `+224${phone}`, signup: 'email' },
    },
  });
  if (error) throw new Error(/registered|exists/i.test(error.message) ? 'EMAIL_TAKEN' : error.message);
  // Sans session : l'adresse doit d'abord être confirmée par e-mail.
  if (!data.session) return 'CHECK_EMAIL' as const;
  await completeProfile();
  return 'OK' as const;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: SITE_URL });
  if (error) throw new Error(error.message);
}

// Recopie prénom, boutique et numéro saisis à l'inscription par e-mail dans le profil (une seule fois).
export async function completeProfile() {
  const { data: u } = await supabase.auth.getUser();
  const meta = u.user?.user_metadata as { first_name?: string; business_name?: string; phone?: string; signup?: string } | undefined;
  if (!u.user || meta?.signup !== 'email') return;
  const { data: p } = await supabase.from('profiles').select('full_name, phone').eq('id', u.user.id).maybeSingle();
  if (p && (p.full_name || p.phone)) return;
  await supabase.from('profiles').update({
    full_name: meta.first_name || '',
    business_name: meta.business_name || null,
    phone: meta.phone || null,
  }).eq('id', u.user.id);
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
