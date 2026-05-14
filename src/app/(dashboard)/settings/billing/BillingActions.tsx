"use client";

import { useState } from "react";

import { billingPlans, type BillingPlanId } from "@/lib/billing-plans";

type BillingActionsProps = {
  hasCustomer: boolean;
  requestedPlan?: BillingPlanId;
};

async function openStripeFlow(endpoint: string, plan?: BillingPlanId) {
  const response = await fetch(endpoint, {
    body: plan ? JSON.stringify({ plan }) : undefined,
    headers: plan ? { "Content-Type": "application/json" } : undefined,
    method: "POST",
  });
  const payload = (await response.json()) as { error?: string; url?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error || "Stripe n'a pas retourne de lien.");
  }

  window.location.href = payload.url;
}

export function BillingActions({ hasCustomer, requestedPlan }: BillingActionsProps) {
  const [loading, setLoading] = useState<BillingPlanId | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runCheckout(plan: BillingPlanId) {
    setError(null);
    setLoading(plan);
    try {
      await openStripeFlow("/api/billing/checkout", plan);
    } catch (flowError) {
      setError(flowError instanceof Error ? flowError.message : "Action Stripe impossible.");
      setLoading(null);
    }
  }

  async function runPortal() {
    setError(null);
    setLoading("portal");
    try {
      await openStripeFlow("/api/billing/portal");
    } catch (flowError) {
      setError(flowError instanceof Error ? flowError.message : "Action Stripe impossible.");
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-3">
      {billingPlans.map((plan) => (
        <button
          className="premium-action rounded-md text-sm font-semibold"
          data-requested={requestedPlan === plan.id}
          disabled={loading !== null}
          key={plan.id}
          onClick={() => runCheckout(plan.id)}
          type="button"
        >
          {loading === plan.id
            ? "Ouverture..."
            : `${requestedPlan === plan.id ? "Activer le plan demande" : "Activer"} ${plan.name} - ${plan.priceLabel}/mois`}
        </button>
      ))}
      <button
        className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
        disabled={!hasCustomer || loading !== null}
        onClick={runPortal}
        type="button"
      >
        {loading === "portal" ? "Ouverture..." : "Gerer dans Stripe"}
      </button>
      {error ? <p className="billing-error">{error}</p> : null}
    </div>
  );
}
