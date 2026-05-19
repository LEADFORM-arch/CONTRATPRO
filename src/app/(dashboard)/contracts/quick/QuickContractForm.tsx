"use client";

import { FormEvent, useMemo, useState } from "react";

type QuickContractFormProps = {
  defaultEndDate: string;
  defaultStartDate: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | {
      status: "success";
      authorisationUrl?: string;
      contractId: string;
      customerId: string;
      message: string;
    }
  | { status: "error"; message: string };

type FormSnapshot = {
  brand: string;
  contactName: string;
  customerName: string;
  equipmentType: string;
  model: string;
  paymentMethod: string;
  priceTtc: string;
  vatRate: string;
};

const inputClass = "contract-form-input";

const equipmentLabels: Record<string, string> = {
  AC_REVERSIBLE: "Clim réversible",
  BOILER_GAS: "Chaudière gaz",
  BOILER_OIL: "Chaudière fioul",
  HEAT_PUMP_AIR_AIR: "PAC air/air",
  HEAT_PUMP_AIR_WATER: "PAC air/eau",
  OTHER: "Autre équipement",
  VMC: "VMC",
};

function formValue(form: HTMLFormElement, name: string) {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value : "";
}

function submitIntent(event: FormEvent<HTMLFormElement>) {
  const nativeEvent = event.nativeEvent as SubmitEvent;
  const submitter = nativeEvent.submitter;
  return submitter instanceof HTMLButtonElement ? submitter.value : "create";
}

export function QuickContractForm({
  defaultEndDate,
  defaultStartDate,
}: QuickContractFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });
  const [snapshot, setSnapshot] = useState<FormSnapshot>({
    brand: "",
    contactName: "",
    customerName: "",
    equipmentType: "BOILER_GAS",
    model: "",
    paymentMethod: "SEPA",
    priceTtc: "",
    vatRate: "20",
  });

  const summary = useMemo(() => {
    const equipment = [
      equipmentLabels[snapshot.equipmentType] ?? "Equipement CVC",
      snapshot.brand,
      snapshot.model,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      contact: snapshot.contactName || snapshot.customerName || "Client à renseigner",
      contract: snapshot.priceTtc ? `${snapshot.priceTtc} EUR TTC / an` : "Tarif à renseigner",
      equipment: equipment || "Équipement à renseigner",
      payment:
        snapshot.paymentMethod === "SEPA"
          ? "Prélèvement SEPA"
          : snapshot.paymentMethod === "BANK_TRANSFER"
            ? "Virement"
            : "Chèque",
    };
  }, [snapshot]);
  const groupStates = {
    client: snapshot.customerName ? "ready" : "pending",
    contract: snapshot.priceTtc ? "ready" : "pending",
    equipment: snapshot.brand || snapshot.model ? "ready" : "pending",
    payment: snapshot.paymentMethod === "SEPA" ? "sepa" : "manual",
  };

  function refreshSnapshot(form: HTMLFormElement) {
    setSnapshot({
      brand: formValue(form, "brand"),
      contactName: [formValue(form, "contactFirstName"), formValue(form, "contactLastName")]
        .filter(Boolean)
        .join(" "),
      customerName: formValue(form, "customerName"),
      equipmentType: formValue(form, "equipmentType") || "BOILER_GAS",
      model: formValue(form, "model"),
      paymentMethod: formValue(form, "paymentMethod") || "SEPA",
      priceTtc: formValue(form, "priceTtc"),
      vatRate: formValue(form, "vatRate") || "20",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const intent = submitIntent(event);

    setSubmitState({
      status: "loading",
      message:
        intent === "create-and-sign"
          ? "Création du contrat puis préparation du lien de prélèvement..."
          : "Mise en portefeuille du contrat...",
    });

    const response = await fetch("/api/contracts/quick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json()) as {
      customerId?: string;
      error?: string;
      id?: string;
    };

    if (!response.ok || !payload.id || !payload.customerId) {
      setSubmitState({
        status: "error",
        message: payload.error || "Impossible de créer ce contrat rapide.",
      });
      return;
    }

    if (intent === "create-and-sign" && formData.get("paymentMethod") === "SEPA") {
      const mandateResponse = await fetch(
        `/api/contracts/${payload.id}/mandate/authorisation`,
        {
          method: "POST",
        },
      );
      const mandatePayload = (await mandateResponse.json().catch(() => null)) as
        | { authorisationUrl?: string; error?: string }
        | null;

      if (!mandateResponse.ok || !mandatePayload?.authorisationUrl) {
        setSubmitState({
          status: "success",
          contractId: payload.id,
          customerId: payload.customerId,
          message:
            mandatePayload?.error ||
            "Contrat créé. Le lien de prélèvement pourra être repris depuis la fiche contrat.",
        });
        return;
      }

      setSubmitState({
        status: "success",
        authorisationUrl: mandatePayload.authorisationUrl,
        contractId: payload.id,
        customerId: payload.customerId,
        message:
          "Contrat créé. Le lien de signature SEPA est prêt pour le client.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      contractId: payload.id,
      customerId: payload.customerId,
      message: "Contrat créé. Le dossier est prêt pour facture ou paiement.",
    });
  }

  const disabled = submitState.status === "loading";
  const sepaSelected = snapshot.paymentMethod === "SEPA";

  return (
    <form
      className="quick-contract-shell mt-6"
      onChange={(event) => refreshSnapshot(event.currentTarget)}
      onInput={(event) => refreshSnapshot(event.currentTarget)}
      onSubmit={handleSubmit}
    >
      <input defaultValue={defaultStartDate} name="startDate" type="hidden" />
      <input defaultValue={defaultEndDate} name="endDate" type="hidden" />

      <section className="quick-contract-main">
        <div className="quick-contract-strip">
          <span>1 Client</span>
          <span>2 Équipement</span>
          <span>3 Contrat</span>
          <span>4 Paiement</span>
          <span>5 Validation</span>
        </div>

        <section className="quick-contract-group" data-accent="emerald" data-state={groupStates.client}>
          <div className="quick-contract-group-number">1</div>
          <div className="quick-contract-group-body">
            <div className="quick-contract-group-title">
              <h3>Client</h3>
              <p>Qui paie le contrat ?</p>
            </div>
            <div className="quick-contract-grid">
              <label className="contract-form-field md:col-span-2">
                <span>Nom / société</span>
                <input
                  autoComplete="organization"
                  className={inputClass}
                  name="customerName"
                  placeholder="Martin Depannage Chauffage"
                  required
                />
              </label>
              <label className="contract-form-field">
                <span>Prénom</span>
                <input
                  autoComplete="given-name"
                  className={inputClass}
                  name="contactFirstName"
                  placeholder="Paul"
                />
              </label>
              <label className="contract-form-field">
                <span>Nom contact</span>
                <input
                  autoComplete="family-name"
                  className={inputClass}
                  name="contactLastName"
                  placeholder="Martin"
                />
              </label>
              <label className="contract-form-field">
                <span>Email</span>
                <input
                  autoComplete="email"
                  className={inputClass}
                  name="customerEmail"
                  placeholder="client@example.fr"
                  required
                  type="email"
                />
              </label>
              <label className="contract-form-field">
                <span>Téléphone</span>
                <input
                  autoComplete="tel"
                  className={inputClass}
                  name="customerPhone"
                  placeholder="06 12 34 56 78"
                  type="tel"
                />
              </label>
              <label className="contract-form-field md:col-span-2">
                <span>Adresse</span>
                <input
                  autoComplete="street-address"
                  className={inputClass}
                  name="customerAddress"
                  placeholder="18 rue des Lilas"
                />
              </label>
              <label className="contract-form-field">
                <span>Code postal</span>
                <input
                  autoComplete="postal-code"
                  className={inputClass}
                  name="customerZipCode"
                  placeholder="31000"
                />
              </label>
              <label className="contract-form-field">
                <span>Ville</span>
                <input
                  autoComplete="address-level2"
                  className={inputClass}
                  name="customerCity"
                  placeholder="Toulouse"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="quick-contract-group" data-accent="cyan" data-state={groupStates.equipment}>
          <div className="quick-contract-group-number">2</div>
          <div className="quick-contract-group-body">
            <div className="quick-contract-group-title">
              <h3>Équipement</h3>
              <p>Sur quoi porte l'entretien ?</p>
            </div>
            <div className="quick-contract-grid">
              <label className="contract-form-field">
                <span>Type</span>
                <select className={inputClass} defaultValue="BOILER_GAS" name="equipmentType">
                  <option value="BOILER_GAS">Chaudière gaz</option>
                  <option value="BOILER_OIL">Chaudière fioul</option>
                  <option value="HEAT_PUMP_AIR_WATER">PAC air/eau</option>
                  <option value="HEAT_PUMP_AIR_AIR">PAC air/air</option>
                  <option value="AC_REVERSIBLE">Clim réversible</option>
                  <option value="VMC">VMC</option>
                  <option value="OTHER">Autre</option>
                </select>
              </label>
              <label className="contract-form-field">
                <span>Marque</span>
                <input className={inputClass} name="brand" placeholder="Saunier Duval" />
              </label>
              <label className="contract-form-field">
                <span>Modèle</span>
                <input className={inputClass} name="model" placeholder="ThemaPlus Condens F25" />
              </label>
              <label className="contract-form-field">
                <span>Puissance</span>
                <input className={inputClass} inputMode="decimal" name="powerKw" placeholder="25" />
              </label>
              <label className="contract-form-field">
                <span>Emplacement</span>
                <input className={inputClass} name="location" placeholder="Cuisine" />
              </label>
              <label className="contract-form-field">
                <span>N° de série</span>
                <input className={inputClass} name="serialNumber" placeholder="SD-F25-TEST-2026" />
              </label>
            </div>
          </div>
        </section>

        <section className="quick-contract-group" data-accent="amber" data-state={groupStates.contract}>
          <div className="quick-contract-group-number">3</div>
          <div className="quick-contract-group-body">
            <div className="quick-contract-group-title">
              <h3>Contrat</h3>
              <p>Quelle prestation est vendue ?</p>
            </div>
            <div className="quick-contract-grid">
              <label className="contract-form-field">
                <span>Début</span>
                <input className={inputClass} defaultValue={defaultStartDate} name="visibleStartDate" type="date" />
              </label>
              <label className="contract-form-field">
                <span>Duree</span>
                <select className={inputClass} defaultValue="12" name="durationMonths">
                  <option value="12">12 mois</option>
                  <option value="24">24 mois</option>
                  <option value="36">36 mois</option>
                </select>
              </label>
              <label className="contract-form-field">
                <span>Prix annuel TTC</span>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  name="priceTtc"
                  placeholder="216"
                  required
                />
              </label>
              <label className="contract-form-field">
                <span>TVA</span>
                <select className={inputClass} defaultValue="20" name="vatRate">
                  <option value="20">20%</option>
                  <option value="10">10%</option>
                  <option value="5.5">5,5%</option>
                  <option value="0">0%</option>
                </select>
              </label>
              <label className="contract-form-field md:col-span-2">
                <span>Note visible dossier</span>
                <input
                  className={inputClass}
                  name="contractNotes"
                  placeholder="Entretien annuel chaudière gaz avec attestation après visite"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="quick-contract-group" data-accent="green" data-state={groupStates.payment}>
          <div className="quick-contract-group-number">4</div>
          <div className="quick-contract-group-body">
            <div className="quick-contract-group-title">
              <h3>Paiement</h3>
              <p>Comment le client va payer ?</p>
            </div>
            <div className="quick-payment-options" role="radiogroup" aria-label="Mode de paiement">
              <label className="quick-payment-option">
                <input defaultChecked name="paymentMethod" type="radio" value="SEPA" />
                <span>Prélèvement SEPA</span>
                <small>ContratPro prépare le lien de signature.</small>
              </label>
              <label className="quick-payment-option">
                <input name="paymentMethod" type="radio" value="BANK_TRANSFER" />
                <span>Virement</span>
                <small>Le contrat est créé sans mandat.</small>
              </label>
              <label className="quick-payment-option">
                <input name="paymentMethod" type="radio" value="CHECK" />
                <span>Chèque</span>
                <small>Suivi manuel, utile en transition.</small>
              </label>
            </div>
            <div className="quick-contract-human-status" data-active={sepaSelected}>
              <span>{sepaSelected ? "À faire signer" : "Pas de mandat SEPA"}</span>
              <p>
                {sepaSelected
                  ? "Le client recevra ou ouvrira un lien sécurisé GoCardless. Les IDs techniques restent cachés."
                  : "Le paiement sera noté sur le contrat, sans prélèvement automatique."}
              </p>
            </div>
          </div>
        </section>

        <section className="quick-contract-group" data-accent="blue" data-state="review">
          <div className="quick-contract-group-number">5</div>
          <div className="quick-contract-group-body">
            <div className="quick-contract-group-title">
              <h3>Validation</h3>
              <p>Dernière vérification avant création.</p>
            </div>
            <div className="quick-contract-summary">
              <div>
                <span>Client</span>
                <strong>{summary.contact}</strong>
              </div>
              <div>
                <span>Équipement</span>
                <strong>{summary.equipment}</strong>
              </div>
              <div>
                <span>Contrat</span>
                <strong>{summary.contract}</strong>
              </div>
              <div>
                <span>Paiement</span>
                <strong>{summary.payment}</strong>
              </div>
            </div>
          </div>
        </section>
      </section>

      <aside className="quick-contract-side">
        <p>Nouveau contrat guide</p>
        <h3>Comme une fiche papier, mais exploitable tout de suite.</h3>
        <div className="quick-contract-side-summary" aria-label="Resume du contrat">
          <div>
            <span>Client</span>
            <strong>{summary.contact}</strong>
          </div>
          <div>
            <span>Équipement</span>
            <strong>{summary.equipment}</strong>
          </div>
          <div>
            <span>Contrat</span>
            <strong>{summary.contract}</strong>
          </div>
          <div>
            <span>Paiement</span>
            <strong>{summary.payment}</strong>
          </div>
        </div>
        <div className="quick-contract-sepa-note">
          <span>Statut client</span>
          <strong>{sepaSelected ? "Prélèvement à faire signer" : "Paiement manuel"}</strong>
          <small>
            {sepaSelected
              ? "Le client voit GoCardless, le chauffagiste voit seulement le statut."
              : "Aucun lien bancaire n’est créé pour ce mode de paiement."}
          </small>
        </div>
        <a className="quick-contract-import-card" href="/import">
          <span>Fichier Excel</span>
          <strong>Importer plusieurs clients</strong>
          <small>
            CSV ou XLSX, simulation d’abord, création seulement après validation.
          </small>
        </a>
      </aside>

      <div className="contract-form-footer quick-contract-footer">
        <p
          className={
            submitState.status === "error"
              ? "contract-form-message-error"
              : "contract-form-message"
          }
        >
          {submitState.message ||
            "Saisissez le minimum terrain. Vous pourrez enrichir le dossier ensuite."}
        </p>
        <div className="quick-contract-submit-actions">
          <button
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            name="intent"
            type="submit"
            value="create"
          >
            {disabled ? "Création..." : "Créer le contrat"}
          </button>
          <button
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled || !sepaSelected}
            name="intent"
            type="submit"
            value="create-and-sign"
          >
            {disabled ? "Préparation..." : "Créer et faire signer"}
          </button>
        </div>
      </div>

      {submitState.status === "success" ? (
        <section className="quick-contract-success" aria-live="polite">
          <div>
            <p>Contrat actif</p>
            <h3>
              {submitState.authorisationUrl
                ? "Le lien de prélèvement est prêt."
                : "Le portefeuille est alimenté."}
            </h3>
            <span>{submitState.message}</span>
          </div>
          <div className="quick-contract-success-actions">
            {submitState.authorisationUrl ? (
              <a className="premium-action rounded-md text-sm font-semibold" href={submitState.authorisationUrl} rel="noreferrer" target="_blank">
                Ouvrir signature
              </a>
            ) : null}
            <a className="premium-action rounded-md text-sm font-semibold" href={`/contracts/${submitState.contractId}`}>
              Voir contrat
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href={`/invoices/new?contractId=${submitState.contractId}`}>
              Créer facture
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/payments/new">
              Paiements
            </a>
          </div>
        </section>
      ) : null}
    </form>
  );
}
