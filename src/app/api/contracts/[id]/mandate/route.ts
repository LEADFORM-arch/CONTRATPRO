import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  insertSupabaseRow,
  selectSupabaseRows,
  SupabaseWriteError,
  updateSupabaseRows,
} from "@/server/supabase-write";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MandateRow = {
  id: string;
};

const statuses = new Set([
  "PENDING_SUBMISSION",
  "SUBMITTED",
  "ACTIVE",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
]);

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function statusValue(value: unknown) {
  return typeof value === "string" && statuses.has(value)
    ? value
    : "PENDING_SUBMISSION";
}

export async function POST(request: Request, context: RouteContext) {
  const authError = await requireApiUser();
  if (authError) {
    return authError;
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const status = statusValue(body.status);
    const mandateProviderId = text(body.gcMandateId);
    const customerProviderId = text(body.gcCustomerId);

    if (status === "ACTIVE" && !mandateProviderId) {
      return NextResponse.json(
        {
          error:
            "Renseignez l'identifiant mandat GoCardless avant de passer le mandat en actif.",
        },
        { status: 400 },
      );
    }

    const payload = {
      contract_id: id,
      gc_customer_id: customerProviderId,
      gc_mandate_id: mandateProviderId,
      signed_at: status === "ACTIVE" ? new Date().toISOString() : null,
      status,
    };

    const existing = await selectSupabaseRows<MandateRow>(
      "sepa_mandates",
      `contract_id=eq.${encodeURIComponent(id)}&select=id&limit=1`,
    );

    const mandate = existing[0]
      ? (
          await updateSupabaseRows<MandateRow>(
            "sepa_mandates",
            `id=eq.${encodeURIComponent(existing[0].id)}`,
            payload,
          )
        )[0]
      : await insertSupabaseRow<MandateRow>("sepa_mandates", payload);

    return NextResponse.json({ id: mandate.id, status }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible d'enregistrer le mandat SEPA." },
      { status: 500 },
    );
  }
}
