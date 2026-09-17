# NUMBER OVER

Plateforme de vente et de location de numéros virtuels (SMS et appels selon les capacités réelles de chaque numéro), fournisseur télécom principal : Twilio.

> **État : phase 2 — architecture et configuration.**
> Aucune fonctionnalité commerciale, aucun numéro, aucun prix et aucun paiement ne sont encore implémentés. Le catalogue sera alimenté exclusivement par des données réelles issues du compte Twilio à partir de la phase 5.

## Stack

| Couche | Choix | Raison |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19 | Rendu serveur, Route Handlers et Server Actions : les secrets restent côté serveur. |
| Langage | TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | Fiabilité des flux argent/attribution. |
| Styles | Tailwind CSS 4 | Responsive mobile-first, poids faible. |
| Données / Auth | Supabase (PostgreSQL, Auth, RLS) | Isolation par client via Row Level Security (phase 3). |
| Validation | Zod | Validation serveur des entrées et des variables d'environnement. |
| CI | GitHub Actions | Lint, typecheck, scan de secrets, audit, build. |

## Dépendances et justification

Production :
- `next`, `react`, `react-dom` — framework.
- `@supabase/supabase-js` — client base de données/auth.
- `@supabase/ssr` — gestion des sessions Supabase par cookies dans l'App Router.
- `zod` — validation.

Développement :
- `typescript`, `@types/node`, `@types/react`, `@types/react-dom` — typage.
- `tailwindcss`, `@tailwindcss/postcss` — styles.
- `eslint`, `eslint-config-next` — lint.

Le SDK Twilio et le SDK de paiement **ne sont pas installés** : ils le seront respectivement en phase 5 et en phase 9, après autorisation.

## Installation

```bash
npm ci
cp .env.example .env.local   # remplir uniquement ce qui est nécessaire
npm run dev                  # http://localhost:3000
```

L'application démarre **sans aucune variable renseignée** : les fonctionnalités dépendant d'un service absent se signalent comme « non configurées » (voir `GET /api/health`) sans exposer de valeur.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarrage du build |
| `npm run lint` | ESLint (inclut une règle interdisant `process.env` hors de `src/lib/env`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:secrets` | Vérifie qu'aucun `.env`, clé privée ou motif de secret n'est versionné |
| `npm run check` | Enchaîne lint, typecheck, secrets, build |

## Architecture des dossiers

```
src/
├── app/                      # App Router
│   ├── layout.tsx            # Layout racine (lang="fr", viewport, metadata)
│   ├── page.tsx              # Page temporaire « En construction »
│   ├── error.tsx             # Frontière d'erreur : message générique, aucun détail interne
│   ├── not-found.tsx
│   ├── globals.css           # Tailwind + jetons de design provisoires
│   └── api/health/route.ts   # Sonde : booléens de configuration uniquement
├── components/
│   ├── layout/               # En-tête, pied de page, marque
│   └── ui/                   # Composants réutilisables (phase 6)
├── lib/
│   ├── env/
│   │   ├── public.ts         # Variables NEXT_PUBLIC_* validées (sans secret)
│   │   ├── server.ts         # Secrets serveur, protégé par "server-only"
│   │   └── index.ts          # N'exporte QUE la partie publique
│   ├── errors/               # AppError + conversion en erreur sûre pour le client
│   └── supabase/
│       ├── client.ts         # Navigateur — clé anon, RLS
│       ├── server.ts         # Serveur, session utilisateur — clé anon, RLS
│       └── admin.ts          # Serveur uniquement — service role, contourne RLS
├── providers/
│   ├── telecom/
│   │   ├── types.ts          # Contrat TelecomProvider (capacités réelles, résultats typés)
│   │   ├── index.ts          # Fabrique getTelecomProvider()
│   │   └── twilio/           # Adaptateur Twilio (implémentation en phases 5 et 10)
│   └── payment/              # Contrat PaymentProvider (fournisseur choisi avant phase 9)
└── types/database.ts         # Types Supabase — remplacés par génération en phase 3
scripts/check-secrets.mjs     # Scan de secrets
docs/ci/ci.yml                # Workflow CI à installer manuellement (voir docs/ci/README.md)
docs/                         # Documentation (architecture, sécurité, exploitation)
```

## Règles de sécurité appliquées dès cette phase

- `.env*` ignorés par Git (sauf `.env.example`, sans valeurs).
- Secrets lus uniquement via `src/lib/env/server.ts`, marqué `server-only` : toute importation côté client échoue à la compilation.
- ESLint interdit `process.env` hors du module d'environnement.
- Trois clients Supabase séparés ; le client `admin` (service role) n'est jamais importable côté client.
- Messages d'erreur génériques côté client (`error.tsx`, `toSafeClientError`).
- En-têtes de sécurité (`X-Frame-Options`, `nosniff`, HSTS, `Referrer-Policy`, `Permissions-Policy`) ; `X-Powered-By` désactivé.
- `robots: noindex` tant que le site est en construction.
- CI : scan de secrets et `npm audit --audit-level=high` bloquants.

## Feuille de route

Voir `docs/phases.md`. Chaque phase requiert une validation explicite avant la suivante.
