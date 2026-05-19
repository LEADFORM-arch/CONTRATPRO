import { createHmac } from "node:crypto";

import {
  getDeploymentProtectionHeaders,
  getSessionCookie,
  getSmokeConfig,
  loadLocalEnv,
  read,
} from "./smoke-test-helpers.mjs";

loadLocalEnv();

const { baseUrl, email, password } = getSmokeConfig("smoke:stripe");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const priceId =
  process.env.STRIPE_PRICE_ID_PRO ||
  process.env.STRIPE_PRICE_ID ||
  process.env.STRIPE_PRICE_ID_STARTER ||
  "price_smoke_contratpro";
const stamp = Date.now();

const commonHeaders = {
  ...getDeploymentProtectionHeaders(),
  "content-type": "application/json",
  "user-agent": "ContratPro Stripe billing smoke test",
};

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

function logStep(label, detail) {
  console.log(`OK ${label}${detail ? ` - ${detail}` : ""}`);
}

async function loginAndGetCookie() {
  let response;
  try {
    response = await fetch(`${baseUrl}/api/auth/login`, {
      body: JSON.stringify({ email, password }),
      headers: commonHeaders,
      method: "POST",
      redirect: "manual",
    });
  } catch (error) {
    fail(
      `/api/auth/login impossible de joindre ${baseUrl}: ${
        error instanceof Error ? error.message : "erreur reseau inconnue"
      }`,
    );
  }

  if (!response.ok) {
    fail(`/api/auth/login ${response.status} - ${(await read(response)).slice(0, 180)}`);
  }

  return getSessionCookie(response);
}

async function getOrganizationId(cookie) {
  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      ...getDeploymentProtectionHeaders(),
      cookie,
      "user-agent": "ContratPro Stripe billing smoke test",
    },
    redirect: "manual",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.organizationId) {
    fail(`/api/auth/me ${response.status} - ${JSON.stringify(payload).slice(0, 180)}`);
  }

  return payload.organizationId;
}

function stripeSignature(rawBody) {
  if (!webhookSecret) {
    fail("STRIPE_WEBHOOK_SECRET absent.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

async function postStripeWebhook(event) {
  const rawBody = JSON.stringify(event);
  const response = await fetch(`${baseUrl}/api/webhooks/stripe`, {
    body: rawBody,
    headers: {
      ...getDeploymentProtectionHeaders(),
      "content-type": "application/json",
      "Stripe-Signature": stripeSignature(rawBody),
      "User-Agent": "ContratPro Stripe billing smoke test",
    },
    method: "POST",
    redirect: "manual",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    fail(`/api/webhooks/stripe ${response.status} - ${JSON.stringify(payload).slice(0, 260)}`);
  }

  return payload;
}

async function supabaseSelect(table, query) {
  if (!supabaseUrl || !supabaseServiceKey) {
    fail("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis pour verifier Stripe Billing.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  });
  const payload = await response.json().catch(() => []);

  if (!response.ok) {
    fail(`Supabase ${table} ${response.status} - ${JSON.stringify(payload).slice(0, 220)}`);
  }

  return payload;
}

const cookie = await loginAndGetCookie();
logStep("Connexion smoke", baseUrl);

const organizationId = await getOrganizationId(cookie);
logStep("Organisation smoke", organizationId);

const subscriptionId = `sub_smoke_${stamp}`;
const customerId = `cus_smoke_${stamp}`;
const checkoutEventId = `evt_checkout_smoke_${stamp}`;
const subscriptionEventId = `evt_subscription_smoke_${stamp}`;
const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

const checkoutResult = await postStripeWebhook({
  data: {
    object: {
      client_reference_id: organizationId,
      customer: customerId,
      id: `cs_smoke_${stamp}`,
      metadata: {
        organization_id: organizationId,
        plan: "pro",
      },
      mode: "subscription",
      status: "complete",
      subscription: subscriptionId,
    },
  },
  id: checkoutEventId,
  type: "checkout.session.completed",
});
logStep("Webhook checkout Stripe", checkoutResult.type);

const subscriptionResult = await postStripeWebhook({
  data: {
    object: {
      cancel_at_period_end: false,
      current_period_end: periodEnd,
      customer: customerId,
      id: subscriptionId,
      items: {
        data: [
          {
            price: {
              id: priceId,
            },
          },
        ],
      },
      metadata: {
        organization_id: organizationId,
        plan: "pro",
      },
      status: "active",
      trial_end: null,
    },
  },
  id: subscriptionEventId,
  type: "customer.subscription.updated",
});
logStep("Webhook abonnement Stripe", subscriptionResult.type);

const subscriptions = await supabaseSelect(
  "billing_subscriptions",
  `organization_id=eq.${encodeURIComponent(
    organizationId,
  )}&select=organization_id,stripe_customer_id,stripe_subscription_id,stripe_price_id,status&limit=1`,
);
const subscription = subscriptions[0];

if (
  !subscription ||
  subscription.status !== "active" ||
  subscription.stripe_subscription_id !== subscriptionId
) {
  fail(`Abonnement Stripe non synchronise - ${JSON.stringify(subscription).slice(0, 260)}`);
}
logStep("Abonnement Supabase", subscription.status);

const events = await supabaseSelect(
  "billing_events",
  `provider_event_id=in.(${checkoutEventId},${subscriptionEventId})&select=provider_event_id,event_type,status`,
);

if (events.length < 2) {
  fail(`Evenements billing incomplets - ${JSON.stringify(events).slice(0, 260)}`);
}
logStep("Journal billing_events", `${events.length} evenement(s)`);

console.log("\nStripe Billing OK: webhook signe -> abonnement actif -> billing_events.");
