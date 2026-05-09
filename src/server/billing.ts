import { serviceInsert, serviceSelect, serviceUpdate } from "@/server/supabase-service";
import { getResolvedOrganizationId } from "@/server/supabase-write";

export const BILLING_ACTIVE_STATUSES = new Set(["active", "trialing"]);

export type BillingSubscriptionRow = {
  cancel_at_period_end: boolean | null;
  created_at: string;
  current_period_end: string | null;
  organization_id: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  stripe_subscription_id: string | null;
  trial_end: string | null;
  updated_at: string;
};

export type BillingStatus = {
  active: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  customerId: string | null;
  required: boolean;
  status: string;
  subscriptionId: string | null;
  trialEnd: string | null;
};

export function isBillingRequired() {
  return process.env.CONTRATPRO_REQUIRE_BILLING === "true";
}

export function normalizeStripeDate(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

export function billingStatusFromRow(row: BillingSubscriptionRow | null): BillingStatus {
  const status = row?.status ?? "missing";
  return {
    active: BILLING_ACTIVE_STATUSES.has(status),
    cancelAtPeriodEnd: Boolean(row?.cancel_at_period_end),
    currentPeriodEnd: row?.current_period_end ?? null,
    customerId: row?.stripe_customer_id ?? null,
    required: isBillingRequired(),
    status,
    subscriptionId: row?.stripe_subscription_id ?? null,
    trialEnd: row?.trial_end ?? null,
  };
}

export async function getBillingSubscription(organizationId: string) {
  const rows = await serviceSelect<BillingSubscriptionRow>(
    "billing_subscriptions",
    `organization_id=eq.${encodeURIComponent(
      organizationId,
    )}&select=organization_id,stripe_customer_id,stripe_subscription_id,stripe_price_id,status,current_period_end,cancel_at_period_end,trial_end,created_at,updated_at&limit=1`,
  );

  return rows[0] ?? null;
}

export async function getCurrentBillingStatus() {
  try {
    const organizationId = await getResolvedOrganizationId();
    const subscription = await getBillingSubscription(organizationId);
    return billingStatusFromRow(subscription);
  } catch {
    return billingStatusFromRow(null);
  }
}

export async function findBillingByStripeSubscription(subscriptionId: string) {
  const rows = await serviceSelect<BillingSubscriptionRow>(
    "billing_subscriptions",
    `stripe_subscription_id=eq.${encodeURIComponent(
      subscriptionId,
    )}&select=organization_id,stripe_customer_id,stripe_subscription_id,stripe_price_id,status,current_period_end,cancel_at_period_end,trial_end,created_at,updated_at&limit=1`,
  );

  return rows[0] ?? null;
}

export async function upsertBillingSubscription(
  organizationId: string,
  payload: Partial<BillingSubscriptionRow>,
) {
  const existing = await getBillingSubscription(organizationId).catch(() => null);
  const body = {
    cancel_at_period_end: payload.cancel_at_period_end ?? false,
    current_period_end: payload.current_period_end ?? null,
    organization_id: organizationId,
    status: payload.status ?? "incomplete",
    stripe_customer_id: payload.stripe_customer_id ?? null,
    stripe_price_id: payload.stripe_price_id ?? null,
    stripe_subscription_id: payload.stripe_subscription_id ?? null,
    trial_end: payload.trial_end ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const rows = await serviceUpdate<BillingSubscriptionRow>(
      "billing_subscriptions",
      `organization_id=eq.${encodeURIComponent(organizationId)}`,
      body,
    );
    return rows[0] ?? existing;
  }

  return serviceInsert<BillingSubscriptionRow>("billing_subscriptions", body);
}

export async function recordBillingEvent(payload: {
  eventType: string;
  organizationId?: string | null;
  providerEventId?: string | null;
  raw: unknown;
  status?: string | null;
}) {
  return serviceInsert("billing_events", {
    event_type: payload.eventType,
    organization_id: payload.organizationId ?? null,
    payload: payload.raw,
    provider: "stripe",
    provider_event_id: payload.providerEventId ?? null,
    status: payload.status ?? null,
  });
}
