import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase SERVEUR lié à la session de l'utilisateur (cookies).
 * Utilise la clé anonyme + le JWT de session : RLS s'applique.
 * À utiliser dans les Server Components, Server Actions et Route Handlers.
 */
export async function createSupabaseServerClient() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : les cookies sont en lecture seule.
          // Le middleware (phase 4) se chargera du rafraîchissement de session.
        }
      },
    },
  });
}
