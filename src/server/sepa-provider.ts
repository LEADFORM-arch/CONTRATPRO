import { randomUUID } from "node:crypto";

type CreateSepaPaymentPayload = {
  amount: number;
  chargeDate: string;
  currency: string;
  description: string;
  mandateProviderId: string;
  metadata: Record<string, string>;
};

type CreateMandateAuthorisationFlowPayload = {
  appBaseUrl: string;
  contractId: string;
  customer: {
    address?: string;
    city?: string;
    companyName?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    postalCode?: string;
  };
  description: string;
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

type GoCardlessErrorPayload = {
  error?: {
    errors?: Array<{ message?: string }>;
    message?: string;
  };
};

async function goCardlessPost<T>(path: string, body: unknown) {
  const config = providerConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      "GoCardless-Version": config.version,
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as
    | (T & GoCardlessErrorPayload)
    | null;

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.error?.errors?.[0]?.message ||
      "GoCardless a refuse la requete.";
    throw new SepaProviderError(message, response.status);
  }

  return data as T;
}

async function goCardlessGet<T>(path: string) {
  const config = providerConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "GET",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      "GoCardless-Version": config.version,
    },
  });

  const data = (await response.json().catch(() => null)) as
    | (T & GoCardlessErrorPayload)
    | null;

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.error?.errors?.[0]?.message ||
      "GoCardless a refuse la lecture.";
    throw new SepaProviderError(message, response.status);
  }

  return data as T;
}

function cleanObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      return typeof entry === "string" ? entry.trim().length > 0 : Boolean(entry);
    }),
  );
}

export async function createGoCardlessPayment(payload: CreateSepaPaymentPayload) {
  const amountInCents = Math.round(payload.amount * 100);
  const data = await goCardlessPost<{
    payments?: { id?: string; status?: string };
  }>(
    "/payments",
    {
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
    },
  );

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

export async function createGoCardlessMandateAuthorisationFlow(
  payload: CreateMandateAuthorisationFlowPayload,
) {
  const billingRequest = await goCardlessPost<{
    billing_requests?: {
      id?: string;
      links?: {
        customer?: string;
      };
      status?: string;
    };
  }>("/billing_requests", {
    billing_requests: {
      mandate_request: {
        currency: "EUR",
        description: payload.description,
        metadata: {
          contratpro_contract_id: payload.contractId,
        },
        scheme: "sepa_core",
      },
      metadata: {
        contratpro_contract_id: payload.contractId,
        contratpro_source: "contract_mandate",
      },
    },
  });

  const billingRequestId = billingRequest.billing_requests?.id;
  if (!billingRequestId) {
    throw new SepaProviderError(
      "GoCardless n'a pas retourne d'identifiant de demande mandat.",
    );
  }

  const prefilledCustomer = cleanObject({
    address_line1: payload.customer.address,
    city: payload.customer.city,
    company_name: payload.customer.companyName,
    country_code: "FR",
    email: payload.customer.email,
    family_name: payload.customer.lastName,
    given_name: payload.customer.firstName,
    postal_code: payload.customer.postalCode,
  });

  const successUrl = `${payload.appBaseUrl}/mandat-sepa/merci`;
  const exitUrl = `${payload.appBaseUrl}/mandat-sepa/merci?status=interrompu`;
  const flow = await goCardlessPost<{
    billing_request_flows?: {
      authorisation_url?: string;
      expires_at?: string;
      id?: string;
      links?: {
        billing_request?: string;
      };
    };
  }>("/billing_request_flows", {
    billing_request_flows: {
      exit_uri: exitUrl,
      language: "fr",
      links: {
        billing_request: billingRequestId,
      },
      prefilled_customer: prefilledCustomer,
      redirect_uri: successUrl,
    },
  });

  const authorisationUrl = flow.billing_request_flows?.authorisation_url;
  const flowId = flow.billing_request_flows?.id;
  if (!authorisationUrl || !flowId) {
    throw new SepaProviderError(
      "GoCardless n'a pas retourne de lien d'autorisation mandat.",
    );
  }

  return {
    authorisationUrl,
    billingRequestId,
    customerId: billingRequest.billing_requests?.links?.customer ?? "",
    expiresAt: flow.billing_request_flows?.expires_at ?? "",
    flowId,
  };
}

export async function retrieveGoCardlessBillingRequest(id: string) {
  const data = await goCardlessGet<{
    billing_requests?: {
      id?: string;
      links?: {
        customer?: string;
        mandate_request_mandate?: string;
      };
      metadata?: Record<string, string>;
      status?: string;
    };
  }>(`/billing_requests/${encodeURIComponent(id)}`);

  return data.billing_requests ?? null;
}
