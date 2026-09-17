/**
 * Erreur applicative typée.
 *
 * - `code`        : identifiant stable, utilisable côté client.
 * - `userMessage` : message affichable à l'utilisateur, jamais de détail interne.
 * - `cause`       : détail technique conservé pour les logs serveur uniquement.
 */
export type AppErrorCode =
  | "CONFIGURATION_MISSING"
  | "NOT_CONFIGURED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "PROVIDER_ERROR"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly status: number;

  constructor(
    code: AppErrorCode,
    userMessage: string,
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(userMessage, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "AppError";
    this.code = code;
    this.userMessage = userMessage;
    this.status = options.status ?? defaultStatus(code);
  }
}

function defaultStatus(code: AppErrorCode): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "VALIDATION_FAILED":
      return 422;
    case "PROVIDER_ERROR":
      return 502;
    case "CONFIGURATION_MISSING":
    case "NOT_CONFIGURED":
    case "INTERNAL":
      return 500;
  }
}

/**
 * Convertit n'importe quelle erreur en réponse sûre pour le client :
 * aucun message interne, aucune pile d'appels, aucune valeur de configuration.
 */
export function toSafeClientError(error: unknown): { code: AppErrorCode; message: string; status: number } {
  if (error instanceof AppError) {
    return { code: error.code, message: error.userMessage, status: error.status };
  }
  return {
    code: "INTERNAL",
    message: "Une erreur est survenue. Veuillez réessayer plus tard.",
    status: 500,
  };
}
