"use client";

import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";

type CustomerOption = {
  id: string;
  label: string;
};

type ContractFormProps = {
  customers: CustomerOption[];
  defaultStartDate: string;
  defaultEndDate: string;
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

export function ContractForm({
  customers,
  defaultStartDate,
  defaultEndDate,
}: ContractFormProps) {
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
      message: "Creation du contrat en cours...",
    });

    const response = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: payload.error || "Impossible de créer ce contrat.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Contrat créé. Retour aux contrats...",
    });
    form.reset();
    router.push("/contracts");
    router.refresh();
  }

  const disabled = submitState.status === "loading" || customers.length === 0;

  return (
    <form className="contract-form-shell mt-6" onSubmit={handleSubmit}>
      <FormSection
        description="Sélectionnez le donneur d’ordre ou créez une fiche client avant de signer."
        index="01"
        title="Client"
      >
        <label className="contract-form-field md:col-span-2">
          <span>Client rattaché</span>
          <select className={inputClass} name="customerId" required>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.label}
              </option>
            ))}
          </select>
        </label>
        <a
          className="premium-secondary-action self-end rounded-md px-4 py-3 text-center text-sm font-semibold"
          href="/customers/new"
        >
          Ajouter un client
        </a>
      </FormSection>

      <FormSection
        description="Renseignez les données techniques utiles aux visites, attestations et relances."
        index="02"
        title="Installation CVC"
      >
        <label className="contract-form-field">
          <span>Type</span>
          <select className={inputClass} name="equipmentType">
            <option value="HEAT_PUMP_AIR_WATER">PAC air/eau</option>
            <option value="HEAT_PUMP_AIR_AIR">PAC air/air</option>
            <option value="AC_REVERSIBLE">Clim réversible</option>
            <option value="BOILER_GAS">Chaudière gaz</option>
            <option value="BOILER_OIL">Chaudière fioul</option>
            <option value="VMC">VMC</option>
            <option value="OTHER">Autre</option>
          </select>
        </label>
        <label className="contract-form-field">
          <span>Marque</span>
          <input className={inputClass} name="brand" placeholder="Atlantic" />
        </label>
        <label className="contract-form-field">
          <span>Modèle</span>
          <input className={inputClass} name="model" placeholder="Alfea Extensa" />
        </label>
        <label className="contract-form-field">
          <span>Puissance kW</span>
          <input
            className={inputClass}
            inputMode="decimal"
            name="powerKw"
            placeholder="8"
          />
        </label>
        <label className="contract-form-field">
          <span>Numéro de série</span>
          <input className={inputClass} name="serialNumber" placeholder="SN-2026-001" />
        </label>
        <label className="contract-form-field">
          <span>Emplacement</span>
          <input className={inputClass} name="location" placeholder="Garage" />
        </label>
      </FormSection>

      <FormSection
        description="Fixez la période contractuelle, le mode de paiement et le prix TTC annuel."
        index="03"
        title="Contrat annuel"
      >
        <label className="contract-form-field">
          <span>Début</span>
          <input
            className={inputClass}
            defaultValue={defaultStartDate}
            name="startDate"
            required
            type="date"
          />
        </label>
        <label className="contract-form-field">
          <span>Échéance</span>
          <input
            className={inputClass}
            defaultValue={defaultEndDate}
            name="endDate"
            required
            type="date"
          />
        </label>
        <label className="contract-form-field">
          <span>Paiement</span>
          <select className={inputClass} name="paymentMethod">
            <option value="SEPA">SEPA</option>
            <option value="BANK_TRANSFER">Virement</option>
            <option value="CHECK">Chèque</option>
            <option value="CASH">Espèces</option>
          </select>
        </label>
        <label className="contract-form-field">
          <span>Prix TTC annuel</span>
          <input
            className={inputClass}
            inputMode="decimal"
            name="priceTtc"
            placeholder="289"
            required
          />
        </label>
        <label className="contract-form-field">
          <span>TVA %</span>
          <input
            className={inputClass}
            defaultValue="20"
            inputMode="decimal"
            name="vatRate"
            required
          />
        </label>
        <label className="contract-form-field md:col-span-3">
          <span>Notes contrat</span>
          <textarea
            className="contract-form-input min-h-28 py-3"
            name="notes"
            placeholder="Inclus, exclus, consignes de relance..."
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
            (customers.length
              ? "Le contrat crée une installation puis le contrat annuel rattaché."
              : "Ajoutez d’abord un client pour créer un contrat.")}
        </p>
        <button className="login-submit sm:max-w-64" disabled={disabled} type="submit">
          Enregistrer le contrat
        </button>
      </div>
    </form>
  );
}
