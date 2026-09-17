"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase NAVIGATEUR.
 * Utilise exclusivement la clé anonyme (publique par conception) ; toute donnée
 * accessible via ce client est protégée par Row Level Security (phase 3).
 *
 * Retourne `null` si Supabase n'est pas configuré, afin que l'application
 * fonctionne en phase 2 sans base de données.
 */
export function createSupabaseBrowserClient() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient<Database>(url, anonKey);
}
