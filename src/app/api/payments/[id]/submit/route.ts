import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { recordPaymentEvent } from "@/server/payment-events";
import {
  createGoCardlessPayment,
  SepaProviderError,
} from "@/server/sepa-provider";
import {
  SupabaseWriteError,
  selectSupabaseRows,
  updateSupabaseRows,
} from "@/server/supabase-write";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PaymentRow = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  charge_date: string;
  description: string | null;
  gc_payment_id: string | null;
  mandate?: {
    gc_mandate_id: string | null;
  };
};

function isoDateOnly(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export async function POST(_request: Request, context: RouteContext) {
  const authError = await requireApiUser();
  if (authError) {
    return authError;
  }

  const { id } = await context.params;

  try {
    const rows = await selectSupabaseRows<PaymentRow>(
      "sepa_payments",
      `id=eq.${encodeURIComponent(
        id,
      )}&select=id,amount,currency,status,charge_date,description,gc_payment_id,mandate:sepa_mandates(gc_mandate_id)&limit=1`,
    );
    const payment = rows[0];

    if (!payment) {
      return NextResponse.json({ error: "Paiement introuvable." }, { status: 404 });
    }

    if (payment.gc_payment_id) {
      return NextResponse.json({
        id: payment.id,
        providerPaymentId: payment.gc_payment_id,
        status: payment.status,
      });
    }

    const mandateProviderId = payment.mandate?.gc_mandate_id;
    if (!mandateProviderId) {
      return NextResponse.json(
        {
          error:
            "Mandat provider absent. Renseignez gc_mandate_id avant soumission GoCardless.",
        },
        { status: 422 },
      );
    }

    let providerPayment: Awaited<ReturnType<typeof createGoCardlessPayment>>;
    try {
      providerPayment = await createGoCardlessPayment({
        amount: Number(payment.amount),
        chargeDate: isoDateOnly(payment.charge_date),
        currency: payment.currency || "EUR",
        description: payment.description || "Contrat maintenance CVC",
        mandateProviderId,
        metadata: {
          contratpro_payment_id: payment.id,
        },
      });
    } catch (error) {
      if (error instanceof SepaProviderError) {
        await recordPaymentEvent({
          eventType: "provider_submission_failed",
          message: error.message,
          paymentId: payment.id,
          status: "FAILED",
        }).catch((eventError) => {
          console.warn("[Payments] event log failed", eventError);
        });
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }

    await updateSupabaseRows("sepa_payments", `id=eq.${encodeURIComponent(id)}`, {
      gc_payment_id: providerPayment.id,
      status: "SUBMITTED",
    });

    await recordPaymentEvent({
      eventType: "provider_submission",
      message: "Paiement soumis a GoCardless.",
      paymentId: payment.id,
      providerEventId: providerPayment.id,
      rawPayload: providerPayment.raw,
      status: "SUBMITTED",
    }).catch((eventError) => {
      console.warn("[Payments] event log failed", eventError);
    });

    return NextResponse.json({
      id: payment.id,
      providerPaymentId: providerPayment.id,
      status: "SUBMITTED",
    });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de soumettre ce paiement." },
      { status: 500 },
    );
  }
}
