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

type FlowState =
  | { status: "idle"; message: string; url: string }
  | { status: "loading"; message: string; url: string }
  | { status: "success"; message: string; url: string; expiresAt?: string }
  | { status: "error"; message: string; url: string };

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
  const [flowState, setFlowState] = useState<FlowState>({
    status: "idle",
    message: "",
    url: "",
  });

  async function createAuthorisationLink() {
    setFlowState({
      status: "loading",
      message: "Creation du lien GoCardless sandbox...",
      url: "",
    });

    const response = await fetch(`/api/contracts/${contractId}/mandate/authorisation`, {
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as
      | {
          authorisationUrl?: string;
          error?: string;
          expiresAt?: string;
        }
      | null;

    if (!response.ok || !payload?.authorisationUrl) {
      setFlowState({
        status: "error",
        message: payload?.error || "Impossible de créer le lien GoCardless.",
        url: "",
      });
      return;
    }

    setFlowState({
      status: "success",
      message: "Lien prêt. Ouvrez-le en sandbox ou copiez-le pour le client test.",
      url: payload.authorisationUrl,
      expiresAt: payload.expiresAt,
    });
    router.refresh();
  }

  async function copyAuthorisationLink() {
    if (!flowState.url) {
      return;
    }
    await navigator.clipboard.writeText(flowState.url);
    setFlowState({
      ...flowState,
      message: "Lien GoCardless copié.",
    });
  }

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
        message: payload?.error || "Impossible d’enregistrer le mandat.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Mandat SEPA enregistré. Le dossier est prêt pour paiement.",
    });
    router.refresh();
  }

  const disabled = submitState.status === "loading";
  const flowLoading = flowState.status === "loading";

  return (
    <form className="contract-mandate-form" onSubmit={handleSubmit}>
      <div className="contract-mandate-authorisation">
        <div>
          <p>Mandat hébergé GoCardless</p>
          <strong>Faire signer le mandat SEPA sandbox</strong>
          <span>
            ContratPro crée le parcours GoCardless, préremplit le client et
            garde le mandat en suivi jusqu’au retour webhook.
          </span>
        </div>
        <button
          className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={flowLoading}
          onClick={createAuthorisationLink}
          type="button"
        >
          {flowLoading ? "Création..." : "Créer lien GoCardless"}
        </button>
      </div>

      {flowState.status !== "idle" ? (
        <div
          className={
            flowState.status === "error"
              ? "contract-mandate-flow contract-mandate-flow-error"
              : "contract-mandate-flow"
          }
        >
          <p>{flowState.message}</p>
          {flowState.url ? (
            <div className="contract-mandate-flow-link">
              <input className={inputClass} readOnly value={flowState.url} />
              <a
                className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
                href={flowState.url}
                rel="noreferrer"
                target="_blank"
              >
                Ouvrir
              </a>
              <button
                className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
                onClick={copyAuthorisationLink}
                type="button"
              >
                Copier
              </button>
            </div>
          ) : null}
          {flowState.status === "success" && flowState.expiresAt ? (
            <small>Expiration GoCardless : {flowState.expiresAt}</small>
          ) : null}
        </div>
      ) : null}

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
            <option value="PENDING_SUBMISSION">À préparer</option>
            <option value="SUBMITTED">Envoyé GoCardless</option>
            <option value="ACTIVE">Actif GoCardless</option>
            <option value="FAILED">Échec mandat</option>
            <option value="CANCELLED">Annulé</option>
            <option value="EXPIRED">Expiré</option>
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
