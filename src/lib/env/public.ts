import { z } from "zod";

/**
 * Variables PUBLIQUES (préfixe NEXT_PUBLIC_).
 * Elles sont intégrées au bundle navigateur : n'y placer AUCUN secret.
 * Toutes sont optionnelles en phase 2 : l'application doit démarrer sans Supabase.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

// Next.js remplace process.env.NEXT_PUBLIC_* statiquement : l'accès doit être explicite.
const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
});

if (!parsed.success) {
  // Ne journalise que les noms de variables, jamais leurs valeurs.
  const fields = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
  throw new Error(`Variables publiques invalides : ${fields}`);
}

export const publicEnv = parsed.data;

export const isSupabasePublicConfigured = (): boolean =>
  Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
