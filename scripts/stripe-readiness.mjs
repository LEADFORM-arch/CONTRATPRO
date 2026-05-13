const requiredEvents = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
];

function clean(value) {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function modeFromKey(secretKey) {
  if (secretKey.startsWith("sk_test_")) {
    return "test";
  }
  if (secretKey.startsWith("sk_live_")) {
    return "live";
  }
  return "unknown";
}

function check(label, passed, detail) {
  const symbol = passed ? "OK" : "FAIL";
  console.log(`${symbol} ${label} - ${detail}`);
  return passed;
}

const secretKey = clean(process.env.STRIPE_SECRET_KEY);
const webhookSecret = clean(process.env.STRIPE_WEBHOOK_SECRET);
const priceIds = [
  clean(process.env.STRIPE_PRICE_ID_STARTER),
  clean(process.env.STRIPE_PRICE_ID_PRO || process.env.STRIPE_PRICE_ID),
  clean(process.env.STRIPE_PRICE_ID_BUSINESS),
];
const appUrl = clean(process.env.NEXT_PUBLIC_APP_URL || process.env.CONTRATPRO_APP_URL);
const billingRequired = clean(process.env.CONTRATPRO_REQUIRE_BILLING);
const mode = modeFromKey(secretKey);

const checks = [
  check(
    "STRIPE_SECRET_KEY",
    Boolean(secretKey) && mode !== "unknown",
    secretKey ? `mode ${mode}` : "cle absente",
  ),
  check(
    "STRIPE_WEBHOOK_SECRET",
    webhookSecret.startsWith("whsec_"),
    webhookSecret ? "secret webhook present" : "secret webhook absent",
  ),
  check(
    "Prix Stripe",
    priceIds.every((priceId) => priceId.startsWith("price_")),
    priceIds.filter(Boolean).length
      ? `${priceIds.filter((priceId) => priceId.startsWith("price_")).length}/3 prix configures`
      : "prix Starter/Pro/Business absents",
  ),
  check(
    "URL webhook",
    Boolean(appUrl),
    appUrl ? `${appUrl.replace(/\/$/, "")}/api/webhooks/stripe` : "NEXT_PUBLIC_APP_URL absent",
  ),
  check(
    "Billing lock",
    billingRequired === "true",
    billingRequired === "true"
      ? "paywall actif"
      : "CONTRATPRO_REQUIRE_BILLING doit passer a true apres validation Stripe",
  ),
];

console.log("\nEvenements webhook requis:");
for (const event of requiredEvents) {
  console.log(`- ${event}`);
}

if (checks.includes(false)) {
  console.error("\nReadiness Stripe incomplete.");
  process.exit(1);
}

console.log("\nReadiness Stripe OK.");
