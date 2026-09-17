# Déploiement NUMBER OVER — Vercel + Supabase

## Variables d'environnement Vercel
Projet → Settings → Environment Variables. Ne jamais mettre ces valeurs dans le dépôt.

| Nom | Où trouver la valeur | Environnements | Sensitive |
|---|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase → Project Settings → API → Project URL (racine, sans /rest/v1/) | Production, Preview, Development | non |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase → Project Settings → API → anon public | Production, Preview, Development | non |
| SUPABASE_SERVICE_ROLE_KEY | Supabase → Project Settings → API → service_role | Production, Preview | OUI |
| NEXT_PUBLIC_APP_URL | URL du site Vercel (https://…vercel.app puis domaine final) | Production | non |
| CRON_SECRET | Chaîne aléatoire ≥ 32 caractères | Production, Preview | OUI |
| TWILIO_* | Phase 5 | Production, Preview | OUI |
| PAYMENT_* | Phase 9 | Production, Preview | OUI |

## Vérification après déploiement
Ouvrir `https://<votre-site>/api/health` : les booléens `configured.supabase` et `configured.supabaseAdmin` doivent être `true`. Aucune valeur n'est exposée.

## Migrations Supabase
Écrites dans `supabase/migrations/` (phase 3). À appliquer avec la CLI Supabase depuis votre poste :
```
supabase login
supabase link --project-ref <ref>
supabase db push
```
ou en collant chaque fichier, dans l'ordre, dans Supabase → SQL Editor.
