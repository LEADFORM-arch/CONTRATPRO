"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type ContractOption = {
  amountHt: number;
  amountTtc: number;
  id: string;
  label: string;
  vatRate: number;
};

type InvoiceFormProps = {
  contracts: ContractOption[];
  defaultDueDate: string;
  defaultIssueDate: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-emerald-700";

function invoiceNumber() {
  const now = new Date();
  return `FAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function InvoiceForm({
  contracts,
  defaultDueDate,
  defaultIssueDate,
}: InvoiceFormProps) {
  const router = useRouter();
  const [selectedContractId, setSelectedContractId] = useState(contracts[0]?.id ?? "");
  const [amountTtc, setAmountTtc] = useState(String(contracts[0]?.amountTtc ?? ""));
  const [vatRate, setVatRate] = useState(String(contracts[0]?.vatRate ?? 10));
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });
  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.id === selectedContractId),
    [contracts, selectedContractId],
  );

  function selectContract(contractId: string) {
    const contract = contracts.find((item) => item.id === contractId);
    setSelectedContractId(contractId);
    setAmountTtc(String(contract?.amountTtc ?? ""));
    setVatRate(String(contract?.vatRate ?? 10));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState({
      status: "loading",
      message: "Creation de la facture...",
    });

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json()) as { error?: string; id?: string };

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: payload.error || "Impossible de creer cette facture.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Facture creee. Ouverture de la facture...",
    });
    router.push(`/invoices/${payload.id}`);
    router.refresh();
  }

  const disabled = submitState.status === "loading" || contracts.length === 0;

  return (
    <form
      className="mt-6 max-w-5xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2">
          Contrat facture
          <select
            className={inputClass}
            name="contractId"
            onChange={(event) => selectContract(event.target.value)}
            required
            value={selectedContractId}
          >
            {contracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Numero
          <input
            className={inputClass}
            defaultValue={invoiceNumber()}
            name="number"
            placeholder="FAC-2026-0001"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Statut initial
          <select className={inputClass} name="status">
            <option value="DRAFT">Brouillon</option>
            <option value="SENT">Envoyee</option>
            <option value="PAID">Payee</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Date emission
          <input
            className={inputClass}
            defaultValue={defaultIssueDate}
            name="issueDate"
            required
            type="date"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Echeance paiement
          <input
            className={inputClass}
            defaultValue={defaultDueDate}
            name="dueDate"
            required
            type="date"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Montant TTC
          <input
            className={inputClass}
            inputMode="decimal"
            name="amountTtc"
            onChange={(event) => setAmountTtc(event.target.value)}
            required
            value={amountTtc}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          TVA %
          <input
            className={inputClass}
            inputMode="decimal"
            name="vatRate"
            onChange={(event) => setVatRate(event.target.value)}
            required
            value={vatRate}
          />
        </label>
      </div>

      <div className="mt-5 rounded-md bg-zinc-50 p-4 text-sm text-zinc-600">
        {selectedContract
          ? "Les montants sont repris du contrat, puis recalcules cote serveur pour garder une base fiable."
          : "Aucun contrat disponible pour generer une facture."}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm ${
            submitState.status === "error" ? "text-red-700" : "text-zinc-600"
          }`}
        >
          {submitState.message}
        </p>
        <button
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={disabled}
          type="submit"
        >
          Creer facture
        </button>
      </div>
    </form>
  );
}
