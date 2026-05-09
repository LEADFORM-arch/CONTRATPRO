import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  getResolvedOrganizationId,
  insertSupabaseRow,
  SupabaseWriteError,
} from "@/server/supabase-write";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const companyName = text(body.companyName);
    const firstName = text(body.firstName);
    const lastName = text(body.lastName);

    if (!companyName && (!firstName || !lastName)) {
      return NextResponse.json(
        {
          error:
            "Renseignez un nom d'entreprise ou le prenom et le nom du client.",
        },
        { status: 400 },
      );
    }

    const customer = await insertSupabaseRow<{ id: string }>("customers", {
      organization_id: await getResolvedOrganizationId(),
      company_name: companyName,
      first_name: firstName,
      last_name: lastName,
      email: text(body.email),
      phone: text(body.phone),
      address: text(body.address),
      city: text(body.city),
      zip_code: text(body.zipCode),
      notes: text(body.notes),
    });

    return NextResponse.json({ id: customer.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de creer ce client." },
      { status: 500 },
    );
  }
}
