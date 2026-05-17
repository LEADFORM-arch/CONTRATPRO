import { NextResponse } from "next/server";

import { getCurrentAdminUser } from "@/server/admin";
import {
  SupabaseWriteError,
  updateSupabaseRows,
} from "@/server/supabase-write";

const statuses = new Set([
  "TO_QUALIFY",
  "CONTACTED",
  "REPLIED",
  "DEMO_SCHEDULED",
  "WON",
  "LOST",
]);

type LeadRouteContext = {
  params: Promise<{ id: string }>;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function statusValue(value: unknown) {
  return typeof value === "string" && statuses.has(value) ? value : null;
}

export async function PATCH(request: Request, context: LeadRouteContext) {
  try {
    const admin = await getCurrentAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: "Acces admin prospection requis." },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const status = statusValue(body.status);

    if (!status) {
      return NextResponse.json(
        { error: "Statut de lead invalide." },
        { status: 400 },
      );
    }

    const updates: Record<string, string | null> = {
      status,
      last_touch_at: new Date().toISOString(),
      next_action: text(body.nextAction),
      updated_at: new Date().toISOString(),
    };

    if ("notes" in body) {
      updates.notes = text(body.notes);
    }

    const rows = await updateSupabaseRows<{ id: string }>(
      "prospection_leads",
      `id=eq.${encodeURIComponent(id)}`,
      updates,
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Lead introuvable." }, { status: 404 });
    }

    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      if (error.status === 404) {
        return NextResponse.json(
          {
            error:
              "La table prospection_leads est absente. Executez supabase/prospection.sql dans Supabase SQL Editor.",
          },
          { status: 424 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de mettre a jour ce lead." },
      { status: 500 },
    );
  }
}
