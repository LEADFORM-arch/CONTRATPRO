import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { getOrganizationProfile } from "@/server/contratpro-data";

import { CompanySettingsForm } from "./CompanySettingsForm";

export default async function CompanySettingsPage() {
  const profile = await getOrganizationProfile();
  const completion = [
    profile.name,
    profile.email,
    profile.phone,
    profile.siret,
    profile.vatNumber,
    profile.address,
    profile.city,
  ].filter(Boolean).length;

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
        description="Ces informations alimentent les factures, attestations et documents commerciaux de l'entreprise."
        eyebrow="Parametres"
        title="Identite entreprise"
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <CompanySettingsForm profile={profile} />

        <aside className="settings-side-panel rounded-lg border p-5 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-50">Controle qualite</h3>
          <div className="mt-4">
            <StatusPill>{completion}/7 champs essentiels</StatusPill>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Entreprise</dt>
              <dd className="font-semibold text-zinc-50">{profile.name}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Adresse facture</dt>
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
