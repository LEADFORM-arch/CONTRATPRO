import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  getResolvedOrganizationId,
  insertSupabaseRow,
  selectSupabaseRows,
  SupabaseWriteError,
  updateSupabaseRows,
} from "@/server/supabase-write";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function PATCH(request: Request) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const organizationId = await getResolvedOrganizationId();
    const name = text(body.name);

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de l'entreprise est obligatoire." },
        { status: 400 },
      );
    }

    const payload = {
      name,
      siret: text(body.siret),
      rge_number: text(body.rgeNumber),
      vat_number: text(body.vatNumber),
      address: text(body.address),
      city: text(body.city),
      zip_code: text(body.zipCode),
      phone: text(body.phone),
      email: text(body.email),
      updated_at: new Date().toISOString(),
    };
    const rows = await selectSupabaseRows<{ id: string }>(
      "organizations",
      `select=id&id=eq.${encodeURIComponent(organizationId)}&limit=1`,
    );

    if (!rows.length) {
      const organization = await insertSupabaseRow<{ id: string }>(
        "organizations",
        {
          id: organizationId,
          ...payload,
        },
      );
      return NextResponse.json({ id: organization.id }, { status: 201 });
    }

    const updated = await updateSupabaseRows<{ id: string }>(
      "organizations",
      `id=eq.${encodeURIComponent(organizationId)}`,
      payload,
    );

    return NextResponse.json({ id: updated[0].id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de sauvegarder l'identite entreprise." },
      { status: 500 },
    );
  }
}
