import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  SupabaseWriteError,
  updateSupabaseRows,
} from "@/server/supabase-write";

const statuses = new Set(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]);

type InvoiceRouteContext = {
  params: Promise<{ id: string }>;
};

function statusValue(value: unknown) {
  return typeof value === "string" && statuses.has(value) ? value : null;
}

export async function PATCH(request: Request, context: InvoiceRouteContext) {
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
        { error: "Statut de facture invalide." },
        { status: 400 },
      );
    }

    const rows = await updateSupabaseRows<{ id: string }>(
      "invoices",
      `id=eq.${encodeURIComponent(id)}`,
      {
        status,
        paid_at: status === "PAID" ? new Date().toISOString() : null,
      },
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
    }

    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de mettre a jour cette facture." },
      { status: 500 },
    );
  }
}
