import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { recordDocumentSend } from "@/server/document-sends";
import { buildInvoicePdf } from "@/server/documents";
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
    const document = await buildInvoicePdf(id);

    if (!document) {
      return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
    }

    if (!isCustomerEmail(document.customerEmail)) {
      return NextResponse.json(
        { error: "Email client invalide ou absent sur cette facture." },
        { status: 400 },
      );
    }

    let email: { id: string };
    try {
      email = await sendDocumentEmail({
        attachment: document.pdf,
        filename: document.filename,
        html: `<p>Bonjour,</p><p>Vous trouverez en piece jointe votre facture ${document.number}.</p><p>Cordialement,<br/>ContratPro</p>`,
        subject: document.subject,
        text: `Bonjour,\n\nVous trouverez en piece jointe votre facture ${document.number}.\n\nCordialement,\nContratPro`,
        to: document.customerEmail,
      });
    } catch (error) {
      if (error instanceof EmailProviderError) {
        await recordDocumentSend({
          documentId: id,
          documentType: "INVOICE",
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
      documentType: "INVOICE",
      providerMessageId: email.id,
      recipientEmail: document.customerEmail,
      recipientName: document.customerName,
      status: "SENT",
      subject: document.subject,
    });

    await updateSupabaseRows("invoices", `id=eq.${encodeURIComponent(id)}`, {
      status: "SENT",
    });

    return NextResponse.json({ ok: true, providerMessageId: email.id });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible d'envoyer cette facture." },
      { status: 500 },
    );
  }
}
