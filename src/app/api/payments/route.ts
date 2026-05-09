import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { recordPaymentEvent } from "@/server/payment-events";
import {
  getResolvedOrganizationId,
  insertSupabaseRow,
  SupabaseWriteError,
} from "@/server/supabase-write";

const statuses = new Set([
  "PENDING_SUBMISSION",
  "SUBMITTED",
  "CONFIRMED",
  "PAID_OUT",
  "FAILED",
  "CANCELLED",
  "CHARGED_BACK",
]);

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function enumValue(value: unknown, allowed: Set<string>, fallback: string) {
  return typeof value === "string" && allowed.has(value) ? value : fallback;
}

function numberValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function isoDate(value: unknown) {
  const raw = text(value);
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const mandateId = text(body.mandateId);
    const amount = numberValue(body.amount);
    const chargeDate = isoDate(body.chargeDate);

    if (!mandateId || !amount || !chargeDate) {
      return NextResponse.json(
        {
          error:
            "Mandat, montant et date d'encaissement sont obligatoires.",
        },
        { status: 400 },
      );
    }

    const payment = await insertSupabaseRow<{ id: string }>("sepa_payments", {
      amount,
      charge_date: chargeDate,
      currency: "EUR",
      description: text(body.description),
      mandate_id: mandateId,
      organization_id: await getResolvedOrganizationId(),
      status: enumValue(body.status, statuses, "PENDING_SUBMISSION"),
    });

    await recordPaymentEvent({
      eventType: "payment_created",
      message: "Paiement programme dans ContratPro.",
      paymentId: payment.id,
      status: enumValue(body.status, statuses, "PENDING_SUBMISSION"),
    }).catch((eventError) => {
      console.warn("[Payments] event log failed", eventError);
    });

    return NextResponse.json({ id: payment.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de creer ce paiement." },
      { status: 500 },
    );
  }
}
