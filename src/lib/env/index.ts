/**
 * Point d'entrée du module d'environnement.
 *
 * - `publicEnv`  : importable partout (client et serveur), aucun secret.
 * - `serverEnv`  : à importer depuis "@/lib/env/server" uniquement côté serveur.
 *
 * On ne ré-exporte volontairement PAS serverEnv ici, afin qu'un composant client
 * qui importe "@/lib/env" ne puisse jamais tirer un secret par transitivité.
 */
export { publicEnv, isSupabasePublicConfigured } from "./public";
