"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const actions = [
  ["TO_QUALIFY", "Qualifier", "Appeler sous 24h et qualifier le parc contrats"],
  ["CONTACTED", "Contacté", "Envoyer le lien démo et relancer J+2"],
  ["REPLIED", "Répondu", "Proposer deux créneaux de démonstration"],
  ["DEMO_SCHEDULED", "Démo", "Préparer la démo avec données client"],
  ["WON", "Gagné", "Créer l'organisation client et lancer onboarding"],
  ["LOST", "Perdu", "Archiver avec motif et relance à 90 jours"],
] as const;

export function LeadStatusControls({
  currentStatus,
  leadId,
}: {
  currentStatus: string;
  leadId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  async function updateStatus(status: string, nextAction: string) {
    setError("");
    setPending(status);
    const response = await fetch(`/api/prospection/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextAction, status }),
    });
    setPending(null);
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Mise à jour impossible.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <div className="lead-status-controls flex flex-wrap gap-2">
        {actions.map(([status, label, nextAction]) => (
          <button
            className="lead-status-button rounded-md border px-2 py-1 text-xs font-semibold"
            data-selected={currentStatus === status}
            data-status={status}
            disabled={pending !== null || currentStatus === status}
            key={status}
            onClick={() => updateStatus(status, nextAction)}
            type="button"
          >
            {pending === status ? "..." : label}
          </button>
        ))}
      </div>
      {error ? <p className="text-xs font-medium text-red-300">{error}</p> : null}
    </div>
  );
}
