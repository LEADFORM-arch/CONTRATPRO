import { NextRequest, NextResponse } from "next/server";

import {
  findBillingByStripeSubscription,
  hasRecordedBillingEvent,
  normalizeStripeDate,
  recordBillingEvent,
  upsertBillingSubscription,
} from "@/server/billing";
import { notifyAdmin } from "@/server/internal-notifications";
import { verifyStripeSignature, StripeWebhookSignatureError } from "@/server/stripe";

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bool(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function stripeId(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "id" in value) {
    return text((value as { id?: unknown }).id);
  }
  return null;
}

function metadataOrganizationId(object: Record<string, unknown>) {
  const metadata = object.metadata;
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  return text((metadata as Record<string, unknown>).organization_id);
}

function subscriptionPriceId(object: Record<string, unknown>) {
  const items = object.items;
  if (!items || typeof items !== "object") {
    return null;
  }

  const data = (items as { data?: unknown }).data;
  if (!Array.isArray(data)) {
    return null;
  }

  const first = data[0];
  if (!first || typeof first !== "object") {
    return null;
  }

  const price = (first as { price?: unknown }).price;
  return stripeId(price);
}

async function handleCheckoutCompleted(object: Record<string, unknown>) {
  const organizationId =
    metadataOrganizationId(object) || text(object.client_reference_id);
  const subscriptionId = stripeId(object.subscription);

  if (!organizationId || !subscriptionId) {
    return null;
  }

  await upsertBillingSubscription(organizationId, {
    status: "active",
    stripe_customer_id: stripeId(object.customer),
    stripe_subscription_id: subscriptionId,
  });

  return organizationId;
}

async function handleSubscriptionChanged(object: Record<string, unknown>) {
  const subscriptionId = stripeId(object.id);
  if (!subscriptionId) {
    return null;
  }

  const existing = await findBillingByStripeSubscription(subscriptionId).catch(() => null);
  const organizationId = metadataOrganizationId(object) || existing?.organization_id;
  if (!organizationId) {
    return null;
  }

  await upsertBillingSubscription(organizationId, {
    cancel_at_period_end: bool(object.cancel_at_period_end),
    current_period_end: normalizeStripeDate(object.current_period_end),
    status: text(object.status) || "incomplete",
    stripe_customer_id: stripeId(object.customer),
    stripe_price_id: subscriptionPriceId(object),
    stripe_subscription_id: subscriptionId,
    trial_end: normalizeStripeDate(object.trial_end),
  });

  const status = text(object.status) || "incomplete";
  if (["past_due", "unpaid", "canceled", "incomplete_expired"].includes(status)) {
    await notifyAdmin({
      actionUrl: "/settings/billing",
      message: `Abonnement Stripe ${subscriptionId} au statut ${status}.`,
      metadata: {
        status,
        stripeCustomerId: stripeId(object.customer),
        stripeSubscriptionId: subscriptionId,
      },
      organizationId,
      severity: status === "past_due" ? "warning" : "critical",
      title: "Abonnement SaaS a surveiller",
      type: "stripe_subscription_status",
    }).catch((notificationError) => {
      console.warn("[Stripe] notification failed", notificationError);
    });
  }

  return organizationId;
}

async function handleInvoicePaymentFailed(object: Record<string, unknown>) {
  const subscriptionId = stripeId(object.subscription);
  const existing = subscriptionId
    ? await findBillingByStripeSubscription(subscriptionId).catch(() => null)
    : null;
  const organizationId = existing?.organization_id ?? metadataOrganizationId(object);

  await notifyAdmin({
    actionUrl: "/settings/billing",
    message: `Stripe signale une facture impayee pour l'abonnement ${subscriptionId ?? "inconnu"}.`,
    metadata: {
      amountDue: object.amount_due,
      invoiceId: stripeId(object.id),
      stripeCustomerId: stripeId(object.customer),
      stripeSubscriptionId: subscriptionId,
    },
    organizationId,
    severity: "critical",
    title: "Facture Stripe impayee",
    type: "stripe_invoice_failed",
  }).catch((notificationError) => {
    console.warn("[Stripe] notification failed", notificationError);
  });

  return organizationId ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    verifyStripeSignature(rawBody, request.headers.get("Stripe-Signature"));

    const event = JSON.parse(rawBody) as StripeEvent;
    if (await hasRecordedBillingEvent(event.id).catch(() => false)) {
      return NextResponse.json({
        duplicate: true,
        ok: true,
        type: event.type,
      });
    }

    let organizationId: string | null = null;

    if (event.type === "checkout.session.completed") {
      organizationId = await handleCheckoutCompleted(event.data.object);
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      organizationId = await handleSubscriptionChanged(event.data.object);
    }

    if (event.type === "invoice.payment_failed") {
      organizationId = await handleInvoicePaymentFailed(event.data.object);
    }

    await recordBillingEvent({
      eventType: event.type,
      organizationId,
      providerEventId: event.id,
      raw: event,
      status: text(event.data.object.status),
    }).catch((error) => {
      console.warn("[Stripe] billing event log failed", error);
    });

    return NextResponse.json({ ok: true, organizationId, type: event.type });
  } catch (error) {
    if (error instanceof StripeWebhookSignatureError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Impossible de traiter le webhook Stripe." },
      { status: 500 },
    );
  }
}
