import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  SupabaseWriteError,
  updateSupabaseRows,
} from "@/server/supabase-write";

type CertificateRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: CertificateRouteContext) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const sent = body.sentToCustomer !== false;

    const rows = await updateSupabaseRows<{ id: string }>(
      "certificates",
      `id=eq.${encodeURIComponent(id)}`,
      {
        sent_at: sent ? new Date().toISOString() : null,
        sent_to_customer: sent,
      },
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Attestation introuvable." },
        { status: 404 },
      );
    }

    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de mettre a jour cette attestation." },
      { status: 500 },
    );
  }
}
