"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export function DemoRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan") ?? "";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const companyName = String(formData.get("companyName") ?? "").trim();
    const plan = String(formData.get("plan") ?? requestedPlan ?? "pro").trim();
    const payload = {
      ...Object.fromEntries(formData.entries()),
      sourceUrl: window.location.href,
    };

    try {
      const response = await fetch("/api/public/demo-request", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(body.error ?? "Demande impossible pour le moment.");
        return;
      }

      const nextParams = new URLSearchParams();
      if (companyName) {
        nextParams.set("company", companyName);
      }
      if (plan) {
        nextParams.set("plan", plan);
      }
      router.push(`/demo/merci?${nextParams.toString()}`);
    } catch {
      setError("Le serveur n'a pas repondu. Reessayez dans quelques instants.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="demo-request-form" onSubmit={handleSubmit}>
      <div className="demo-form-grid">
        <label>
          <span>Entreprise</span>
          <input name="companyName" placeholder="Dupont Chauffage" required />
        </label>
        <label>
          <span>Contact</span>
          <input name="contactName" placeholder="Jean Dupont" />
        </label>
        <label>
          <span>Email professionnel</span>
          <input name="email" placeholder="contact@entreprise.fr" required type="email" />
        </label>
        <label>
          <span>Telephone</span>
          <input name="phone" placeholder="06 12 34 56 78" />
        </label>
        <label>
          <span>Ville</span>
          <input name="city" placeholder="Nantes" />
        </label>
        <label>
          <span>Contrats suivis</span>
          <input min="0" name="contractCount" placeholder="120" type="number" />
        </label>
        <label>
          <span>Specialite</span>
          <select name="specialty" defaultValue="Multi CVC">
            <option>Multi CVC</option>
            <option>Chaudiere gaz</option>
            <option>Pompe a chaleur</option>
            <option>Clim reversible</option>
            <option>Autre</option>
          </select>
        </label>
        <label>
          <span>Plan vise</span>
          <select name="plan" defaultValue={requestedPlan || "pro"}>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
          </select>
        </label>
      </div>

      <label className="demo-message-field">
        <span>Contexte</span>
        <textarea
          name="message"
          placeholder="Je veux importer mon Excel et securiser mes relances de contrats."
          rows={4}
        />
      </label>

      {error ? <p className="demo-form-error">{error}</p> : null}

      <button className="premium-action rounded-md text-sm font-semibold" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Envoi..." : "Demander une demo"}
      </button>
    </form>
  );
}
