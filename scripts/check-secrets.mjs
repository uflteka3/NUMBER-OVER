#!/usr/bin/env node
/**
 * Vérification de sécurité NUMBER OVER :
 *  1. Aucun fichier .env (hors .env.example) n'est suivi par Git.
 *  2. Aucun motif de secret connu n'apparaît dans les fichiers suivis.
 *  3. Aucune variable NEXT_PUBLIC_ ne porte un nom de secret.
 * Sort avec le code 1 en cas d'anomalie. Utilisé en local et en CI.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const tracked = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
const problems = [];

// 1. Fichiers d'environnement
for (const f of tracked) {
  const base = f.split("/").pop() ?? "";
  if (base === ".env" || (base.startsWith(".env.") && base !== ".env.example")) {
    problems.push(`Fichier d'environnement versionné : ${f}`);
  }
  if (/\.(pem|key|p12|pfx)$/i.test(base)) problems.push(`Clé privée versionnée : ${f}`);
}

// 2. Motifs de secrets
const patterns = [
  { name: "Twilio Account SID", re: /\bAC[0-9a-fA-F]{32}\b/ },
  { name: "Twilio API Key SID", re: /\bSK[0-9a-fA-F]{32}\b/ },
  { name: "Stripe secret key", re: /\b(sk|rk)_(live|test)_[0-9A-Za-z]{10,}\b/ },
  { name: "Stripe webhook secret", re: /\bwhsec_[0-9A-Za-z]{10,}\b/ },
  { name: "Supabase service role JWT", re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/ },
  { name: "Supabase secret key", re: /\bsb_secret_[0-9A-Za-z_-]{10,}\b/ },
  { name: "Clé privée PEM", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Affectation de secret en dur", re: /(auth_?token|api_?secret|service_role_key|secret_key)\s*[:=]\s*["'][^"'\s]{16,}["']/i },
];

const textExt = /\.(ts|tsx|js|mjs|cjs|json|md|yml|yaml|toml|css|sql|txt|example|sh)$/i;
for (const f of tracked) {
  if (!textExt.test(f) && !f.startsWith(".")) continue;
  if (f === "package-lock.json" || f === "scripts/check-secrets.mjs") continue;
  let content;
  try {
    content = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  for (const { name, re } of patterns) {
    if (re.test(content)) problems.push(`${name} détecté dans ${f}`);
  }
}

// 3. Variables publiques suspectes dans .env.example
try {
  const example = readFileSync(".env.example", "utf8");
  for (const line of example.split("\n")) {
    const m = line.match(/^NEXT_PUBLIC_([A-Z0-9_]+)=/);
    if (m && /(SECRET|SERVICE_ROLE|TOKEN|PRIVATE)/.test(m[1])) {
      problems.push(`Variable publique au nom de secret dans .env.example : NEXT_PUBLIC_${m[1]}`);
    }
    const v = line.match(/^[A-Z0-9_]+=(.+)$/);
    if (v && !line.startsWith("NEXT_PUBLIC_APP_URL") && !line.startsWith("NODE_ENV") && v[1].trim() !== "") {
      problems.push(`.env.example contient une valeur non vide : ${line.split("=")[0]}`);
    }
  }
} catch {
  problems.push(".env.example introuvable");
}

if (problems.length) {
  console.error("✖ Vérification des secrets ÉCHOUÉE :");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`✔ Vérification des secrets réussie (${tracked.length} fichiers suivis analysés).`);
