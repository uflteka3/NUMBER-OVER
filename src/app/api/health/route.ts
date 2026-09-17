import { NextResponse } from "next/server";
import { isSupabasePublicConfigured } from "@/lib/env";
import { isServerFeatureConfigured } from "@/lib/env/server";

export const dynamic = "force-dynamic";

/**
 * Sonde de santé pour l'hébergeur et la CI.
 * Expose uniquement des booléens de configuration — jamais une valeur.
 */
export function GET() {
  return NextResponse.json(
    {
      service: "NUMBER OVER",
      status: "ok",
      phase: 2,
      configured: {
        supabase: isSupabasePublicConfigured(),
        supabaseAdmin: isServerFeatureConfigured.supabaseAdmin(),
        telecom: isServerFeatureConfigured.twilio(),
        payment: isServerFeatureConfigured.payment(),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
