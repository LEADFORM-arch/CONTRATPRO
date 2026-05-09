import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { notifyAdmin } from "@/server/internal-notifications";
import { recordPaymentEvent } from "@/server/payment-events";
import {
  SupabaseWriteError,
  updateSupabaseRows,
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

type PaymentRouteContext = {
  params: Promise<{ id: string }>;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function statusValue(value: unknown) {
  return typeof value === "string" && statuses.has(value) ? value : null;
}

export async function PATCH(request: Request, context: PaymentRouteContext) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const status = statusValue(body.status);

    if (!status) {
      return NextResponse.json(
        { error: "Statut de paiement invalide." },
        { status: 400 },
      );
    }

    const rows = await updateSupabaseRows<{ id: string }>(
      "sepa_payments",
      `id=eq.${encodeURIComponent(id)}`,
      {
        failure_reason: status === "FAILED" ? text(body.failureReason) : null,
        status,
      },
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Paiement introuvable." },
        { status: 404 },
      );
    }

    await recordPaymentEvent({
      eventType: "payment_status_updated",
      message:
        status === "FAILED"
          ? text(body.failureReason) || "Paiement marque en echec."
          : `Statut mis a jour: ${status}.`,
      paymentId: rows[0].id,
      status,
    }).catch((eventError) => {
      console.warn("[Payments] event log failed", eventError);
    });

    if (status === "FAILED" || status === "CHARGED_BACK") {
      await notifyAdmin({
        actionUrl: "/payments",
        message:
          text(body.failureReason) ||
          `Le paiement ${rows[0].id} est passe au statut ${status}.`,
        metadata: {
          paymentId: rows[0].id,
          status,
        },
        severity: "critical",
        title: "Paiement SEPA en echec",
        type: "payment_failed",
      }).catch((notificationError) => {
        console.warn("[Payments] notification failed", notificationError);
      });
    }

    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de mettre a jour ce paiement." },
      { status: 500 },
    );
  }
}
