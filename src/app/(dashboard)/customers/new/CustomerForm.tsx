"use client";

import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";

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

    setSubmitState({
      status: "loading",
      message: "Creation du client en cours...",
    });

    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: payload.error || "Impossible de créer ce client.",
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: "Client créé. Retour à la base clients...",
    });
    form.reset();
    router.push("/customers");
    router.refresh();
  }

  const disabled = submitState.status === "loading";

  return (
    <form className="contract-form-shell mt-6" onSubmit={handleSubmit}>
      <FormSection
        description="Identifiez le foyer, la SCI ou l’entreprise à rattacher au portefeuille."
        index="01"
        title="Identité"
      >
        <label className="contract-form-field md:col-span-3">
          <span>Société ou foyer</span>
          <input
            className={inputClass}
            name="companyName"
            placeholder="Maison Lefevre, SCI Bellecour..."
          />
        </label>
        <label className="contract-form-field">
          <span>Prénom</span>
          <input className={inputClass} name="firstName" placeholder="Claire" />
        </label>
        <label className="contract-form-field">
          <span>Nom</span>
          <input className={inputClass} name="lastName" placeholder="Lefevre" />
        </label>
      </FormSection>

      <FormSection
        description="Ajoutez les coordonnées qui serviront aux relances et confirmations de visite."
        index="02"
        title="Contact"
      >
        <label className="contract-form-field">
          <span>Téléphone</span>
          <input
            className={inputClass}
            name="phone"
            placeholder="06 12 34 56 78"
            type="tel"
          />
        </label>
        <label className="contract-form-field md:col-span-2">
          <span>Email</span>
          <input
            className={inputClass}
            name="email"
            placeholder="client@example.fr"
            type="email"
          />
        </label>
      </FormSection>

      <FormSection
        description="Localisez le site d’intervention pour préparer les futures visites."
        index="03"
        title="Adresse et notes"
      >
        <label className="contract-form-field md:col-span-3">
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
        <label className="contract-form-field md:col-span-2">
          <span>Ville</span>
          <input className={inputClass} name="city" placeholder="Nantes" />
        </label>
        <label className="contract-form-field md:col-span-3">
          <span>Notes internes</span>
          <textarea
            className="contract-form-input min-h-28 py-3"
            name="notes"
            placeholder="Accès, préférence horaire, interlocuteur..."
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
            "Le nom de société ou prénom + nom suffit pour démarrer."}
        </p>
        <button className="login-submit sm:max-w-64" disabled={disabled} type="submit">
          Enregistrer le client
        </button>
      </div>
    </form>
  );
}
