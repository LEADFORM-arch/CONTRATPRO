"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
  "rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-emerald-700";

export function PaymentForm({ defaultChargeDate, mandates }: PaymentFormProps) {
  const router = useRouter();
  const [selectedMandateId, setSelectedMandateId] = useState(mandates[0]?.id ?? "");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });
  const selectedMandate = mandates.find((mandate) => mandate.id === selectedMandateId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState({
      status: "loading",
      message: "Creation du prelevement...",
    });

    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: payload.error || "Impossible de creer ce paiement.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Prelevement cree. Retour aux paiements...",
    });
    form.reset();
    router.push("/payments");
    router.refresh();
  }

  const disabled = submitState.status === "loading" || mandates.length === 0;

  return (
    <form
      className="mt-6 max-w-5xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2">
          Mandat actif
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

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Montant TTC
          <input
            className={inputClass}
            inputMode="decimal"
            name="amount"
            required
            value={selectedMandate?.amount || ""}
            readOnly
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Date d'encaissement
          <input
            className={inputClass}
            defaultValue={defaultChargeDate}
            name="chargeDate"
            required
            type="date"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Statut initial
          <select className={inputClass} name="status">
            <option value="PENDING_SUBMISSION">Programme</option>
            <option value="SUBMITTED">Envoye banque</option>
            <option value="CONFIRMED">Confirme</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2">
          Libelle
          <input
            className={inputClass}
            name="description"
            placeholder="Contrat entretien annuel CVC"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm ${
            submitState.status === "error" ? "text-red-700" : "text-zinc-600"
          }`}
        >
          {submitState.message ||
            (mandates.length
              ? "Le paiement reste interne tant que le prestataire SEPA n'est pas branche."
              : "Aucun mandat SEPA actif disponible.")}
        </p>
        <button
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={disabled}
          type="submit"
        >
          Enregistrer paiement
        </button>
      </div>
    </form>
  );
}
