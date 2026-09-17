import "server-only";

import type { TelecomProvider } from "../types";

/**
 * Adaptateur Twilio — EMPLACEMENT RÉSERVÉ (phase 2).
 *
 * L'implémentation réelle (SDK `twilio`, appels réseau, validation de signature)
 * sera écrite en phase 5 (lecture) et phase 10 (écriture), après autorisation.
 *
 * En phase 2, ce module n'installe pas le SDK et n'effectue aucun appel : il
 * garantit seulement que le point d'intégration existe et est typé.
 */
export function createTwilioProvider(): TelecomProvider {
  throw new Error("Le fournisseur Twilio n'est pas encore implémenté (prévu en phase 5).");
}
