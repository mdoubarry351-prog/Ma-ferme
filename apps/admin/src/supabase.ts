import { createClient } from '@supabase/supabase-js'

// Clé publique « anon » uniquement. Les droits de l'équipe sont vérifiés par le serveur
// (rôle, permissions et double authentification aal2).
export const supabase = createClient(
  'https://ngdyuvalxwkpghayhkks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZHl1dmFseHdrcGdoYXloa2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NDEzNjUsImV4cCI6MjEwNjExNzM2NX0.rKNuC2lAHoJfxmYGnrNUQWa4P4MF0i6aPyu2o3htUL8',
  { auth: { storageKey: 'ma-ferme-admin', detectSessionInUrl: false } },
)

export const gnf = (n: number | null | undefined) =>
  n == null ? '—' : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF'

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
export const dayLabel = (iso: string) => {
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00Z' : iso)
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}
// Conakry = UTC+0.
export const todayIso = () => new Date().toISOString().slice(0, 10)
export const addDays = (iso: string, n: number) => new Date(Date.parse(iso + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10)

const ERR: Record<string, string> = {
  PAYMENT_REQUIRED: 'Impossible : la commande n’est pas encore payée.',
  PAYMENT_RESOLUTION_REQUIRED: 'Un paiement est reçu ou en cours : règle-le avant d’annuler.',
  DRIVER_REQUIRED: 'Assigne un livreur avant de passer « En livraison ».',
  INVALID_STATUS_TRANSITION: 'Ce changement de statut n’est pas permis.',
  PRICE_CONFLICT: 'Le prix a changé entre-temps. Recharge la page.',
  INVALID_PRICE: 'Prix ou motif invalide (motif : 5 caractères minimum).',
  CAPACITY_BELOW_BOOKINGS: 'Capacité inférieure aux commandes déjà prises ce jour-là.',
  INVALID_DAY: 'Jour invalide.',
  FORBIDDEN: 'Ton rôle ne permet pas cette action.',
  INVALID_INPUT: 'Donnée invalide.',
}
export const errText = (e: unknown) => {
  const m = (e as { message?: string })?.message ?? String(e)
  const k = Object.keys(ERR).find((x) => m.includes(x))
  if (k) return ERR[k]
  if (/aal2|42501|permission/i.test(m)) return 'Accès refusé. Reconnecte-toi avec ton code de sécurité.'
  if (/fetch|network/i.test(m)) return 'Pas de connexion internet.'
  return 'Une erreur est survenue. Réessaie.'
}
