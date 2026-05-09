import { createHmac, timingSafeEqual } from "node:crypto";

export class StripeConfigError extends Error {
  status: number;

  constructor(message: string, status = 503) {
    super(message);
    this.name = "StripeConfigError";
    this.status = status;
  }
}

export class StripeWebhookSignatureError extends Error {
  constructor(message = "Signature webhook Stripe invalide.") {
    super(message);
    this.name = "StripeWebhookSignatureError";
  }
}

function secretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new StripeConfigError("STRIPE_SECRET_KEY est absent.");
  }
  return key;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isStripeWebhookConfigured() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export function getAppBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.CONTRATPRO_APP_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function stripePost<T>(path: string, params: URLSearchParams) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    signal: AbortSignal.timeout(15000),
  });

  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new StripeConfigError(
      payload.error?.message || "Stripe a refuse la requete.",
      response.status,
    );
  }

  return payload;
}

export function verifyStripeSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new StripeWebhookSignatureError("STRIPE_WEBHOOK_SECRET est absent.");
  }
  if (!signatureHeader) {
    throw new StripeWebhookSignatureError();
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    throw new StripeWebhookSignatureError();
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) {
    throw new StripeWebhookSignatureError("Signature Stripe expiree.");
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new StripeWebhookSignatureError();
  }
}
