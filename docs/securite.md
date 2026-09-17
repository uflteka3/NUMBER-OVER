# Sécurité — décisions de la phase 2

## Séparation public / serveur
- `src/lib/env/public.ts` : uniquement `NEXT_PUBLIC_*`. Intégré au bundle navigateur.
- `src/lib/env/server.ts` : secrets. Import `server-only` → erreur de build si importé depuis un composant client.
- `src/lib/env/index.ts` ne ré-exporte jamais la partie serveur.

## Clients Supabase
| Fichier | Clé | RLS | Contexte |
|---|---|---|---|
| `client.ts` | anon | appliquée | navigateur |
| `server.ts` | anon + session cookie | appliquée | Server Components / Actions / Route Handlers |
| `admin.ts` | service role | **contournée** | webhooks vérifiés, jobs, provisioning uniquement |

## Erreurs
- `AppError` sépare `userMessage` (affichable) et `cause` (logs).
- `error.tsx` n'affiche jamais `error.message`.
- Les erreurs de configuration citent le **nom** de la variable, jamais sa valeur.

## Dépôt
- `.gitignore` exclut `.env`, `.env.*` (sauf `.env.example`), clés privées, `.vercel/`.
- `scripts/check-secrets.mjs` exécuté en CI.

## À venir
- Phase 3 : RLS sur toutes les tables.
- Phase 4 : rate limiting auth, MFA admin.
- Phase 9/10 : vérification de signature des webhooks paiement et Twilio.
- Phase 14 : CSP stricte, audit complet.
