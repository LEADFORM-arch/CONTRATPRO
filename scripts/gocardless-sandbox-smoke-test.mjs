import { createHmac } from "node:crypto";

import {
  getDeploymentProtectionHeaders,
  getSessionCookie,
  getSmokeConfig,
  loadLocalEnv,
  read,
} from "./smoke-test-helpers.mjs";

loadLocalEnv();

const { baseUrl, email, password } = getSmokeConfig("smoke:gocardless");
const webhookSecret = process.env.GOCARDLESS_WEBHOOK_ENDPOINT_SECRET?.trim();
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stamp = Date.now();

const commonHeaders = {
  ...getDeploymentProtectionHeaders(),
  "content-type": "application/json",
  "user-agent": "ContratPro GoCardless sandbox smoke test",
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

async function postJson(path, cookie, body, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`, {
    body: JSON.stringify(body),
    headers: { ...commonHeaders, cookie },
    method: "POST",
    redirect: "manual",
  });
  const payload = await response.json().catch(() => ({}));

  if (response.status !== expectedStatus) {
    fail(`${path} ${response.status} - ${JSON.stringify(payload).slice(0, 260)}`);
  }

  return payload;
}

async function postWebhook(body) {
  if (!webhookSecret) {
    fail("GOCARDLESS_WEBHOOK_ENDPOINT_SECRET absent.");
  }

  const rawBody = JSON.stringify(body);
  const signature = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const response = await fetch(`${baseUrl}/api/webhooks/gocardless`, {
    body: rawBody,
    headers: {
      ...getDeploymentProtectionHeaders(),
      "content-type": "application/json",
      "User-Agent": "ContratPro GoCardless sandbox smoke test",
      "Webhook-Signature": signature,
    },
    method: "POST",
    redirect: "manual",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    fail(`/api/webhooks/gocardless ${response.status} - ${JSON.stringify(payload).slice(0, 260)}`);
  }

  return payload;
}

async function patchPaymentProviderId(paymentId, providerPaymentId) {
  if (!supabaseUrl || !supabaseServiceKey) {
    fail("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis pour preparer le webhook sandbox.");
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/sepa_payments?id=eq.${encodeURIComponent(paymentId)}`,
    {
      body: JSON.stringify({
        gc_payment_id: providerPaymentId,
        status: "SUBMITTED",
      }),
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      method: "PATCH",
    },
  );
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    fail(`Supabase payment patch ${response.status} - ${JSON.stringify(payload).slice(0, 220)}`);
  }

  return payload?.[0] ?? null;
}

const cookie = await loginAndGetCookie();
logStep("Connexion smoke", baseUrl);

const contract = await postJson("/api/contracts/quick", cookie, {
  brand: "Saunier Duval",
  contactFirstName: "Paul",
  contactLastName: "Martin",
  contractNotes: "Controle GoCardless sandbox ContratPro",
  customerAddress: "12 rue des Artisans",
  customerCity: "Lille",
  customerEmail: `gocardless.martin+${stamp}@example.fr`,
  customerName: `Martin GoCardless Sandbox ${stamp}`,
  customerPhone: "06 00 00 00 00",
  customerZipCode: "59000",
  durationMonths: "12",
  equipmentType: "BOILER_GAS",
  location: "Cuisine",
  model: "ThemaPlus Condens F25",
  paymentMethod: "SEPA",
  powerKw: "25",
  priceTtc: "216",
  serialNumber: `GC-SD-${stamp}`,
  vatRate: "10",
  visibleStartDate: "2026-05-19",
}, 201);
logStep("Contrat SEPA cree", contract.id);

const mandate = await postJson(`/api/contracts/${contract.id}/mandate`, cookie, {
  gcCustomerId: `CU-SANDBOX-${stamp}`,
  gcMandateId: `MD-SANDBOX-${stamp}`,
  status: "ACTIVE",
}, 201);
logStep("Mandat SEPA actif", mandate.id);

const payment = await postJson("/api/payments", cookie, {
  amount: "216",
  chargeDate: "2026-06-19",
  description: "Demo GoCardless sandbox ContratPro",
  mandateId: mandate.id,
}, 201);
logStep("Paiement programme", payment.id);

const providerPaymentId = `PM-SANDBOX-${stamp}`;
await patchPaymentProviderId(payment.id, providerPaymentId);
logStep("Paiement rattache provider sandbox", providerPaymentId);

const webhook = await postWebhook({
  events: [
    {
      action: "confirmed",
      created_at: new Date().toISOString(),
      details: {
        cause: "payment_confirmed",
        description: "Paiement sandbox confirme par smoke ContratPro.",
        origin: "gocardless",
      },
      id: `EV-SANDBOX-${stamp}`,
      links: {
        payment: providerPaymentId,
      },
      resource_type: "payments",
    },
  ],
});

if (webhook.processed !== 1) {
  fail(`webhook non traite - ${JSON.stringify(webhook)}`);
}
logStep("Webhook GoCardless signe", `processed=${webhook.processed}`);

console.log(
  "\nGoCardless sandbox OK: contrat -> mandat actif -> paiement -> webhook signe -> payment_events.",
);
