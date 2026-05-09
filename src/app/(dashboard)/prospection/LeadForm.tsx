"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export function LeadForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/prospection/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: formData.get("companyName"),
        contactName: formData.get("contactName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        city: formData.get("city"),
        specialty: formData.get("specialty"),
        score: formData.get("score"),
        nextAction: formData.get("nextAction"),
        source: "MANUAL",
      }),
    });
    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "Lead impossible a creer.");
      return;
    }

    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <form
      className="lead-form grid gap-3 rounded-lg border p-4 shadow-sm lg:grid-cols-6"
      onSubmit={handleSubmit}
    >
      <label className="lg:col-span-2">
        <span className="text-xs font-medium text-zinc-500">Entreprise</span>
        <input
          className="lead-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          name="companyName"
          required
        />
      </label>
      <label>
        <span className="text-xs font-medium text-zinc-500">Contact</span>
        <input
          className="lead-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          name="contactName"
        />
      </label>
      <label>
        <span className="text-xs font-medium text-zinc-500">Email</span>
        <input
          className="lead-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          name="email"
          type="email"
        />
      </label>
      <label>
        <span className="text-xs font-medium text-zinc-500">Ville</span>
        <input
          className="lead-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          name="city"
        />
      </label>
      <label>
        <span className="text-xs font-medium text-zinc-500">Score</span>
        <input
          className="lead-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          defaultValue="60"
          max="100"
          min="0"
          name="score"
          type="number"
        />
      </label>
      <label className="lg:col-span-2">
        <span className="text-xs font-medium text-zinc-500">Telephone</span>
        <input
          className="lead-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          name="phone"
        />
      </label>
      <label className="lg:col-span-2">
        <span className="text-xs font-medium text-zinc-500">Specialite</span>
        <input
          className="lead-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          name="specialty"
          placeholder="PAC, chaudiere gaz, clim reversible"
        />
      </label>
      <label className="lg:col-span-2">
        <span className="text-xs font-medium text-zinc-500">Prochaine action</span>
        <input
          className="lead-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          name="nextAction"
          placeholder="Appeler, envoyer demo, qualifier parc"
        />
      </label>
      <div className="flex items-end justify-between gap-3 lg:col-span-6">
        <p className="text-xs text-red-700">{error}</p>
        <button
          className="premium-action rounded-md px-4 py-2 text-sm font-semibold disabled:bg-zinc-400"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Creation..." : "Ajouter lead"}
        </button>
      </div>
    </form>
  );
}
