import { NextResponse } from "next/server";

import { getCurrentAdminUser } from "@/server/admin";
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

function secret(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: "Acces admin acquisition requis." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const organizationId = await getResolvedOrganizationId();
    const rows = await selectSupabaseRows<{ id: string }>(
      "facebook_channel_settings",
      `select=id&organization_id=eq.${encodeURIComponent(organizationId)}&limit=1`,
    );
    const payload: Record<string, unknown> = {
      buffer_profile_id: text(body.bufferProfileId),
      demo_url: text(body.demoUrl),
      n8n_webhook_url: text(body.n8nWebhookUrl),
      posting_frequency: text(body.postingFrequency) ?? "3 posts / semaine",
      persona:
        text(body.persona) ??
        "Marc, chauffagiste senior franc, utile et non vendeur",
      updated_at: new Date().toISOString(),
    };
    const bufferAccessToken = secret(body.bufferAccessToken);
    const apifyToken = secret(body.apifyToken);
    const manychatToken = secret(body.manychatToken);

    if (bufferAccessToken !== undefined) {
      payload.buffer_access_token = bufferAccessToken;
    }
    if (apifyToken !== undefined) {
      payload.apify_token = apifyToken;
    }
    if (manychatToken !== undefined) {
      payload.manychat_token = manychatToken;
    }

    if (!rows.length) {
      const settings = await insertSupabaseRow<{ id: string }>(
        "facebook_channel_settings",
        {
          organization_id: organizationId,
          ...payload,
        },
      );
      return NextResponse.json({ id: settings.id }, { status: 201 });
    }

    const updated = await updateSupabaseRows<{ id: string }>(
      "facebook_channel_settings",
      `id=eq.${encodeURIComponent(rows[0].id)}`,
      payload,
    );

    return NextResponse.json({ id: updated[0].id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      if (error.status === 404) {
        return NextResponse.json(
          {
            error:
              "La table facebook_channel_settings est absente. Executez supabase/prospection.sql dans Supabase SQL Editor.",
          },
          { status: 424 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de sauvegarder la configuration Facebook." },
      { status: 500 },
    );
  }
}
