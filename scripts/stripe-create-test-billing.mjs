const STRIPE_API = "https://api.stripe.com/v1";

const plans = [
  {
    envKey: "STRIPE_PRICE_ID_STARTER",
    lookupKey: "contratpro_starter_monthly_49_eur",
    metadataPlan: "starter",
    name: "ContratPro Starter",
    unitAmount: "4900",
  },
  {
    envKey: "STRIPE_PRICE_ID_PRO",
    lookupKey: "contratpro_pro_monthly_99_eur",
    metadataPlan: "pro",
    name: "ContratPro Pro",
    unitAmount: "9900",
  },
  {
    envKey: "STRIPE_PRICE_ID_BUSINESS",
    lookupKey: "contratpro_business_monthly_199_eur",
    metadataPlan: "business",
    name: "ContratPro Business",
    unitAmount: "19900",
  },
];

function clean(value) {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function usage() {
  console.error("STRIPE_SECRET_KEY est requis dans le terminal courant.");
  console.error("Exemple: $env:STRIPE_SECRET_KEY=\"sk_test_...\"; npm run stripe:create-test-billing");
}

const secretKey = clean(process.env.STRIPE_SECRET_KEY);
if (!secretKey) {
  usage();
  process.exit(1);
}

if (!secretKey.startsWith("sk_test_")) {
  console.error("Ce script est volontairement limite au mode test: la cle doit commencer par sk_test_.");
  process.exit(1);
}

async function stripe(path, init = {}) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${secretKey}`,
      "content-type": "application/x-www-form-urlencoded",
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `Stripe HTTP ${response.status}`);
  }
  return payload;
}

function body(params) {
  return new URLSearchParams(params).toString();
}

const created = [];

for (const plan of plans) {
  const existingPrices = await stripe(`/prices?active=true&lookup_keys[]=${plan.lookupKey}&limit=1`);
  let price = existingPrices.data?.[0];
  let productId = typeof price?.product === "string" ? price.product : null;

  if (!price) {
    const product = await stripe("/products", {
      body: body({
        name: plan.name,
        "metadata[source]": "contratpro",
        "metadata[plan]": plan.metadataPlan,
      }),
      method: "POST",
    });
    productId = product.id;
    price = await stripe("/prices", {
      body: body({
        currency: "eur",
        lookup_key: plan.lookupKey,
        product: productId,
        "recurring[interval]": "month",
        tax_behavior: "exclusive",
        unit_amount: plan.unitAmount,
      }),
      method: "POST",
    });
  }

  created.push({ ...plan, priceId: price.id, productId });
}

console.log("Stripe test billing pret.");
for (const plan of created) {
  console.log(`\n${plan.name}`);
  console.log(`Product: ${plan.productId}`);
  console.log(`Price: ${plan.priceId}`);
  console.log(`Lookup key: ${plan.lookupKey}`);
}

console.log("\nA ajouter dans Vercel Production:");
console.log("STRIPE_SECRET_KEY=<votre sk_test_...>");
console.log("STRIPE_WEBHOOK_SECRET=<whsec_... apres creation du webhook>");
for (const plan of created) {
  console.log(`${plan.envKey}=${plan.priceId}`);
}
