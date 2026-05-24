import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
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

const repoLeakScanTargets = [
  ".env.local.example",
  ".env.production.example",
  "README.md",
  "docs",
  "package.json",
  "public",
  "scripts",
  "src",
  "tests",
];

const repoLeakTextExtensions = new Set([
  "",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

function collectRepoTextFiles(targetPath) {
  const absolutePath = pathOf(targetPath);
  if (!existsSync(absolutePath)) {
    return [];
  }

  const stat = statSync(absolutePath);
  if (stat.isFile()) {
    return repoLeakTextExtensions.has(extname(absolutePath)) ? [absolutePath] : [];
  }

  return readdirSync(absolutePath).flatMap((entry) => {
    const childPath = join(absolutePath, entry);
    const childStat = statSync(childPath);
    if (childStat.isDirectory()) {
      return collectRepoTextFiles(childPath);
    }
    return repoLeakTextExtensions.has(extname(childPath)) ? [childPath] : [];
  });
}

describe("production guardrails", () => {
  it("keeps production project refs out of public repo files", () => {
    const productionProjectRef = ["yotafzxc", "pyyrkkpeyfpp"].join("");
    const privateFounderEmail = ["esport.hub.pro", "proton.me"].join("@");
    const forbiddenValues = [
      productionProjectRef,
      `https://${productionProjectRef}.supabase.co`,
      `https://supabase.com/dashboard/project/${productionProjectRef}`,
      privateFounderEmail,
    ];
    const files = repoLeakScanTargets.flatMap(collectRepoTextFiles);

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const value of forbiddenValues) {
        assert.ok(!content.includes(value), `${file} must not expose ${value}`);
      }
    }
  });

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
      "Lecture Supabase indisponible hors mode démo.",
      "Profil organisation introuvable hors mode démo.",
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
      "src/app/(dashboard)/admin/prospection/content/page.tsx",
      "src/app/(dashboard)/admin/prospection/page.tsx",
      "src/app/(dashboard)/admin/prospection/guide/page.tsx",
      "src/app/(dashboard)/prospection/page.tsx",
      "src/app/(dashboard)/settings/facebook/page.tsx",
    ];

    for (const route of adminRoutes) {
      assert.ok(read(route).includes("requireAdminUser"), `${route} must require admin user`);
    }

    assertIncludes(read("src/app/(dashboard)/prospection/page.tsx"), [
      "Command center",
      "File d'appel fondateur",
      "Architecte IA relance",
      "File de relance commerciale",
      "leadFollowUpSignal",
      "followUpArchitectSummary",
      "data-od-id=\"lead-followup-architect\"",
      "lead-stage-board",
      "PUBLIC_DEMO",
      "Cree le {lead.createdAt}",
      "Attribution: {lead.attribution}",
      "LeadDmCopyButton",
      "LeadCommercialLogForm",
      "PilotBriefCopyButton",
      "buildLeadDmScript",
      "latestCommercialLog",
      "leadDmScenario",
      "leadFounderAction",
      "pilotReadinessSignal",
      "buildPilotBrief",
      "Action apres envoi",
      "Dernier suivi",
      "Architecte IA démo pilote",
      "Passage lead vers rendez-vous",
      "data-od-id=\"pilot-handoff-command\"",
      "DM skill",
      "/admin/prospection/guide",
    ], "founder sales pipeline cockpit");

    assertIncludes(read("src/app/(dashboard)/prospection/LeadDmCopyButton.tsx"), [
      "\"use client\"",
      "navigator.clipboard.writeText",
      "lead-dm-copy-button",
      "DM copie",
    ], "lead DM copy button");

    assertIncludes(read("src/app/(dashboard)/prospection/LeadCommercialLogForm.tsx"), [
      "\"use client\"",
      "Journaliser action",
      "Suivi commercial",
      "objection",
      "router.refresh",
    ], "lead commercial action log form");

    assertIncludes(read("src/app/(dashboard)/prospection/PilotBriefCopyButton.tsx"), [
      "\"use client\"",
      "navigator.clipboard.writeText",
      "pilot-brief-copy-button",
      "Fiche copiee",
    ], "pilot brief copy button");

    assertIncludes(read("src/app/api/prospection/leads/[id]/route.ts"), [
      "updates.notes = text(body.notes)",
      "last_touch_at",
      "next_action",
    ], "lead PATCH commercial log fields");

    assertIncludes(read("src/app/(dashboard)/admin/prospection/page.tsx"), [
      "Priorité fondateur",
      "Appels démo à traiter aujourd'hui",
      "founder-queue-card",
      "PUBLIC_DEMO",
      "{lead.attribution}",
      "Performance attribution",
      "Ce qui génère les meilleurs leads",
      "attributionStats",
      "Score moyen",
      "Architecte IA prospection Facebook",
      "facebookSkillModules",
      "facebookDmScript",
      "ProspectionCopyButton",
      "data-od-id=\"facebook-prospection-skill\"",
      "/admin/prospection/guide",
      "/admin/prospection/content",
      "Bibliotheque contenus",
      "Mode d'emploi skill",
      "Ouvrir guide",
      "Ouvrir contenus",
    ], "admin sales command queue");

    assertIncludes(read("src/app/(dashboard)/admin/prospection/content/page.tsx"), [
      "Bibliotheque contenus Facebook",
      "requireAdminUser",
      "contentAssets",
      "Architecte IA contenus",
      "Reception kit Claude",
      "Strategie Claude",
      "/facebook/contratpro-strategie-facebook.html",
      "Post épinglé lancement",
      "Prompt visuel",
      "ProspectionCopyButton",
      "Liens UTM",
    ], "admin Facebook content library page");

    assert.ok(
      existsSync(pathOf("public/facebook/contratpro-strategie-facebook.html")),
      "Claude Facebook strategy artifact should be published as a static reference",
    );

    const facebookStrategyArtifact = read("public/facebook/contratpro-strategie-facebook.html");

    assertIncludes(facebookStrategyArtifact, [
      "ContratPro",
      "Facebook Complet",
      "Critique DC",
      "V2",
      "Version corrig",
    ], "Claude Facebook strategy artifact");
    assert.ok(
      !facebookStrategyArtifact.includes("file:///"),
      "Claude Facebook strategy artifact should not include local file links",
    );

    assertIncludes(read("src/app/(dashboard)/admin/prospection/guide/page.tsx"), [
      "Guide prospection Facebook",
      "requireAdminUser",
      "Architecte IA acquisition",
      "Routine quotidienne",
      "KPI scorecard 90 jours",
      "ProspectionCopyButton",
      "promptAnalyse",
      "Décision: vendre / itérer / couper",
    ], "admin prospection skill guide page");

    assert.ok(
      existsSync(pathOf("docs/skill-prospection-facebook/README.md")),
      "prospection skill manual should exist",
    );

    assertIncludes(read("docs/skill-prospection-facebook/README.md"), [
      "/admin/prospection",
      "/facebook/contratpro-strategie-facebook.html",
      "Architecte IA prospection Facebook",
      "mode-emploi.md",
      "templates-copier-coller.md",
      "kpi-scorecard.md",
    ], "prospection skill manual");

    assertIncludes(read("docs/gocardless-sandbox-runbook.md"), [
      "GOCARDLESS_ACCESS_TOKEN",
      "GOCARDLESS_ENVIRONMENT=sandbox",
      "npm run smoke:gocardless",
      "/contracts/quick",
      "Créer lien GoCardless",
      "mandate_request_mandate",
      "Actif GoCardless",
      "/payments/new",
      "/api/webhooks/gocardless",
    ], "GoCardless sandbox runbook");

    assertIncludes(read("docs/skill-prospection-facebook/mode-emploi.md"), [
      "Routine quotidienne",
      "Garder l'angle",
      "Couper si",
    ], "prospection skill operating guide");

    assertIncludes(read("docs/skill-prospection-facebook/templates-copier-coller.md"), [
      "DM froid",
      "Post probleme -> solution",
      "Message apres reponse positive",
    ], "prospection skill templates");

    assertIncludes(read("docs/skill-prospection-facebook/prompts-codex.md"), [
      "Generer un DM froid",
      "Construire une semaine editoriale",
      "Analyser une semaine",
    ], "prospection skill codex prompts");

    assertIncludes(read("docs/skill-prospection-facebook/kpi-scorecard.md"), [
      "KPI scorecard 90 jours",
      "Lecture Architecte IA",
      "Decision : vendre / iterer / couper",
    ], "prospection skill KPI scorecard");

    assertIncludes(read("README.md"), [
      "docs/skill-prospection-facebook/",
      "Skill admin - Prospection Facebook",
      "Architecte IA prospection Facebook",
    ], "prospection skill README");

    assertIncludes(read("src/server/contratpro-data.ts"), [
      "source_url",
      "leadAttributionLabel",
      "utm_source",
      "utm_campaign",
      "Attribution:",
    ], "lead attribution mapping");

    assertIncludes(read("src/app/(dashboard)/settings/facebook/page.tsx"), [
      "CampaignLinkBuilder",
      "demoUrl={settings.demoUrl}",
      "Canal Facebook fondateur",
    ], "campaign link builder placement");

    assertIncludes(read("src/app/(dashboard)/settings/facebook/CampaignLinkBuilder.tsx"), [
      "\"use client\"",
      "Generateur de liens campagnes",
      "navigator.clipboard.writeText",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "plan",
    ], "campaign link builder");

    assertIncludes(read("src/app/(dashboard)/prospection/LeadStatusControls.tsx"), [
      "REPLIED",
      "LOST",
      "nextAction",
      "Mise à jour impossible.",
    ], "lead status sales actions");

    assertIncludes(read("src/app/globals.css"), [
      ".sales-command",
      ".lead-followup-command",
      ".lead-followup-layout",
      ".lead-followup-decision",
      ".lead-followup-card",
      ".pilot-handoff-command",
      ".pilot-handoff-grid",
      ".pilot-handoff-card",
      ".pilot-brief-copy-button",
      ".lead-stage-board",
      ".founder-queue-card",
      ".campaign-link-panel",
      ".campaign-preset-button",
      ".campaign-link-output",
      ".attribution-performance-card",
      ".attribution-mini-stat",
      ".prospection-skill-cockpit",
      ".skill-module-card",
      ".prospection-copy-button",
      ".prospection-guide-hero",
      ".prospection-guide-panel",
      ".prospection-guide-scorecard",
      ".lead-dm-panel",
      ".lead-dm-copy-button",
      ".lead-dm-table-action",
      ".lead-founder-action",
      ".lead-log-form",
      ".lead-latest-log",
      ".lead-table-log",
      ".content-library-hero",
      ".content-status-strip",
      ".content-asset-card",
      ".content-copy-block",
    ], "sales cockpit styles");

    const shell = read("src/components/layout/AppShell.tsx");
    assertIncludes(shell, [
      "showInternalTools = false",
      "/admin/launch",
      "/admin/pilots",
      "/admin/notifications",
      "/admin/ops",
      "/admin/prospection/guide",
      "/admin/prospection/content",
      "/settings/facebook",
    ], "app shell founder navigation");
  });

  it("keeps business APIs authenticated", () => {
    const apiRoutes = [
      "src/app/api/billing/checkout/route.ts",
      "src/app/api/billing/portal/route.ts",
      "src/app/api/certificates/[id]/send/route.ts",
      "src/app/api/certificates/[id]/pdf/route.ts",
      "src/app/api/contracts/[id]/mandate/route.ts",
      "src/app/api/contracts/quick/route.ts",
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
      "Supabase Auth est indisponible ou mal configure.",
      "Session Supabase incomplete apres connexion.",
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
      "sendPlainEmail",
      "Demande demo ContratPro recue",
      "marketingAttribution",
      "utm_source",
      "utm_campaign",
    ], "public demo request guardrails");
  });

  it("keeps provider webhooks signed and cron protected", () => {
    assertIncludes(read("src/app/api/webhooks/gocardless/route.ts"), [
      "verifyGoCardlessSignature",
      "Webhook-Signature",
      "handleBillingRequestEvent",
      "handleMandateEvent",
      "mandate_request_mandate",
      "retrieveGoCardlessBillingRequest",
    ], "gocardless webhook");

    assertIncludes(read("scripts/gocardless-sandbox-smoke-test.mjs"), [
      "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET",
      "/api/contracts/quick",
      "/api/payments",
      "/api/webhooks/gocardless",
      "payment_events",
      "GoCardless sandbox OK",
    ], "gocardless sandbox smoke");

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
      "OpsSmokeAction",
      "OpsDemoChecklistItem",
      "buildCronRunbook",
      "buildDemoChecklist",
      "buildGoCardlessRunbook",
      "buildSmokeRunbook",
      "checkGoCardlessProvider",
      "GET /creditors sur api-sandbox.gocardless.com",
      "Dry-run quotidien",
      "Envoi reel controle",
      "Preuve de journalisation",
      "Alerte fondateur",
      "CONTRATPRO_ORG_ID",
      "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET",
      "CONTRATPRO_SMOKE_EMAIL",
      "Parcours client",
      "Parcours client OK",
      "Preparer un import sec",
      "npm run smoke:auth",
      "npm run smoke:journey",
      "npm run deploy:smoke:journey -- https://votre-domaine.fr",
    ], "ops cron runbook");

    assertIncludes(read("src/app/(dashboard)/admin/ops/page.tsx"), [
      "OpsCommandCopyButton",
      "data-od-id=\"ops-cron-runbook\"",
      "data-od-id=\"ops-gocardless-runbook\"",
      "data-od-id=\"ops-demo-checklist\"",
      "data-od-id=\"ops-smoke-runbook\"",
      "Cron relances sous contrôle",
      "GoCardless sandbox sous contrôle",
      "Checklist pré-démo",
      "Smoke tests client",
      "health.cronRunbook.map",
      "health.goCardlessRunbook.map",
      "health.demoChecklist.map",
      "health.smokeRunbook.map",
      "Dry-run avant envoi réel",
      "Mandat puis paiement",
      "15 minutes avant l'appel",
      "Local puis Vercel",
    ], "ops cron page");

    assertIncludes(read("src/app/(dashboard)/admin/ops/OpsCommandCopyButton.tsx"), [
      "\"use client\"",
      "navigator.clipboard.writeText",
      "Copier la commande",
      "ops-copy-command-button",
    ], "ops command copy button");

    assertIncludes(read("src/app/globals.css"), [
      ".ops-cron-panel",
      ".ops-gocardless-panel",
      ".ops-cron-grid",
      ".ops-cron-card",
      ".ops-demo-panel",
      ".ops-demo-grid",
      ".ops-demo-card",
      ".ops-smoke-panel",
      ".ops-smoke-grid",
      ".ops-smoke-card",
      ".ops-command-copy",
      ".ops-copy-command-button",
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
      "data-od-id=\"relance-revenue-command\"",
      "Commande du jour",
      "Action prioritaire",
      "analyzeRenewalAgent",
      "relance-agent-panel",
      "Score IA",
    ], "renewal agent page");

    assertIncludes(read("src/app/globals.css"), [
      ".relance-agent-panel",
      ".relance-agent-card",
      ".relance-agent-note",
      ".relance-command-panel",
      ".relance-command-decision",
    ], "renewal agent styles");
  });

  it("keeps the first mobile terrain PWA surface available", () => {
    assertIncludes(read("src/app/layout.tsx"), [
      "manifest: \"/manifest.webmanifest\"",
      "appleWebApp",
      "themeColor: \"#1E3A5F\"",
      "ServiceWorkerRegistration",
    ], "pwa metadata");

    assertIncludes(read("src/app/manifest.ts"), [
      "start_url: \"/terrain\"",
      "display: \"standalone\"",
      "orientation: \"portrait\"",
      "theme_color: \"#1E3A5F\"",
    ], "pwa manifest");

    assert.ok(existsSync(pathOf("src/app/icon.svg")), "PWA icon should exist");
    assert.ok(existsSync(pathOf("src/app/offline/page.tsx")), "offline fallback page should exist");
    assert.ok(existsSync(pathOf("public/service-worker.js")), "service worker should exist");

    assertIncludes(read("public/service-worker.js"), [
      "contratpro-offline-v1",
      "OFFLINE_URL",
      "/offline",
      "request.mode === \"navigate\"",
      "PRECACHE_URLS",
    ], "pwa service worker");

    assertIncludes(read("src/components/pwa/ServiceWorkerRegistration.tsx"), [
      "\"use client\"",
      "navigator.serviceWorker.register",
      "/service-worker.js",
      "scope: \"/\"",
    ], "pwa service worker registration");

    assertIncludes(read("src/app/offline/page.tsx"), [
      "Mode hors ligne",
      "sans stocker les donnees clients hors ligne",
      "Retour terrain",
    ], "pwa offline fallback");

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
      "/service-worker.js",
      "/offline",
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

    assertIncludes(read("src/server/resend.ts"), [
      "RESEND_API_KEY est absent",
      "RESEND_FROM_EMAIL est absent",
      "sendDocumentEmail",
      "sendPlainEmail",
    ], "resend provider safety");

    assertIncludes(read("scripts/resend-readiness.mjs"), [
      "RESEND_API_KEY",
      "RESEND_FROM_EMAIL",
      "CONTRATPRO_RESEND_TEST_TO",
      "https://api.resend.com/domains",
      "https://api.resend.com/emails",
      "Resend OK",
    ], "resend readiness script");

    assertIncludes(read("docs/resend-readiness.md"), [
      "Resend readiness ContratPro",
      "npm run resend:readiness",
      "CONTRATPRO_RESEND_TEST_TO",
      "document_sends",
    ], "resend readiness runbook");
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
      "\"db:audit\"",
      "\"deploy:preflight\"",
      "\"vercel:live-audit\"",
      "\"deploy:smoke\"",
      "\"deploy:smoke:auth\"",
      "\"deploy:smoke:journey\"",
      "\"smoke:gocardless\"",
      "\"deploy:smoke:gocardless\"",
      "\"smoke:stripe\"",
      "\"deploy:smoke:stripe\"",
      "\"resend:readiness\"",
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
      "https://your-project-ref.supabase.co",
      "CONTRATPRO_REQUIRE_AUTH=true",
      "CONTRATPRO_REQUIRE_BILLING=true",
      "GOCARDLESS_ENVIRONMENT=live",
      "CRON_SECRET",
    ], "production env example");

    assertIncludes(read("scripts/vercel-preflight.mjs"), [
      "github.com/admincairn/CONTRATPRO.git",
      "Node 24",
      "deployer ContratPro avec Node 24.x",
      "https://your-project-ref.supabase.co",
    ], "vercel preflight");

    assertIncludes(read("scripts/vercel-live-audit.mjs"), [
      "Environment Variables found",
      "npx vercel env ls",
      ".vercel-env.txt",
      "CONTRATPRO_REQUIRE_BILLING",
      "CONTRATPRO_ORG_ID",
      "org_demo",
      "GOCARDLESS_ENVIRONMENT",
      "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET",
      "STRIPE_PRICE_ID_STARTER",
      "STRIPE_PRICE_ID_BUSINESS",
      "VERCEL_AUTOMATION_BYPASS_SECRET",
      "pilotMode",
      "PILOT CONTROLE",
      "pilote controle sans encaissement automatique",
      "volontairement differes",
      "LIVE PAUSE",
      "LIVE OK",
    ], "vercel live audit");

    assertIncludes(read("scripts/deployment-smoke-test.mjs"), [
      "CONTRATPRO_DEPLOYMENT_URL",
      "getDeploymentProtectionHeaders",
      "/api/health",
      "/login",
      "/simulateur",
      "/attestation-entretien-chaudiere",
      "/pricing",
      "/demo",
      "/demo/merci",
    ], "deployment smoke test");

    assertIncludes(read("docs/vercel-launch-checklist.md"), [
      "admincairn/CONTRATPRO",
      "https://vercel.com/contratpro",
      "Node.js 24.x",
      "npm run deploy:preflight",
      "npx vercel env ls | npm run vercel:live-audit --silent",
      "PILOT CONTROLE",
      "npm run deploy:smoke",
      "https://supabase.com/dashboard/project/<project-ref>",
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

    assertIncludes(read("scripts/env-guard.mjs"), [
      "VERCEL_ENV ne doit pas etre defini dans .env.local",
      "CONTRATPRO_ORG_ID pointe vers org_demo",
      "CONTRATPRO_PUBLIC_LEAD_ORG_ID pointe vers org_demo",
      "OK env guard",
    ], "local dev env guard");

    assertIncludes(read("package.json"), [
      "\"env:guard\": \"node scripts/env-guard.mjs\"",
      "\"dev\": \"node scripts/env-guard.mjs && next dev\"",
      "\"smoke:auth\": \"node scripts/authenticated-smoke-test.mjs\"",
      "\"smoke:journey\": \"node scripts/customer-journey-smoke-test.mjs\"",
      "\"smoke:demo\": \"node scripts/demo-journey-smoke-test.mjs\"",
      "\"deploy:smoke:demo\": \"node scripts/demo-journey-smoke-test.mjs\"",
    ], "env guard package scripts");

    assertIncludes(read("scripts/smoke-test-helpers.mjs"), [
      "loadLocalEnv",
      ".env.local",
      "npm_lifecycle_event",
      "CONTRATPRO_SMOKE_BASE_URL",
      "NEXT_PUBLIC_APP_URL",
      "http://localhost:3000",
      "CONTRATPRO_SMOKE_EMAIL",
      "VERCEL_AUTOMATION_BYPASS_SECRET",
      "x-vercel-protection-bypass",
      "Les identifiants smoke sont encore des valeurs d'exemple.",
      "ton-domaine.fr",
      "containsDashboardErrorBoundary",
      "TENANT_DEMO_FORBIDDEN",
    ], "smoke test helper");

    assertIncludes(read("scripts/authenticated-smoke-test.mjs"), [
      "getSmokeConfig",
      "getDeploymentProtectionHeaders",
      "containsDashboardErrorBoundary",
      "impossible de joindre",
      "Demarrez le serveur avec npm run dev",
      "/api/auth/login",
      "/api/auth/me",
      "/onboarding",
    ], "authenticated smoke test");

    assertIncludes(read("scripts/customer-journey-smoke-test.mjs"), [
      "getSmokeConfig",
      "getDeploymentProtectionHeaders",
      "containsDashboardErrorBoundary",
      "impossible de joindre",
      "Demarrez le serveur avec npm run dev",
      "Dashboard dirigeant",
      "Securisation des contrats CVC",
      "Architecte IA contrats",
      "/import",
      "/contracts",
      "/relances",
      "/invoices",
      "/certificates",
      "/payments",
      "/settings/billing",
      "Parcours client OK",
    ], "customer journey smoke test");

    assertIncludes(read("scripts/demo-journey-smoke-test.mjs"), [
      "getSmokeConfig",
      "CONTRATPRO_DEMO_SEND_EMAIL",
      "/api/import/clients",
      "/api/contracts/quick",
      "/mandate/authorisation",
      "/api/invoices",
      "/pdf",
      "/send",
      "Demo M. Martin OK",
    ], "demo journey smoke test");

    assertIncludes(read(".env.local.example"), [
      "NEXT_PUBLIC_APP_URL=http://localhost:3000",
      "SUPABASE_SERVICE_ROLE_KEY=",
      "CONTRATPRO_REQUIRE_AUTH=true",
      "CONTRATPRO_ORG_ID=org_contratpro_admin",
      "CONTRATPRO_PUBLIC_LEAD_ORG_ID=org_contratpro_admin",
    ], "local env example");

    assertIncludes(read("docs/local-development-env.md"), [
      "vercel env pull",
      "npm run env:guard",
      "npm run smoke:auth",
      "npm run smoke:journey",
      "CONTRATPRO_SMOKE_BASE_URL",
      "http://localhost:3000",
      "reprise dashboard apparait",
      "VERCEL_ENV=production",
      "org_contratpro_admin",
      "npm run security:audit",
      "npm run deploy:smoke:auth",
    ], "local env runbook");

    assertIncludes(read("docs/customer-journey-runbook.md"), [
      "Runbook parcours client ContratPro",
      "npm run smoke:auth",
      "npm run smoke:journey",
      "npm run smoke:demo",
      "ecran de reprise dashboard",
      "npm run deploy:smoke:journey",
      "npm run deploy:smoke:demo",
      "Test manuel avec un vrai fichier",
      "Definition of done",
      "Stop rules",
    ], "customer journey runbook");

    assertIncludes(read("README.md"), [
      "Priorite 30 - Parcours client complet",
      "docs/customer-journey-runbook.md",
      "npm run deploy:smoke:journey",
      "npm run smoke:demo",
      "CONTRATPRO_DEMO_SEND_EMAIL=true",
      "relances, factures, attestations, paiements",
    ], "customer journey README");
  });

  it("keeps dashboard runtime errors converted into a branded recovery screen", () => {
    assert.ok(
      existsSync(pathOf("src/app/(dashboard)/error.tsx")),
      "dashboard error boundary should exist",
    );

    assertIncludes(read("src/app/(dashboard)/error.tsx"), [
      "\"use client\"",
      "DemoOrganizationForbiddenError",
      "ProductionTenantConfigError",
      "TENANT_DEMO_FORBIDDEN",
      "Vérifier la sécurité",
      "Se reconnecter",
      "Dashboard error boundary",
    ], "dashboard error boundary");

    assertIncludes(read("src/app/globals.css"), [
      ".dashboard-error-shell",
      ".dashboard-error-card",
      ".dashboard-error-diagnostic",
    ], "dashboard error styles");
  });

  it("keeps client security and payment trust readable without exposing provider keys", () => {
    assertIncludes(read("src/app/(dashboard)/settings/security/page.tsx"), [
      "Sécurité et paiements",
      "client-security-trust",
      "Clés API masquées",
      "Comment circule un paiement SEPA",
      "Vous n'avez pas à créer de compte technique GoCardless",
      "L'encaissement SEPA live reste soumis à validation juridique",
      "Auditabilité",
      "Diagnostic admin",
      "currentAdmin ?",
      "Variables serveur",
    ], "client security trust page");

    assertIncludes(read("src/app/globals.css"), [
      ".trust-command",
      ".trust-pillar-grid",
      ".payment-trust-panel",
      ".payment-assurance-panel",
      ".trust-audit-panel",
      ".admin-security-diagnostics",
    ], "client security trust styles");
  });

  it("keeps founder go-live readiness visible before commercial launch", () => {
    assertIncludes(read("src/server/launch-readiness.ts"), [
      "STRIPE_SECRET_KEY",
      "CONTRATPRO_REQUIRE_BILLING",
      "GOCARDLESS_ENVIRONMENT",
      "pilote sans encaissement automatique",
      "expediteur a verifier plus tard",
      "admincairn/CONTRATPRO",
      "getProductionActivationPlan",
      "getProductionArchitectSummary",
      "productionControlLinks",
      "recommendedDecision",
      "supabaseDashboardHref",
      "SUPABASE_PROJECT_REF",
      "https://vercel.com/contratpro?repo=https%3A%2F%2Fgithub.com%2Fadmincairn%2FCONTRATPRO",
      "Architecte IA production",
      "LIVE OK",
      "LIVE PAUSE",
      "ROLLBACK",
      "ProductionActivationStep",
      "getPilotReadinessPlan",
      "Decision go/no-go",
    ], "launch readiness service");

    assertIncludes(read("src/app/(dashboard)/admin/launch/page.tsx"), [
      "requireAdminUser",
      "getLaunchReadiness",
      "getPilotReadinessPlan",
      "getProductionActivationPlan",
      "getProductionArchitectSummary",
      "Readiness commerciale",
      "data-od-id=\"production-ai-architect\"",
      "Décider le live avec preuves",
      "Décision recommandée maintenant",
      "Activation production live",
      "data-od-id=\"production-live-activation\"",
      "Bloquants avant vente forte",
      "Plan pilote terrain",
    ], "launch admin page");

    assertIncludes(read("src/app/(dashboard)/admin/launch/LaunchDecisionCopyButton.tsx"), [
      "navigator.clipboard.writeText",
      "launch-decision-copy",
      "Copier la decision",
      "Copie",
    ], "launch decision copy button");

    assertIncludes(read("src/app/globals.css"), [
      ".launch-command",
      ".launch-architect",
      ".launch-control-links",
      ".launch-recommended-decision",
      ".launch-recommended-note",
      ".launch-signal-card",
      ".launch-decision-note",
      ".launch-decision-copy",
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
      "Script de rendez-vous",
      "Je ne vais pas vous vendre un logiciel aujourd'hui",
      "J'ai deja Excel",
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
      "pilotDemoScript",
      "pilotObjections",
      "pilotDecisionNotes",
      "Decision: Vendre",
      "Decision: Iterer",
      "Decision: Stop",
      "Architecte IA pilote",
      "Je ne vais pas vous vendre un logiciel aujourd'hui",
      "J'ai deja Excel",
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
      "data-od-id=\"pilot-demo-script\"",
      "data-od-id=\"pilot-objections\"",
      "data-od-id=\"pilot-decision-notes\"",
      "Architecte IA pilote",
      "Script de rendez-vous pilote",
      "Objections a traiter",
      "Fiche de sortie pilote",
      "PilotDecisionCopyButton",
      "PilotExitNoteBuilder",
      "Décision premium après rendez-vous",
      "Décision attendue",
      "Vendre / Iterer / Stop",
    ], "pilot admin page");

    assertIncludes(read("src/app/(dashboard)/admin/pilots/PilotExitNoteBuilder.tsx"), [
      "pilot-exit-builder",
      "pilot-exit-note-builder",
      "Nom pilote",
      "Preuve observee",
      "Objection bloquante",
      "Copier la note personnalisee",
      "navigator.clipboard.writeText",
    ], "pilot exit note builder");

    assertIncludes(read("src/app/(dashboard)/admin/pilots/PilotDecisionCopyButton.tsx"), [
      "navigator.clipboard.writeText",
      "pilot-decision-copy",
      "Copier la note",
      "Copie",
    ], "pilot decision copy button");

    assertIncludes(read("src/app/globals.css"), [
      ".pilot-command",
      ".pilot-kpi-grid",
      ".pilot-signal-panel",
      ".pilot-signal-bar",
      ".pilot-architect",
      ".pilot-architect-card",
      ".pilot-panel",
      ".pilot-question-card",
      ".pilot-script-timeline",
      ".pilot-script-step",
      ".pilot-objection-grid",
      ".pilot-objection-card",
      ".pilot-exit-builder",
      ".pilot-exit-note",
      ".pilot-decision-note-grid",
      ".pilot-decision-note",
      ".pilot-decision-copy",
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
      "Plan demandé depuis la page tarifs",
      "data-od-id=\"billing-ai-architect\"",
      "Vendre le bon palier",
      "Journal Stripe récent",
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

    assertIncludes(read("scripts/stripe-billing-smoke-test.mjs"), [
      "STRIPE_WEBHOOK_SECRET",
      "/api/webhooks/stripe",
      "checkout.session.completed",
      "customer.subscription.updated",
      "billing_subscriptions",
      "billing_events",
      "Stripe Billing OK",
    ], "stripe billing smoke");

    assertIncludes(read("src/app/globals.css"), [
      ".billing-architect",
      ".billing-architect-grid",
      ".billing-plan-card",
    ], "stripe billing architect styles");

    assertIncludes(read("docs/stripe-test-billing.md"), [
      "https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard",
      "https://contratpro-dun.vercel.app/api/webhooks/stripe",
      "4242 4242 4242 4242",
      "npm run smoke:stripe",
      "billing_subscriptions",
      "billing_events",
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
      "Démarrage accompagné",
      "Pilote facturable",
      "Go-live limité",
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
      "src/app/attestation-entretien-chaudiere/page.tsx",
      "src/app/demo/page.tsx",
      "src/app/demo/merci/page.tsx",
      "src/app/pricing/page.tsx",
      "src/app/legal/page.tsx",
      "src/app/cookies/page.tsx",
      "src/app/privacy/page.tsx",
      "src/app/dpa/page.tsx",
      "src/app/terms/page.tsx",
    ]) {
      assert.ok(existsSync(pathOf(page)), `${page} should exist`);
      assert.ok(read(page).includes("PublicShell"), `${page} should use public shell`);
    }
    assert.ok(existsSync(pathOf("src/app/simulateur/page.tsx")), "src/app/simulateur/page.tsx should exist");
    assert.ok(
      read("src/app/simulateur/SimulatorClient.tsx").includes("PublicShell"),
      "src/app/simulateur/SimulatorClient.tsx should use public shell",
    );

    assertIncludes(read("src/components/marketing/PublicShell.tsx"), [
      "CookiePreferencesButton",
      "href=\"/\"",
      "/architecte-ia",
      "/simulateur",
      "/attestation-entretien-chaudiere",
      "/demo",
      "/pricing",
      "/privacy",
      "/dpa",
      "/cookies",
      "/legal",
      "/terms",
    ], "public shell");

    assertIncludes(read("src/app/layout.tsx"), [
      "CookieConsent",
      "<CookieConsent />",
    ], "cookie consent root layout");

    assertIncludes(read("src/app/page.tsx"), [
      "HomeLanding",
      "export const metadata",
      "PublicShell",
      "StructuredData",
      "SoftwareApplication",
      "Ne laissez plus vos contrats d'entretien dormir dans Excel.",
      "if (authEnforced && !user)",
      "return <HomeLanding />",
      "return <DashboardHome />",
      "getRenewalPipeline",
      "getInvoices",
      "Cockpit dirigeant",
      "Securisation des contrats CVC",
      "data-od-id=\"dashboard-empty-cockpit\"",
      "data-od-id=\"dashboard-contract-architect\"",
      "Architecte IA contrats",
      "Actions qui securisent le cash",
      "Cockpit revenu recurrent",
      "Securiser les contrats avant qu'ils ne fuient.",
      "Score securite",
      "Action du jour",
    ], "public landing on root");

    assertIncludes(read("src/components/marketing/StructuredData.tsx"), [
      "application/ld+json",
      "JSON.stringify",
      "replace(/</g",
    ], "structured data component");

    assertIncludes(read("src/app/layout.tsx"), [
      "metadataBase",
      "template: \"%s | ContratPro\"",
      "openGraph",
      "twitter",
      "Logiciel contrats entretien CVC",
    ], "global public metadata");

    assertIncludes(read("src/app/demo/page.tsx"), [
      "export const metadata",
      "StructuredData",
      "ScheduleAction",
      "canonical: \"/demo\"",
      "Démo ContratPro pour chauffagistes CVC",
    ], "demo metadata");

    assertIncludes(read("src/app/demo/merci/page.tsx"), [
      "export const metadata",
      "robots",
      "index: false",
      "Demande reçue",
      "Votre demande démo est bien arrivée.",
      "Prochaines étapes",
      "Préparer votre fichier clients",
    ], "demo thank-you page");

    assertIncludes(read("src/app/pricing/page.tsx"), [
      "export const metadata",
      "StructuredData",
      "\"@type\": \"Product\"",
      "canonical: \"/pricing\"",
      "Tarifs ContratPro Starter, Pro et Business",
    ], "pricing metadata");

    assertIncludes(read("src/app/cookies/page.tsx"), [
      "export const metadata",
      "canonical: \"/cookies\"",
      "COOKIE_CATEGORIES",
      "Politique cookies",
    ], "cookies metadata");

    assertIncludes(read("src/app/dpa/page.tsx"), [
      "export const metadata",
      "canonical: \"/dpa\"",
      "Accord de traitement des donnees",
      "sous-traitant",
    ], "dpa metadata");

    assertIncludes(read("src/app/simulateur/page.tsx"), [
      "export const metadata",
      "StructuredData",
      "WebApplication",
      "canonical: \"/simulateur\"",
      "Simulateur contrats oublies CVC",
    ], "simulator metadata");

    assertIncludes(read("src/app/simulateur/SimulatorClient.tsx"), [
      "\"use client\"",
      "Calculer ma perte",
      "/api/simulateur/track",
    ], "simulator client interaction");

    assertIncludes(read("src/app/globals.css"), [
      ".home-proof-strip",
      ".home-final-cta",
      ".contract-safety-cockpit",
      ".contract-safety-gauge",
      ".contract-safety-actions",
      ".dashboard-empty-cockpit",
      ".dashboard-command-grid",
      ".dashboard-architect-panel",
      ".dashboard-today-panel",
      ".dashboard-today-action",
    ], "public landing styles");

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
      "VOIR LA DÉMO",
    ], "architecte ia public page");

    assertIncludes(read("src/app/simulateur/SimulatorClient.tsx"), [
      "Simulateur ROI",
      "Calculer ma perte",
      "/api/simulateur/track",
      "Programmer une démo",
    ], "roi simulator public page");

    assertIncludes(read("src/app/attestation-entretien-chaudiere/page.tsx"), [
      "Attestation d’entretien chaudière",
      "Service-Public",
      "www.ecologie.gouv.fr",
      "application/ld+json",
      "Voir la démo documents",
    ], "seo boiler certificate page");

    assertIncludes(read("src/app/demo/page.tsx"), [
      "DemoRequestForm",
      "Suspense",
      "#demande-demo",
      "Capture lead",
      "Demander une démonstration ContratPro",
    ], "public demo lead capture page");

    assertIncludes(read("src/app/demo/DemoRequestForm.tsx"), [
      "/api/public/demo-request",
      "sourceUrl: window.location.href",
      "Plan vise",
      "useRouter",
      "URLSearchParams",
      "/demo/merci",
    ], "public demo lead form");

    assertIncludes(read("src/app/globals.css"), [
      ".cookie-consent-banner",
      ".cookie-consent-equal-button",
      ".cookie-modal-panel",
      ".cookie-policy-grid",
      ".demo-request-panel",
      ".demo-request-form",
      ".demo-form-success",
    ], "public demo lead styles");

    assertIncludes(read("src/components/cookie-consent.tsx"), [
      "\"use client\"",
      "useCookieConsent",
      "contratpro:open-cookie-modal",
      "Tout refuser",
      "Tout accepter",
      "/cookies",
    ], "cookie consent component");

    assertIncludes(read("src/hooks/use-cookie-consent.ts"), [
      "COOKIE_CONSENT_STORAGE_KEY",
      "COOKIE_CONSENT_EXPIRY_MS",
      "COOKIE_BANNER_ID",
      "localStorage",
      "hydrated",
    ], "cookie consent hook");

    assertIncludes(read("src/lib/cookies-config.ts"), [
      "COOKIE_BANNER_VERSION",
      "defaultValue: false",
      "statistics",
      "marketing",
    ], "cookie consent config");

    assertIncludes(read("src/app/sitemap.ts"), [
      "/attestation-entretien-chaudiere",
      "/cookies",
      "/dpa",
      "contratpro-dun.vercel.app",
    ], "public sitemap");

    assertIncludes(read("src/app/robots.ts"), [
      "/attestation-entretien-chaudiere",
      "/api",
      "sitemap.xml",
    ], "public robots");

    assertIncludes(read("src/app/pricing/page.tsx"), [
      "Cash-flow CVC",
      "Encaissez vos contrats d’entretien",
      "contrats récupérés",
      "revenu récurrent plus fiable",
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
      "Fiche de contrôle import",
      "Simulation obligatoire",
      "Modèle chauffagiste",
      "Préparer un fichier Excel que ContratPro comprend.",
      "Télécharger le modèle",
      "PAC air/eau",
      "Derniers imports et simulations",
      "Confirmer l'import",
      "modele-import-contratpro.csv",
    ], "client import page");

    assertIncludes(read("src/app/globals.css"), [
      ".import-decision-note",
      ".import-decision-proof",
      ".import-next-action",
      ".import-model-panel",
      ".import-column-row",
      ".import-example-sheet",
    ], "client import decision styling");
  });

  it("keeps first-run business screens actionable instead of empty", () => {
    assertIncludes(read("src/components/layout/ActivationEmptyState.tsx"), [
      "activation-empty-state",
      "actionLabel",
      "proofPoints",
      "data-od-id=\"activation-empty-state\"",
    ], "activation empty state component");

    for (const route of [
      "src/app/(dashboard)/customers/page.tsx",
      "src/app/(dashboard)/contracts/page.tsx",
      "src/app/(dashboard)/relances/page.tsx",
      "src/app/(dashboard)/invoices/page.tsx",
      "src/app/(dashboard)/certificates/page.tsx",
      "src/app/(dashboard)/payments/page.tsx",
    ]) {
      assert.ok(read(route).includes("ActivationEmptyState"), `${route} should use actionable empty state`);
    }

    assertIncludes(read("src/app/(dashboard)/customers/page.tsx"), [
      "Importer mon fichier clients",
      "Ajouter un client",
    ], "customers empty state actions");

    assertIncludes(read("src/app/(dashboard)/contracts/page.tsx"), [
      "data-od-id=\"contracts-portfolio-architect\"",
      "Architecte IA portefeuille",
      "À sécuriser",
      "Prochaine action",
      "/contracts/quick",
      "Contrat guide",
      "Créer mon premier contrat",
      "Importer depuis Excel",
    ], "contracts empty state actions");

    assertIncludes(read("src/app/(dashboard)/contracts/quick/page.tsx"), [
      "Créer un contrat avec paiement",
      "Formulaire complet",
      "Importer Excel",
      "QuickContractForm",
      "Parcours terrain numéroté",
      "1 Client",
      "5 Validation",
    ], "quick contract page");

    assertIncludes(read("src/app/(dashboard)/contracts/quick/QuickContractForm.tsx"), [
      "/api/contracts/quick",
      "/api/contracts/${payload.id}/mandate/authorisation",
      "customerName",
      "contactFirstName",
      "customerAddress",
      "equipmentType",
      "priceTtc",
      "paymentMethod",
      "Créer + lien SEPA",
      "Prélèvement SEPA",
      "Option Excel",
      "/import",
      "5 Validation",
      "Créer facture",
    ], "quick contract form");

    assertIncludes(read("src/app/(dashboard)/contracts/[id]/page.tsx"), [
      "data-od-id=\"contract-next-action\"",
      "MandateSetupForm",
      "Créer facture",
      "/invoices/new?contractId=",
      "Préparer SEPA",
      "GoCardless",
      "Programmer paiement",
    ], "contract detail next actions");

    assertIncludes(read("src/app/(dashboard)/contracts/[id]/MandateSetupForm.tsx"), [
      "/api/contracts/${contractId}/mandate/authorisation",
      "/api/contracts/${contractId}/mandate",
      "Créer lien GoCardless",
      "gcCustomerId",
      "gcMandateId",
      "Actif GoCardless",
      "Enregistrer mandat",
    ], "contract mandate setup form");

    assertIncludes(read("src/app/api/contracts/[id]/mandate/authorisation/route.ts"), [
      "createGoCardlessMandateAuthorisationFlow",
      "sepa_mandates",
      "SUBMITTED",
      "authorisationUrl",
      "Ajoutez un email client",
    ], "contract mandate authorisation API");

    assertIncludes(read("src/server/sepa-provider.ts"), [
      "/billing_requests",
      "/billing_request_flows",
      "retrieveGoCardlessBillingRequest",
      "sepa_core",
      "authorisationUrl",
      "contratpro_contract_id",
    ], "gocardless mandate authorisation provider");

    assertIncludes(read("src/app/mandat-sepa/merci/page.tsx"), [
      "Mandat SEPA transmis",
      "Votre mandat SEPA est en cours de validation",
      "GoCardless valide les informations bancaires",
    ], "mandate thank-you page");

    assertIncludes(read("src/app/api/contracts/[id]/mandate/route.ts"), [
      "requireApiUser",
      "sepa_mandates",
      "gc_customer_id",
      "gc_mandate_id",
      "Renseignez l'identifiant mandat GoCardless",
    ], "contract mandate setup API");

    assertIncludes(read("src/app/(dashboard)/payments/new/PaymentForm.tsx"), [
      "Aucun mandat SEPA actif disponible",
      "Créer un mandat depuis un contrat",
      "/contracts",
    ], "payment empty mandate action");

    assertIncludes(read("src/app/api/contracts/quick/route.ts"), [
      "requireApiUser",
      "insertSupabaseRow",
      "\"customers\"",
      "\"installations\"",
      "\"contracts\"",
      "payment_method: paymentMethod",
      "customerAddress",
      "durationMonths",
      "Prelevement SEPA a faire signer",
    ], "quick contract API");

    assertIncludes(read("src/app/(dashboard)/invoices/new/page.tsx"), [
      "searchParams",
      "contractId",
      "initialContractId",
    ], "invoice contract preselection");

    assertIncludes(read("src/app/(dashboard)/relances/page.tsx"), [
      "Les relances apparaissent",
      "Importer contrats",
    ], "renewals empty state actions");

    assertIncludes(read("src/app/(dashboard)/payments/page.tsx"), [
      "data-od-id=\"payment-cash-command\"",
      "Commande cash-flow",
      "Action prioritaire",
      "Corriger le rejet",
      "Créer un paiement",
    ], "payments cash command");

    assertIncludes(read("src/app/(dashboard)/invoices/page.tsx"), [
      "data-od-id=\"invoice-billing-command\"",
      "Commande facturation",
      "Action prioritaire",
      "Relancer la facture",
      "Créer une facture",
    ], "invoices billing command");

    assertIncludes(read("src/app/globals.css"), [
      ".activation-empty-state",
      ".activation-empty-actions",
      ".quick-contract-shell",
      ".quick-contract-group",
      ".quick-contract-import-card",
      ".quick-payment-options",
      ".quick-contract-summary",
      ".quick-contract-success",
      ".contract-next-action",
      ".contract-next-action-card",
      ".contract-mandate-form",
      ".contract-portfolio-command",
      ".contract-portfolio-decision",
      ".payment-command-panel",
      ".payment-command-decision",
      ".invoice-command-panel",
      ".invoice-command-decision",
    ], "activation empty state styles");
  });
});
