"use client";

import { FormEvent, useState } from "react";

type QuickContractFormProps = {
  defaultEndDate: string;
  defaultStartDate: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; contractId: string; customerId: string; message: string }
  | { status: "error"; message: string };

const inputClass = "contract-form-input";

export function QuickContractForm({
  defaultEndDate,
  defaultStartDate,
}: QuickContractFormProps) {
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
      message: "Mise en portefeuille du contrat...",
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
        message: payload.error || "Impossible de creer ce contrat rapide.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      contractId: payload.id,
      customerId: payload.customerId,
      message: "Contrat cree. Le dossier est pret pour facture ou SEPA plus tard.",
    });
  }

  const disabled = submitState.status === "loading";

  return (
    <form className="quick-contract-shell mt-6" onSubmit={handleSubmit}>
      <input defaultValue={defaultStartDate} name="startDate" type="hidden" />
      <input defaultValue={defaultEndDate} name="endDate" type="hidden" />
      <input defaultValue="20" name="vatRate" type="hidden" />

      <section className="quick-contract-main">
        <div className="quick-contract-strip">
          <span>01 Client</span>
          <span>02 Chaudiere / PAC</span>
          <span>03 Tarif</span>
        </div>

        <div className="quick-contract-grid">
          <label className="contract-form-field md:col-span-2">
            <span>Client ou foyer</span>
            <input
              autoComplete="organization"
              className={inputClass}
              name="customerName"
              placeholder="M. Martin, Maison Martin, SCI du Centre..."
              required
            />
          </label>
          <label className="contract-form-field">
            <span>Ville</span>
            <input
              autoComplete="address-level2"
              className={inputClass}
              name="customerCity"
              placeholder="Nantes"
            />
          </label>
          <label className="contract-form-field">
            <span>Email client</span>
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
            <span>Telephone</span>
            <input
              autoComplete="tel"
              className={inputClass}
              name="customerPhone"
              placeholder="06 12 34 56 78"
              type="tel"
            />
          </label>
          <label className="contract-form-field">
            <span>Equipement</span>
            <select className={inputClass} name="equipmentType">
              <option value="BOILER_GAS">Chaudiere gaz</option>
              <option value="BOILER_OIL">Chaudiere fioul</option>
              <option value="HEAT_PUMP_AIR_WATER">PAC air/eau</option>
              <option value="HEAT_PUMP_AIR_AIR">PAC air/air</option>
              <option value="AC_REVERSIBLE">Clim reversible</option>
              <option value="VMC">VMC</option>
              <option value="OTHER">Autre</option>
            </select>
          </label>
          <label className="contract-form-field">
            <span>Marque</span>
            <input className={inputClass} name="brand" placeholder="Saunier Duval" />
          </label>
          <label className="contract-form-field">
            <span>Modele</span>
            <input className={inputClass} name="model" placeholder="ThemaPlus" />
          </label>
          <label className="contract-form-field">
            <span>Emplacement</span>
            <input className={inputClass} name="location" placeholder="Garage" />
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
        </div>
      </section>

      <aside className="quick-contract-side">
        <p>Mode rapide</p>
        <h3>5 minutes pour rendre le contrat exploitable.</h3>
        <ul>
          <li>Client, installation et contrat annuel crees ensemble.</li>
          <li>Echeance annuelle calculee automatiquement.</li>
          <li>Paiement marque SEPA, mandat a preparer plus tard.</li>
        </ul>
        <div className="quick-contract-sepa-note">
          <span>SEPA</span>
          <strong>Pas de prelevement lance ici.</strong>
          <small>Le mandat GoCardless restera une etape separee.</small>
        </div>
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
        <button className="login-submit sm:max-w-64" disabled={disabled} type="submit">
          {disabled ? "Creation..." : "Creer contrat rapide"}
        </button>
      </div>

      {submitState.status === "success" ? (
        <section className="quick-contract-success" aria-live="polite">
          <div>
            <p>Contrat actif</p>
            <h3>Le portefeuille est alimente.</h3>
            <span>Choisissez la prochaine action sans retourner dans les menus.</span>
          </div>
          <div className="quick-contract-success-actions">
            <a className="premium-action rounded-md text-sm font-semibold" href={`/contracts/${submitState.contractId}`}>
              Voir contrat
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href={`/invoices/new?contractId=${submitState.contractId}`}>
              Creer facture
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/payments/new">
              Preparer SEPA plus tard
            </a>
          </div>
        </section>
      ) : null}
    </form>
  );
}
