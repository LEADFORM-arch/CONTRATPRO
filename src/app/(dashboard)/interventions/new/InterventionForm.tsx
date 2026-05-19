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
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputClass = "contract-form-input";

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

    const response = await fetch("/api/interventions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: payload.error || "Impossible de planifier cette intervention.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Intervention planifiee. Retour au planning...",
    });
    form.reset();
    router.push("/interventions");
    router.refresh();
  }

  const disabled = submitState.status === "loading" || contracts.length === 0;

  return (
    <form className="contract-form-shell mt-6" onSubmit={handleSubmit}>
      <FormSection
        description="Selectionnez le contrat qui portera l'historique et l'attestation."
        index="01"
        title="Contrat rattache"
      >
        <label className="contract-form-field md:col-span-3">
          <span>Contrat</span>
          <select className={inputClass} name="contractId" required>
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
        <button className="login-submit sm:max-w-64" disabled={disabled} type="submit">
          Enregistrer intervention
        </button>
      </div>
    </form>
  );
}
