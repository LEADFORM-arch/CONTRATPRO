"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type MandateSetupFormProps = {
  contractId: string;
  customerProviderId?: string;
  mandateProviderId?: string;
  status?: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputClass = "contract-form-input";

export function MandateSetupForm({
  contractId,
  customerProviderId = "",
  mandateProviderId = "",
  status = "PENDING_SUBMISSION",
}: MandateSetupFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setSubmitState({
      status: "loading",
      message: "Enregistrement du mandat...",
    });

    const response = await fetch(`/api/contracts/${contractId}/mandate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: payload?.error || "Impossible d'enregistrer le mandat.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Mandat SEPA enregistre. Le dossier est pret pour paiement.",
    });
    router.refresh();
  }

  const disabled = submitState.status === "loading";

  return (
    <form className="contract-mandate-form" onSubmit={handleSubmit}>
      <div className="contract-mandate-form-grid">
        <label className="contract-form-field">
          <span>ID client GoCardless</span>
          <input
            className={inputClass}
            defaultValue={customerProviderId === "-" ? "" : customerProviderId}
            name="gcCustomerId"
            placeholder="CU000..."
          />
        </label>
        <label className="contract-form-field">
          <span>ID mandat GoCardless</span>
          <input
            className={inputClass}
            defaultValue={mandateProviderId === "-" ? "" : mandateProviderId}
            name="gcMandateId"
            placeholder="MD000..."
          />
        </label>
        <label className="contract-form-field">
          <span>Statut mandat</span>
          <select className={inputClass} defaultValue={status} name="status">
            <option value="PENDING_SUBMISSION">A preparer</option>
            <option value="SUBMITTED">Envoye GoCardless</option>
            <option value="ACTIVE">Actif GoCardless</option>
            <option value="FAILED">Echec mandat</option>
            <option value="CANCELLED">Annule</option>
            <option value="EXPIRED">Expire</option>
          </select>
        </label>
      </div>
      <div className="contract-mandate-form-footer">
        <p
          className={
            submitState.status === "error"
              ? "contract-form-message-error"
              : "contract-form-message"
          }
        >
          {submitState.message ||
            "Collez les identifiants GoCardless quand ils sont disponibles. Un mandat actif permettra ensuite de programmer le paiement."}
        </p>
        <button
          className="premium-action rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          type="submit"
        >
          {disabled ? "Enregistrement..." : "Enregistrer mandat"}
        </button>
      </div>
    </form>
  );
}
