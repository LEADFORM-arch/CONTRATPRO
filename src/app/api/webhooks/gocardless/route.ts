import { NextRequest, NextResponse } from "next/server";

import {
  billingRequestMandateStatusFromAction,
  eventMessage,
  mandateStatusFromGoCardlessAction,
  normalizeGoCardlessEvents,
  paymentStatusFromGoCardlessAction,
  verifyGoCardlessSignature,
  WebhookSignatureError,
} from "@/server/gocardless-webhooks";
import { notifyAdmin } from "@/server/internal-notifications";
import {
  retrieveGoCardlessBillingRequest,
  SepaProviderError,
} from "@/server/sepa-provider";
import {
  serviceInsert,
  serviceSelect,
  serviceUpdate,
  SupabaseServiceError,
} from "@/server/supabase-service";

type PaymentRow = {
  id: string;
  organization_id: string;
  status: string;
};

type MandateCustomer = {
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  organization_id: string | null;
};

type MandateContract = {
  installations?: Array<{
    customers?: Array<MandateCustomer>;
  }>;
};

type MandateRow = {
  contract_id: string;
  gc_mandate_id: string | null;
  id: string;
  status: string;
  contracts?: MandateContract | MandateContract[];
};

function mandateContract(mandate: MandateRow) {
  return first(mandate.contracts);
}

function mandateCustomer(mandate: MandateRow) {
  const contract = mandateContract(mandate);
  const installation = first(contract?.installations);
  return first(installation?.customers);
}

async function recordEvent({
  event,
  message,
  organizationId,
  paymentId,
  status,
}: {
  event: ReturnType<typeof normalizeGoCardlessEvents>[number];
  message: string;
  organizationId: string;
  paymentId: string;
  status: string;
}) {
  await serviceInsert("payment_events", {
    event_type: `webhook_${event.action ?? "unknown"}`,
    message,
    organization_id: organizationId,
    payment_id: paymentId,
    provider: "gocardless",
    provider_event_id: event.id ?? null,
    payload: event,
    status,
  });
}

