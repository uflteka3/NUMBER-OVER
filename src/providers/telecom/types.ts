/**
 * Contrat du fournisseur télécom de NUMBER OVER.
 *
 * Toute interaction avec un opérateur (Twilio en premier lieu) passe par cette
 * interface. Les implémentations vivent côté serveur uniquement.
 *
 * PHASE 2 : contrat uniquement. Aucune implémentation réseau.
 * PHASE 5 : implémentation Twilio en lecture (catalogue, prix, réglementation).
 * PHASE 10 : acquisition, libération, messagerie, voix.
 *
 * Règle : aucune valeur ici n'est une donnée réelle ; ce sont des formes de
 * données que le fournisseur devra remplir.
 */

/** Identifiant du fournisseur. Seul "twilio" est prévu ; l'union évite les chaînes libres. */
export type TelecomProviderId = "twilio";

/** Code pays ISO 3166-1 alpha-2, en majuscules (ex. "US"). */
export type CountryIso2 = string & { readonly __brand: "CountryIso2" };

/** Numéro au format E.164 (ex. "+14155550100" — format, pas un numéro réel). */
export type E164 = string & { readonly __brand: "E164" };

/** Types de numéros tels qu'exposés par les API de numérotation. */
export type NumberType = "local" | "mobile" | "toll_free" | "national";

/**
 * Capacités RÉELLES d'un numéro, telles que rapportées par le fournisseur.
 * Ne jamais les déduire du pays ou du type.
 */
export interface NumberCapabilities {
  readonly sms: boolean;
  readonly mms: boolean;
  readonly voice: boolean;
  readonly fax: boolean;
}

/** Pays retourné par le fournisseur, avec les types de numéros qu'il propose. */
export interface ProviderCountry {
  readonly iso2: CountryIso2;
  readonly name: string;
  readonly availableTypes: readonly NumberType[];
  readonly beta: boolean;
}

/** Numéro disponible à l'acquisition chez le fournisseur (non encore possédé). */
export interface AvailableNumber {
  readonly e164: E164;
  readonly countryIso2: CountryIso2;
  readonly type: NumberType;
  readonly capabilities: NumberCapabilities;
  readonly friendlyName?: string;
  readonly locality?: string;
  readonly region?: string;
  /** Exigences réglementaires signalées par le fournisseur pour ce numéro. */
  readonly requiresAddress: boolean;
  readonly requiresBundle: boolean;
}

/** Coût fournisseur d'un type de numéro dans un pays (montant + devise, tel quel). */
export interface ProviderNumberPrice {
  readonly countryIso2: CountryIso2;
  readonly type: NumberType;
  readonly monthlyCost: string; // chaîne décimale exacte, pas de float
  readonly currency: string; // ISO 4217
  readonly retrievedAt: string; // ISO 8601
}

/** Numéro déjà possédé sur le compte fournisseur. */
export interface OwnedNumber {
  readonly providerSid: string;
  readonly e164: E164;
  readonly countryIso2: CountryIso2;
  readonly capabilities: NumberCapabilities;
  readonly friendlyName?: string;
  readonly acquiredAt?: string;
}

export interface SearchAvailableNumbersParams {
  readonly countryIso2: CountryIso2;
  readonly type: NumberType;
  readonly smsEnabled?: boolean;
  readonly voiceEnabled?: boolean;
  readonly contains?: string;
  readonly limit?: number;
}

/** Résultat homogène de chaque appel fournisseur, pour journalisation et gestion d'erreur. */
export type ProviderResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ProviderError };

export interface ProviderError {
  readonly provider: TelecomProviderId;
  readonly operation: string;
  /** Code d'erreur du fournisseur si disponible (ex. code numérique Twilio). */
  readonly providerCode?: string | number;
  readonly httpStatus?: number;
  /** Message technique — pour les logs serveur, jamais renvoyé tel quel au client. */
  readonly message: string;
  readonly retryable: boolean;
}

/**
 * Interface du fournisseur télécom.
 * Les méthodes d'écriture (acquire/release/send) sont déclarées dès maintenant
 * pour figer le contrat, mais ne seront implémentées qu'en phase 10.
 */
export interface TelecomProvider {
  readonly id: TelecomProviderId;

  // --- Lecture (phase 5) ---
  listCountries(): Promise<ProviderResult<readonly ProviderCountry[]>>;
  searchAvailableNumbers(
    params: SearchAvailableNumbersParams,
  ): Promise<ProviderResult<readonly AvailableNumber[]>>;
  getNumberPrices(countryIso2: CountryIso2): Promise<ProviderResult<readonly ProviderNumberPrice[]>>;
  listOwnedNumbers(): Promise<ProviderResult<readonly OwnedNumber[]>>;

  // --- Écriture (phase 10) ---
  acquireNumber(params: {
    readonly e164: E164;
    readonly idempotencyKey: string;
    readonly webhookBaseUrl: string;
  }): Promise<ProviderResult<OwnedNumber>>;
  releaseNumber(providerSid: string): Promise<ProviderResult<void>>;

  // --- Webhooks (phase 10) ---
  verifyWebhookSignature(params: {
    readonly signature: string | null;
    readonly url: string;
    readonly params: Record<string, string>;
  }): boolean;
}
