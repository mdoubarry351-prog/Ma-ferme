# Ma Ferme

Centrale d'achat d'œufs pour les commerçants de Conakry : le client commande, Ma Ferme achète, prépare et livre à jour fixe.

## Contenu

| Dossier | Rôle |
|---|---|
| `apps/client` | Application client (Expo Router, React Native, TypeScript) — site web de test puis Android |
| `apps/admin` | Administration web responsive (à venir) |
| `supabase/functions/phone-auth` | Création de compte par numéro guinéen + code secret |
| `packages/shared` | Types générés depuis la base Supabase |

## Règles

- Le serveur Supabase calcule tous les montants (devis, frais, total) et refuse les commandes tant que `orders_enabled = false`.
- L'application ne contient que la clé publique « anon ». Aucune clé secrète dans le code.
- Ne rien supprimer en base sans accord explicite du propriétaire.

## Lancer le client

```bash
cd apps/client
npm install
npx expo start            # téléphone (Expo Go) ou navigateur
EXPO_OFFLINE=1 npx expo export -p web --output-dir dist   # site statique
```
