# NUMBER OVER — Base de données (phase 3)

PostgreSQL / Supabase. 26 tables, 5 vues, 27 enums, RLS **activé et forcé sur 100 % des tables**.

## Principes
- **Aucune donnée fictive** : les migrations ne contiennent que des référentiels (rôles, types, paramètres, brouillons de textes, endpoints webhook désactivés). Aucun pays activé, aucun numéro, aucun prix, aucun client.
- **Le serveur écrit, le client lit** : `orders`, `payments`, `rentals`, `refunds`, `phone_numbers`… ne sont modifiables que par `service_role` (côté serveur) ou par un admin selon RLS. Un client ne peut jamais insérer une commande payée ni changer un statut.
- **Coûts internes jamais exposés** : `provider_*_cost`, `provider_price`, `provider_sid` sont exclus des vues publiques et de l'audit.
- **Traçabilité** : `audit_logs` en ajout seul (trigger anti UPDATE/DELETE), alimenté automatiquement pour rôles, statuts de compte, pays, prix, numéros, locations, remboursements, paiements, paramètres, rejeu de webhook.

## Migrations (`supabase/migrations/`)
| Fichier | Contenu |
|---|---|
| `…000100_extensions` | pgcrypto, citext, btree_gist |
| `…000200_enums` | 27 enums (statuts commande, location, paiement, numéro, …) |
| `…000300_helpers` | `set_updated_at`, `mask_e164`, `generate_public_reference` |
| `…000400_profiles_roles` | `roles`, `profiles`, `user_roles`, trigger d'inscription, `has_role/is_admin/is_staff/is_superadmin`, garde anti-élévation |
| `…000500_catalog` | `countries` (resale_allowed=false par défaut), `number_types`, `phone_numbers`, `phone_number_capabilities`, `phone_number_prices` (historisé) |
| `…000600_orders` | `orders`, `order_items` |
| `…000700_payments` | `payments`, `refunds` + contrôle somme remboursée ≤ payé |
| `…000800_rentals` | `rentals` (index unique anti-double location), `subscriptions` |
| `…000900_communications` | `messages`, `calls` (contenu chiffré côté app, rétention) |
| `…001000_webhooks_logs_jobs` | `webhooks`, `webhook_events` (unique provider+event_id), `provider_api_logs`, `job_queue` + `claim_next_job()` |
| `…001100_notifications_support` | `notifications`, `support_tickets`, `support_messages` |
| `…001200_settings_content_audit` | `site_settings` (refus des clés secrètes), `content_blocks`, `audit_logs` + triggers d'audit |
| `…001300_public_views` | `catalog_countries`, `catalog_numbers`, `catalog_number_prices`, `public_settings`, `published_content` |
| `…001400_rls` | Grants minimaux + politiques RLS + triggers de protection de colonnes |
| `…001500_seed_reference` | Seeds référentiels idempotents |
| `…001600_fix_grants` | Correctif : exécution de `generate_public_reference` pour les clients (tickets) |

## Relations principales
```
auth.users 1─1 profiles ; auth.users 1─n user_roles n─1 roles
countries 1─n phone_numbers n─1 number_types
phone_numbers 1─1 phone_number_capabilities ; phone_numbers 1─n phone_number_prices (ou règle pays+type)
auth.users 1─n orders 1─n order_items n─1 phone_numbers
orders 1─n payments 1─n refunds
orders 1─n rentals n─1 phone_numbers ; rentals 1─1 subscriptions
rentals 1─n messages / calls
support_tickets 1─n support_messages ; auth.users 1─n notifications
webhook_events, provider_api_logs, job_queue, audit_logs : journaux
```

## Matrice d'accès (RLS)
| Donnée | Client | Support | Admin | Superadmin |
|---|---|---|---|---|
| Catalogue (vues) | lecture | lecture | lecture | lecture |
| Son profil / commandes / paiements / locations / messages | lecture (+ `auto_renew`, redirection) | lecture (sauf messages/appels) | lecture + gestion | tout |
| Données d'autres clients | **aucune** | lecture | lecture | tout |
| `phone_number_prices` (avec coûts) | **aucune** | lecture | écriture | tout |
| Rôles | lecture des siens | — | attribuer `support` | attribuer `admin`/`superadmin` |
| `countries.resale_allowed` | — | — | — | **seul autorisé** |
| Remboursements | lecture des siens | — | créer | créer |
| Paramètres critiques | — | — | — | écriture |
| Logs, webhooks, jobs, audit | **aucune** | **aucune** | lecture (+ rejeu webhook) | lecture |
| `audit_logs` UPDATE/DELETE | interdit | interdit | interdit | interdit |
Personne ne peut modifier ses propres rôles.

## Tests
`supabase/tests/security.test.mjs` : 115 assertions (structure, FK, unicité, montants, dates, double location, double webhook, idempotence, RLS par rôle, triggers). Exécutés dans une transaction annulée : la base de test reste vide.

## Exécution locale (sans Docker)
```bash
# PostgreSQL embarqué (dev uniquement)
mkdir -p ~/pgtool && cd ~/pgtool && npm i embedded-postgres pg
BIN=~/pgtool/node_modules/@embedded-postgres/linux-x64/native/bin
$BIN/initdb -D ~/pgtool/data -U postgres --auth=trust && $BIN/pg_ctl -D ~/pgtool/data -o "-p 54329 -k /tmp" start
# Migrations + tests
supabase/tests/run-migrations.sh numberover_test
node supabase/tests/security.test.mjs numberover_test
# Types
PG_MODULE_DIR=~/pgtool DATABASE_URL=postgresql://postgres@localhost:54329/numberover_test node scripts/gen-db-types.mjs
```
Avec Docker/CLI Supabase : `supabase start`, `supabase db reset`, `supabase gen types typescript --local > src/types/database.ts`.

## Application sur le projet Supabase distant
**Nécessite votre confirmation explicite.** Depuis votre poste : `supabase login && supabase link --project-ref <ref> && supabase db push`. Ou coller chaque migration dans l'ordre dans SQL Editor.
Ensuite : `supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts`.

## Note sur le shim de test
`supabase/tests/00_supabase_shim.sql` reproduit `auth.users`, `auth.uid()` et les rôles Supabase pour PostgreSQL nu. **Ne jamais l'appliquer sur Supabase.**
