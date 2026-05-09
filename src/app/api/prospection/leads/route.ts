import { NextResponse } from "next/server";

import { getCurrentAdminUser } from "@/server/admin";
import { notifyAdmin } from "@/server/internal-notifications";
import {
  getResolvedOrganizationId,
  insertSupabaseRow,
  SupabaseWriteError,
} from "@/server/supabase-write";

const statuses = new Set([
  "TO_QUALIFY",
  "CONTACTED",
  "REPLIED",
  "DEMO_SCHEDULED",
  "WON",
  "LOST",
]);

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function scoreValue(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 50;
  }
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function statusValue(value: unknown) {
  return typeof value === "string" && statuses.has(value) ? value : "TO_QUALIFY";
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: "Acces admin prospection requis." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const companyName = text(body.companyName);

    if (!companyName) {
      return NextResponse.json(
        { error: "Le nom de l'entreprise est obligatoire." },
        { status: 400 },
      );
    }

    const organizationId = await getResolvedOrganizationId();
    const lead = await insertSupabaseRow<{ id: string }>("prospection_leads", {
      organization_id: organizationId,
      company_name: companyName,
      contact_name: text(body.contactName),
      email: text(body.email),
      phone: text(body.phone),
      city: text(body.city),
      specialty: text(body.specialty),
      source: text(body.source) ?? "MANUAL",
      source_url: text(body.sourceUrl),
      status: statusValue(body.status),
      score: scoreValue(body.score),
      next_action: text(body.nextAction),
      notes: text(body.notes),
    });

    await notifyAdmin({
      actionUrl: "/admin/prospection",
      message: `${companyName} a ete ajoute au pipeline avec un score de ${scoreValue(body.score)}/100.`,
      metadata: {
        city: text(body.city),
        leadId: lead.id,
        source: text(body.source) ?? "MANUAL",
      },
      organizationId,
      severity: scoreValue(body.score) >= 75 ? "warning" : "info",
      title: "Nouveau lead prospection",
      type: "lead_created",
    }).catch((notificationError) => {
      console.warn("[Prospection] notification failed", notificationError);
    });

    return NextResponse.json({ id: lead.id }, { status: 201 });
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
      { error: "Impossible de creer ce lead." },
      { status: 500 },
    );
  }
}
