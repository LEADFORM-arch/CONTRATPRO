import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(path) {
  return readFileSync(resolve(root, path), "utf8");
}

function assertIncludes(content, values, label) {
  for (const value of values) {
    assert.ok(content.includes(value), `${label} should include ${value}`);
  }
}

describe("financial webhook hardening", () => {
  it("keeps Stripe webhook signed, idempotent and organization-scoped", () => {
    assertIncludes(read("src/app/api/webhooks/stripe/route.ts"), [
      "verifyStripeSignature",
      "Stripe-Signature",
      "hasRecordedBillingEvent",
      "duplicate: true",
      "recordBillingEvent",
      "organization_id",
      "invoice.payment_failed",
      "invoice.payment_succeeded",
    ], "stripe webhook route");

    assertIncludes(read("scripts/stripe-billing-smoke-test.mjs"), [
      "checkout.session.completed",
      "customer.subscription.updated",
      "organization_id",
      "billing_subscriptions",
      "billing_events",
      "Stripe Billing OK",
    ], "stripe smoke test");
  });

  it("keeps GoCardless webhook signed and journaled through payment_events", () => {
    assertIncludes(read("src/app/api/webhooks/gocardless/route.ts"), [
      "verifyGoCardlessSignature",
      "Webhook-Signature",
      "handleBillingRequestEvent",
      "handleMandateEvent",
      "payment_events",
      "processed",
    ], "gocardless webhook route");

    assertIncludes(read("scripts/gocardless-sandbox-smoke-test.mjs"), [
      "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET",
      "/api/webhooks/gocardless",
      "payment_events",
      "webhook signe",
      "GoCardless sandbox OK",
    ], "gocardless smoke test");
  });
});
