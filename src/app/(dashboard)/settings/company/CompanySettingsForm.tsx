"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type CompanyProfile = {
  address: string;
  city: string;
  email: string;
  name: string;
  phone: string;
  rgeNumber: string;
  siret: string;
  updatedAt: string;
  vatNumber: string;
  zipCode: string;
};

const inputClass =
  "settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm outline-none";

export function CompanySettingsForm({ profile }: { profile: CompanyProfile }) {
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/settings/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json()) as { error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Sauvegarde impossible.");
      return;
    }

    setStatus("Identité entreprise sauvegardée");
  }

  return (
    <form
      className="settings-form mt-6 rounded-lg border p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="settings-form-intro">
        <p>Fiche visible sur documents</p>
        <h3>Renseignez seulement ce qui rassure le client final.</h3>
        <span>
          Ces informations sortent ensuite sur les factures, attestations et
          relances. Le reste peut etre complete plus tard.
        </span>
      </div>

      <div className="settings-field-band">
        1. Identite commerciale
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">
            Nom commercial
          </span>
          <input
            className={inputClass}
            defaultValue={profile.name}
            name="name"
            placeholder="Martin Chauffage"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            className={inputClass}
            defaultValue={profile.email}
            name="email"
            placeholder="contact@martin-chauffage.fr"
            type="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Telephone</span>
          <input className={inputClass} defaultValue={profile.phone} name="phone" placeholder="02 40 00 00 00" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">SIRET</span>
          <input className={inputClass} defaultValue={profile.siret} name="siret" placeholder="123 456 789 00012" />
        </label>
      </div>

      <div className="settings-field-band">
        2. Mentions legales et qualifications
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">
            Numero TVA intracommunautaire
          </span>
          <input
            className={inputClass}
            defaultValue={profile.vatNumber}
            name="vatNumber"
            placeholder="FR00123456789"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Numero RGE</span>
          <input
            className={inputClass}
            defaultValue={profile.rgeNumber}
            name="rgeNumber"
            placeholder="E-E123456"
          />
        </label>
      </div>

      <div className="settings-field-band">
        3. Adresse de facturation
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-zinc-700">Adresse</span>
          <input
            className={inputClass}
            defaultValue={profile.address}
            name="address"
            placeholder="12 rue des Artisans"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Code postal</span>
          <input
            className={inputClass}
            defaultValue={profile.zipCode}
            name="zipCode"
            placeholder="44000"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Ville</span>
          <input className={inputClass} defaultValue={profile.city} name="city" placeholder="Nantes" />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          Derniere mise a jour : {profile.updatedAt}
        </p>
        <div className="flex items-center gap-3">
          {status && (
            <span className="text-sm font-medium text-emerald-300">
              {status}
            </span>
          )}
          <button
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold disabled:bg-zinc-400"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}
