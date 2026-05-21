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
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
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
      message: "Creation du client en cours...",
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
      message: "Client cree. Ouverture du dossier...",
    });
    form.reset();
    router.push(result.id ? `/customers/${result.id}` : "/customers");
    router.refresh();
  }

  const disabled = submitState.status === "loading";

  return (
    <form className="contract-form-shell customer-fast-shell mt-6" onSubmit={handleSubmit}>
      <section className="customer-fast-summary" aria-label="Parcours client">
        <span>1 Client</span>
        <span>2 Equipement</span>
        <span>3 Contrat</span>
        <span>4 Dossier</span>
      </section>

      <FormSection
        description="Le minimum pour retrouver le client et rappeler rapidement."
        index="01"
        title="Client recu au telephone"
      >
        <label className="contract-form-field md:col-span-2">
          <span>Nom client / societe / foyer</span>
          <input
            className={inputClass}
            name="companyName"
            placeholder="Maison Lefevre, SCI Bellecour, Cabinet Martin..."
            required
          />
        </label>
        <label className="contract-form-field">
          <span>Telephone</span>
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
          <span>Equipement a suivre</span>
          <input
            className={inputClass}
            name="equipmentMemo"
            placeholder="Chaudiere gaz Saunier Duval, PAC air/eau..."
          />
        </label>
        <label className="contract-form-field">
          <span>Contrat prevu</span>
          <select
            className={inputClass}
            defaultValue="Entretien annuel - a chiffrer"
            name="contractMemo"
          >
            <option value="Entretien annuel - a chiffrer">Entretien annuel</option>
            <option value="Contrat chaudiere - 216 EUR TTC/an">Chaudiere - 216 EUR/an</option>
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
            "Nom, telephone, ville, equipement : assez pour ouvrir le dossier."}
        </p>
        <button className="login-submit sm:max-w-64" disabled={disabled} type="submit">
          Enregistrer le client
        </button>
      </div>
    </form>
  );
}
