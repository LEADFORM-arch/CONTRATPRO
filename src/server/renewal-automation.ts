import { sendPlainEmail } from "@/server/resend";
import {
  serviceInsert,
  serviceSelect,
  SupabaseServiceError,
} from "@/server/supabase-service";

type MaybeArray<T> = T | T[] | null | undefined;

type ContractRow = {
  id: string;
  end_date: string;
  payment_method: string;
  price_ttc: number | string;
  installations?: MaybeArray<{
    brand: string | null;
    model: string | null;
    customers?: MaybeArray<{
      company_name: string | null;
      email: string | null;
      first_name: string | null;
      last_name: string | null;
    }>;
  }>;
};

type OrganizationRow = {
  email: string | null;
  id: string;
  name: string;
};

type RenewalActionRow = {
  id: string;
};

type AutomationResult = {
  contractId: string;
  customer: string;
  daysRemaining: number;
  reason?: string;
  status: "sent" | "skipped" | "failed";
};

function first<T>(value: MaybeArray<T>): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function customerName(customer?: {
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  if (!customer) {
    return "Client sans nom";
  }
  return (
    customer.company_name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Client sans nom"
  );
}

function equipmentLabel(installation?: { brand: string | null; model: string | null }) {
  return [installation?.brand, installation?.model].filter(Boolean).join(" ") ||
    "votre equipement CVC";
}

function daysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function isEmail(value: string | null | undefined) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

function channelFor(daysRemaining: number, paymentMethod: string) {
  if (daysRemaining <= 15) {
    return "Email urgent";
  }
  if (paymentMethod === "SEPA") {
    return "Email + rappel SEPA";
  }
  return "Email";
}

function messageFor(contract: ContractRow, organization: OrganizationRow) {
  const installation = first(contract.installations);
  const equipment = equipmentLabel(installation);
  return `Bonjour, votre contrat d'entretien ${equipment} arrive a echeance le ${formatDate(
    contract.end_date,
  )}. Je vous propose de le renouveler afin de conserver le suivi annuel, la priorite d'intervention et l'attestation d'entretien reglementaire.`;
}

function htmlMessage(message: string, organization: OrganizationRow) {
  return `<p>${message}</p><p>Cordialement,<br/>${organization.name}</p>`;
}

async function alreadySent(contractId: string, sinceIso: string) {
  const rows = await serviceSelect<RenewalActionRow>(
    "renewal_actions",
    `contract_id=eq.${encodeURIComponent(
      contractId,
    )}&status=eq.SENT&created_at=gte.${encodeURIComponent(
      sinceIso,
    )}&select=id&limit=1`,
  ).catch((error) => {
    if (error instanceof SupabaseServiceError && error.status === 404) {
      return [];
    }
    throw error;
  });
  return rows.length > 0;
}

async function logAction(payload: {
  channel: string;
  contractId: string;
  message: string;
  outcome: string;
  status: "SENT" | "TODO";
}) {
  return serviceInsert<{ id: string }>("renewal_actions", {
    channel: payload.channel,
    completed_at: payload.status === "SENT" ? new Date().toISOString() : null,
    contract_id: payload.contractId,
    due_at: new Date().toISOString(),
    message: payload.message,
    outcome: payload.outcome,
    status: payload.status,
  });
}

export async function runRenewalAutomation({
  dryRun,
  organizationId,
}: {
  dryRun: boolean;
  organizationId: string;
}) {
  const organizations = await serviceSelect<OrganizationRow>(
    "organizations",
    `id=eq.${encodeURIComponent(organizationId)}&select=id,name,email&limit=1`,
  );
  const organization = organizations[0];
  if (!organization) {
    throw new SupabaseServiceError("Organisation introuvable.", 404);
  }

  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 45);
  const rows = await serviceSelect<ContractRow>(
    "contracts",
    `status=neq.CANCELLED&end_date=lte.${encodeURIComponent(
      horizon.toISOString(),
    )}&select=id,end_date,payment_method,price_ttc,installations(brand,model,customers(company_name,first_name,last_name,email))&order=end_date.asc`,
  );
  const since = new Date();
  since.setDate(since.getDate() - 21);

  const results: AutomationResult[] = [];

  for (const contract of rows) {
    const installation = first(contract.installations);
    const customer = first(installation?.customers);
    const name = customerName(customer);
    const daysRemaining = daysUntil(contract.end_date);

    if (daysRemaining < 0 || daysRemaining > 45) {
      results.push({
        contractId: contract.id,
        customer: name,
        daysRemaining,
        reason: "Hors fenetre de relance.",
        status: "skipped",
      });
      continue;
    }

    if (!isEmail(customer?.email)) {
      results.push({
        contractId: contract.id,
        customer: name,
        daysRemaining,
        reason: "Email client absent.",
        status: "skipped",
      });
      continue;
    }

    if (await alreadySent(contract.id, since.toISOString())) {
      results.push({
        contractId: contract.id,
        customer: name,
        daysRemaining,
        reason: "Relance deja envoyee recemment.",
        status: "skipped",
      });
      continue;
    }

    const channel = channelFor(daysRemaining, contract.payment_method);
    const message = messageFor(contract, organization);

    if (dryRun) {
      results.push({
        contractId: contract.id,
        customer: name,
        daysRemaining,
        reason: "Dry run.",
        status: "skipped",
      });
      continue;
    }

    try {
      const email = await sendPlainEmail({
        html: htmlMessage(message, organization),
        subject: `Renouvellement de votre contrat d'entretien - ${organization.name}`,
        text: `${message}\n\nCordialement,\n${organization.name}`,
        to: customer?.email ?? "",
      });
      await logAction({
        channel,
        contractId: contract.id,
        message,
        outcome: `Relance automatique envoyee a ${customer?.email} via Resend (${email.id || "sans id provider"}).`,
        status: "SENT",
      });
      results.push({
        contractId: contract.id,
        customer: name,
        daysRemaining,
        status: "sent",
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Erreur inconnue";
      await logAction({
        channel,
        contractId: contract.id,
        message,
        outcome: `Echec relance automatique: ${reason}`,
        status: "TODO",
      }).catch((logError) => {
        console.warn("[Renewal automation] failed log failed", logError);
      });
      results.push({
        contractId: contract.id,
        customer: name,
        daysRemaining,
        reason,
        status: "failed",
      });
    }
  }

  return {
    dryRun,
    failed: results.filter((item) => item.status === "failed").length,
    processed: results.length,
    results,
    sent: results.filter((item) => item.status === "sent").length,
    skipped: results.filter((item) => item.status === "skipped").length,
  };
}
