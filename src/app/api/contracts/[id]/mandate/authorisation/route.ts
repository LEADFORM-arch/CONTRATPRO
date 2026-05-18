import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  createGoCardlessMandateAuthorisationFlow,
  SepaProviderError,
} from "@/server/sepa-provider";
import {
  insertSupabaseRow,
  selectSupabaseRows,
  SupabaseWriteError,
  updateSupabaseRows,
} from "@/server/supabase-write";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MaybeArray<T> = T | T[] | null | undefined;

type ContractMandateFlowRow = {
  id: string;
  price_ttc: number | string;
  installations?: MaybeArray<{
    brand: string | null;
    model: string | null;
    type: string;
    customers?: MaybeArray<{
      address: string | null;
      city: string | null;
      company_name: string | null;
      email: string | null;
      first_name: string | null;
      last_name: string | null;
      zip_code: string | null;
    }>;
  }>;
};

type MandateRow = {
  gc_mandate_id: string | null;
  id: string;
  status: string;
};

function first<T>(value: MaybeArray<T>) {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function appBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.CONTRATPRO_APP_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function equipmentLabel(installation?: { brand: string | null; model: string | null; type: string }) {
  if (!installation) {
    return "equipement CVC";
  }
  return [installation.brand, installation.model].filter(Boolean).join(" ") || installation.type;
}

export async function POST(request: Request, context: RouteContext) {
  const authError = await requireApiUser();
  if (authError) {
    return authError;
  }

  const { id } = await context.params;

  try {
    const rows = await selectSupabaseRows<ContractMandateFlowRow>(
      "contracts",
      `id=eq.${encodeURIComponent(
        id,
      )}&select=id,price_ttc,installations(type,brand,model,customers(first_name,last_name,company_name,email,address,city,zip_code))&limit=1`,
    );
    const contract = rows[0];

    if (!contract) {
      return NextResponse.json({ error: "Contrat introuvable." }, { status: 404 });
    }

    const installation = first(contract.installations);
    const customer = first(installation?.customers);

    if (!customer?.email) {
      return NextResponse.json(
        {
          error:
            "Ajoutez un email client avant de creer le lien mandat GoCardless.",
        },
        { status: 422 },
      );
    }

    const existing = await selectSupabaseRows<MandateRow>(
      "sepa_mandates",
      `contract_id=eq.${encodeURIComponent(id)}&select=id,status,gc_mandate_id&limit=1`,
    );
    const currentMandate = existing[0];

    if (currentMandate?.status === "ACTIVE" && currentMandate.gc_mandate_id) {
      return NextResponse.json(
        {
          error:
            "Un mandat actif existe deja pour ce contrat. Annulez-le cote GoCardless avant de recreer un lien.",
        },
        { status: 409 },
      );
    }

    const useCompanyOnly = Boolean(customer.company_name?.trim());
    const flow = await createGoCardlessMandateAuthorisationFlow({
      appBaseUrl: appBaseUrl(request),
      contractId: id,
      customer: {
        address: customer.address ?? undefined,
        city: customer.city ?? undefined,
        companyName: useCompanyOnly ? customer.company_name ?? undefined : undefined,
        email: customer.email,
        firstName: useCompanyOnly ? undefined : customer.first_name ?? undefined,
        lastName: useCompanyOnly ? undefined : customer.last_name ?? undefined,
        postalCode: customer.zip_code ?? undefined,
      },
      description: `Mandat SEPA ContratPro - ${equipmentLabel(installation)} - ${Number(
        contract.price_ttc,
      ).toFixed(2)} EUR`,
    });

    const mandatePayload: Record<string, unknown> = {
      contract_id: id,
      signed_at: null,
      status: "SUBMITTED",
    };
    if (flow.customerId) {
      mandatePayload.gc_customer_id = flow.customerId;
    }

    const mandate = currentMandate
      ? (
          await updateSupabaseRows<MandateRow>(
            "sepa_mandates",
            `id=eq.${encodeURIComponent(currentMandate.id)}`,
            mandatePayload,
          )
        )[0]
      : await insertSupabaseRow<MandateRow>("sepa_mandates", mandatePayload);

    return NextResponse.json(
      {
        authorisationUrl: flow.authorisationUrl,
        billingRequestId: flow.billingRequestId,
        customerId: flow.customerId,
        expiresAt: flow.expiresAt,
        flowId: flow.flowId,
        mandateId: mandate.id,
        status: "SUBMITTED",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SepaProviderError || error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de creer le lien mandat GoCardless." },
      { status: 500 },
    );
  }
}
