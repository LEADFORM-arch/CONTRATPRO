import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  getContractDetail,
  getOrganizationProfile,
} from "@/server/contratpro-data";
import { EmailProviderError, sendPlainEmail } from "@/server/resend";
import { insertSupabaseRow, SupabaseWriteError } from "@/server/supabase-write";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function htmlMessage(message: string) {
  return message
    .split(/\n+/)
    .map((line) => `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const contractId = text(body.contractId);
    const channel = text(body.channel) ?? "Email";
    const message = text(body.message);

    if (!contractId || !message) {
      return NextResponse.json(
        { error: "Contrat et message sont obligatoires." },
        { status: 400 },
      );
    }

    const [contract, organization] = await Promise.all([
      getContractDetail(contractId),
      getOrganizationProfile(),
    ]);

    if (!contract) {
      return NextResponse.json({ error: "Contrat introuvable." }, { status: 404 });
    }

    if (!isEmail(contract.email)) {
      return NextResponse.json(
        { error: "Email client absent ou invalide sur ce contrat." },
        { status: 400 },
      );
    }

    const subject = `Renouvellement de votre contrat d'entretien - ${organization.name}`;

    try {
      const email = await sendPlainEmail({
        html: `${htmlMessage(message)}<p>Cordialement,<br/>${organization.name}</p>`,
        subject,
        text: `${message}\n\nCordialement,\n${organization.name}`,
        to: contract.email,
      });

      const action = await insertSupabaseRow<{ id: string }>("renewal_actions", {
        channel,
        completed_at: new Date().toISOString(),
        contract_id: contractId,
        due_at: new Date().toISOString(),
        message,
        outcome: `Email envoye a ${contract.email} via Resend (${email.id || "sans id provider"}).`,
        status: "SENT",
      });

      return NextResponse.json({
        id: action.id,
        providerMessageId: email.id,
      });
    } catch (error) {
      if (error instanceof EmailProviderError) {
        await insertSupabaseRow<{ id: string }>("renewal_actions", {
          channel,
          contract_id: contractId,
          due_at: new Date().toISOString(),
          message,
          outcome: `Echec envoi email a ${contract.email}: ${error.message}`,
          status: "TODO",
        }).catch((logError) => {
          console.warn("[Relances] failed send log failed", logError);
        });

        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
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
      { error: "Impossible d'envoyer cette relance." },
      { status: 500 },
    );
  }
}
