/**
 * Types de la base de données Supabase.
 *
 * PHASE 2 : type vide volontaire. Il sera REMPLACÉ en phase 3 par la sortie de
 * `supabase gen types typescript` après création des migrations.
 * Ne pas écrire de tables à la main ici.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
