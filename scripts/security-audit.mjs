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

function parseEnv(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
}

function check(label, passed, detail) {
  checks.push({ detail, label, passed });
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function normalizeEnvValue(value) {
  if (!value) {
    return "";
  }
  return value.trim().replace(/^["']|["']$/g, "");
}

function hasUsableEnvValue(value) {
  const normalized = normalizeEnvValue(value);
  if (!normalized) {
    return false;
  }
  return ![
    "[]",
    "{}",
    "Encrypted",
  ].includes(normalized);
}

const envPath = ".env.local";
const envExists = existsSync(file(envPath));
check(".env.local present", envExists, envExists ? "configuration locale trouvee" : "fichier absent");

const env = envExists ? parseEnv(read(envPath)) : {};
check(
  "Auth obligatoire",
  normalizeEnvValue(env.CONTRATPRO_REQUIRE_AUTH) === "true",
  "CONTRATPRO_REQUIRE_AUTH doit valoir true",
);
check(
  "RLS attendu",
  normalizeEnvValue(env.CONTRATPRO_RLS_ENABLED) === "true",
  "CONTRATPRO_RLS_ENABLED doit valoir true apres rls.sql",
);
check(
  "Email admin",
  hasUsableEnvValue(env.CONTRATPRO_ADMIN_EMAILS),
  "CONTRATPRO_ADMIN_EMAILS doit contenir au moins un email admin reel",
);
check(
  "Supabase URL",
  hasUsableEnvValue(env.SUPABASE_URL) || hasUsableEnvValue(env.NEXT_PUBLIC_SUPABASE_URL),
  "SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL requis",
);
check(
  "Supabase anon key",
  hasUsableEnvValue(env.SUPABASE_ANON_KEY) ||
    hasUsableEnvValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  "SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY requis",
);
check(
  "Service role serveur",
  hasUsableEnvValue(env.SUPABASE_SERVICE_ROLE_KEY),
  "SUPABASE_SERVICE_ROLE_KEY requis cote serveur. Si la valeur vaut [] apres vercel env pull, remettre le secret depuis Supabase.",
);

const rls = read("supabase/rls.sql");
check(
  "SQL verification RLS",
  existsSync(file("supabase/verify_rls.sql")),
  "supabase/verify_rls.sql doit etre executable dans Supabase SQL Editor",
);
check(
  "SQL historique documents",
  existsSync(file("supabase/document_sends.sql")),
  "supabase/document_sends.sql doit creer l'historique d'envoi",
);
check(
  "SQL historique paiements",
  existsSync(file("supabase/payment_events.sql")),
  "supabase/payment_events.sql doit creer le journal provider SEPA",
);
check(
  "SQL historique imports",
  existsSync(file("supabase/import_logs.sql")),
  "supabase/import_logs.sql doit creer la tracabilite des imports clients",
);
const rlsTables = [
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
  "billing_subscriptions",
  "billing_events",
  "internal_notifications",
  "import_logs",
  "sepa_mandates",
  "sepa_payments",
];
for (const table of rlsTables) {
  check(
    `RLS ${table}`,
    rls.includes(`alter table public.${table} enable row level security`),
    `politique RLS attendue sur ${table}`,
  );
}
check(
  "RLS acquisition interne",
  includesAll(rls, [
    "prospection_leads",
    "facebook_channel_settings",
    "enable row level security",
  ]),
  "prospection_leads et facebook_channel_settings doivent etre couvertes",
);
check(
  "Helper membership",
  includesAll(rls, ["current_organization_ids", "can_access_organization"]),
  "fonctions de portee organisation requises",
);

check(
  "Fail-closed tenant production",
  includesAll(read("src/server/tenant.ts"), [
    "DemoOrganizationForbiddenError",
    "ProductionTenantConfigError",
    "assertProductionSafeOrganizationId",
    "organizationId === DEMO_ORGANIZATION_ID",
    "VERCEL_ENV",
    "canUseDemoData",
  ]),
  "le tenant demo doit etre impossible en production, meme configure explicitement",
);

check(
  "Fail-closed tenant auth",
  includesAll(read("src/server/auth.ts"), [
    "assertProductionSafeOrganizationId",
    "return assertProductionSafeOrganizationId(organizationId, \"auth\")",
  ]),
  "un rattachement auth a org_demo doit etre refuse en production",
);

check(
  "Fail-closed donnees metier",
  includesAll(read("src/server/contratpro-data.ts"), [
    "SupabaseDataUnavailableError",
    "const allowDemoFallback = canUseDemoData()",
    "if (!allowDemoFallback)",
    "Lecture Supabase indisponible hors mode démo.",
  ]),
  "les donnees demo ne doivent etre servies qu'en mode demo explicite",
);

const adminRouteFiles = [
  "src/app/(dashboard)/admin/page.tsx",
  "src/app/(dashboard)/admin/notifications/page.tsx",
  "src/app/(dashboard)/admin/ops/page.tsx",
  "src/app/(dashboard)/admin/prospection/page.tsx",
  "src/app/(dashboard)/prospection/page.tsx",
  "src/app/(dashboard)/settings/facebook/page.tsx",
];
for (const route of adminRouteFiles) {
  const content = read(route);
  check(
    `Route admin ${route}`,
    content.includes("requireAdminUser"),
    "la route doit appeler requireAdminUser",
  );
}

const adminApiFiles = [
  "src/app/api/admin/ops/route.ts",
  "src/app/api/prospection/leads/route.ts",
  "src/app/api/prospection/leads/[id]/route.ts",
  "src/app/api/settings/facebook/route.ts",
];
for (const route of adminApiFiles) {
  const content = read(route);
  check(
    `API admin ${route}`,
    content.includes("getCurrentAdminUser") && content.includes("403"),
    "l'API doit refuser les non-admins",
  );
}

const authenticatedApiFiles = [
  "src/app/api/certificates/route.ts",
  "src/app/api/certificates/[id]/route.ts",
  "src/app/api/certificates/[id]/pdf/route.ts",
  "src/app/api/certificates/[id]/send/route.ts",
  "src/app/api/billing/checkout/route.ts",
  "src/app/api/billing/portal/route.ts",
  "src/app/api/contracts/route.ts",
  "src/app/api/customers/route.ts",
  "src/app/api/import/clients/route.ts",
  "src/app/api/import/praxedo/route.ts",
  "src/app/api/interventions/route.ts",
  "src/app/api/invoices/route.ts",
  "src/app/api/invoices/[id]/route.ts",
  "src/app/api/invoices/[id]/pdf/route.ts",
  "src/app/api/invoices/[id]/send/route.ts",
  "src/app/api/payments/route.ts",
  "src/app/api/payments/[id]/route.ts",
  "src/app/api/payments/[id]/submit/route.ts",
  "src/app/api/relances/route.ts",
  "src/app/api/relances/[id]/route.ts",
  "src/app/api/relances/send/route.ts",
  "src/app/api/settings/company/route.ts",
];
for (const route of authenticatedApiFiles) {
  const content = read(route);
  check(
    `API auth ${route}`,
    content.includes("requireApiUser"),
    "l'API metier doit exiger une session avant validation",
  );
}

check(
  "API publique demo limitee",
  includesAll(read("src/app/api/public/demo-request/route.ts"), [
    "rateLimit",
    "CONTRATPRO_PUBLIC_LEAD_ORG_ID",
    "assertProductionSafeOrganizationId",
    "prospection_leads",
    "notifyAdmin",
  ]),
  "la capture demo publique doit etre rate-limitee, rattachee a une org sure et notifier le fondateur",
);

const signedWebhookFiles = [
  "src/app/api/webhooks/gocardless/route.ts",
  "src/app/api/webhooks/stripe/route.ts",
];
for (const route of signedWebhookFiles) {
  const content = read(route);
  check(
    `Webhook signe ${route}`,
    (content.includes("verifyGoCardlessSignature") &&
      content.includes("Webhook-Signature")) ||
      (content.includes("verifyStripeSignature") &&
        content.includes("Stripe-Signature")),
    "le webhook provider doit verifier sa signature",
  );
}

const cronRoute = read("src/app/api/cron/renewals/route.ts");
check(
  "Cron relances signe",
  cronRoute.includes("CONTRATPRO_CRON_SECRET") &&
    cronRoute.includes("authorization"),
  "le cron de relance doit exiger un bearer secret",
);

const appShell = read("src/components/layout/AppShell.tsx");
check(
  "Navigation interne opt-in",
  appShell.includes("showInternalTools = false") &&
    appShell.includes("Dashboard acquisition") &&
    appShell.includes("Supervision") &&
    appShell.includes("Notifications"),
  "la navigation fondateur ne doit pas etre affichee par defaut",
);

check(
  "Service notifications",
  includesAll(read("src/server/internal-notifications.ts"), [
    "CONTRATPRO_NOTIFICATION_EMAILS",
    "sendPlainEmail",
    "internal_notifications",
  ]),
  "les alertes internes doivent etre envoyees par email et journalisees",
);

const apiAuth = read("src/server/api-auth.ts");
check(
  "Billing lock API",
  apiAuth.includes("allowInactiveBilling") && apiAuth.includes("status: 402"),
  "les API metier doivent pouvoir etre bloquees si l'abonnement est impaye",
);

const failures = checks.filter((item) => !item.passed);

for (const item of checks) {
  const symbol = item.passed ? "OK" : "FAIL";
  console.log(`${symbol} ${item.label} - ${item.detail}`);
}

if (failures.length) {
  console.error(`\nAudit securite echoue: ${failures.length} point(s) a corriger.`);
  process.exit(1);
}

console.log("\nAudit securite OK: priorite 1 verrouillee cote code/config locale.");
