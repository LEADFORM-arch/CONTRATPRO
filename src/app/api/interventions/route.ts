import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { insertSupabaseRow, SupabaseWriteError } from "@/server/supabase-write";

const statuses = new Set(["SCHEDULED", "COMPLETED", "CANCELLED"]);

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function enumValue(value: unknown, allowed: Set<string>, fallback: string) {
  return typeof value === "string" && allowed.has(value) ? value : fallback;
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
    const contractId = text(body.contractId);
    const performedAt = isoDate(body.performedAt);

    if (!contractId || !performedAt) {
      return NextResponse.json(
        {
          error:
            "Contrat et date d'intervention sont obligatoires pour planifier la visite.",
        },
        { status: 400 },
      );
    }

    const intervention = await insertSupabaseRow<{ id: string }>(
      "interventions",
      {
        contract_id: contractId,
        performed_at: performedAt,
        technician: text(body.technician),
        status: enumValue(body.status, statuses, "SCHEDULED"),
        report: text(body.report),
        next_visit_date: isoDate(body.nextVisitDate),
      },
    );

    return NextResponse.json({ id: intervention.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de creer cette intervention." },
      { status: 500 },
    );
  }
}
