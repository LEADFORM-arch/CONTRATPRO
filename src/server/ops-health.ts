import { getAdminEmails } from "@/server/admin";
import { serviceSelect } from "@/server/supabase-service";
import { isAuthEnforced, isRlsExpected } from "@/server/tenant";

export type OpsStatus = "ready" | "warning" | "critical";

export type OpsCheck = {
  label: string;
  detail: string;
  status: OpsStatus;
};

export type OpsMetric = {
  label: string;
  value: string;
  detail: string;
  status: OpsStatus;
};

export type OpsRecentItem = {
  label: string;
  detail: string;
  status: OpsStatus;
  timestamp: string | null;
};

type SafeRows<T> = {
  error?: string;
  rows: T[];
  status: OpsStatus;
};

type TimestampRow = {
  created_at?: string | null;
  sent_at?: string | null;
  status?: string | null;
  updated_at?: string | null;
};

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

function hasAnyEnv(names: string[]) {
  return names.some((name) => hasEnv(name));
}

function envCheck(label: string, name: string, detail: string, critical = false): OpsCheck {
  const ready = hasEnv(name);
  return {
    detail: ready ? detail : `${name} absent ou vide`,
    label,
    status: ready ? "ready" : critical ? "critical" : "warning",
  };
}

function envAnyCheck(label: string, names: string[], detail: string, critical = false): OpsCheck {
  const ready = hasAnyEnv(names);
  return {
    detail: ready ? detail : `${names.join(" ou ")} absent`,
    label,
    status: ready ? "ready" : critical ? "critical" : "warning",
  };
}

function booleanCheck(label: string, ready: boolean, detail: string): OpsCheck {
  return {
    detail: ready ? detail : "A activer avant une mise en production client.",
    label,
    status: ready ? "ready" : "critical",
  };
}

function scoreStatus(score: number): OpsStatus {
  if (score >= 85) {
    return "ready";
  }
  if (score >= 65) {
    return "warning";
  }
  return "critical";
}

