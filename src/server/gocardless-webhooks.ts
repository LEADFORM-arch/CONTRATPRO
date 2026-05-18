import { createHmac, timingSafeEqual } from "node:crypto";

type GoCardlessEvent = {
  action?: string;
  created_at?: string;
  details?: {
    cause?: string;
    description?: string;
    origin?: string;
    reason_code?: string;
  };
  id?: string;
  links?: {
    billing_request?: string;
    customer?: string;
    mandate?: string;
    mandate_request_mandate?: string;
    new_mandate?: string;
    payment?: string;
  };
  metadata?: Record<string, string>;
  resource_type?: string;
};

export class WebhookSignatureError extends Error {
  constructor(message = "Signature webhook GoCardless invalide.") {
    super(message);
    this.name = "WebhookSignatureError";
  }
}

export function verifyGoCardlessSignature(rawBody: string, signature: string | null) {
  const secret = process.env.GOCARDLESS_WEBHOOK_ENDPOINT_SECRET;
  if (!secret) {
    throw new WebhookSignatureError(
      "GOCARDLESS_WEBHOOK_ENDPOINT_SECRET est absent.",
    );
  }
  if (!signature) {
    throw new WebhookSignatureError();
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new WebhookSignatureError();
  }
}

export function paymentStatusFromGoCardlessAction(action?: string) {
  const statuses: Record<string, string> = {
    cancelled: "CANCELLED",
    charged_back: "CHARGED_BACK",
    confirmed: "CONFIRMED",
    failed: "FAILED",
    paid_out: "PAID_OUT",
    submitted: "SUBMITTED",
  };
  return action ? statuses[action] ?? null : null;
}

export function mandateStatusFromGoCardlessAction(action?: string) {
  const statuses: Record<string, string> = {
    active: "ACTIVE",
    cancelled: "CANCELLED",
    created: "PENDING_SUBMISSION",
    expired: "EXPIRED",
    failed: "FAILED",
    pending_submission: "PENDING_SUBMISSION",
    replaced: "ACTIVE",
    submitted: "SUBMITTED",
  };
  return action ? statuses[action] ?? null : null;
}

export function billingRequestMandateStatusFromAction(action?: string) {
  const statuses: Record<string, string> = {
    bank_authorisation_denied: "FAILED",
    bank_authorisation_expired: "FAILED",
    bank_authorisation_failed: "FAILED",
    cancelled: "CANCELLED",
    failed: "FAILED",
    fulfilled: "SUBMITTED",
  };
  return action ? statuses[action] ?? null : null;
}

export function normalizeGoCardlessEvents(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const events = (payload as { events?: unknown }).events;
  if (!Array.isArray(events)) {
    return [];
  }

  return events.filter((event): event is GoCardlessEvent => {
    return Boolean(event && typeof event === "object");
  });
}

export function eventMessage(event: GoCardlessEvent) {
  return [
    event.details?.description,
    event.details?.cause,
    event.details?.reason_code,
  ]
    .filter(Boolean)
    .join(" - ");
}
