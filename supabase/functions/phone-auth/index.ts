// Ma Ferme — création de compte par numéro guinéen + code secret.
// Le client se connecte ensuite avec supabase.auth.signInWithPassword (identifiant dérivé du numéro).
// Aucune clé secrète côté client : la clé de service n'existe qu'ici.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// 6XX XX XX XX — numéros mobiles guinéens (9 chiffres commençant par 6).
export function normalizeGuineaPhone(raw: string): string | null {
  let d = String(raw ?? "").replace(/[^\d+]/g, "");
  if (d.startsWith("+224")) d = d.slice(4);
  else if (d.startsWith("00224")) d = d.slice(5);
  else if (d.startsWith("224") && d.length === 12) d = d.slice(3);
  d = d.replace(/\D/g, "");
  return /^6\d{8}$/.test(d) ? d : null;
}

export const loginEmail = (local9: string) => `224${local9}@telephone.ma-ferme.app`;
export const loginPassword = (pin: string) => `MaFerme-${pin}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "INVALID_REQUEST" }, 400); }

  if (body.action !== "register") return json({ error: "INVALID_ACTION" }, 400);

  const phone = normalizeGuineaPhone(String(body.phone ?? ""));
  const pin = String(body.pin ?? "");
  const first = String(body.first_name ?? "").trim();
  const shop = String(body.business_name ?? "").trim();

  if (!phone) return json({ error: "INVALID_PHONE" }, 400);
  if (!/^\d{6}$/.test(pin) || /^(\d)\1{5}$/.test(pin) || pin === "123456" || pin === "654321")
    return json({ error: "WEAK_PIN" }, 400);
  if (first.length < 1 || first.length > 60) return json({ error: "INVALID_NAME" }, 400);
  if (shop.length > 80) return json({ error: "INVALID_SHOP" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email: loginEmail(phone),
    password: loginPassword(pin),
    email_confirm: true,
    user_metadata: { signup: "phone_pin", phone: `+224${phone}` },
  });
  if (error || !data.user) {
    const msg = (error?.message ?? "").toLowerCase();
    if (msg.includes("already") || msg.includes("exists") || (error as { status?: number })?.status === 422)
      return json({ error: "PHONE_TAKEN" }, 409);
    console.error("createUser", error);
    return json({ error: "SIGNUP_FAILED" }, 500);
  }

  // Le profil est créé par le déclencheur private.create_profile ; on le complète.
  const { error: pErr } = await admin.from("profiles").update({
    first_name: first,
    last_name: "",
    full_name: first,
    business_name: shop || null,
    phone: `+224${phone}`,
  }).eq("id", data.user.id);
  if (pErr) console.error("profile", pErr);

  return json({ ok: true });
});
