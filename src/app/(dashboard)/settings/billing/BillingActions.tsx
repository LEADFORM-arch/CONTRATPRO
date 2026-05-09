"use client";

import { useState } from "react";

type BillingActionsProps = {
  hasCustomer: boolean;
};

async function openStripeFlow(endpoint: string) {
  const response = await fetch(endpoint, { method: "POST" });
  const payload = (await response.json()) as { error?: string; url?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error || "Stripe n'a pas retourne de lien.");
  }

  window.location.href = payload.url;
}

export function BillingActions({ hasCustomer }: BillingActionsProps) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(type: "checkout" | "portal") {
    setError(null);
    setLoading(type);
    try {
      await openStripeFlow(type === "checkout" ? "/api/billing/checkout" : "/api/billing/portal");
    } catch (flowError) {
      setError(flowError instanceof Error ? flowError.message : "Action Stripe impossible.");
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        className="premium-action rounded-md text-sm font-semibold"
        disabled={loading !== null}
        onClick={() => run("checkout")}
        type="button"
      >
        {loading === "checkout" ? "Ouverture..." : "Activer l'abonnement"}
      </button>
      <button
        className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
        disabled={!hasCustomer || loading !== null}
        onClick={() => run("portal")}
        type="button"
      >
        {loading === "portal" ? "Ouverture..." : "Gerer dans Stripe"}
      </button>
      {error ? <p className="billing-error">{error}</p> : null}
    </div>
  );
}
