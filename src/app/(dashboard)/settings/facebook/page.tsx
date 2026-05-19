import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import { getFacebookSettings } from "@/server/contratpro-data";

import { CampaignLinkBuilder } from "./CampaignLinkBuilder";
import { FacebookSettingsForm } from "./FacebookSettingsForm";

const groups = [
  ["Chauffagistes de France", "~15 000 membres", "Observation"],
  ["Plombiers Chauffagistes Pro", "~8 000 membres", "Posts conseils"],
  ["Pompes à chaleur - Installateurs", "~5 000 membres", "ICP prioritaire"],
  ["VMC et Ventilation Pro", "~2 000 membres", "Secondaire"],
];

export default async function FacebookSettingsPage() {
  await requireAdminUser("/settings/facebook");
  const settings = await getFacebookSettings();

  return (
    <AppShell activePath="/settings/facebook" showInternalTools>
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/prospection"
          >
            Voir leads internes
          </a>
        }
        description="Configuration privée de ton canal d'acquisition Facebook: Buffer, Apify, ManyChat et n8n pour alimenter le pipeline ContratPro."
        eyebrow="Acquisition interne"
        title="Canal Facebook fondateur"
      />

      <section className="internal-notice mt-6 rounded-lg border p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
          Outil interne
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Cette page est pour toi, pas pour les entreprises clientes. Elle sert à
          prospecter des chauffagistes sur Facebook et à remplir ton pipeline de
          vente ContratPro.
        </p>
      </section>

      <FacebookSettingsForm settings={settings} />

      <CampaignLinkBuilder demoUrl={settings.demoUrl} />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="settings-panel rounded-lg border p-4 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-50">
            Routine conseillée
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {[
              "Observer",
              "Générer posts",
              "Vérifier ton",
              "Planifier Buffer",
              "Brancher MP",
            ].map((step, index) => (
              <article
                className="facebook-step-card rounded-lg border p-3"
                key={step}
              >
                <p className="text-xs font-medium text-zinc-500">
                  J+{index === 0 ? "0" : index}
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-50">{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="settings-panel rounded-lg border p-4 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-50">
            État connecteurs
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Buffer</span>
              <StatusPill>
                {settings.bufferAccessTokenConfigured ? "Prêt" : "À configurer"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Apify</span>
              <StatusPill>
                {settings.apifyTokenConfigured ? "Prêt" : "À configurer"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">ManyChat</span>
              <StatusPill>
                {settings.manychatTokenConfigured ? "Prêt" : "À configurer"}
              </StatusPill>
            </div>
          </div>
        </section>
      </div>

      <section className="settings-panel mt-6 rounded-lg border p-4 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-50">Groupes à tester</h3>
        <div className="facebook-groups mt-3 divide-y rounded-lg border">
          {groups.map(([name, members, status]) => (
            <div
              className="facebook-group-row flex items-center justify-between gap-4 px-4 py-3"
              key={name}
            >
              <div>
                <p className="font-medium text-zinc-50">{name}</p>
                <p className="text-sm text-zinc-500">{members}</p>
              </div>
              <StatusPill>{status}</StatusPill>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
