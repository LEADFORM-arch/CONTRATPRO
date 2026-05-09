import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  SupabaseWriteError,
  updateSupabaseRows,
} from "@/server/supabase-write";

const statuses = new Set(["TODO", "SENT", "REPLIED", "WON", "LOST"]);

type RelanceRouteContext = {
  params: Promise<{ id: string }>;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function statusValue(value: unknown) {
  return typeof value === "string" && statuses.has(value) ? value : null;
}

export async function PATCH(request: Request, context: RelanceRouteContext) {
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
        { error: "Statut de relance invalide." },
        { status: 400 },
      );
    }

    const rows = await updateSupabaseRows<{ id: string }>(
      "renewal_actions",
      `id=eq.${encodeURIComponent(id)}`,
      {
        status,
        completed_at: status === "TODO" ? null : new Date().toISOString(),
        outcome: text(body.outcome),
      },
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Relance introuvable." },
        { status: 404 },
      );
    }

    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      if (error.status === 404) {
        return NextResponse.json(
          {
            error:
              "La table renewal_actions est absente. Executez supabase/renewal_actions.sql dans Supabase SQL Editor.",
          },
          { status: 424 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de mettre a jour cette relance." },
      { status: 500 },
    );
  }
}
