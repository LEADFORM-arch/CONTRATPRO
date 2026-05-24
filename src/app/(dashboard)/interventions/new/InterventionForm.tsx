"use client";

import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";

type ContractOption = {
  id: string;
  label: string;
};

type InterventionFormProps = {
  contracts: ContractOption[];
  defaultPerformedAt: string;
  selectedContractId?: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputClass = "contract-form-input";
const INTERVENTION_SUBMIT_TIMEOUT_MS = 30_000;

function FormSection({
  index,
  title,
  description,
  children,
}: {
  index: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="contract-form-section">
      <div className="contract-form-section-header">
        <span>{index}</span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="contract-form-grid">{children}</div>
    </section>
  );
}

export function InterventionForm({
  contracts,
  defaultPerformedAt,
  selectedContractId = "",
}: InterventionFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState({
      status: "loading",
      message: "Planification de la visite...",
    });

    const contractId = String(formData.get("contractId") ?? "");
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      INTERVENTION_SUBMIT_TIMEOUT_MS,
    );

    let response: Response;
    let payload: { error?: string } | null = null;
    try {
      response = await fetch("/api/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
        signal: controller.signal,
      });
      payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof DOMException && error.name === "AbortError"
            ? "Enregistrement trop long. Gardez la page ouverte et reessayez."
            : "Impossible de planifier cette intervention. Reessayez depuis le dossier.",
      });
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message:
          payload?.error ||
          "Impossible de planifier cette intervention. Reessayez depuis le dossier.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Intervention planifiee. Retour au dossier contrat...",
    });
    form.reset();
    router.push(contractId ? `/contracts/${contractId}` : "/interventions");
    router.refresh();
  }

  const disabled = submitState.status === "loading" || contracts.length === 0;

  return (
    <form className="contract-form-shell mt-6" onSubmit={handleSubmit}>
      <div className="intervention-form-command">
        <div>
          <p>À la fin de cette saisie</p>
          <h3>Le planning est à jour et l'attestation peut être générée.</h3>
        </div>
        <span>{contracts.length ? `${contracts.length} contrat(s) disponible(s)` : "Aucun contrat"}</span>
      </div>

      <FormSection
        description="Selectionnez le contrat qui portera l'historique et l'attestation."
        index="01"
        title="Contrat rattache"
      >
        <label className="contract-form-field md:col-span-3">
          <span>Contrat</span>
          <select
            className={inputClass}
            defaultValue={selectedContractId}
            name="contractId"
            required
          >
            {!selectedContractId ? (
              <option value="">Selectionner un contrat</option>
            ) : null}
            {contracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.label}
              </option>
            ))}
          </select>
        </label>
      </FormSection>

      <FormSection
        description="Planifiez le passage terrain et anticipez la prochaine échéance."
        index="02"
        title="Visite"
      >
        <label className="contract-form-field">
          <span>Date et heure</span>
          <input
            className={inputClass}
            defaultValue={defaultPerformedAt}
            name="performedAt"
            required
            type="datetime-local"
          />
        </label>

        <label className="contract-form-field">
          <span>Statut</span>
          <select className={inputClass} name="status">
            <option value="SCHEDULED">Planifiée</option>
            <option value="COMPLETED">Réalisée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </label>

        <label className="contract-form-field">
          <span>Technicien</span>
          <input className={inputClass} name="technician" placeholder="Nadia" />
        </label>

        <label className="contract-form-field">
          <span>Prochaine visite</span>
          <input className={inputClass} name="nextVisitDate" type="date" />
        </label>
      </FormSection>

      <FormSection
        description="Ajoutez les observations qui serviront au suivi client et à l’attestation."
        index="03"
        title="Compte rendu"
      >
        <label className="contract-form-field md:col-span-3">
          <span>Rapport technicien</span>
          <textarea
            className="contract-form-input min-h-32 py-3"
            name="report"
            placeholder="Points contrôlés, anomalies, recommandations client..."
          />
        </label>
      </FormSection>

      <div className="contract-form-footer">
        <p
          className={
            submitState.status === "error"
              ? "contract-form-message-error"
              : "contract-form-message"
          }
        >
          {submitState.message ||
            (contracts.length
              ? "Une visite planifiée alimente ensuite les attestations et le suivi légal."
              : "Creez d'abord un contrat pour planifier une intervention.")}
        </p>
        <button
          className="premium-action rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-64"
          disabled={disabled}
          type="submit"
        >
          {submitState.status === "loading" ? "Enregistrement..." : "Enregistrer intervention"}
        </button>
      </div>
    </form>
  );
}