function first<T>(value: T[] | T | null | undefined) {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function customerLabel(mandate: MandateRow) {
  const customer = mandateCustomer(mandate);
  return (
    customer?.company_name ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    "client"
  );
}

function mandateOrganizationId(mandate: MandateRow) {
  return mandateCustomer(mandate)?.organization_id ?? null;
}

async function findMandateByProviderId(providerMandateId: string) {
  const rows = await serviceSelect<MandateRow>(
    "sepa_mandates",
    `gc_mandate_id=eq.${encodeURIComponent(
      providerMandateId,
    )}&select=id,contract_id,gc_mandate_id,status,contracts(installations(customers(first_name,last_name,company_name,organization_id)))&limit=1`,
  );
  return rows[0] ?? null;
}

async function findMandateByContractId(contractId: string) {
  const rows = await serviceSelect<MandateRow>(
    "sepa_mandates",
    `contract_id=eq.${encodeURIComponent(
      contractId,
    )}&select=id,contract_id,gc_mandate_id,status,contracts(installations(customers(first_name,last_name,company_name,organization_id)))&limit=1`,
  );
  return rows[0] ?? null;
}

async function handleBillingRequestEvent(
  event: ReturnType<typeof normalizeGoCardlessEvents>[number],
) {
  const status = billingRequestMandateStatusFromAction(event.action);
  if (!status) {
    return false;
  }

  const billingRequestId = event.links?.billing_request;
  const billingRequest = billingRequestId
    ? await retrieveGoCardlessBillingRequest(billingRequestId)
    : null;
  const contractId =
    event.metadata?.contratpro_contract_id ||
    billingRequest?.metadata?.contratpro_contract_id;

  if (!contractId) {
    return false;
  }

  const mandate = await findMandateByContractId(contractId);
  if (!mandate) {
    return false;
  }

  const providerMandateId =
    event.links?.mandate_request_mandate ||
    billingRequest?.links?.mandate_request_mandate ||
    mandate.gc_mandate_id;
  const customerProviderId =
    event.links?.customer || billingRequest?.links?.customer || null;
  const payload: Record<string, unknown> = {
    status,
  };

  if (providerMandateId) {
    payload.gc_mandate_id = providerMandateId;
  }
  if (customerProviderId) {
    payload.gc_customer_id = customerProviderId;
  }
  if (status === "ACTIVE") {
    payload.signed_at = new Date().toISOString();
  }

  await serviceUpdate("sepa_mandates", `id=eq.${encodeURIComponent(mandate.id)}`, payload);

  if (status === "FAILED" || status === "CANCELLED") {
    await notifyAdmin({
      actionUrl: `/contracts/${mandate.contract_id}`,
      message:
        eventMessage(event) ||
        `Le parcours mandat GoCardless est ${status} pour ${customerLabel(mandate)}.`,
      metadata: {
        action: event.action,
        billingRequestId,
        contractId: mandate.contract_id,
        providerEventId: event.id,
      },
      organizationId: mandateOrganizationId(mandate),
      severity: "warning",
      title: "Mandat GoCardless a reprendre",
      type: "gocardless_mandate_attention",
    }).catch((notificationError) => {
      console.warn("[GoCardless] mandate notification failed", notificationError);
    });
  }

  return true;
}

async function handleMandateEvent(
  event: ReturnType<typeof normalizeGoCardlessEvents>[number],
) {
  const providerMandateId = event.links?.mandate;
  const status = mandateStatusFromGoCardlessAction(event.action);
  if (!providerMandateId || !status) {
    return false;
  }

  const mandate = await findMandateByProviderId(providerMandateId);
  if (!mandate) {
    return false;
  }

  const payload: Record<string, unknown> = {
    status,
  };
  if (event.action === "replaced" && event.links?.new_mandate) {
    payload.gc_mandate_id = event.links.new_mandate;
  }
  if (status === "ACTIVE") {
    payload.signed_at = new Date().toISOString();
  }

  await serviceUpdate("sepa_mandates", `id=eq.${encodeURIComponent(mandate.id)}`, payload);

  if (status === "FAILED" || status === "CANCELLED" || status === "EXPIRED") {
    await notifyAdmin({
      actionUrl: `/contracts/${mandate.contract_id}`,
      message:
        eventMessage(event) ||
        `GoCardless a signale le statut ${status} pour le mandat de ${customerLabel(
          mandate,
        )}.`,
      metadata: {
        action: event.action,
        contractId: mandate.contract_id,
        mandateId: mandate.id,
        providerEventId: event.id,
        providerMandateId,
      },
      organizationId: mandateOrganizationId(mandate),
      severity: status === "FAILED" ? "critical" : "warning",
      title: "Incident mandat GoCardless",
      type: "gocardless_mandate_failed",
    }).catch((notificationError) => {
      console.warn("[GoCardless] mandate notification failed", notificationError);
    });
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    verifyGoCardlessSignature(rawBody, request.headers.get("Webhook-Signature"));

    const payload = JSON.parse(rawBody) as unknown;
    const events = normalizeGoCardlessEvents(payload);
    let processed = 0;
    let ignored = 0;

    for (const event of events) {
      if (event.resource_type === "billing_requests") {
        if (await handleBillingRequestEvent(event)) {
          processed += 1;
        } else {
          ignored += 1;
        }
        continue;
      }

      if (event.resource_type === "mandates") {
        if (await handleMandateEvent(event)) {
          processed += 1;
        } else {
          ignored += 1;
        }
        continue;
      }

      if (event.resource_type !== "payments" || !event.links?.payment) {
        ignored += 1;
        continue;
      }

      const status = paymentStatusFromGoCardlessAction(event.action);
      if (!status) {
        ignored += 1;
        continue;
      }

      const rows = await serviceSelect<PaymentRow>(
        "sepa_payments",
        `gc_payment_id=eq.${encodeURIComponent(
          event.links.payment,
        )}&select=id,organization_id,status&limit=1`,
      );
      const payment = rows[0];

      if (!payment) {
        ignored += 1;
        continue;
      }

      await serviceUpdate("sepa_payments", `id=eq.${encodeURIComponent(payment.id)}`, {
        failure_reason: status === "FAILED" ? eventMessage(event) : null,
        status,
      });

      await recordEvent({
        event,
        message: eventMessage(event) || `Webhook GoCardless ${event.action}.`,
        organizationId: payment.organization_id,
        paymentId: payment.id,
        status,
      });

      if (status === "FAILED" || status === "CHARGED_BACK") {
        await notifyAdmin({
          actionUrl: "/payments",
          message:
            eventMessage(event) ||
            `GoCardless a signale le statut ${status} pour le paiement ${payment.id}.`,
          metadata: {
            action: event.action,
            paymentId: payment.id,
            providerEventId: event.id,
          },
          organizationId: payment.organization_id,
          severity: "critical",
          title: "Incident paiement GoCardless",
          type: "gocardless_payment_failed",
        }).catch((notificationError) => {
          console.warn("[GoCardless] notification failed", notificationError);
        });
      }
      processed += 1;
    }

    return NextResponse.json({ ignored, processed, received: events.length });
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof SepaProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SupabaseServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de traiter le webhook GoCardless." },
      { status: 500 },
    );
  }
}
