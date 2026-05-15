import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const envPath = resolve(root, ".env.local");
const demoOrganizationId = "org_demo";
const failures = [];
const warnings = [];

function parseEnv(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), normalize(line.slice(index + 1))];
      }),
  );
}

function normalize(value = "") {
  return value.trim().replace(/^["']+|["']+$/g, "");
}

function hasValue(value) {
  const normalized = normalize(value);
  return Boolean(normalized) && !["[]", "{}"].includes(normalized);
}

if (!existsSync(envPath)) {
  warnings.push(".env.local absent. Copiez .env.local.example puis renseignez les secrets locaux.");
} else {
  const env = parseEnv(readFileSync(envPath, "utf8"));
  const localVercelEnv = normalize(env.VERCEL_ENV);
  const localNodeEnv = normalize(env.NODE_ENV);
  const configuredOrg = normalize(env.CONTRATPRO_ORG_ID || env.NEXT_PUBLIC_CONTRATPRO_ORG_ID);
  const publicLeadOrg = normalize(env.CONTRATPRO_PUBLIC_LEAD_ORG_ID);

  if (localVercelEnv) {
    failures.push(
      "VERCEL_ENV ne doit pas etre defini dans .env.local. Supprimez cette ligne: Vercel l'injecte seulement en deploiement.",
    );
  }

  if (localNodeEnv === "production") {
    failures.push("NODE_ENV=production ne doit pas etre defini dans .env.local pour le developpement.");
  }

  if (configuredOrg === demoOrganizationId) {
    failures.push(
      "CONTRATPRO_ORG_ID pointe vers org_demo. Utilisez une vraie organisation locale, par exemple org_contratpro_admin.",
    );
  }

  if (publicLeadOrg === demoOrganizationId) {
    failures.push(
      "CONTRATPRO_PUBLIC_LEAD_ORG_ID pointe vers org_demo. Utilisez une organisation de collecte non-demo.",
    );
  }

  if (!hasValue(env.CONTRATPRO_REQUIRE_AUTH)) {
    warnings.push("CONTRATPRO_REQUIRE_AUTH absent. Mettez true pour tester le flux reel.");
  }

  if (!hasValue(env.SUPABASE_SERVICE_ROLE_KEY)) {
    warnings.push("SUPABASE_SERVICE_ROLE_KEY absent ou illisible. Certaines routes serveur ne fonctionneront pas.");
  }
}

for (const warning of warnings) {
  console.warn(`WARN env: ${warning}`);
}

if (failures.length) {
  console.error("\nContratPro env guard a bloque le demarrage local:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error("\nVoir docs/local-development-env.md pour restaurer une configuration saine.\n");
  process.exit(1);
}

console.log("OK env guard: configuration locale coherente.");
