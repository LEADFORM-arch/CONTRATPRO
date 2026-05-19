"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CertificateActionProps = {
  certificateId: string;
  contractId: string;
  interventionId: string;
};

export function CertificateAction({
  certificateId,
  contractId,
  interventionId,
}: CertificateActionProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function generateCertificate() {
    setState("loading");
    const response = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId, interventionId }),
    });
    const payload = (await response.json()) as { id?: string };

    if (!response.ok || !payload.id) {
      setState("error");
      return;
    }

    router.push(`/certificates/${payload.id}`);
    router.refresh();
  }

  if (certificateId) {
    return (
      <a
        className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
        href={`/certificates/${certificateId}`}
      >
        Ouvrir
      </a>
    );
  }

  return (
    <button
      className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      disabled={state === "loading" || !contractId}
      onClick={generateCertificate}
      type="button"
    >
      {state === "loading"
        ? "Generation..."
        : state === "error"
          ? "Erreur"
          : "Générer"}
    </button>
  );
}
