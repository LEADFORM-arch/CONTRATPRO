type CreateSepaPaymentPayload = {
  amount: number;
  chargeDate: string;
  currency: string;
  description: string;
  mandateProviderId: string;
  metadata: Record<string, string>;
};

export class SepaProviderError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "SepaProviderError";
    this.status = status;
  }
}

function providerBaseUrl() {
  return process.env.GOCARDLESS_ENVIRONMENT === "live"
    ? "https://api.gocardless.com"
    : "https://api-sandbox.gocardless.com";
}

function providerConfig() {
  const accessToken = process.env.GOCARDLESS_ACCESS_TOKEN;
  if (!accessToken) {
    throw new SepaProviderError(
      "GOCARDLESS_ACCESS_TOKEN est absent. Configurez la cle sandbox ou live avant de soumettre un prelevement.",
      503,
    );
  }

  return {
    accessToken,
    baseUrl: providerBaseUrl(),
    version: process.env.GOCARDLESS_VERSION || "2015-07-06",
  };
}

export async function createGoCardlessPayment(payload: CreateSepaPaymentPayload) {
  const config = providerConfig();
  const amountInCents = Math.round(payload.amount * 100);
  const response = await fetch(`${config.baseUrl}/payments`, {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      "GoCardless-Version": config.version,
    },
    body: JSON.stringify({
      payments: {
        amount: amountInCents,
        charge_date: payload.chargeDate,
        currency: payload.currency,
        description: payload.description,
        links: {
          mandate: payload.mandateProviderId,
        },
        metadata: payload.metadata,
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | {
        error?: { message?: string; errors?: Array<{ message?: string }> };
        payments?: { id?: string; status?: string };
      }
    | null;

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.error?.errors?.[0]?.message ||
      "GoCardless a refuse la creation du paiement.";
    throw new SepaProviderError(message, response.status);
  }

  const id = data?.payments?.id;
  if (!id) {
    throw new SepaProviderError("GoCardless n'a pas retourne d'identifiant paiement.");
  }

  return {
    id,
    raw: data,
    status: data?.payments?.status ?? "submitted",
  };
}
