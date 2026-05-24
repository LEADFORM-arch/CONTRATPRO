import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { getContractDetail } from "@/server/contratpro-data";
import { insertSupabaseRow, SupabaseWriteError } from "@/server/supabase-write";

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
    const interventionId = text(body.interventionId);
    const contractId = text(body.contractId);

    if (!interventionId || !contractId) {
      return NextResponse.json(
        {
          error:
            "Intervention et contrat sont obligatoires pour generer l'attestation.",
        },
        { status: 400 },
      );
    }

    const contract = await getContractDetail(contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contrat introuvable." }, { status: 404 });
    }

    const interventionBelongsToContract = contract.interventions.some(
      (intervention) => intervention.id === interventionId,
    );
    if (!interventionBelongsToContract) {
      return NextResponse.json(
        { error: "Intervention introuvable sur ce contrat." },
        { status: 404 },
      );
    }

    const certificate = await insertSupabaseRow<{ id: string }>("certificates", {
      intervention_id: interventionId,
      contract_id: contractId,
      file_name: `attestation-${interventionId}.pdf`,
      legal_reference:
        text(body.legalReference) || "Arrete 15/09/2009 et 02/03/2017",
      sent_to_customer: false,
    });

    return NextResponse.json({ id: certificate.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      if (error.status === 409) {
        return NextResponse.json(
          { error: "Une attestation existe deja pour cette intervention." },
          { status: 409 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de generer cette attestation." },
      { status: 500 },
    );
  }
}
