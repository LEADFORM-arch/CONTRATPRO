import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checks = [];

function file(path) {
  return resolve(root, path);
}

function read(path) {
  return readFileSync(file(path), "utf8");
}

function check(label, passed, detail) {
  checks.push({ detail, label, passed });
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function parseJson(path) {
  return JSON.parse(read(path));
}

check(
  "Template env production",
  existsSync(file(".env.production.example")),
  ".env.production.example doit lister les variables Vercel",
);

const envTemplate = existsSync(file(".env.production.example"))
  ? read(".env.production.example")
  : "";
for (const variable of [
  "NEXT_PUBLIC_APP_URL",
  "CONTRATPRO_REQUIRE_AUTH=true",
  "CONTRATPRO_RLS_ENABLED=true",
  "CONTRATPRO_REQUIRE_BILLING=true",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET",
  "STRIPE_WEBHOOK_SECRET",
  "CRON_SECRET",
]) {
  check(
    `Env ${variable}`,
    envTemplate.includes(variable),
    "variable attendue dans le template production",
  );
}

check("vercel.json present", existsSync(file("vercel.json")), "configuration Vercel requise");
if (existsSync(file("vercel.json"))) {
  const vercel = parseJson("vercel.json");
  const cron = Array.isArray(vercel.crons)
    ? vercel.crons.find((item) => item.path === "/api/cron/renewals")
    : null;
  check(
    "Vercel cron relances",
    Boolean(cron?.schedule),
    "vercel.json doit planifier /api/cron/renewals",
  );
}

const cronRoute = read("src/app/api/cron/renewals/route.ts");
check(
  "Cron compatible Vercel GET",
  includesAll(cronRoute, ["export async function GET", "CRON_SECRET", "CONTRATPRO_CRON_SECRET"]),
  "Vercel Cron appelle les routes en GET avec Authorization",
);

const packageJson = parseJson("package.json");
for (const script of [
  "build",
  "type-check",
  "security:audit",
  "test:quality",
  "production:audit",
  "ci:verify",
  "deploy:preflight",
  "deploy:smoke",
]) {
  check(
    `Script ${script}`,
    Boolean(packageJson.scripts?.[script]),
    "script attendu pour CI/deploiement",
  );
}

check(
  "Healthcheck public",
  includesAll(read("src/app/api/health/route.ts"), ["ok", "service", "timestamp"]),
  "/api/health doit rester minimal et public",
);

check(
  "Proxy Next 16",
  existsSync(file("src/proxy.ts")) && !existsSync(file("src/middleware.ts")),
  "utiliser proxy.ts plutot que middleware.ts avec Next 16",
);

check(
  "README deploiement",
  includesAll(read("README.md"), ["Priorite 12 - Deploiement production", "vercel.json", "/api/health"]),
  "README doit documenter la mise en production",
);

for (const page of [
  "src/app/architecte-ia/page.tsx",
  "src/app/demo/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/legal/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/terms/page.tsx",
]) {
  check(
    `Page publique ${page}`,
    existsSync(file(page)) && read(page).includes("PublicShell"),
    "les pages commerciales doivent etre accessibles hors dashboard",
  );
}

check(
  "Workflow GitHub Actions",
  existsSync(file(".github/workflows/ci.yml")) &&
    includesAll(read(".github/workflows/ci.yml"), [
      "ContratPro CI",
      "node-version: \"24\"",
      "npm ci",
      "npm run type-check",
      "npm run test:quality",
      "npm run security:audit",
      "npm run production:audit",
      "npm run build",
    ]),
  "la CI doit rejouer les controles de production",
);

check(
  "Template pull request",
  existsSync(file(".github/pull_request_template.md")) &&
    includesAll(read(".github/pull_request_template.md"), [
      "Checklist production",
      "npm run production:audit",
      "Notes de release",
    ]),
  "chaque PR doit rappeler les controles et impacts SaaS",
);

check(
  "Runbook production",
  existsSync(file("docs/production-runbook.md")) &&
    includesAll(read("docs/production-runbook.md"), [
      "https://github.com/admincairn/CONTRATPRO",
      "Gate avant merge",
      "Variables Vercel obligatoires",
      "https://supabase.com/dashboard/project/yotafzxcpyyrkkpeyfpp",
      "https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard",
      "Retour arriere",
    ]),
  "le deploiement doit etre documente comme une procedure reproductible",
);

check(
  "Checklist Vercel",
  existsSync(file("docs/vercel-launch-checklist.md")) &&
    includesAll(read("docs/vercel-launch-checklist.md"), [
      "https://github.com/admincairn/CONTRATPRO",
      "https://vercel.com/contratpro",
      "Node.js 24.x",
      "npm run deploy:preflight",
      "npm run deploy:smoke",
      "https://supabase.com/dashboard/project/yotafzxcpyyrkkpeyfpp",
      "https://yotafzxcpyyrkkpeyfpp.supabase.co",
      "https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard",
    ]),
  "la mise en ligne Vercel doit avoir une checklist dediee",
);

check(
  "Preflight Vercel",
  existsSync(file("scripts/vercel-preflight.mjs")) &&
    includesAll(read("scripts/vercel-preflight.mjs"), [
      "github.com/admincairn/CONTRATPRO.git",
      "Node 24",
      "https://yotafzxcpyyrkkpeyfpp.supabase.co",
    ]),
  "le repo doit pouvoir verifier sa preparation Vercel",
);

check(
  "Smoke test deploiement",
  existsSync(file("scripts/deployment-smoke-test.mjs")) &&
    includesAll(read("scripts/deployment-smoke-test.mjs"), [
      "CONTRATPRO_DEPLOYMENT_URL",
      "/api/health",
      "/architecte-ia",
      "/pricing",
      "/demo",
    ]),
  "le deploiement doit avoir un controle HTTP post-release",
);

const failures = checks.filter((item) => !item.passed);

for (const item of checks) {
  const symbol = item.passed ? "OK" : "FAIL";
  console.log(`${symbol} ${item.label} - ${item.detail}`);
}

if (failures.length) {
  console.error(`\nAudit production echoue: ${failures.length} point(s) a corriger.`);
  process.exit(1);
}

console.log("\nAudit production OK: configuration deploiement prete cote repo.");
