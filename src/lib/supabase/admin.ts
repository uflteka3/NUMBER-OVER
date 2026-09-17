import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env/server";
import { AppError } from "@/lib/errors";
import type { Database } from "@/types/database";

/**
 * Client Supabase ADMINISTRATEUR (service role).
 *
 * ⚠️ Contourne totalement Row Level Security.
 * Réservé aux traitements serveur de confiance : webhooks vérifiés, jobs
 * planifiés, provisioning. Ne JAMAIS l'utiliser pour servir une requête
 * utilisateur sans contrôle d'autorisation explicite en amont.
 */
export function createSupabaseAdminClient() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new AppError("CONFIGURATION_MISSING", "Le service de données n'est pas configuré.");
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
