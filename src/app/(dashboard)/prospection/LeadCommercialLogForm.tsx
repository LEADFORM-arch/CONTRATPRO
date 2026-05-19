"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

const channels = [
  ["Messenger", "Messenger"],
  ["Commentaire", "Commentaire"],
  ["Telephone", "Téléphone"],
  ["Email", "Email"],
  ["Demo", "Démo"],
] as const;
const scenarios = [
  ["froid", "froid"],
  ["chaud", "chaud"],
  ["excel", "excel"],
  ["relance", "relance"],
  ["reponse", "réponse"],
  ["demo", "démo"],
] as const;

function appendCommercialLog(currentNotes: string, logLine: string) {
  const cleanNotes = currentNotes.trim();

  if (!cleanNotes || cleanNotes === "-") {
    return logLine;
  }

  return `${cleanNotes}\n${logLine}`;
}

export function LeadCommercialLogForm({
  currentNotes,
  currentStatus,
  defaultNextAction,
  defaultScenario,
  leadId,
}: {
  currentNotes: string;
  currentStatus: string;
  defaultNextAction: string;
  defaultScenario: string;
  leadId: string;
}) {
  const router = useRouter();
  const [action, setAction] = useState("DM copie/envoye");
  const [channel, setChannel] = useState("Messenger");
  const [error, setError] = useState("");
  const [nextAction, setNextAction] = useState(defaultNextAction);
  const [objection, setObjection] = useState("");
  const [pending, setPending] = useState(false);
  const [relay, setRelay] = useState("J+2");
  const [scenario, setScenario] = useState(defaultScenario);
  const [saved, setSaved] = useState(false);

  async function submitLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setPending(true);

    const cleanObjection = objection.trim() || "-";
    const cleanNextAction = nextAction.trim() || defaultNextAction;
    const logLine = [
      `Suivi commercial ${new Date().toISOString()}`,
      `canal=${channel}`,
      `scenario=${scenario}`,
      `relance=${relay.trim() || "-"}`,
      `objection=${cleanObjection}`,
      `action=${action.trim() || "Action commerciale"}`,
    ].join(" | ");

    const response = await fetch(`/api/prospection/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nextAction: cleanNextAction,
        notes: appendCommercialLog(currentNotes, logLine),
        status: currentStatus,
      }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Journalisation impossible.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form className="lead-log-form mt-3" onSubmit={submitLog}>
      <div className="lead-log-form-header">
        <div>
          <p>Journal commercial</p>
          <strong>Tracer l'action et la relance</strong>
        </div>
        <button disabled={pending} type="submit">
          {pending ? "..." : "Journaliser action"}
        </button>
      </div>

      <div className="lead-log-grid mt-3">
        <label>
          Canal
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
          >
            {channels.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Scénario
          <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
            {scenarios.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Relance
          <input value={relay} onChange={(event) => setRelay(event.target.value)} />
        </label>
        <label>
          Objection
          <input
            placeholder="Excel suffit, pas le moment..."
            value={objection}
            onChange={(event) => setObjection(event.target.value)}
          />
        </label>
        <label className="lead-log-wide">
          Prochaine action
          <input value={nextAction} onChange={(event) => setNextAction(event.target.value)} />
        </label>
        <label className="lead-log-wide">
          Action faite
          <input value={action} onChange={(event) => setAction(event.target.value)} />
        </label>
      </div>

      <div className="lead-log-footer">
        {saved ? <span data-state="saved">Suivi enregistre.</span> : null}
        {error ? <span data-state="error">{error}</span> : null}
      </div>
    </form>
  );
}
