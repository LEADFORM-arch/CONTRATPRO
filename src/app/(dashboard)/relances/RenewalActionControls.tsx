"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RenewalActionControlsProps = {
  actionId: string;
  currentStatus: string;
};

const RENEWAL_STATUS_TIMEOUT_MS = 20_000;

const actions = [
  {
    label: "Envoyee",
    outcome: "Relance envoyee au client",
    status: "SENT",
  },
  {
    label: "Gagnee",
    outcome: "Contrat renouvele",
    status: "WON",
  },
  {
    label: "Perdue",
    outcome: "Renouvellement perdu",
    status: "LOST",
  },
];

export function RenewalActionControls({
  actionId,
  currentStatus,
}: RenewalActionControlsProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function updateStatus(status: string, outcome: string) {
    setLoadingStatus(status);
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      RENEWAL_STATUS_TIMEOUT_MS,
    );

    let response: Response;
    try {
      response = await fetch(`/api/relances/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, status }),
        signal: controller.signal,
      });
    } catch (error) {
      setMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "Mise a jour relance trop longue. Le statut actuel reste visible."
          : "Mise a jour relance impossible.",
      );
      setLoadingStatus(null);
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    setLoadingStatus(null);

    if (response.ok) {
      router.refresh();
      return;
    }

    setMessage("Mise a jour relance impossible.");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const selected = currentStatus === action.status;
          return (
            <button
              className={`relance-decision-button rounded-md border px-2 py-1 text-xs font-semibold ${
                selected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-zinc-300 text-zinc-700"
              }`}
              disabled={Boolean(loadingStatus) || selected}
              key={action.status}
              onClick={() => updateStatus(action.status, action.outcome)}
              type="button"
            >
              {loadingStatus === action.status ? "..." : action.label}
            </button>
          );
        })}
      </div>
      {message ? <p className="mt-2 text-xs text-rose-300">{message}</p> : null}
    </div>
  );
}
