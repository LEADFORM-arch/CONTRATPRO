"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type MandateOption = {
  amount: number;
  id: string;
  label: string;
};

type PaymentFormProps = {
  defaultChargeDate: string;
  mandates: MandateOption[];
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputClass =
  "payment-form-input";
const PAYMENT_REQUEST_TIMEOUT_MS = 30_000;

function formatPaymentEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
}

export function PaymentForm({ defaultChargeDate, mandates }: PaymentFormProps) {
  const router = useRouter();
  const [selectedMandateId, setSelectedMandateId] = useState(mandates[0]?.id ?? "");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });
  const selectedMandate = mandates.find((mandate) => mandate.id === selectedMandateId);
  const selectedAmount = useMemo(
    () => Number(selectedMandate?.amount ?? 0),
    [selectedMandate?.amount],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState({
      status: "loading",
      message: "Création du prélèvement...",
    });

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      PAYMENT_REQUEST_TIMEOUT_MS,
    );

    let response: Response;
    let payload: { error?: string } = {};
    try {
      response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
        signal: controller.signal,
      });
      payload = (await response.json().catch(() => ({}))) as { error?: string };
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof DOMException && error.name === "AbortError"
            ? "Creation trop longue. Le mandat reste intact, reessayez ou revenez au contrat."
            : "Impossible de creer ce paiement.",
      });
      return;
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: payload.error || "Impossible de créer ce paiement.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Prélèvement créé. Retour aux paiements...",
    });
    form.reset();
    router.push("/payments");
    router.refresh();
  }

  const disabled = submitState.status === "loading" || mandates.length === 0;

  return (
    <form
      className="payment-new-shell mt-6"
      onSubmit={handleSubmit}
    >
      <section className="payment-new-form rounded-lg border p-5 shadow-sm">
        <div className="payment-new-form-intro">
          <p>1. Mandat signé</p>
          <h3>Choisissez le client à encaisser.</h3>
          <span>
            Si la liste est vide, ouvrez un contrat et préparez d'abord la signature SEPA.
          </span>
        </div>

        <div className="payment-new-rhythm" aria-label="Étapes de création du paiement">
          <div>
            <span>01</span>
            <strong>Client</strong>
            <p>Mandat signé</p>
          </div>
          <div>
            <span>02</span>
            <strong>Montant</strong>
            <p>Repris du contrat</p>
          </div>
          <div>
            <span>03</span>
            <strong>Date</strong>
            <p>Encaissement prévu</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="payment-form-field md:col-span-2">
            <span>Mandat actif</span>
            <select
              className={inputClass}
              name="mandateId"
              onChange={(event) => setSelectedMandateId(event.target.value)}
              required
              value={selectedMandateId}
            >
              {mandates.map((mandate) => (
                <option key={mandate.id} value={mandate.id}>
                  {mandate.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="payment-step-band">2. Encaissement</div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="payment-form-field">
            <span>Montant TTC</span>
            <input
              className={inputClass}
              inputMode="decimal"
              name="amount"
              required
              value={selectedMandate?.amount || ""}
              readOnly
            />
          </label>

          <label className="payment-form-field">
            <span>Date d'encaissement</span>
            <input
              className={inputClass}
              defaultValue={defaultChargeDate}
              name="chargeDate"
              required
              type="date"
            />
          </label>

          <label className="payment-form-field">
            <span>Statut initial</span>
            <select className={inputClass} name="status">
              <option value="PENDING_SUBMISSION">Programmé</option>
              <option value="SUBMITTED">Envoyé banque</option>
              <option value="CONFIRMED">Confirmé</option>
            </select>
          </label>

          <label className="payment-form-field">
            <span>Libellé</span>
            <input
              className={inputClass}
              name="description"
              placeholder="Contrat entretien annuel CVC"
            />
          </label>
        </div>

        <div className="payment-new-footer">
          <p
            className={
              submitState.status === "error"
                ? "payment-new-message-error"
                : "payment-new-message"
            }
          >
            {submitState.message ||
              (mandates.length
                ? "Vérifiez la date et enregistrez."
                : "Aucun mandat SEPA actif disponible.")}
          </p>
          {!mandates.length ? (
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/contracts"
            >
              Créer un mandat depuis un contrat
            </a>
          ) : null}
          <button
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
          >
            {submitState.status === "loading" ? "Enregistrement..." : "Enregistrer paiement"}
          </button>
        </div>
      </section>

      <aside className="payment-new-preview rounded-lg border p-5 shadow-sm">
        <p>Lecture cash</p>
        <h3>{selectedMandate?.label ?? "Aucun mandat actif"}</h3>
        <dl>
          <div>
            <dt>Montant à encaisser</dt>
            <dd>{formatPaymentEuro(selectedAmount)}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>SEPA</dd>
          </div>
          <div>
            <dt>Statut de départ</dt>
            <dd>Programmé</dd>
          </div>
        </dl>
        <span>
          Mode sandbox : aucun vrai prélèvement bancaire tant que GoCardless reste en test.
        </span>
      </aside>
    </form>
  );
}
