import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { recordDocumentSend } from "@/server/document-sends";
import { buildCertificatePdf } from "@/server/documents";
import { EmailProviderError, sendDocumentEmail } from "@/server/resend";
import {
  SupabaseWriteError,
  updateSupabaseRows,
} from "@/server/supabase-write";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isCustomerEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const { id } = await context.params;
    const document = await buildCertificatePdf(id);

    if (!document) {
      return NextResponse.json({ error: "Attestation introuvable." }, { status: 404 });
    }

    if (!isCustomerEmail(document.customerEmail)) {
      return NextResponse.json(
        { error: "Email client invalide ou absent sur cette attestation." },
        { status: 400 },
      );
    }

    let email: { id: string };
    try {
      email = await sendDocumentEmail({
        attachment: document.pdf,
        filename: document.filename,
        html: "<p>Bonjour,</p><p>Vous trouverez en piece jointe votre attestation d'entretien CVC.</p><p>Cordialement,<br/>ContratPro</p>",
        subject: document.subject,
        text: "Bonjour,\n\nVous trouverez en piece jointe votre attestation d'entretien CVC.\n\nCordialement,\nContratPro",
        to: document.customerEmail,
      });
    } catch (error) {
      if (error instanceof EmailProviderError) {
        await recordDocumentSend({
          documentId: id,
          documentType: "CERTIFICATE",
          errorMessage: error.message,
          recipientEmail: document.customerEmail,
          recipientName: document.customerName,
          status: "FAILED",
          subject: document.subject,
        });
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }

    await recordDocumentSend({
      documentId: id,
      documentType: "CERTIFICATE",
      providerMessageId: email.id,
      recipientEmail: document.customerEmail,
      recipientName: document.customerName,
      status: "SENT",
      subject: document.subject,
    });

    await updateSupabaseRows("certificates", `id=eq.${encodeURIComponent(id)}`, {
      sent_at: new Date().toISOString(),
      sent_to_customer: true,
    });

    return NextResponse.json({ ok: true, providerMessageId: email.id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible d'envoyer cette attestation." },
      { status: 500 },
    );
  }
}
