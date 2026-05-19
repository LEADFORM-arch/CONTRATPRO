"use client";

import { useMemo, useState } from "react";

const campaignPresets = [
  {
    campaign: "contrats-oublies",
    content: "post-roi",
    label: "Post ROI contrats oublies",
    medium: "post",
    source: "facebook",
  },
  {
    campaign: "attestation-chaudiere",
    content: "commentaire-guide",
    label: "Commentaire attestation",
    medium: "commentaire",
    source: "facebook",
  },
  {
    campaign: "relances-sepa",
    content: "message-prive",
    label: "Message prive SEPA",
    medium: "mp",
    source: "facebook",
  },
];

function clean(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function safeBaseUrl(value: string) {
  if (!value.trim()) {
    return "https://contratpro-dun.vercel.app/demo";
  }

  try {
    return new URL(value).toString();
  } catch {
    return "https://contratpro-dun.vercel.app/demo";
  }
}

export function CampaignLinkBuilder({ demoUrl }: { demoUrl: string }) {
  const [source, setSource] = useState("facebook");
  const [medium, setMedium] = useState("post");
  const [campaign, setCampaign] = useState("contrats-oublies");
  const [content, setContent] = useState("post-roi");
  const [plan, setPlan] = useState("pro");
  const [status, setStatus] = useState("");

  const trackedUrl = useMemo(() => {
    const url = new URL(safeBaseUrl(demoUrl));
    url.searchParams.set("utm_source", clean(source));
    url.searchParams.set("utm_medium", clean(medium));
    url.searchParams.set("utm_campaign", clean(campaign));

    if (content.trim()) {
      url.searchParams.set("utm_content", clean(content));
    }
    if (plan.trim()) {
      url.searchParams.set("plan", clean(plan));
    }

    return url.toString();
  }, [campaign, content, demoUrl, medium, plan, source]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(trackedUrl);
      setStatus("Lien copie");
    } catch {
      setStatus("Copie impossible, selectionnez le lien manuellement.");
    }
  }

  return (
    <section className="campaign-link-panel settings-panel mt-6 rounded-lg border p-4 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Attribution acquisition
          </p>
          <h3 className="mt-1 text-base font-semibold text-zinc-50">
            Generateur de liens campagnes
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Cree un lien de demonstration trace avant chaque publication ou
            message. Les UTM remontent ensuite dans le cockpit prospection.
          </p>
        </div>
        <button
          className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
          onClick={copyLink}
          type="button"
        >
          Copier le lien
        </button>
      </div>

      <div className="campaign-presets mt-4 grid gap-2 md:grid-cols-3">
        {campaignPresets.map((preset) => (
          <button
            className="campaign-preset-button rounded-md border p-3 text-left"
            key={preset.label}
            onClick={() => {
              setSource(preset.source);
              setMedium(preset.medium);
              setCampaign(preset.campaign);
              setContent(preset.content);
              setStatus("");
            }}
            type="button"
          >
            <span>{preset.label}</span>
            <small>
              {preset.source} / {preset.medium}
            </small>
          </button>
        ))}
      </div>

      <div className="campaign-link-grid mt-4 grid gap-3 md:grid-cols-5">
        <label>
          <span>Source</span>
          <input value={source} onChange={(event) => setSource(event.target.value)} />
        </label>
        <label>
          <span>Medium</span>
          <input value={medium} onChange={(event) => setMedium(event.target.value)} />
        </label>
        <label>
          <span>Campagne</span>
          <input value={campaign} onChange={(event) => setCampaign(event.target.value)} />
        </label>
        <label>
          <span>Contenu</span>
          <input value={content} onChange={(event) => setContent(event.target.value)} />
        </label>
        <label>
          <span>Plan</span>
          <select value={plan} onChange={(event) => setPlan(event.target.value)}>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
          </select>
        </label>
      </div>

      <div className="campaign-link-output mt-4 rounded-md border p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Lien prêt à publier
        </p>
        <code className="mt-2 block break-all text-sm text-zinc-200">
          {trackedUrl}
        </code>
        {status ? (
          <p className="mt-2 text-sm font-medium text-emerald-300">{status}</p>
        ) : null}
      </div>
    </section>
  );
}
