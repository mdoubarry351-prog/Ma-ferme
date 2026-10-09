// Codes renvoyés par le serveur Supabase → phrases claires pour le client.
const MESSAGES: Record<string, string> = {
  ORDERS_DISABLED: 'Les commandes ouvrent bientôt. Tu pourras commander dès l’ouverture.',
  MAINTENANCE: 'Le service est en maintenance. Réessaie un peu plus tard.',
  PAYMENT_NOT_READY: 'Le paiement mobile arrive bientôt. Tu pourras commander dès son ouverture.',
  SLOT_UNAVAILABLE: 'Ce jour n’est plus disponible. Choisis un autre jour.',
  DELIVERY_FULL: 'Ce jour est complet. Choisis un autre jour.',
  ZONE_UNAVAILABLE: 'Nous ne livrons pas encore cette adresse.',
  ADDRESS_LOCALITY_REQUIRED: 'Choisis le quartier de ton adresse.',
  INVALID_ADDRESS: 'Adresse incomplète. Vérifie la commune et le quartier.',
  ADDRESS_LIMIT: 'Tu as déjà 20 adresses enregistrées.',
  INVALID_QUANTITY: 'Quantité non valide : 5 alvéoles minimum.',
  PRODUCT_UNAVAILABLE: 'Ce produit n’est plus disponible pour le moment.',
  STOCK_INSUFFICIENT: 'Pas assez d’œufs disponibles pour cette quantité.',
  QUOTE_EXPIRED: 'Le prix a expiré. Vérifie ta commande et réessaie.',
  QUOTE_CHANGED: 'Le prix ou la livraison a changé. Vérifie le nouveau total.',
  ACTIVE_ORDER_LIMIT: 'Tu as déjà 5 commandes en attente de paiement.',
  QUOTE_LIMIT: 'Trop de tentatives. Réessaie dans une heure.',
  AUTH_REQUIRED: 'Connecte-toi pour continuer.',
  ORDER_NOT_FOUND: 'Commande introuvable.',
  INVALID_PHONE: 'Numéro non valide. Exemple : 621 00 00 00.',
  WEAK_PIN: 'Code trop simple. Choisis 6 chiffres différents de 123456 ou 000000.',
  PHONE_TAKEN: 'Ce numéro a déjà un compte. Connecte-toi avec ton code.',
  INVALID_NAME: 'Indique ton prénom.',
  SIGNUP_FAILED: 'Création du compte impossible pour le moment. Réessaie.',
  BAD_LOGIN: 'Numéro ou code incorrect.',
  NETWORK: 'Pas de connexion internet. Vérifie ta connexion et réessaie.',
};

export function messageFor(err: unknown): string {
  const raw =
    typeof err === 'string'
      ? err
      : (err as { message?: string; error?: string; code?: string })?.message ??
        (err as { error?: string })?.error ??
        '';
  const code = Object.keys(MESSAGES).find((k) => raw.includes(k));
  if (code) return MESSAGES[code];
  if (/fetch|network/i.test(raw)) return MESSAGES.NETWORK;
  return 'Une erreur est survenue. Réessaie.';
}
