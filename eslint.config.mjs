import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "node_modules/**", "next-env.d.ts"]),
  {
    rules: {
      // Interdit l'accès direct à process.env hors du module d'environnement validé.
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.object.name='process'][object.property.name='env']",
          message:
            "N'accédez pas à process.env directement : utilisez src/lib/env (serverEnv / publicEnv).",
        },
      ],
    },
  },
  {
    files: ["src/lib/env/**", "next.config.ts", "scripts/**"],
    rules: { "no-restricted-syntax": "off" },
  },
]);
