import "server-only";
import { z } from "zod";

/**
 * Variables SERVEUR (secrets).
 * Ce module importe "server-only" : toute importation depuis un composant client
 * provoque une erreur de compilation, ce qui empêche une fuite accidentelle.
 *
 * Toutes les valeurs sont optionnelles en phase 2 ; chaque fonctionnalité qui en
 * a besoin appelle `requireServerEnv()` et échoue proprement si elle manque.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_API_KEY_SID: z.string().min(1).optional(),
  TWILIO_API_KEY_SECRET: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  PAYMENT_PROVIDER: z.string().min(1).optional(),
  PAYMENT_SECRET_KEY: z.string().min(1).optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(16).optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;

const clean = (v: string | undefined) => (v && v.length > 0 ? v : undefined);

const parsed = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_SERVICE_ROLE_KEY: clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  TWILIO_ACCOUNT_SID: clean(process.env.TWILIO_ACCOUNT_SID),
  TWILIO_API_KEY_SID: clean(process.env.TWILIO_API_KEY_SID),
  TWILIO_API_KEY_SECRET: clean(process.env.TWILIO_API_KEY_SECRET),
  TWILIO_AUTH_TOKEN: clean(process.env.TWILIO_AUTH_TOKEN),
  PAYMENT_PROVIDER: clean(process.env.PAYMENT_PROVIDER),
  PAYMENT_SECRET_KEY: clean(process.env.PAYMENT_SECRET_KEY),
  PAYMENT_WEBHOOK_SECRET: clean(process.env.PAYMENT_WEBHOOK_SECRET),
  CRON_SECRET: clean(process.env.CRON_SECRET),
});

if (!parsed.success) {
  const fields = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
  throw new Error(`Variables serveur invalides : ${fields}`);
}

export const serverEnv: Readonly<ServerEnv> = Object.freeze(parsed.data);

/** Garde-fou : refuse d'exposer une variable préfixée NEXT_PUBLIC_ comme secret. */
type SecretKey = Exclude<keyof ServerEnv, "NODE_ENV">;

/**
 * Récupère une variable serveur obligatoire ou lève une erreur de configuration
 * dont le message ne contient jamais la valeur.
 */
export function requireServerEnv(key: SecretKey): string {
  const value = serverEnv[key];
  if (!value) {
    throw new Error(`Configuration manquante : la variable ${key} n'est pas définie.`);
  }
  return value;
}

export const isServerFeatureConfigured = {
  supabaseAdmin: () => Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY),
  twilio: () =>
    Boolean(
      serverEnv.TWILIO_ACCOUNT_SID &&
        ((serverEnv.TWILIO_API_KEY_SID && serverEnv.TWILIO_API_KEY_SECRET) ||
          serverEnv.TWILIO_AUTH_TOKEN),
    ),
  payment: () => Boolean(serverEnv.PAYMENT_PROVIDER && serverEnv.PAYMENT_SECRET_KEY),
};
