"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RenewalActionControlsProps = {
  actionId: string;
  currentStatus: string;
};

const actions = [
  {
    label: "Envoyée",
    outcome: "Relance envoyée au client",
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

  async function updateStatus(status: string, outcome: string) {
    setLoadingStatus(status);
    const response = await fetch(`/api/relances/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome, status }),
    });

    setLoadingStatus(null);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
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
  );
}
