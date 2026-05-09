"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const payload = (await response.json()) as { error?: string };
    setIsLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Connexion impossible.");
      return;
    }

    router.push(searchParams.get("next") || "/onboarding");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-field">
        <span>Email professionnel</span>
        <input
          className="login-input"
          name="email"
          placeholder="vous@entreprise.fr"
          required
          type="email"
        />
      </label>
      <label className="login-field">
        <span>Mot de passe</span>
        <input
          className="login-input"
          name="password"
          placeholder="Votre mot de passe"
          required
          type="password"
        />
      </label>
      {error && <p className="login-error">{error}</p>}
      <button className="login-submit" disabled={isLoading} type="submit">
        {isLoading ? "Connexion..." : "Entrer dans ContratPro"}
      </button>
    </form>
  );
}
