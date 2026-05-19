"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SendCertificateButton({
  certificateId,
  sent,
}: {
  certificateId: string;
  sent: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function markSent() {
    setState("loading");
    const response = await fetch(`/api/certificates/${certificateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentToCustomer: true }),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    setState("idle");
    router.refresh();
  }

  if (sent) {
    return (
      <span className="certificate-sent-pill print:hidden">
        Envoyée client
      </span>
    );
  }

  return (
    <button
      className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold print:hidden disabled:cursor-not-allowed disabled:opacity-60"
      disabled={state === "loading"}
      onClick={markSent}
      type="button"
    >
      {state === "loading"
        ? "Mise a jour..."
        : state === "error"
          ? "Erreur envoi"
          : "Marquer envoyee"}
    </button>
  );
}
