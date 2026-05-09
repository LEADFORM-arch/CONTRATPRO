import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { buildCertificatePdf } from "@/server/documents";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authError = await requireApiUser();
  if (authError) {
    return authError;
  }

  const { id } = await context.params;
  const document = await buildCertificatePdf(id);

  if (!document) {
    return NextResponse.json({ error: "Attestation introuvable." }, { status: 404 });
  }

  return new NextResponse(document.pdf, {
    headers: {
      "Content-Disposition": `attachment; filename="${document.filename}"`,
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  });
}
