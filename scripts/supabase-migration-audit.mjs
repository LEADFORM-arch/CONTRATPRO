import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const supabaseRoot = resolve(root, "supabase");
const manifestPath = resolve(supabaseRoot, "migration-order.json");
const checks = [];

function check(label, passed, detail) {
  checks.push({ detail, label, passed });
}

function read(path) {
  return readFileSync(path, "utf8");
}

function indexOfScript(scripts, file) {
  return scripts.findIndex((script) => script.file === file);
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

check(
  "Manifest migrations",
  existsSync(manifestPath),
  "supabase/migration-order.json doit decrire l'ordre d'execution",
);

const manifest = existsSync(manifestPath)
  ? JSON.parse(read(manifestPath))
  : { scripts: [] };
const scripts = Array.isArray(manifest.scripts) ? manifest.scripts : [];
const files = scripts.map((script) => script.file);
const duplicates = files.filter((file, index) => files.indexOf(file) !== index);

check("Manifest non vide", scripts.length > 0, "au moins un script Supabase attendu");
check("Manifest sans doublon", duplicates.length === 0, "chaque script doit apparaitre une seule fois");

for (const script of scripts) {
  check(
    `Script ${script.file}`,
    existsSync(resolve(supabaseRoot, script.file)),
    "script reference par le manifeste",
  );
}

const schemaIndex = indexOfScript(scripts, "schema.sql");
const rlsIndex = indexOfScript(scripts, "rls.sql");
const verifyIndex = indexOfScript(scripts, "verify_rls.sql");

check("schema.sql premier", schemaIndex === 0, "schema.sql doit ouvrir la chaine");
check("rls.sql present", rlsIndex >= 0, "RLS doit etre versionne dans le manifeste");
check("verify_rls.sql dernier", verifyIndex === scripts.length - 1, "verify_rls.sql doit rester dernier");
check(
  "RLS avant verification",
  rlsIndex >= 0 && verifyIndex > rlsIndex,
  "la verification doit s'executer apres RLS",
);

for (const featureFile of [
  "renewal_actions.sql",
  "prospection.sql",
  "simulation_leads.sql",
  "document_sends.sql",
  "payment_events.sql",
  "billing.sql",
  "notifications.sql",
  "import_logs.sql",
]) {
  const featureIndex = indexOfScript(scripts, featureFile);
  check(
    `${featureFile} avant RLS`,
    featureIndex >= 0 && rlsIndex > featureIndex,
    "les tables metier doivent exister avant activation RLS",
  );
}

const rlsPath = resolve(supabaseRoot, "rls.sql");
const verifyPath = resolve(supabaseRoot, "verify_rls.sql");
const rls = existsSync(rlsPath) ? read(rlsPath) : "";
const verify = existsSync(verifyPath) ? read(verifyPath) : "";

const tenantTables = [
  "organizations",
  "organization_memberships",
  "customers",
  "installations",
  "contracts",
  "interventions",
  "certificates",
  "invoices",
  "document_sends",
  "payment_events",
  "sepa_mandates",
  "sepa_payments",
  "renewal_actions",
  "prospection_leads",
  "facebook_channel_settings",
  "billing_subscriptions",
  "billing_events",
  "internal_notifications",
  "import_logs",
];

for (const table of tenantTables) {
  check(
    `RLS enable ${table}`,
    rls.includes(`public.${table}`) && rls.includes("enable row level security"),
    "chaque table tenant doit etre couverte par rls.sql",
  );
  check(
    `Verify ${table}`,
    verify.includes(`('${table}')`),
    "chaque table tenant doit etre verifiee par verify_rls.sql",
  );
}

check(
  "Helpers isolation tenant",
  includesAll(rls, [
    "current_organization_ids",
    "can_access_organization",
    "can_access_customer",
    "can_access_installation",
    "can_access_contract",
  ]),
  "les politiques doivent passer par les helpers de portee organisation",
);

check(
  "payment_events lie paiement + organisation",
  includesAll(rls, [
    "payment_events_by_org",
    "where p.id = payment_id",
    "and p.organization_id = organization_id",
  ]),
  "le journal provider SEPA ne doit pas etre lisible hors paiement et organisation rattaches",
);

const failures = checks.filter((item) => !item.passed);

for (const item of checks) {
  const symbol = item.passed ? "OK" : "FAIL";
  console.log(`${symbol} ${item.label} - ${item.detail}`);
}

if (failures.length) {
  console.error(`\nAudit migrations Supabase echoue: ${failures.length} point(s) a corriger.`);
  process.exit(1);
}

console.log("\nAudit migrations Supabase OK: ordre, RLS et verification sont versionnes.");
