import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  type ClientImportMode,
  getRecentClientImportLogs,
  runClientImport,
} from "@/server/client-import";
import { rateLimit } from "@/server/rate-limit";
import { SupabaseWriteError } from "@/server/supabase-write";

function modeFromBody(value: unknown): ClientImportMode {
  return value === "execute" ? "execute" : "dry-run";
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET() {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const logs = await getRecentClientImportLogs().catch(() => []);
    return NextResponse.json({ logs });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de lire l'historique des imports." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const limited = rateLimit({
      limit: 12,
      request,
      scope: "client-import",
      windowMs: 60 * 60_000,
    });
    if (limited) {
      return limited;
    }

    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as {
      fileName?: unknown;
      mode?: unknown;
      rows?: unknown;
    };
    const rows = Array.isArray(body.rows) ? body.rows : [];

    if (!rows.length) {
      return NextResponse.json(
        { error: "Ajoutez au moins une ligne CSV ou Excel a analyser." },
        { status: 400 },
      );
    }

    const report = await runClientImport(
      rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object"),
      modeFromBody(body.mode),
      {
        fileName: text(body.fileName),
        source: "client_csv_xlsx",
      },
    );

    return NextResponse.json(report, {
      status: body.mode === "execute" ? 201 : 200,
    });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de traiter cet import clients." },
      { status: 500 },
    );
  }
}
