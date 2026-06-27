import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ProgressBar } from "@/components/ui";
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
      detail: "RGE et coordonnées prêts pour les attestations d'entretien.",
      done: Boolean(profile.rgeNumber && profile.email && profile.phone),
      label: "Attestations crédibles",
    },
    {
      detail: "Email et téléphone renseignés pour les relances client.",
      done: Boolean(profile.email && profile.phone),
      label: "Relances identifiées",
    },
  ];

  return (
    <AppShell activePath="/settings/company">
      <PageHeader
        action={<a className="cp-btn cp-btn-secondary cp-btn-sm" href="/invoices">Voir factures</a>}
        description="Ces informations alimentent les factures, attestations et emails envoyés aux clients. Une fiche complète rend les documents immédiatement présentables."
        eyebrow="Paramètres"
        title="Identité entreprise"
      />

      <section className="cp-onboarding-cta">
        <div>
          <p className="cp-eyebrow">Préparation documents</p>
          <h2 className="cp-onboarding-title">{completionPercent}% de la fiche prête</h2>
          <p className="cp-onboarding-detail">Les champs ci-dessous servent directement aux factures PDF, attestations d'entretien et relances client.</p>
          <div className="mt-4" style={{ maxWidth: 360 }}>
            <ProgressBar value={completionPercent} />
          </div>
        </div>
        <a className="cp-btn cp-btn-primary" href="/invoices/new">Tester une facture</a>
      </section>

      <div className="cp-settings-grid">
        <CompanySettingsForm profile={profile} />

        <aside className="cp-section cp-side-panel">
          <header className="cp-section-header">
            <h3 className="cp-section-title">Contrôle qualité</h3>
          </header>
          <div className="cp-section-body">
            <StatusPill>{completion}/7 champs essentiels</StatusPill>

            <div className="cp-settings-checks">
              {documentChecks.map((check) => (
                <article className="cp-settings-check" data-ready={check.done} key={check.label}>
                  <strong>{check.done ? "Prêt" : "À compléter"}</strong>
                  <span>{check.label}</span>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>

            <dl className="cp-detail-stack">
              <div className="cp-detail-item"><dt>Entreprise</dt><dd>{profile.name}</dd></div>
              <div className="cp-detail-item"><dt>Adresse de facturation</dt><dd>{profile.fullAddress}</dd></div>
              <div className="cp-detail-item"><dt>SIRET</dt><dd>{profile.siret || "-"}</dd></div>
              <div className="cp-detail-item"><dt>TVA</dt><dd>{profile.vatNumber || "-"}</dd></div>
              <div className="cp-detail-item"><dt>RGE</dt><dd>{profile.rgeNumber || "-"}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