async function safeSelect<T>(table: string, query: string): Promise<SafeRows<T>> {
  try {
    const rows = await serviceSelect<T>(table, query);
    return { rows, status: "ready" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { error: message, rows: [], status: "warning" };
  }
}

function latestDate(rows: TimestampRow[]) {
  const timestamps = rows
    .flatMap((row) => [row.created_at, row.sent_at, row.updated_at])
    .filter(Boolean)
    .map((value) => new Date(value as string).getTime())
    .filter((value) => Number.isFinite(value));

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function dataMetric(label: string, rows: SafeRows<TimestampRow>, emptyDetail: string): OpsMetric {
  if (rows.error) {
    return {
      detail: "Table absente, RLS non verifiee ou service role indisponible.",
      label,
      status: "warning",
      value: "A verifier",
    };
  }

  return {
    detail: rows.rows.length ? `Dernier signal: ${latestDate(rows.rows) ?? "date non renseignee"}` : emptyDetail,
    label,
    status: rows.rows.length ? "ready" : "warning",
    value: String(rows.rows.length),
  };
}

function recentItem(label: string, rows: SafeRows<TimestampRow>, emptyDetail: string): OpsRecentItem {
  if (rows.error) {
    return {
      detail: "Lecture impossible. Controle le script SQL et la service role.",
      label,
      status: "warning",
      timestamp: null,
    };
  }

  const first = rows.rows[0];
  return {
    detail: first?.status ? `Statut: ${first.status}` : emptyDetail,
    label,
    status: first ? "ready" : "warning",
    timestamp: first?.created_at ?? first?.sent_at ?? first?.updated_at ?? null,
  };
}

export async function getOpsHealth() {
  const adminEmails = [...getAdminEmails()];
  const checks: OpsCheck[] = [
    booleanCheck("Authentification", isAuthEnforced(), "CONTRATPRO_REQUIRE_AUTH=true"),
    booleanCheck("Isolation RLS", isRlsExpected(), "CONTRATPRO_RLS_ENABLED=true"),
    {
      detail: adminEmails.length ? `${adminEmails.length} email admin configure` : "Aucun admin configure",
      label: "Acces fondateur",
      status: adminEmails.length ? "ready" : "critical",
    },
    envAnyCheck("Supabase public", ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"], "URL publique disponible", true),
    envAnyCheck("Supabase anon", ["SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"], "Cle anon disponible", true),
    envCheck("Supabase service role", "SUPABASE_SERVICE_ROLE_KEY", "Service role serveur disponible", true),
    envCheck("Email provider", "RESEND_API_KEY", "Resend pret pour les factures, attestations et relances"),
    envCheck("Expediteur email", "RESEND_FROM_EMAIL", "Adresse expediteur configuree"),
    envCheck("GoCardless", "GOCARDLESS_ACCESS_TOKEN", "Provider SEPA pret a soumettre les paiements"),
    envCheck("Webhook GoCardless", "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET", "Signature webhook configurable"),
    envCheck("Cron relances", "CONTRATPRO_CRON_SECRET", "Endpoint cron protege par bearer secret"),
    envCheck("Stripe Billing", "STRIPE_SECRET_KEY", "Checkout et portail client disponibles"),
    envCheck("Webhook Stripe", "STRIPE_WEBHOOK_SECRET", "Synchronisation abonnement signee"),
  ];

  const [
    organizations,
    documentSends,
    paymentEvents,
    renewalActions,
    billingSubscriptions,
    billingEvents,
    internalNotifications,
  ] = await Promise.all([
    safeSelect<TimestampRow>("organizations", "select=id,created_at&order=created_at.desc&limit=10"),
    safeSelect<TimestampRow>("document_sends", "select=id,status,created_at,sent_at&order=created_at.desc&limit=10"),
    safeSelect<TimestampRow>("payment_events", "select=id,status,created_at&order=created_at.desc&limit=10"),
    safeSelect<TimestampRow>("renewal_actions", "select=id,status,created_at&order=created_at.desc&limit=10"),
    safeSelect<TimestampRow>("billing_subscriptions", "select=organization_id,status,created_at,updated_at&order=updated_at.desc&limit=10"),
    safeSelect<TimestampRow>("billing_events", "select=id,status,created_at&order=created_at.desc&limit=10"),
    safeSelect<TimestampRow>("internal_notifications", "select=id,status,created_at&order=created_at.desc&limit=10"),
  ]);

  const metrics: OpsMetric[] = [
    dataMetric("Organisations", organizations, "Aucune organisation trouvee"),
    dataMetric("Documents envoyes", documentSends, "Aucun envoi PDF journalise"),
    dataMetric("Evenements SEPA", paymentEvents, "Aucun signal provider recu"),
    dataMetric("Relances cron", renewalActions, "Aucune relance automatisee journalisee"),
    dataMetric("Abonnements SaaS", billingSubscriptions, "Aucun abonnement Stripe synchronise"),
    dataMetric("Notifications", internalNotifications, "Aucune alerte interne journalisee"),
  ];

  const readyWeight = checks.reduce((total, item) => {
    if (item.status === "ready") {
      return total + 1;
    }
    if (item.status === "warning") {
      return total + 0.5;
    }
    return total;
  }, 0);
  const score = Math.round((readyWeight / checks.length) * 100);

  return {
    checks,
    generatedAt: new Date().toISOString(),
    metrics,
    recent: [
      recentItem("Dernier document", documentSends, "Aucun document envoye"),
      recentItem("Dernier paiement", paymentEvents, "Aucun evenement paiement"),
      recentItem("Derniere relance", renewalActions, "Aucune relance cron"),
      recentItem("Dernier billing", billingEvents, "Aucun webhook Stripe"),
      recentItem("Derniere alerte", internalNotifications, "Aucune notification interne"),
    ],
    score,
    status: scoreStatus(score),
  };
}
