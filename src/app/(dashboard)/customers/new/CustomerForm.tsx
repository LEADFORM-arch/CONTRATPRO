"use client";

import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const inputClass = "contract-form-input";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

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
    <section className="contract-form-section customer-fast-section">
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

export function CustomerForm() {
  const router = useRouter();
  const [submitIntent, setSubmitIntent] = useState<"contract" | "customer">(
    "contract",
  );
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as
      | HTMLButtonElement
      | null;
    const intent = submitter?.value === "customer" ? "customer" : "contract";
    setSubmitIntent(intent);
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const equipmentMemo = text(formData.get("equipmentMemo"));
    const contractMemo = text(formData.get("contractMemo"));
    const notes = text(formData.get("notes"));
    const terrainNotes = [
      equipmentMemo ? `Equipement a rattacher : ${equipmentMemo}` : "",
      contractMemo ? `Contrat souhaite : ${contractMemo}` : "",
      notes,
    ].filter(Boolean);

    payload.notes = terrainNotes.join("\n\n");
    delete payload.equipmentMemo;
    delete payload.contractMemo;

    setSubmitState({
      status: "loading",
      message:
        intent === "contract"
          ? "Création du client, puis ouverture du contrat..."
          : "Création du client en cours...",
    });

    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string; id?: string };

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: result.error || "Impossible de creer ce client.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message:
        intent === "contract"
          ? "Client créé. Ouverture du contrat guidé..."
          : "Client créé. Ouverture du dossier...",
    });
    form.reset();
    router.push(
      result.id
        ? intent === "contract"
          ? `/contracts/quick?customerId=${result.id}`
          : `/customers/${result.id}`
        : "/customers",
    );
    router.refresh();
  }

  const disabled = submitState.status === "loading";

  return (
    <form className="contract-form-shell customer-fast-shell mt-6" onSubmit={handleSubmit}>
      <section className="customer-fast-summary" aria-label="Parcours client">
        <span>1 Client</span>
        <span>2 Équipement</span>
        <span>3 Créer contrat</span>
        <span>4 Encaisser</span>
      </section>

      <FormSection
        description="Le minimum pour retrouver le client et rappeler rapidement."
        index="01"
        title="Client reçu au téléphone"
      >
        <label className="contract-form-field md:col-span-2">
          <span>Nom client / société / foyer</span>
          <input
            className={inputClass}
            name="companyName"
            placeholder="Maison Lefèvre, SCI Bellecour, Cabinet Martin..."
            required
          />
        </label>
        <label className="contract-form-field">
          <span>Téléphone</span>
          <input
            className={inputClass}
            name="phone"
            placeholder="06 12 34 56 78"
            type="tel"
          />
        </label>
        <label className="contract-form-field">
          <span>Ville</span>
          <input className={inputClass} name="city" placeholder="Nantes" />
        </label>
        <label className="contract-form-field md:col-span-2">
          <span>Équipement à suivre</span>
          <input
            className={inputClass}
            name="equipmentMemo"
            placeholder="Chaudière gaz Saunier Duval, PAC air/eau..."
          />
        </label>
        <label className="contract-form-field">
          <span>Contrat prévu</span>
          <select
            className={inputClass}
            defaultValue="Entretien annuel - a chiffrer"
            name="contractMemo"
          >
            <option value="Entretien annuel - a chiffrer">Entretien annuel</option>
            <option value="Contrat chaudiere - 216 EUR TTC/an">Chaudière - 216 EUR/an</option>
            <option value="Contrat PAC - 289 EUR TTC/an">PAC - 289 EUR/an</option>
            <option value="Contrat clim - 198 EUR TTC/an">Clim - 198 EUR/an</option>
          </select>
        </label>
      </FormSection>

      <details className="customer-advanced-details">
        <summary>Ajouter email, adresse et notes si disponibles</summary>
        <div className="contract-form-grid mt-4">
          <label className="contract-form-field">
            <span>Prenom</span>
            <input className={inputClass} name="firstName" placeholder="Claire" />
          </label>
          <label className="contract-form-field">
            <span>Nom</span>
            <input className={inputClass} name="lastName" placeholder="Lefevre" />
          </label>
          <label className="contract-form-field">
            <span>Email</span>
            <input
              className={inputClass}
              name="email"
              placeholder="client@example.fr"
              type="email"
            />
          </label>
          <label className="contract-form-field md:col-span-2">
            <span>Adresse</span>
            <input
              className={inputClass}
              name="address"
              placeholder="12 rue des Acacias"
            />
          </label>
          <label className="contract-form-field">
            <span>Code postal</span>
            <input className={inputClass} name="zipCode" placeholder="44000" />
          </label>
          <label className="contract-form-field md:col-span-3">
            <span>Notes internes</span>
            <textarea
              className="contract-form-input min-h-28 py-3"
              name="notes"
              placeholder="Acces, preference horaire, interlocuteur..."
            />
          </label>
        </div>
      </details>

      <div className="contract-form-footer">
        <p
          className={
            submitState.status === "error"
              ? "contract-form-message-error"
              : "contract-form-message"
          }
        >
          {submitState.message ||
            "Nom, téléphone, ville, équipement : assez pour créer le contrat."}
        </p>
        <div className="customer-submit-actions">
          <button
            className="login-submit"
            disabled={disabled}
            onClick={() => setSubmitIntent("contract")}
            type="submit"
            value="contract"
          >
            {submitState.status === "loading" && submitIntent === "contract"
              ? "Ouverture..."
              : "Enregistrer + créer contrat"}
          </button>
          <button
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            disabled={disabled}
            onClick={() => setSubmitIntent("customer")}
            type="submit"
            value="customer"
          >
            Juste enregistrer
          </button>
        </div>
      </div>
    </form>
  );
}
