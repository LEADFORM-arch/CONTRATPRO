import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { getOrganizationProfile } from "@/server/contratpro-data";

import { CompanySettingsForm } from "./CompanySettingsForm";

export default async function CompanySettingsPage() {
  const profile = await getOrganizationProfile();
  const essentialFields = [
    profile.name,
    profile.email,
    profile.phone,
    profile.siret,
    profile.vatNumber,
    profile.address,
    profile.city,
  ];
  const completion = essentialFields.filter(Boolean).length;
  const completionPercent = Math.round((completion / essentialFields.length) * 100);
  const documentChecks = [
    {
      detail: "Nom commercial, adresse et SIRET visibles sur les factures.",
      done: Boolean(profile.name && profile.address && profile.city && profile.siret),
      label: "Factures propres",
    },
    {
      detail: "RGE et coordonnees prets pour les attestations d'entretien.",
      done: Boolean(profile.rgeNumber && profile.email && profile.phone),
      label: "Attestations credibles",
    },
    {
      detail: "Email et telephone renseignes pour les relances client.",
      done: Boolean(profile.email && profile.phone),
      label: "Relances identifiees",
    },
  ];

  return (
    <AppShell activePath="/settings/company">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/invoices"
          >
            Voir factures
          </a>
        }
        description="Ces informations alimentent les factures, attestations et emails envoyes aux clients. Une fiche complete rend les documents immediatement presentables."
        eyebrow="Paramètres"
        title="Identité entreprise"
      />

      <section className="settings-company-brief mt-6 rounded-lg border p-5">
        <div>
          <p>Preparation documents</p>
          <h2>{completionPercent}% de la fiche prete</h2>
          <span>
            Le chauffagiste ne doit pas se demander quoi renseigner. Les champs
            ci-dessous servent directement aux factures PDF, attestations
            d'entretien et relances client.
          </span>
        </div>
        <a className="premium-action rounded-md text-sm font-semibold" href="/invoices/new">
          Tester une facture
        </a>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <CompanySettingsForm profile={profile} />

        <aside className="settings-side-panel rounded-lg border p-5 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-50">Contrôle qualité</h3>
          <div className="mt-4">
            <StatusPill>{completion}/7 champs essentiels</StatusPill>
          </div>

          <div className="settings-company-checks mt-5">
            {documentChecks.map((check) => (
              <article data-ready={check.done} key={check.label}>
                <strong>{check.done ? "Pret" : "A completer"}</strong>
                <span>{check.label}</span>
                <p>{check.detail}</p>
              </article>
            ))}
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Entreprise</dt>
              <dd className="font-semibold text-zinc-50">{profile.name}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Adresse de facturation</dt>
              <dd className="font-semibold text-zinc-50">{profile.fullAddress}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">SIRET</dt>
              <dd className="font-semibold text-zinc-50">{profile.siret || "-"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">TVA</dt>
              <dd className="font-semibold text-zinc-50">
                {profile.vatNumber || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">RGE</dt>
              <dd className="font-semibold text-zinc-50">
                {profile.rgeNumber || "-"}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </AppShell>
  );
}
