import { NextResponse } from "next/server";

import { notifyAdmin } from "@/server/internal-notifications";
import { rateLimit } from "@/server/rate-limit";
import { serviceInsert, SupabaseServiceError } from "@/server/supabase-service";
import {
  DemoOrganizationForbiddenError,
  ProductionTenantConfigError,
  assertProductionSafeOrganizationId,
} from "@/server/tenant";

const specialties = new Set([
  "Chaudiere gaz",
  "Pompe a chaleur",
  "Clim reversible",
  "Multi CVC",
  "Autre",
]);

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function email(value: unknown) {
  const candidate = text(value)?.toLowerCase();
  if (!candidate) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : null;
}

function integer(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : fallback;
}

function leadOrganizationId() {
  const organizationId =
    process.env.CONTRATPRO_PUBLIC_LEAD_ORG_ID || process.env.CONTRATPRO_ORG_ID;

  if (!organizationId) {
    throw new SupabaseServiceError(
      "CONTRATPRO_PUBLIC_LEAD_ORG_ID ou CONTRATPRO_ORG_ID est requis pour capter les demandes demo.",
      503,
    );
  }

  return assertProductionSafeOrganizationId(organizationId, "public-lead");
}

function scoreLead(payload: Record<string, unknown>) {
  const contractCount = integer(payload.contractCount);
  const hasPhone = Boolean(text(payload.phone));
  const plan = text(payload.plan);
  let score = 54;

  if (contractCount >= 50) {
    score += 14;
  }
  if (contractCount >= 150) {
    score += 10;
  }
  if (hasPhone) {
    score += 8;
  }
  if (plan === "pro" || plan === "business") {
    score += 10;
  }

  return Math.min(score, 95);
}

function specialty(value: unknown) {
  const candidate = text(value);
  return candidate && specialties.has(candidate) ? candidate : "Multi CVC";
}

export async function POST(request: Request) {
  try {
    const limited = rateLimit({
      limit: 5,
      request,
      scope: "public-demo-request",
      windowMs: 60 * 60_000,
    });
    if (limited) {
      return limited;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const companyName = text(body.companyName);
    const contactName = text(body.contactName);
    const leadEmail = email(body.email);

    if (!companyName || !leadEmail) {
      return NextResponse.json(
        { error: "Entreprise et email professionnel sont obligatoires." },
        { status: 400 },
      );
    }

    const organizationId = leadOrganizationId();
    const score = scoreLead(body);
    const contractCount = integer(body.contractCount);
    const plan = text(body.plan);
    const lead = await serviceInsert<{ id: string }>("prospection_leads", {
      city: text(body.city),
      company_name: companyName,
      contact_name: contactName,
      email: leadEmail,
      last_touch_at: new Date().toISOString(),
      next_action: "Rappeler sous 24h et qualifier le parc contrats",
      notes: [
        text(body.message),
        contractCount ? `${contractCount} contrats declares` : null,
        plan ? `Plan d'interet: ${plan}` : null,
      ]
        .filter(Boolean)
        .join(" | "),
      organization_id: organizationId,
      phone: text(body.phone),
      score,
      source: "PUBLIC_DEMO",
      source_url: text(body.sourceUrl),
      specialty: specialty(body.specialty),
      status: "TO_QUALIFY",
    });

    await notifyAdmin({
      actionUrl: "/admin/prospection",
      message: `${companyName} demande une demo ContratPro. Score ${score}/100.`,
      metadata: {
        city: text(body.city),
        contractCount,
        leadId: lead.id,
        plan,
        source: "PUBLIC_DEMO",
      },
      organizationId,
      severity: score >= 80 ? "warning" : "info",
      title: "Demande demo publique",
      type: "public_demo_request",
    }).catch((error) => {
      console.warn("[Public demo] notification failed", error);
    });

    return NextResponse.json({ id: lead.id, ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (
      error instanceof DemoOrganizationForbiddenError ||
      error instanceof ProductionTenantConfigError
    ) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Impossible d'enregistrer cette demande demo." },
      { status: 500 },
    );
  }
}
