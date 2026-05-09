import { NextRequest, NextResponse } from "next/server";

import { notifyAdmin } from "@/server/internal-notifications";
import { runRenewalAutomation } from "@/server/renewal-automation";
import { SupabaseServiceError } from "@/server/supabase-service";

function expectedSecret() {
  return process.env.CONTRATPRO_CRON_SECRET || process.env.CRON_SECRET;
}

function isAuthorized(request: NextRequest) {
  const secret = expectedSecret();
  if (!secret) {
    return false;
  }

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  return handleRenewalsCron(request, body, true);
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const body = {
    dryRun: search.get("dryRun") === "true",
    organizationId: search.get("organizationId") ?? undefined,
  };
  return handleRenewalsCron(request, body, false);
}

async function handleRenewalsCron(
  request: NextRequest,
  body: Record<string, unknown>,
  defaultDryRun: boolean,
) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Cron non autorise." }, { status: 401 });
    }

    const organizationId =
      typeof body.organizationId === "string" && body.organizationId.trim()
        ? body.organizationId.trim()
        : process.env.CONTRATPRO_ORG_ID;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId ou CONTRATPRO_ORG_ID est requis." },
        { status: 400 },
      );
    }

    const dryRun =
      typeof body.dryRun === "boolean" ? body.dryRun : defaultDryRun;
    const report = await runRenewalAutomation({ dryRun, organizationId });

    if (!dryRun && report.failed > 0) {
      await notifyAdmin({
        actionUrl: "/relances",
        message: `${report.failed} relance(s) automatique(s) ont echoue sur ${report.processed} contrat(s) analyses.`,
        metadata: {
          failed: report.failed,
          processed: report.processed,
          sent: report.sent,
          skipped: report.skipped,
        },
        organizationId,
        severity: "warning",
        title: "Cron relances avec echecs",
        type: "renewal_cron_failed_items",
      }).catch((notificationError) => {
        console.warn("[Cron renewals] notification failed", notificationError);
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    await notifyAdmin({
      actionUrl: "/admin/ops",
      message: error instanceof Error ? error.message : "Erreur inconnue.",
      severity: "critical",
      title: "Cron relances indisponible",
      type: "renewal_cron_error",
    }).catch((notificationError) => {
      console.warn("[Cron renewals] failure notification failed", notificationError);
    });

    if (error instanceof SupabaseServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible d'executer les relances automatiques." },
      { status: 500 },
    );
  }
}
