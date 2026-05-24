"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CertificateActionProps = {
  certificateId: string;
  contractId: string;
  interventionId: string;
};

const CERTIFICATE_ACTION_TIMEOUT_MS = 30_000;

export function CertificateAction({
  certificateId,
  contractId,
  interventionId,
}: CertificateActionProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function generateCertificate() {
    setState("loading");
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      CERTIFICATE_ACTION_TIMEOUT_MS,
    );

    let response: Response;
    let payload: { id?: string; error?: string } | null = null;
    try {
      response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, interventionId }),
        signal: controller.signal,
      });
      payload = (await response.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null;
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "Generation trop longue. Revenez au dossier, rien n'est perdu."
          : "Generation impossible. Ouvrez le dossier pour verifier.",
      );
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok || !payload?.id) {
      setState("error");
      setMessage(payload?.error ?? "Generation impossible. Ouvrez le dossier pour verifier.");
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
    <div className="intervention-inline-action">
      <button
        className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        disabled={state === "loading" || !contractId}
        onClick={generateCertificate}
        type="button"
      >
        {state === "loading"
          ? "Generation..."
          : state === "error"
            ? "Reessayer"
            : "Generer"}
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
