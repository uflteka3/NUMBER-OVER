/**
 * Contrat du fournisseur de paiement — PHASE 2 : formes de données uniquement.
 * Le fournisseur (Stripe ou autre) sera choisi avec vous avant la phase 9.
 * Aucun paiement, même fictif, n'est traité par ce module.
 */

export type PaymentProviderId = "stripe" | "other";

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded"
  | "partially_refunded"
  | "disputed";

/** Montant en plus petite unité de la devise (centimes), entier, jamais de float. */
export interface Money {
  readonly amountMinor: number;
  readonly currency: string; // ISO 4217
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  /** Vérifie la signature d'un webhook entrant. Obligatoire avant tout traitement. */
  verifyWebhookSignature(params: { readonly rawBody: string; readonly signature: string | null }): boolean;
}
