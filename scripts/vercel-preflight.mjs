import { execFileSync } from "node:child_process";
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

function parseJson(path) {
  return JSON.parse(read(path));
}

function check(label, passed, detail) {
  checks.push({ detail, label, passed });
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function gitRemote() {
  try {
    return execFileSync("git", ["remote", "-v"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

const packageJson = parseJson("package.json");
check(
  "Node 24 verrouille",
  packageJson.engines?.node === "24.x",
  "Vercel doit deployer ContratPro avec Node 24.x",
);

check(
  "Remote GitHub officiel",
  gitRemote().includes("github.com/admincairn/CONTRATPRO.git"),
  "origin doit pointer vers admincairn/CONTRATPRO",
);

check(
  "Secrets non commitables",
  read(".gitignore").includes(".env*") && read(".gitignore").includes(".vercel"),
  ".env* et .vercel doivent rester ignores par Git",
);

check(
  "Vercel cron configure",
  existsSync(file("vercel.json")) &&
    JSON.stringify(parseJson("vercel.json")).includes("/api/cron/renewals"),
  "vercel.json doit contenir le cron quotidien des relances",
);

check(
  "Supabase production cible",
  includesAll(read(".env.production.example"), [
    "https://yotafzxcpyyrkkpeyfpp.supabase.co",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]),
  "le template production doit pointer vers le projet Supabase ContratPro",
);

check(
  "Variables SaaS critiques",
  includesAll(read(".env.production.example"), [
    "CONTRATPRO_REQUIRE_AUTH=true",
    "CONTRATPRO_RLS_ENABLED=true",
    "CONTRATPRO_REQUIRE_BILLING=true",
    "STRIPE_WEBHOOK_SECRET",
    "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET",
    "CRON_SECRET",
  ]),
  "auth, RLS, billing, webhooks et cron doivent etre explicites",
);

check(
  "Runbook Vercel",
  existsSync(file("docs/vercel-launch-checklist.md")) &&
    includesAll(read("docs/vercel-launch-checklist.md"), [
      "admincairn/CONTRATPRO",
      "https://vercel.com/contratpro",
      "Node.js 24.x",
      "npm run deploy:smoke",
      "https://supabase.com/dashboard/project/yotafzxcpyyrkkpeyfpp",
      "https://yotafzxcpyyrkkpeyfpp.supabase.co",
      "https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard",
    ]),
  "la mise en ligne doit avoir une checklist dediee",
);

check(
  "Smoke test deploiement",
  existsSync(file("scripts/deployment-smoke-test.mjs")) &&
    includesAll(read("scripts/deployment-smoke-test.mjs"), ["/api/health", "/architecte-ia", "/pricing", "/demo"]),
  "un deploiement doit pouvoir etre controle par URL",
);

const failures = checks.filter((item) => !item.passed);

for (const item of checks) {
  const symbol = item.passed ? "OK" : "FAIL";
  console.log(`${symbol} ${item.label} - ${item.detail}`);
}

if (failures.length) {
  console.error(`\nPreflight Vercel echoue: ${failures.length} point(s) a corriger.`);
  process.exit(1);
}

console.log("\nPreflight Vercel OK: ContratPro est pret a etre relie et deploye.");
