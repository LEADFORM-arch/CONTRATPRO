import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { insertSupabaseRow, SupabaseWriteError } from "@/server/supabase-write";

const statuses = new Set(["TODO", "SENT", "REPLIED", "WON", "LOST"]);

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function enumValue(value: unknown, allowed: Set<string>, fallback: string) {
  return typeof value === "string" && allowed.has(value) ? value : fallback;
}

function dueDate(value: unknown) {
  const raw = text(value);
  if (!raw) {
    return new Date().toISOString();
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const contractId = text(body.contractId);
    const channel = text(body.channel);
    const message = text(body.message);

    if (!contractId || !channel || !message) {
      return NextResponse.json(
        {
          error:
            "Contrat, canal et message sont obligatoires pour journaliser une relance.",
        },
        { status: 400 },
      );
    }

    const action = await insertSupabaseRow<{ id: string }>("renewal_actions", {
      contract_id: contractId,
      status: enumValue(body.status, statuses, "TODO"),
      channel,
      message,
      due_at: dueDate(body.dueAt),
      outcome: text(body.outcome),
    });

    return NextResponse.json({ id: action.id }, { status: 201 });
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
      { error: "Impossible de journaliser cette relance." },
      { status: 500 },
    );
  }
}
