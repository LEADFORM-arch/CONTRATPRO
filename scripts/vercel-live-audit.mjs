import { existsSync, readFileSync } from "node:fs";

const checks = [];

function check(label, passed, detail, level = "fail") {
  checks.push({ detail, label, level, passed });
}

function parseVercelEnv(output) {
  const variables = new Map();

  for (const line of output.split(/\r?\n/)) {
    const columns = line.trim().split(/\s{2,}/);
    if (columns.length < 4 || columns[0] === "name" || columns[0].startsWith(">")) {
      continue;
    }

    const [name, value, environments] = columns;
    if (/^[A-Z0-9_]+$/.test(name)) {
      variables.set(name, { environments, value });
    }
  }

  return variables;
}

function hasProduction(variables, name) {
  return variables.get(name)?.environments.includes("Production") ?? false;
}

function valueOf(variables, name) {
  return variables.get(name)?.value?.replace(/^["']|["']$/g, "") ?? "";
}

function valueEquals(variables, name, expected) {
  return valueOf(variables, name) === expected;
}

function hasOneOfProduction(variables, names) {
  return names.some((name) => hasProduction(variables, name));
}

const inputPath = process.argv[2];
const input = inputPath && existsSync(inputPath)
  ? readFileSync(inputPath, "utf8")
  : readFileSync(0, "utf8");

if (!input.includes("Environment Variables found")) {
  console.error("Usage: npx vercel env ls | node scripts/vercel-live-audit.mjs");
  console.error("Ou: node scripts/vercel-live-audit.mjs .vercel-env.txt");
  console.error("Le script audite la sortie Vercel CLI sans afficher les secrets.");
  process.exit(1);
}

const variables = parseVercelEnv(input);

check(
  "Auth production",
  valueEquals(variables, "CONTRATPRO_REQUIRE_AUTH", "true"),
  "CONTRATPRO_REQUIRE_AUTH doit valoir true en Production.",
);

check(
  "RLS production",
  valueEquals(variables, "CONTRATPRO_RLS_ENABLED", "true"),
  "CONTRATPRO_RLS_ENABLED doit valoir true et supabase/verify_rls.sql doit etre OK.",
);

check(
  "Billing lock",
  valueEquals(variables, "CONTRATPRO_REQUIRE_BILLING", "true"),
  "CONTRATPRO_REQUIRE_BILLING=false garde ContratPro en pilote gratuit: LIVE PAUSE.",
);

check(
  "Organisation production",
  hasProduction(variables, "CONTRATPRO_ORG_ID") && valueOf(variables, "CONTRATPRO_ORG_ID") !== "org_demo",
  "CONTRATPRO_ORG_ID ne doit pas pointer vers org_demo en Production.",
);

check(
  "URL application",
  hasProduction(variables, "NEXT_PUBLIC_APP_URL") && hasProduction(variables, "CONTRATPRO_APP_URL"),
  "NEXT_PUBLIC_APP_URL et CONTRATPRO_APP_URL doivent pointer vers le domaine public final.",
);

check(
  "Supabase production",
  hasProduction(variables, "SUPABASE_URL") &&
    hasProduction(variables, "SUPABASE_SERVICE_ROLE_KEY") &&
    hasProduction(variables, "NEXT_PUBLIC_SUPABASE_URL") &&
    hasProduction(variables, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  "Supabase URL, anon key et service role doivent exister en Production.",
);

check(
  "Resend documents",
  hasProduction(variables, "RESEND_API_KEY") && hasProduction(variables, "RESEND_FROM_EMAIL"),
  "RESEND_API_KEY et RESEND_FROM_EMAIL sont requis pour emails documents et relances.",
);

check(
  "Stripe multi-paliers",
  hasProduction(variables, "STRIPE_SECRET_KEY") &&
    hasProduction(variables, "STRIPE_WEBHOOK_SECRET") &&
    hasProduction(variables, "STRIPE_PRICE_ID_STARTER") &&
    hasOneOfProduction(variables, ["STRIPE_PRICE_ID_PRO", "STRIPE_PRICE_ID"]) &&
    hasProduction(variables, "STRIPE_PRICE_ID_BUSINESS"),
  "Starter, Pro et Business doivent avoir leurs price_id live avant billing obligatoire.",
);

check(
  "GoCardless live",
  hasProduction(variables, "GOCARDLESS_ACCESS_TOKEN") &&
    valueEquals(variables, "GOCARDLESS_ENVIRONMENT", "live") &&
    hasProduction(variables, "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET"),
  "GoCardless doit avoir token live, environment=live et webhook secret.",
);

check(
  "Cron relances",
  hasOneOfProduction(variables, ["CRON_SECRET", "CONTRATPRO_CRON_SECRET"]),
  "CRON_SECRET ou CONTRATPRO_CRON_SECRET doit proteger /api/cron/renewals.",
);

check(
  "Bypass smoke Vercel",
  Boolean(process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()),
  "Definir VERCEL_AUTOMATION_BYPASS_SECRET localement si Deployment Protection reste active pendant les smokes.",
  "warn",
);

const failures = checks.filter((item) => !item.passed && item.level === "fail");
const warnings = checks.filter((item) => !item.passed && item.level === "warn");

for (const item of checks) {
  const symbol = item.passed ? "OK" : item.level === "warn" ? "WARN" : "FAIL";
  console.log(`${symbol} ${item.label} - ${item.detail}`);
}

if (failures.length) {
  console.error(`\nLIVE PAUSE: ${failures.length} blocage(s) Vercel production a corriger avant ouverture publique.`);
  process.exit(1);
}

if (warnings.length) {
  console.warn(`\nLIVE CONTROLE: ${warnings.length} avertissement(s) a traiter avant smoke final.`);
  process.exit(0);
}

console.log("\nLIVE OK: variables Vercel production alignees avec le lancement payant.");
