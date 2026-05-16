import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export function loadLocalEnv() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) {
    return false;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1].startsWith("#")) {
      continue;
    }

    const [, key, rawValue] = match;
    if (!process.env[key]) {
      process.env[key] = stripQuotes(rawValue);
    }
  }

  return true;
}

export function getSmokeConfig(commandName) {
  loadLocalEnv();

  const lifecycle = process.env.npm_lifecycle_event ?? commandName;
  const isDeploySmoke = lifecycle.startsWith("deploy:");
  const defaultBaseUrl = isDeploySmoke
    ? process.env.CONTRATPRO_DEPLOYMENT_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.CONTRATPRO_APP_URL ||
      "http://localhost:3000"
    : process.env.CONTRATPRO_SMOKE_BASE_URL || "http://localhost:3000";
  const rawBaseUrl =
    process.argv[2] ??
    defaultBaseUrl;
  const email = process.env.CONTRATPRO_SMOKE_EMAIL;
  const password = process.env.CONTRATPRO_SMOKE_PASSWORD;

  if (!email || !password) {
    console.error("CONTRATPRO_SMOKE_EMAIL et CONTRATPRO_SMOKE_PASSWORD sont requis.");
    console.error(`Usage local: npm run ${commandName}`);
    console.error(`Usage Vercel: npm run ${commandName} -- https://votre-deploiement.vercel.app`);
    console.error("Definir ces variables dans le terminal courant ou dans .env.local ignore par Git.");
    process.exit(1);
  }

  const placeholderEmail =
    email.includes("ton-domaine.fr") ||
    email.includes("votre-domaine.fr") ||
    email.endsWith("@example.com") ||
    email.endsWith("@example.fr");
  const placeholderPassword =
    password.includes("mot-de-passe") ||
    password.includes("votre-") ||
    password.includes("ton_");

  if (placeholderEmail || placeholderPassword) {
    console.error("Les identifiants smoke sont encore des valeurs d'exemple.");
    console.error("Creez un vrai utilisateur Supabase Auth, puis remplacez CONTRATPRO_SMOKE_EMAIL et CONTRATPRO_SMOKE_PASSWORD dans .env.local.");
    console.error(`Email actuel: ${email}`);
    process.exit(1);
  }

  return {
    baseUrl: rawBaseUrl.replace(/\/+$/, ""),
    email,
    password,
  };
}

export function getDeploymentProtectionHeaders() {
  loadLocalEnv();

  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (!bypassSecret || ["[]", "{}", "\"\"", "''"].includes(bypassSecret)) {
    return {};
  }

  return {
    "x-vercel-protection-bypass": stripQuotes(bypassSecret),
  };
}

export async function read(response) {
  return response.text().catch(() => "");
}

export function getSessionCookie(response) {
  const cookies = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : response.headers.get("set-cookie")?.split(/,(?=[^;]+?=)/) ?? [];

  return cookies.map((value) => value.split(";")[0]).join("; ");
}

export function containsDashboardErrorBoundary(body) {
  return [
    "TENANT_DEMO_FORBIDDEN",
    "TENANT_CONFIG_REQUIRED",
    "DASHBOARD_RUNTIME_ERROR",
    "Verifier la securite",
    "Acces bloque par securite",
    "Configuration incomplete",
  ].some((marker) => body.includes(marker));
}
