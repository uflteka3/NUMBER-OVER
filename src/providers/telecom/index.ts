import "server-only";

import { isServerFeatureConfigured } from "@/lib/env/server";
import { AppError } from "@/lib/errors";
import { createTwilioProvider } from "./twilio";
import type { TelecomProvider, TelecomProviderId } from "./types";

export type * from "./types";

/**
 * Fabrique du fournisseur télécom. Point d'entrée unique du reste de
 * l'application : aucun autre module ne doit importer le SDK d'un opérateur.
 */
export function getTelecomProvider(id: TelecomProviderId = "twilio"): TelecomProvider {
  switch (id) {
    case "twilio": {
      if (!isServerFeatureConfigured.twilio()) {
        throw new AppError("NOT_CONFIGURED", "Le service télécom n'est pas configuré.");
      }
      return createTwilioProvider();
    }
  }
}
