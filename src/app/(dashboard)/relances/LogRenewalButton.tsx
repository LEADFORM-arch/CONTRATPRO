"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogRenewalButtonProps = {
  channel: string;
  contractId: string;
  message: string;
};

export function LogRenewalButton({
  channel,
  contractId,
  message,
}: LogRenewalButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "saved" | "error">(
    "idle",
  );

  async function handleLog() {
    setState("loading");
    const response = await fetch("/api/relances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        contractId,
        message,
        outcome: "Relance preparee depuis le cockpit ContratPro",
        status: "TODO",
      }),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    setState("saved");
    router.refresh();
  }

  return (
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
  );
}
