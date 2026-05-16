"use client";

import { useMemo, useState } from "react";

type PilotDecision = "Vendre" | "Iterer" | "Stop";

const decisionOptions: PilotDecision[] = ["Vendre", "Iterer", "Stop"];

const decisionDefaults: Record<PilotDecision, string> = {
  Vendre: "Proposition Starter/Pro + import accompagne sous 48h.",
  Iterer: "Corriger le blocage unique puis refaire un test prix cible.",
  Stop: "Ne pas relancer ce profil et chercher un pilote mieux aligne contrats recurrents.",
};

function compact(value: string, fallback: string) {
  return value.trim() || fallback;
}

export function PilotExitNoteBuilder() {
  const [copied, setCopied] = useState(false);
  const [decision, setDecision] = useState<PilotDecision>("Vendre");
  const [pilotName, setPilotName] = useState("");
  const [meetingDate, setMeetingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [proof, setProof] = useState("3 contrats relancables identifies");
  const [acceptedPrice, setAcceptedPrice] = useState("49 EUR/mois");
  const [blocker, setBlocker] = useState("");
  const [nextAction, setNextAction] = useState(decisionDefaults.Vendre);

  const note = useMemo(() => {
    const normalizedBlocker =
      decision === "Vendre"
        ? compact(blocker, "aucun blocage majeur")
        : compact(blocker, "blocage a clarifier avant prochaine vente");

    return [
      `Pilote: ${compact(pilotName, "Nom du chauffagiste")}`,
      `Date: ${compact(meetingDate, "date a renseigner")}`,
      `Decision: ${decision}`,
      `Preuve observee: ${compact(proof, "preuve terrain a renseigner")}`,
      `Prix teste/accepte: ${compact(acceptedPrice, "prix a renseigner")}`,
      `Objection bloquante: ${normalizedBlocker}`,
      `Prochaine action: ${compact(nextAction, decisionDefaults[decision])}`,
    ].join("\n");
  }, [acceptedPrice, blocker, decision, meetingDate, nextAction, pilotName, proof]);

  function updateDecision(value: PilotDecision) {
    setDecision(value);
    setNextAction(decisionDefaults[value]);
  }

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="pilot-exit-builder" data-od-id="pilot-exit-note-builder">
      <div className="pilot-exit-form">
        <div className="pilot-exit-decision">
          {decisionOptions.map((option) => (
            <button
              aria-pressed={decision === option}
              data-decision={option.toLowerCase()}
              key={option}
              onClick={() => updateDecision(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>

        <label>
          <span>Nom pilote</span>
          <input
            onChange={(event) => setPilotName(event.target.value)}
            placeholder="Ex: Dupont Chauffage"
            value={pilotName}
          />
        </label>

        <label>
          <span>Date</span>
          <input
            onChange={(event) => setMeetingDate(event.target.value)}
            type="date"
            value={meetingDate}
          />
        </label>

        <label>
          <span>Preuve observee</span>
          <input
            onChange={(event) => setProof(event.target.value)}
            placeholder="3 contrats, import compris, relance validee..."
            value={proof}
          />
        </label>

        <label>
          <span>Prix teste ou accepte</span>
          <input
            onChange={(event) => setAcceptedPrice(event.target.value)}
            placeholder="49 EUR/mois, 99 EUR/mois, refuse..."
            value={acceptedPrice}
          />
        </label>

        <label>
          <span>Objection bloquante</span>
          <input
            onChange={(event) => setBlocker(event.target.value)}
            placeholder="Terrain offline, import, SEPA, documents..."
            value={blocker}
          />
        </label>

        <label className="pilot-exit-wide">
          <span>Prochaine action</span>
          <input
            onChange={(event) => setNextAction(event.target.value)}
            value={nextAction}
          />
        </label>
      </div>

      <div className="pilot-exit-note">
        <div>
          <span>Note CRM prete</span>
          <strong>{decision}</strong>
        </div>
        <textarea aria-label="Note de sortie pilote" readOnly value={note} />
        <button className="pilot-decision-copy" onClick={copyNote} type="button">
          {copied ? "Copie" : "Copier la note personnalisee"}
        </button>
      </div>
    </div>
  );
}
