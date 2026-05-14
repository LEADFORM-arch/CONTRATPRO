import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function pathOf(path) {
  return resolve(root, path);
}

function read(path) {
  return readFileSync(pathOf(path), "utf8");
}

function assertIncludes(content, values, label) {
  for (const value of values) {
    assert.ok(content.includes(value), `${label} should include ${value}`);
  }
}

describe("production guardrails", () => {
  it("keeps tenant auth, RLS and billing lock wired into dashboard access", () => {
    const layout = read("src/app/(dashboard)/layout.tsx");
    const apiAuth = read("src/server/api-auth.ts");
    const proxy = read("src/proxy.ts");

    assertIncludes(layout, [
      "getCurrentUser",
      "isAuthEnforced",
      "encodeURIComponent(next)",
      "x-contratpro-search",
      "isBillingRequired",
      "getCurrentBillingStatus",
      "redirect(\"/settings/billing?billing=required\")",
    ], "dashboard layout");

    assertIncludes(read("src/server/tenant.ts"), [
      "DemoOrganizationForbiddenError",
      "ProductionTenantConfigError",
      "assertProductionSafeOrganizationId",
      "organizationId === DEMO_ORGANIZATION_ID",
      "CONTRATPRO_REQUIRE_AUTH=true",
      "canUseDemoData",
      "process.env.VERCEL_ENV === \"production\"",
    ], "tenant fail closed");

    assertIncludes(read("src/server/auth.ts"), [
      "assertProductionSafeOrganizationId",
      "return assertProductionSafeOrganizationId(organizationId, \"auth\")",
    ], "authenticated tenant fail closed");

    assertIncludes(read("src/server/contratpro-data.ts"), [
      "SupabaseDataUnavailableError",
      "const allowDemoFallback = canUseDemoData()",
      "Lecture Supabase indisponible hors mode demo.",
      "Profil organisation introuvable hors mode demo.",
    ], "data fail closed");

    assertIncludes(apiAuth, [
      "requireApiUser",
      "allowInactiveBilling",
      "status: 402",
      "getCurrentBillingStatus",
    ], "api auth");

    assertIncludes(proxy, ["x-contratpro-pathname", "x-contratpro-search", "NextResponse.next"], "proxy");
  });

  it("protects founder-only routes and keeps internal navigation opt-in", () => {
    const adminRoutes = [
      "src/app/(dashboard)/admin/launch/page.tsx",
      "src/app/(dashboard)/admin/notifications/page.tsx",
      "src/app/(dashboard)/admin/ops/page.tsx",
      "src/app/(dashboard)/admin/pilots/page.tsx",
      "src/app/(dashboard)/admin/prospection/page.tsx",
      "src/app/(dashboard)/prospection/page.tsx",
      "src/app/(dashboard)/settings/facebook/page.tsx",
    ];

    for (const route of adminRoutes) {
      assert.ok(read(route).includes("requireAdminUser"), `${route} must require admin user`);
    }

    assertIncludes(read("src/app/(dashboard)/prospection/page.tsx"), [
      "Command center",
      "File d'appel fondateur",
      "lead-stage-board",
      "PUBLIC_DEMO",
      "Cree le {lead.createdAt}",
    ], "founder sales pipeline cockpit");

    assertIncludes(read("src/app/(dashboard)/admin/prospection/page.tsx"), [
      "Priorite fondateur",
      "Appels demo a traiter aujourd'hui",
      "founder-queue-card",
      "PUBLIC_DEMO",
    ], "admin sales command queue");

    assertIncludes(read("src/app/(dashboard)/prospection/LeadStatusControls.tsx"), [
      "REPLIED",
      "LOST",
      "nextAction",
      "Mise a jour impossible.",
    ], "lead status sales actions");

    assertIncludes(read("src/app/globals.css"), [
      ".sales-command",
      ".lead-stage-board",
      ".founder-queue-card",
    ], "sales cockpit styles");

    const shell = read("src/components/layout/AppShell.tsx");
    assertIncludes(shell, [
      "showInternalTools = false",
      "/admin/launch",
      "/admin/pilots",
      "/admin/notifications",
      "/admin/ops",
      "/settings/facebook",
    ], "app shell founder navigation");
  });

  it("keeps business APIs authenticated", () => {
    const apiRoutes = [
      "src/app/api/billing/checkout/route.ts",
      "src/app/api/billing/portal/route.ts",
      "src/app/api/certificates/[id]/send/route.ts",
      "src/app/api/certificates/[id]/pdf/route.ts",
      "src/app/api/contracts/route.ts",
      "src/app/api/import/clients/route.ts",
      "src/app/api/import/praxedo/route.ts",
      "src/app/api/invoices/[id]/send/route.ts",
      "src/app/api/invoices/[id]/pdf/route.ts",
      "src/app/api/payments/[id]/submit/route.ts",
      "src/app/api/relances/send/route.ts",
      "src/app/api/settings/company/route.ts",
    ];

    for (const route of apiRoutes) {
      assert.ok(read(route).includes("requireApiUser"), `${route} must require API user`);
    }
  });

  it("keeps HTTP hardening and brute-force limits in place", () => {
    assertIncludes(read("next.config.ts"), [
      "Content-Security-Policy",
      "frame-ancestors 'none'",
      "X-Content-Type-Options",
      "Permissions-Policy",
    ], "security headers");

    assertIncludes(read("src/server/rate-limit.ts"), [
      "Retry-After",
      "status: 429",
      "x-forwarded-for",
    ], "rate limit helper");

    assertIncludes(read("src/app/api/auth/login/route.ts"), [
      "rateLimit",
      "auth-login",
      "limit: 8",
    ], "login rate limit");

    assertIncludes(read("src/app/api/import/clients/route.ts"), [
      "rateLimit",
      "client-import",
      "limit: 12",
    ], "client import rate limit");

    assertIncludes(read("src/app/api/public/demo-request/route.ts"), [
      "rateLimit",
      "public-demo-request",
      "limit: 5",
      "assertProductionSafeOrganizationId",
      "prospection_leads",
      "notifyAdmin",
    ], "public demo request guardrails");
  });

  it("keeps provider webhooks signed and cron protected", () => {
    assertIncludes(read("src/app/api/webhooks/gocardless/route.ts"), [
      "verifyGoCardlessSignature",
      "Webhook-Signature",
    ], "gocardless webhook");

    assertIncludes(read("src/app/api/webhooks/stripe/route.ts"), [
      "verifyStripeSignature",
      "Stripe-Signature",
      "invoice.payment_failed",
    ], "stripe webhook");

    assertIncludes(read("src/app/api/cron/renewals/route.ts"), [
      "export async function GET",
      "CONTRATPRO_CRON_SECRET",
      "CRON_SECRET",
      "authorization",
      "notifyAdmin",
    ], "renewal cron");

    assertIncludes(read("src/server/ops-health.ts"), [
      "OpsRunbookAction",
      "buildCronRunbook",
      "Dry-run quotidien",
      "Envoi reel controle",
      "Preuve de journalisation",
      "Alerte fondateur",
      "CONTRATPRO_ORG_ID",
    ], "ops cron runbook");

    assertIncludes(read("src/app/(dashboard)/admin/ops/page.tsx"), [
      "data-od-id=\"ops-cron-runbook\"",
      "Cron relances sous controle",
      "health.cronRunbook.map",
      "Dry-run avant envoi reel",
    ], "ops cron page");

    assertIncludes(read("src/app/globals.css"), [
      ".ops-cron-panel",
      ".ops-cron-grid",
      ".ops-cron-card",
    ], "ops cron styles");

    assertIncludes(read("docs/cron-renewals-runbook.md"), [
      "Runbook cron relances ContratPro",
      "Dry-run obligatoire",
      "Envoi reel controle",
      "Verification Supabase",
      "Alerting fondateur",
    ], "cron renewal runbook");
  });

  it("keeps the renewal AI growth agent visible and human-validated", () => {
    assertIncludes(read("src/server/renewal-agent.ts"), [
      "analyzeRenewalAgent",
      "humanValidation: \"required\"",
      "totalExpectedValue",
      "validationQueue",
    ], "renewal agent service");

    assertIncludes(read("src/app/(dashboard)/relances/page.tsx"), [
      "Agent IA de croissance",
      "Architecte IA de croissance",
      "analyzeRenewalAgent",
      "relance-agent-panel",
      "Score IA",
    ], "renewal agent page");

    assertIncludes(read("src/app/globals.css"), [
      ".relance-agent-panel",
      ".relance-agent-card",
      ".relance-agent-note",
    ], "renewal agent styles");
  });

  it("keeps the first mobile terrain PWA surface available", () => {
    assertIncludes(read("src/app/layout.tsx"), [
      "manifest: \"/manifest.webmanifest\"",
      "appleWebApp",
      "themeColor: \"#1E3A5F\"",
    ], "pwa metadata");

    assertIncludes(read("src/app/manifest.ts"), [
      "start_url: \"/terrain\"",
      "display: \"standalone\"",
      "orientation: \"portrait\"",
      "theme_color: \"#1E3A5F\"",
    ], "pwa manifest");

    assert.ok(existsSync(pathOf("src/app/icon.svg")), "PWA icon should exist");

    assertIncludes(read("src/components/layout/AppShell.tsx"), [
      "/terrain",
      "Terrain mobile",
    ], "terrain navigation");

    assertIncludes(read("src/app/(dashboard)/terrain/page.tsx"), [
      "AppShell",
      "getInterventions",
      "PWA terrain",
      "PLANIFIER",
      "terrain-card",
    ], "terrain page");

    assertIncludes(read("README.md"), [
      "Priorite 5b - Mobile terrain PWA",
      "/manifest.webmanifest",
      "/terrain",
    ], "terrain documentation");
  });

  it("keeps server-side PDFs, document email sending and send history", () => {
    assertIncludes(read("src/server/document-pdf.ts"), [
      "%PDF-1.4",
      "createPdf",
    ], "pdf generator");

    assertIncludes(read("src/app/api/invoices/[id]/send/route.ts"), [
      "sendDocumentEmail",
      "recordDocumentSend",
      "buildInvoicePdf",
    ], "invoice send route");

    assertIncludes(read("src/app/api/certificates/[id]/send/route.ts"), [
      "sendDocumentEmail",
      "recordDocumentSend",
      "buildCertificatePdf",
    ], "certificate send route");

    assertIncludes(read("src/app/api/invoices/[id]/pdf/route.ts"), [
      "buildInvoicePdf",
      "application/pdf",
      "no-store",
    ], "invoice pdf route");

    assertIncludes(read("src/app/api/certificates/[id]/pdf/route.ts"), [
      "buildCertificatePdf",
      "application/pdf",
      "no-store",
    ], "certificate pdf route");
  });

  it("keeps internal notifications durable and visible", () => {
    assert.ok(existsSync(pathOf("supabase/notifications.sql")), "notifications SQL should exist");
    assertIncludes(read("src/server/internal-notifications.ts"), [
      "CONTRATPRO_NOTIFICATION_EMAILS",
      "sendPlainEmail",
      "internal_notifications",
      "getRecentInternalNotifications",
    ], "notification service");

    assertIncludes(read("src/app/(dashboard)/admin/notifications/page.tsx"), [
      "requireAdminUser",
      "getRecentInternalNotifications",
      "Notifications production",
      "Architecte IA incidents",
      "data-od-id=\"notification-incident-command\"",
      "incidentDecision",
      "topNotificationType",
      "Geler les ventes",
    ], "notification admin page");

    assertIncludes(read("src/app/globals.css"), [
      ".notification-command",
      ".notification-command-grid",
      ".notification-command-card",
      ".notification-command-pill",
    ], "notification incident styles");

    assertIncludes(read("docs/internal-notifications-runbook.md"), [
      "Runbook notifications internes ContratPro",
      "Architecte IA incidents",
      "Incident critique",
      "Alerting degrade",
      "Stop rules",
    ], "notification runbook");

    assertIncludes(read("README.md"), [
      "Priorite 10 - Notifications internes",
      "Architecte IA incidents",
      "docs/internal-notifications-runbook.md",
    ], "notification README");
  });

  it("keeps Supabase SQL scripts and RLS verification aligned", () => {
    const expectedScripts = [
      "supabase/billing.sql",
      "supabase/document_sends.sql",
      "supabase/import_logs.sql",
      "supabase/notifications.sql",
      "supabase/payment_events.sql",
      "supabase/prospection.sql",
      "supabase/renewal_actions.sql",
      "supabase/rls.sql",
      "supabase/verify_rls.sql",
    ];

    for (const script of expectedScripts) {
      assert.ok(existsSync(pathOf(script)), `${script} should exist`);
    }

    const rls = read("supabase/rls.sql");
    const verify = read("supabase/verify_rls.sql");
    for (const table of [
      "billing_events",
      "billing_subscriptions",
      "document_sends",
      "import_logs",
      "internal_notifications",
      "payment_events",
      "prospection_leads",
      "renewal_actions",
    ]) {
      assert.ok(rls.includes(table), `rls.sql should cover ${table}`);
      assert.ok(verify.includes(table), `verify_rls.sql should verify ${table}`);
    }
  });

  it("keeps deployment configuration ready for Vercel production", () => {
    assert.ok(existsSync(pathOf("vercel.json")), "vercel.json should exist");
    const vercel = JSON.parse(read("vercel.json"));
    assert.ok(
      vercel.crons?.some((cron) => cron.path === "/api/cron/renewals"),
      "Vercel cron should target renewal automation",
    );

    assert.ok(
      existsSync(pathOf(".env.production.example")),
      ".env.production.example should exist",
    );
    assertIncludes(read(".env.production.example"), [
      "CONTRATPRO_REQUIRE_BILLING=true",
      "NEXT_PUBLIC_APP_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "CRON_SECRET",
    ], "production env template");
  });

  it("keeps CI and release runbook wired to production checks", () => {
    assert.ok(existsSync(pathOf(".github/workflows/ci.yml")), "CI workflow should exist");
    assertIncludes(read(".github/workflows/ci.yml"), [
      "ContratPro CI",
      "node-version: \"24\"",
      "npm ci",
      "npm run type-check",
      "npm run test:quality",
      "npm run security:audit",
      "npm run production:audit",
      "npm run deploy:preflight",
      "npm run build",
    ], "github workflow");

    assertIncludes(read("package.json"), [
      "\"node\": \"24.x\"",
      "\"ci:verify\"",
      "\"deploy:preflight\"",
      "\"deploy:smoke\"",
      "\"deploy:smoke:auth\"",
      "\"stripe:readiness\"",
      "\"stripe:create-test-billing\"",
      "npm run production:audit",
      "npm run build",
    ], "package scripts");

    assertIncludes(read(".github/pull_request_template.md"), [
      "Checklist production",
      "Impact SaaS",
      "Notes de release",
    ], "pull request template");

    assertIncludes(read("docs/production-runbook.md"), [
      "https://github.com/admincairn/CONTRATPRO",
      "Gate avant merge",
      "Variables Vercel obligatoires",
      "Cron relances quotidiennes",
      "docs/cron-renewals-runbook.md",
      "Backup et restauration Supabase",
      "Retour arriere",
    ], "production runbook");
  });

  it("keeps Vercel launch checks ready for the first production deployment", () => {
    assertIncludes(read(".env.production.example"), [
      "https://yotafzxcpyyrkkpeyfpp.supabase.co",
      "CONTRATPRO_REQUIRE_AUTH=true",
      "CONTRATPRO_REQUIRE_BILLING=true",
      "GOCARDLESS_ENVIRONMENT=live",
      "CRON_SECRET",
    ], "production env example");

    assertIncludes(read("scripts/vercel-preflight.mjs"), [
      "github.com/admincairn/CONTRATPRO.git",
      "Node 24",
      "deployer ContratPro avec Node 24.x",
      "https://yotafzxcpyyrkkpeyfpp.supabase.co",
    ], "vercel preflight");

    assertIncludes(read("scripts/deployment-smoke-test.mjs"), [
      "CONTRATPRO_DEPLOYMENT_URL",
      "/api/health",
      "/login",
      "/simulateur",
      "/attestation-entretien-chaudiere",
      "/pricing",
      "/demo",
    ], "deployment smoke test");

    assertIncludes(read("docs/vercel-launch-checklist.md"), [
      "admincairn/CONTRATPRO",
      "https://vercel.com/contratpro",
      "Node.js 24.x",
      "npm run deploy:preflight",
      "npm run deploy:smoke",
      "https://supabase.com/dashboard/project/yotafzxcpyyrkkpeyfpp",
      "supabase/verify_rls.sql",
      "https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard",
    ], "vercel launch checklist");
  });

  it("keeps local env recovery and authenticated smoke checks documented", () => {
    assertIncludes(read("scripts/security-audit.mjs"), [
      "hasUsableEnvValue",
      "[]",
      "remettre le secret depuis Supabase",
    ], "security audit local env guard");

    assertIncludes(read("scripts/authenticated-smoke-test.mjs"), [
      "CONTRATPRO_SMOKE_EMAIL",
      "CONTRATPRO_SMOKE_PASSWORD",
      "/api/auth/login",
      "/api/auth/me",
      "/onboarding",
    ], "authenticated smoke test");

    assertIncludes(read(".env.local.example"), [
      "NEXT_PUBLIC_APP_URL=http://localhost:3000",
      "SUPABASE_SERVICE_ROLE_KEY=",
      "CONTRATPRO_REQUIRE_AUTH=true",
    ], "local env example");

    assertIncludes(read("docs/local-development-env.md"), [
      "vercel env pull",
      "npm run security:audit",
      "npm run deploy:smoke:auth",
    ], "local env runbook");
  });

  it("keeps founder go-live readiness visible before commercial launch", () => {
    assertIncludes(read("src/server/launch-readiness.ts"), [
      "STRIPE_SECRET_KEY",
      "CONTRATPRO_REQUIRE_BILLING",
      "GOCARDLESS_ENVIRONMENT",
      "admincairn/CONTRATPRO",
      "getProductionActivationPlan",
      "ProductionActivationStep",
      "getPilotReadinessPlan",
      "Decision go/no-go",
    ], "launch readiness service");

    assertIncludes(read("src/app/(dashboard)/admin/launch/page.tsx"), [
      "requireAdminUser",
      "getLaunchReadiness",
      "getPilotReadinessPlan",
      "getProductionActivationPlan",
      "Readiness commerciale",
      "Activation production live",
      "data-od-id=\"production-live-activation\"",
      "Bloquants avant vente forte",
      "Plan pilote terrain",
    ], "launch admin page");

    assertIncludes(read("src/app/globals.css"), [
      ".launch-command",
      ".launch-activation",
      ".launch-activation-card",
      ".launch-check-row",
      ".launch-status-pill",
    ], "launch styles");

    assertIncludes(read("docs/live-production-activation.md"), [
      "Activation production live ContratPro",
      "Supabase backup + RLS",
      "Variables Vercel production",
      "Stripe live",
      "GoCardless live",
      "Smoke post-deploiement",
      "Rollback arme",
    ], "live activation runbook");

    assertIncludes(read("docs/pilot-runbook.md"), [
      "Runbook pilote ContratPro",
      "Import dry-run",
      "Terrain mobile",
      "SEPA et cash-flow",
      "Scorecard de fin",
      "Go / no-go",
    ], "pilot runbook");

    assertIncludes(read("README.md"), [
      "Priorite 5c - Pilotes chauffagistes",
      "Priorite 5d - Activation production live",
      "docs/live-production-activation.md",
      "docs/pilot-runbook.md",
      "/admin/pilots",
      "Architecte IA pilote",
      "vendre, iterer ou stopper",
      "/admin/launch",
    ], "pilot README");

    assertIncludes(read("src/server/pilot-scorecard.ts"), [
      "getPilotScorecard",
      "getPilotArchitectSummary",
      "pilotArchitectInsights",
      "pilotArchitectKpis",
      "pilotSignalSequence",
      "Architecte IA pilote",
      "pilotCriteria",
      "pilotQuestions",
      "pilotSessionBlocks",
    ], "pilot scorecard service");

    assertIncludes(read("src/app/(dashboard)/admin/pilots/page.tsx"), [
      "requireAdminUser",
      "getPilotScorecard",
      "Scorecard pilote terrain",
      "data-od-id=\"pilot-ai-architect\"",
      "data-od-id=\"pilot-signal-chart\"",
      "data-od-id=\"pilot-go-no-go\"",
      "Architecte IA pilote",
      "Decision premium apres rendez-vous",
      "Decision attendue",
      "Vendre / Iterer / Stop",
    ], "pilot admin page");

    assertIncludes(read("src/app/globals.css"), [
      ".pilot-command",
      ".pilot-kpi-grid",
      ".pilot-signal-panel",
      ".pilot-signal-bar",
      ".pilot-architect",
      ".pilot-architect-card",
      ".pilot-panel",
      ".pilot-question-card",
      ".pilot-go",
    ], "pilot styles");
  });

  it("keeps Stripe test billing setup executable and documented", () => {
    assertIncludes(read("scripts/stripe-create-test-billing.mjs"), [
      "ContratPro Starter",
      "sk_test_",
      "ContratPro Pro",
      "ContratPro Business",
      "unitAmount: \"9900\"",
      "lookup_key",
      "STRIPE_PRICE_ID_STARTER",
      "STRIPE_PRICE_ID_BUSINESS",
    ], "stripe create test billing script");

    assertIncludes(read("scripts/stripe-readiness.mjs"), [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PRICE_ID_STARTER",
      "STRIPE_PRICE_ID_PRO",
      "STRIPE_PRICE_ID_BUSINESS",
      "checkout.session.completed",
      "invoice.payment_succeeded",
    ], "stripe readiness script");

    assertIncludes(read("src/app/(dashboard)/settings/billing/page.tsx"), [
      "getRecentBillingEvents",
      "Architecte IA billing",
      "requestedPlan",
      "Plan demande depuis la page tarifs",
      "data-od-id=\"billing-ai-architect\"",
      "Vendre le bon palier",
      "Journal Stripe recent",
      "billing-plan-card",
      "billing-event-row",
    ], "stripe billing page");

    assertIncludes(read("src/app/(dashboard)/settings/billing/BillingActions.tsx"), [
      "requestedPlan",
      "data-requested",
      "Activer le plan demande",
      "JSON.stringify({ plan })",
    ], "stripe billing plan actions");

    assertIncludes(read("src/server/billing.ts"), [
      "hasRecordedBillingEvent",
      "provider_event_id=eq.",
      "billing_events",
    ], "stripe billing idempotency service");

    assertIncludes(read("src/app/api/webhooks/stripe/route.ts"), [
      "hasRecordedBillingEvent",
      "duplicate: true",
      "recordBillingEvent",
    ], "stripe webhook idempotency");

    assertIncludes(read("src/app/globals.css"), [
      ".billing-architect",
      ".billing-architect-grid",
      ".billing-plan-card",
    ], "stripe billing architect styles");

    assertIncludes(read("docs/stripe-test-billing.md"), [
      "https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard",
      "https://contratpro-dun.vercel.app/api/webhooks/stripe",
      "4242 4242 4242 4242",
      "Architecte IA billing",
      "duplicate: true",
      "CONTRATPRO_REQUIRE_BILLING=true",
    ], "stripe billing runbook");
  });

  it("keeps premium onboarding guided by an activation architect", () => {
    assertIncludes(read("src/app/(dashboard)/onboarding/page.tsx"), [
      "Architecte IA activation",
      "data-od-id=\"onboarding-ai-architect\"",
      "activationDecisions",
      "activationDecision",
      "Demarrer accompagne",
      "Pilote facturable",
      "Go-live limite",
      "Plan d'activation client",
    ], "premium onboarding page");

    assertIncludes(read("src/app/globals.css"), [
      ".onboarding-architect",
      ".onboarding-decision-grid",
      ".onboarding-band-grid",
      ".onboarding-band-card",
    ], "premium onboarding styles");

    assertIncludes(read("docs/onboarding-activation-runbook.md"), [
      "Runbook onboarding premium ContratPro",
      "Score de lancement",
      "Architecte IA activation",
      "0-59",
      "60-84",
      "85-100",
      "Stop rules",
    ], "premium onboarding runbook");

    assertIncludes(read("README.md"), [
      "Priorite 9 - Onboarding client premium",
      "Architecte IA activation",
      "docs/onboarding-activation-runbook.md",
    ], "premium onboarding README");
  });

  it("keeps public commercial pages available before login", () => {
    for (const page of [
      "src/app/architecte-ia/page.tsx",
      "src/app/simulateur/page.tsx",
      "src/app/attestation-entretien-chaudiere/page.tsx",
      "src/app/demo/page.tsx",
      "src/app/pricing/page.tsx",
      "src/app/legal/page.tsx",
      "src/app/privacy/page.tsx",
      "src/app/terms/page.tsx",
    ]) {
      assert.ok(existsSync(pathOf(page)), `${page} should exist`);
      assert.ok(read(page).includes("PublicShell"), `${page} should use public shell`);
    }

    assertIncludes(read("src/components/marketing/PublicShell.tsx"), [
      "/architecte-ia",
      "/simulateur",
      "/attestation-entretien-chaudiere",
      "/demo",
      "/pricing",
      "/privacy",
      "/legal",
      "/terms",
    ], "public shell");

    assertIncludes(read("src/app/login/page.tsx"), [
      "/demo",
      "/pricing",
      "/privacy",
    ], "login public links");

    assertIncludes(read("src/app/architecte-ia/page.tsx"), [
      "ARCHITECTE IA DE CROISSANCE CVC",
      "validation humaine",
      "variant=\"openDesign\"",
      "od-hero",
      "od-agent-grid",
      "VOIR LA DEMO",
    ], "architecte ia public page");

    assertIncludes(read("src/app/simulateur/page.tsx"), [
      "Simulateur ROI",
      "Calculer ma perte",
      "/api/simulateur/track",
      "Programmer une demo",
    ], "roi simulator public page");

    assertIncludes(read("src/app/attestation-entretien-chaudiere/page.tsx"), [
      "Attestation d'entretien chaudiere",
      "Service-Public",
      "www.ecologie.gouv.fr",
      "application/ld+json",
      "Voir la demo documents",
    ], "seo boiler certificate page");

    assertIncludes(read("src/app/demo/page.tsx"), [
      "DemoRequestForm",
      "Suspense",
      "#demande-demo",
      "Capture lead",
      "Demander une demonstration ContratPro",
    ], "public demo lead capture page");

    assertIncludes(read("src/app/demo/DemoRequestForm.tsx"), [
      "/api/public/demo-request",
      "sourceUrl: window.location.href",
      "Plan vise",
      "Demande envoyee",
    ], "public demo lead form");

    assertIncludes(read("src/app/globals.css"), [
      ".demo-request-panel",
      ".demo-request-form",
      ".demo-form-success",
    ], "public demo lead styles");

    assertIncludes(read("src/app/sitemap.ts"), [
      "/attestation-entretien-chaudiere",
      "contratpro-dun.vercel.app",
    ], "public sitemap");

    assertIncludes(read("src/app/robots.ts"), [
      "/attestation-entretien-chaudiere",
      "/api",
      "sitemap.xml",
    ], "public robots");

    assertIncludes(read("src/app/pricing/page.tsx"), [
      "Cash-flow CVC",
      "Encaissez vos contrats d'entretien",
      "contrats recuperes",
      "revenu recurrent plus fiable",
      "href={`/login?plan=${plan.id}`}",
      "Choisir {plan.name}",
    ], "cash-flow pricing positioning");

    assertIncludes(read("src/app/login/LoginForm.tsx"), [
      "searchParams.get(\"plan\")",
      "/settings/billing?plan=",
      "Plan demande : ContratPro",
    ], "login plan intent");
  });

  it("keeps client CSV and Excel import guarded by a dry-run", () => {
    assertIncludes(read("src/app/api/import/clients/route.ts"), [
      "requireApiUser",
      "getRecentClientImportLogs",
      "runClientImport",
      "dry-run",
      "execute",
    ], "client import route");

    assertIncludes(read("src/server/client-import.ts"), [
      "customersToCreate",
      "customersToReuse",
      "installationsToCreate",
      "contractsToCreate",
      "mode === \"dry-run\"",
      "recordClientImportLog",
      "import_logs",
    ], "client import service");

    assertIncludes(read("src/app/(dashboard)/import/page.tsx"), [
      "read-excel-file/browser",
      "CSV/XLSX",
      "Plan d'import",
      "Derniers imports et simulations",
      "Confirmer l'import",
      "modele-import-contratpro.csv",
    ], "client import page");
  });
});
