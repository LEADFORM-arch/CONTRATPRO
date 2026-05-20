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
  initialContractId?: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputClass =
  "invoice-form-input";

function invoiceNumber() {
  const now = new Date();
  return `FAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

function formatInvoiceEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number.isFinite(value) ? value : 0);
}

export function InvoiceForm({
  contracts,
  defaultDueDate,
  defaultIssueDate,
  initialContractId,
}: InvoiceFormProps) {
  const router = useRouter();
  const initialContract =
    contracts.find((contract) => contract.id === initialContractId) ?? contracts[0];
  const [selectedContractId, setSelectedContractId] = useState(initialContract?.id ?? "");
  const [amountTtc, setAmountTtc] = useState(String(initialContract?.amountTtc ?? ""));
  const [vatRate, setVatRate] = useState(String(initialContract?.vatRate ?? 10));
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });
  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.id === selectedContractId),
    [contracts, selectedContractId],
  );
  const preview = useMemo(() => {
    const total = Number.parseFloat(amountTtc.replace(",", ".")) || 0;
    const vat = Number.parseFloat(vatRate.replace(",", ".")) || 0;
    const amountHt = vat > -100 ? total / (1 + vat / 100) : total;
    return {
      amountHt,
      total,
      vatAmount: total - amountHt,
    };
  }, [amountTtc, vatRate]);

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
      message: "Création de la facture...",
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
        message: payload.error || "Impossible de créer cette facture.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Facture créée. Ouverture de la facture...",
    });
    router.push(`/invoices/${payload.id}`);
    router.refresh();
  }

  const disabled = submitState.status === "loading" || contracts.length === 0;

  return (
    <form
      className="invoice-new-shell mt-6"
      onSubmit={handleSubmit}
    >
      <section className="invoice-new-form rounded-lg border p-5 shadow-sm">
        <div className="invoice-new-form-intro">
          <p>1. Contrat à facturer</p>
          <h3>Choisissez le contrat.</h3>
          <span>
            ContratPro reprend le client, l'équipement et le montant.
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="invoice-form-field md:col-span-2">
            <span>Contrat facturé</span>
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
        </div>

        <div className="invoice-step-band">2. Numero et dates</div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="invoice-form-field">
            <span>Numéro</span>
            <input
              className={inputClass}
              defaultValue={invoiceNumber()}
              name="number"
              placeholder="FAC-2026-0001"
            />
          </label>

          <label className="invoice-form-field">
            <span>Statut initial</span>
            <select className={inputClass} name="status">
              <option value="DRAFT">Brouillon</option>
              <option value="SENT">Envoyée</option>
              <option value="PAID">Payée</option>
            </select>
          </label>

          <label className="invoice-form-field">
            <span>Date d'émission</span>
            <input
              className={inputClass}
              defaultValue={defaultIssueDate}
              name="issueDate"
              required
              type="date"
            />
          </label>

          <label className="invoice-form-field">
            <span>Échéance paiement</span>
            <input
              className={inputClass}
              defaultValue={defaultDueDate}
              name="dueDate"
              required
              type="date"
            />
          </label>
        </div>

        <div className="invoice-step-band">3. Montant</div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="invoice-form-field">
            <span>Montant TTC</span>
            <input
              className={inputClass}
              inputMode="decimal"
              name="amountTtc"
              onChange={(event) => setAmountTtc(event.target.value)}
              required
              value={amountTtc}
            />
          </label>

          <label className="invoice-form-field">
            <span>TVA %</span>
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

        <div className="invoice-new-note">
          {selectedContract
            ? "Vérifiez seulement le montant avant de créer."
            : "Aucun contrat disponible pour générer une facture."}
        </div>

        <div className="invoice-new-footer">
          <p
            className={
              submitState.status === "error"
                ? "invoice-new-message-error"
                : "invoice-new-message"
            }
          >
            {submitState.message || "La facture sera ouverte juste après création pour PDF ou envoi email."}
          </p>
          <button
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
          >
            {submitState.status === "loading" ? "Création..." : "Créer facture"}
          </button>
        </div>
      </section>

      <aside className="invoice-new-preview rounded-lg border p-5 shadow-sm">
        <p>Prévisualisation rapide</p>
        <h3>{selectedContract?.label ?? "Aucun contrat sélectionné"}</h3>
        <dl>
          <div>
            <dt>Total TTC</dt>
            <dd>{formatInvoiceEuro(preview.total)}</dd>
          </div>
          <div>
            <dt>Base HT estimée</dt>
            <dd>{formatInvoiceEuro(preview.amountHt)}</dd>
          </div>
          <div>
            <dt>TVA estimée</dt>
            <dd>{formatInvoiceEuro(preview.vatAmount)}</dd>
          </div>
        </dl>
        <span>
          Le PDF final sera généré depuis la fiche facture avec les informations
          entreprise et client.
        </span>
      </aside>
    </form>
  );
}
