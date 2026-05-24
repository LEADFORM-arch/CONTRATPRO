"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogRenewalButtonProps = {
  channel: string;
  contractId: string;
  message: string;
};

const RENEWAL_LOG_TIMEOUT_MS = 20_000;

export function LogRenewalButton({
  channel,
  contractId,
  message,
}: LogRenewalButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "saved" | "error">(
    "idle",
  );
  const [messageText, setMessageText] = useState("");

  async function handleLog() {
    setState("loading");
    setMessageText("");

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      RENEWAL_LOG_TIMEOUT_MS,
    );

    let response: Response;
    try {
      response = await fetch("/api/relances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          contractId,
          message,
          outcome: "Relance preparee depuis le cockpit ContratPro",
          status: "TODO",
        }),
        signal: controller.signal,
      });
    } catch (error) {
      setState("error");
      setMessageText(
        error instanceof DOMException && error.name === "AbortError"
          ? "Journal trop long. Copiez le script et revenez plus tard."
          : "Journal impossible. Copiez le script.",
      );
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      setState("error");
      setMessageText("Journal impossible. Copiez le script.");
      return;
    }

    setState("saved");
    router.refresh();
  }

  return (
    <div>
      <button
        className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        disabled={state === "loading"}
        onClick={handleLog}
        type="button"
      >
        {state === "loading"
          ? "Journal..."
          : state === "saved"
            ? "Journalisee"
            : state === "error"
              ? "Erreur"
              : "Journaliser"}
      </button>
      {messageText ? <p className="mt-2 max-w-44 text-xs text-rose-300">{messageText}</p> : null}
    </div>
  );
}
