"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const RENEWAL_EMAIL_TIMEOUT_MS = 30_000;

export function SendRenewalEmailButton({
  channel,
  contractId,
  message,
}: {
  channel: string;
  contractId: string;
  message: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function sendEmail() {
    setState("loading");
    setError("");

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      RENEWAL_EMAIL_TIMEOUT_MS,
    );

    let response: Response;
    let payload: { error?: string } | null = null;
    try {
      response = await fetch("/api/relances/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, contractId, message }),
        signal: controller.signal,
      });
      payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
    } catch (error) {
      setState("error");
      setError(
        error instanceof DOMException && error.name === "AbortError"
          ? "Envoi trop long. Copiez le script ou journalisez la relance."
          : "Envoi impossible. Copiez le script ou journalisez la relance.",
      );
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      setState("error");
      setError(payload?.error ?? "Envoi impossible. Copiez le script ou journalisez la relance.");
      return;
    }

    setState("sent");
    router.refresh();
  }

  return (
    <div>
      <button
        className="premium-inline-action rounded-md px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        disabled={state === "loading"}
        onClick={sendEmail}
        type="button"
      >
        {state === "loading"
          ? "Envoi..."
          : state === "sent"
            ? "Email envoye"
            : state === "error"
              ? "Erreur"
              : "Envoyer email"}
      </button>
      {error ? <p className="mt-2 max-w-44 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
