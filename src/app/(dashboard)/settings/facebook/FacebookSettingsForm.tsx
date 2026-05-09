"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type FacebookSettings = {
  bufferAccessTokenConfigured: boolean;
  bufferProfileId: string;
  apifyTokenConfigured: boolean;
  manychatTokenConfigured: boolean;
  demoUrl: string;
  n8nWebhookUrl: string;
  postingFrequency: string;
  persona: string;
  updatedAt: string;
};

const tokenPlaceholder = (configured: boolean, label: string) =>
  configured ? `${label} deja configure` : label;

export function FacebookSettingsForm({
  settings,
}: {
  settings: FacebookSettings;
}) {
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/settings/facebook", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bufferAccessToken: formData.get("bufferAccessToken"),
        bufferProfileId: formData.get("bufferProfileId"),
        apifyToken: formData.get("apifyToken"),
        manychatToken: formData.get("manychatToken"),
        demoUrl: formData.get("demoUrl"),
        n8nWebhookUrl: formData.get("n8nWebhookUrl"),
        postingFrequency: formData.get("postingFrequency"),
        persona: formData.get("persona"),
      }),
    });
    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Sauvegarde impossible.");
      return;
    }

    setStatus("Configuration sauvegardee");
  }

  return (
    <form
      className="settings-form mt-6 grid gap-4 rounded-lg border p-4 shadow-sm md:grid-cols-2"
      onSubmit={handleSubmit}
    >
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">
          Buffer access token
        </span>
        <input
          className="settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm"
          name="bufferAccessToken"
          placeholder={tokenPlaceholder(
            settings.bufferAccessTokenConfigured,
            "BUFFER_ACCESS_TOKEN",
          )}
          type="password"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">
          Buffer Facebook profile
        </span>
        <input
          className="settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm"
          defaultValue={settings.bufferProfileId}
          name="bufferProfileId"
          placeholder="BUFFER_FACEBOOK_PROFILE_ID"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Apify token</span>
        <input
          className="settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm"
          name="apifyToken"
          placeholder={tokenPlaceholder(settings.apifyTokenConfigured, "APIFY_TOKEN")}
          type="password"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">ManyChat token</span>
        <input
          className="settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm"
          name="manychatToken"
          placeholder={tokenPlaceholder(
            settings.manychatTokenConfigured,
            "MANYCHAT_TOKEN",
          )}
          type="password"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Demo URL</span>
        <input
          className="settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm"
          defaultValue={settings.demoUrl}
          name="demoUrl"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Webhook n8n</span>
        <input
          className="settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm"
          defaultValue={settings.n8nWebhookUrl}
          name="n8nWebhookUrl"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">
          Cadence publication
        </span>
        <input
          className="settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm"
          defaultValue={settings.postingFrequency}
          name="postingFrequency"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Persona</span>
        <input
          className="settings-input mt-2 h-10 w-full rounded-md border px-3 text-sm"
          defaultValue={settings.persona}
          name="persona"
        />
      </label>
      <div className="flex items-center justify-between gap-3 md:col-span-2">
        <p className="text-sm text-zinc-500">
          Derniere mise a jour : {settings.updatedAt}
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
