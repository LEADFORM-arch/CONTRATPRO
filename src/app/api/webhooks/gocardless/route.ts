import { NextRequest, NextResponse } from "next/server";

import {
  eventMessage,
  normalizeGoCardlessEvents,
  paymentStatusFromGoCardlessAction,
  verifyGoCardlessSignature,
  WebhookSignatureError,
} from "@/server/gocardless-webhooks";
import { notifyAdmin } from "@/server/internal-notifications";
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

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    verifyGoCardlessSignature(rawBody, request.headers.get("Webhook-Signature"));

    const payload = JSON.parse(rawBody) as unknown;
    const events = normalizeGoCardlessEvents(payload);
    let processed = 0;
    let ignored = 0;

    for (const event of events) {
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
    if (error instanceof SupabaseServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de traiter le webhook GoCardless." },
      { status: 500 },
    );
  }
}
