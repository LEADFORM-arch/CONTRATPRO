import { isAuthEnforced, isRlsExpected } from "@/server/tenant";

export type LaunchStatus = "ready" | "warning" | "critical";

export type LaunchItem = {
  action: string;
  detail: string;
  label: string;
  owner: string;
  status: LaunchStatus;
};

export type LaunchSection = {
  items: LaunchItem[];
  label: string;
};

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value || ["[]", "{}", "\"\"", "''"].includes(value)) {
    return "";
  }
  return value.replace(/^["']|["']$/g, "");
}

function has(name: string) {
  return Boolean(env(name));
}

function item({
  action,
  detail,
  label,
  owner,
  ready,
  statusWhenMissing = "critical",
}: {
  action: string;
  detail: string;
  label: string;
  owner: string;
  ready: boolean;
  statusWhenMissing?: LaunchStatus;
}): LaunchItem {
  return {
    action,
    detail,
    label,
    owner,
    status: ready ? "ready" : statusWhenMissing,
  };
}

function statusScore(status: LaunchStatus) {
  if (status === "ready") {
    return 1;
  }
  if (status === "warning") {
    return 0.5;
  }
  return 0;
}

export function getLaunchReadiness() {
  const appUrl = env("NEXT_PUBLIC_APP_URL") || env("CONTRATPRO_APP_URL");
  const isVercel = env("VERCEL") === "1" || env("VERCEL_ENV") === "production";
  const gitRepo = [env("VERCEL_GIT_REPO_OWNER"), env("VERCEL_GIT_REPO_SLUG")]
    .filter(Boolean)
    .join("/");
  const billingRequired = env("CONTRATPRO_REQUIRE_BILLING") === "true";
  const goCardlessLive = env("GOCARDLESS_ENVIRONMENT") === "live";

  const sections: LaunchSection[] = [
    {
      items: [
        item({
          action: "Conserver les deployments GitHub -> Vercel sur main.",
          detail: isVercel ? "Runtime Vercel detecte." : "Controle effectue hors Vercel.",
          label: "Runtime Vercel",
          owner: "Fondateur",
          ready: isVercel,
          statusWhenMissing: "warning",
        }),
        item({
          action: "Verifier l'alias Vercel ou connecter le domaine final.",
          detail: appUrl || "URL applicative absente.",
          label: "URL publique",
          owner: "Fondateur",
          ready: Boolean(appUrl),
        }),
        item({
          action: "Garder admincairn/CONTRATPRO connecte a Vercel.",
          detail: gitRepo || "Repo Git non detecte dans l'environnement courant.",
          label: "GitHub connecte",
          owner: "Fondateur",
          ready: gitRepo === "admincairn/CONTRATPRO",
          statusWhenMissing: "warning",
        }),
      ],
      label: "Socle production",
    },
    {
      items: [
        item({
          action: "Laisser CONTRATPRO_REQUIRE_AUTH=true.",
          detail: "Les pages dashboard exigent une session.",
          label: "Authentification",
          owner: "Produit",
          ready: isAuthEnforced(),
        }),
        item({
          action: "Executer supabase/verify_rls.sql apres chaque migration.",
          detail: "Isolation organisation attendue.",
          label: "RLS Supabase",
          owner: "Produit",
          ready: isRlsExpected(),
        }),
        item({
          action: "Maintenir CONTRATPRO_ADMIN_EMAILS avec l'email fondateur.",
          detail: env("CONTRATPRO_ADMIN_EMAILS") || "Aucun admin configure.",
          label: "Acces fondateur",
          owner: "Fondateur",
          ready: has("CONTRATPRO_ADMIN_EMAILS"),
        }),
      ],
      label: "Securite SaaS",
    },
    {
      items: [
        item({
          action: "Ajouter STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET et STRIPE_PRICE_ID.",
          detail: has("STRIPE_SECRET_KEY") ? "Stripe configure." : "Stripe absent: abonnement non encaissable.",
          label: "Stripe Billing",
          owner: "Revenus",
          ready: has("STRIPE_SECRET_KEY") && has("STRIPE_WEBHOOK_SECRET"),
        }),
        item({
          action: "Passer CONTRATPRO_REQUIRE_BILLING=true apres validation Stripe.",
          detail: billingRequired ? "Billing obligatoire actif." : "Billing obligatoire desactive pour le lancement controle.",
          label: "Paywall SaaS",
          owner: "Revenus",
          ready: billingRequired,
          statusWhenMissing: "warning",
        }),
      ],
      label: "Monetisation",
    },
    {
      items: [
        item({
          action: "Ajouter le token GoCardless live avant d'ouvrir les prelevements.",
          detail: goCardlessLive ? "Mode live." : `Mode ${env("GOCARDLESS_ENVIRONMENT") || "non configure"}.`,
          label: "SEPA GoCardless",
          owner: "Finance",
          ready: has("GOCARDLESS_ACCESS_TOKEN") && goCardlessLive,
          statusWhenMissing: "warning",
        }),
        item({
          action: "Configurer RESEND_FROM_EMAIL sur un domaine verifie.",
          detail: has("RESEND_API_KEY") ? "API Resend presente." : "Resend absent.",
          label: "Emails documents",
          owner: "Support",
          ready: has("RESEND_API_KEY"),
        }),
        item({
          action: "Verifier le cron quotidien dans Vercel.",
          detail: has("CRON_SECRET") ? "Cron protege." : "Secret cron absent.",
          label: "Relances automatiques",
          owner: "Ops",
          ready: has("CRON_SECRET") || has("CONTRATPRO_CRON_SECRET"),
        }),
      ],
      label: "Operations CVC",
    },
  ];

  const items = sections.flatMap((section) => section.items);
  const score = Math.round(
    (items.reduce((total, current) => total + statusScore(current.status), 0) /
      items.length) *
      100,
  );
  const blockers = items.filter((current) => current.status === "critical");
  const status: LaunchStatus = blockers.length ? "critical" : score >= 90 ? "ready" : "warning";

  return {
    appUrl,
    blockers,
    generatedAt: new Date().toISOString(),
    score,
    sections,
    status,
  };
}
