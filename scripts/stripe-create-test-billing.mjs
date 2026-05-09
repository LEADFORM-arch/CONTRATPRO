const STRIPE_API = "https://api.stripe.com/v1";
const PRODUCT_NAME = "ContratPro Pro";
const LOOKUP_KEY = "contratpro_pro_monthly_200_eur";

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

const existingPrices = await stripe(`/prices?active=true&lookup_keys[]=${LOOKUP_KEY}&limit=1`);
let price = existingPrices.data?.[0];
let productId = typeof price?.product === "string" ? price.product : null;

if (!price) {
  const product = await stripe("/products", {
    body: body({
      name: PRODUCT_NAME,
      "metadata[source]": "contratpro",
      "metadata[plan]": "pro",
    }),
    method: "POST",
  });
  productId = product.id;
  price = await stripe("/prices", {
    body: body({
      currency: "eur",
      lookup_key: LOOKUP_KEY,
      product: productId,
      "recurring[interval]": "month",
      tax_behavior: "exclusive",
      unit_amount: "20000",
    }),
    method: "POST",
  });
}

console.log("Stripe test billing pret.");
console.log(`Product: ${productId}`);
console.log(`Price: ${price.id}`);
console.log(`Lookup key: ${LOOKUP_KEY}`);
console.log("\nA ajouter dans Vercel Production:");
console.log("STRIPE_SECRET_KEY=<votre sk_test_...>");
console.log("STRIPE_WEBHOOK_SECRET=<whsec_... apres creation du webhook>");
console.log(`STRIPE_PRICE_ID=${price.id}`);
