import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { getCertificates } from "@/server/contratpro-data";

type CertificateTone = "amber" | "cyan" | "emerald" | "rose";

function CertificateWorkTile({
  count,
  detail,
  href,
  label,
  step,
  tone,
}: {
  count: string;
  detail: string;
  href: string;
  label: string;
  step: string;
  tone: CertificateTone;
}) {
  return (
    <a className="artisan-terrain-tile" data-tone={tone} href={href}>
      <span>{step}</span>
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
      <em>{count}</em>
    </a>
  );
}

export default async function CertificatesPage() {
  const certificates = await getCertificates();
  const pendingCertificates = certificates.filter(
    (certificate) => certificate.status !== "EnvoyÃ©e",
  );
  const sentCount = certificates.filter(
    (certificate) => certificate.status === "Envoyée",
  ).length;
  const pendingCount = certificates.length - sentCount;
  const referencesCount = new Set(
    certificates.map((certificate) => certificate.legalReference),
  ).size;
  const priorityCertificate = pendingCertificates[0] ?? certificates[0];
  const certificateCommand = pendingCount
    ? {
        action: "Envoyer l'attestation",
        detail: `${pendingCount} document(s) a envoyer ou verifier avant archivage client.`,
        label: "Preuve a sortir",
        tone: "amber" as const,
      }
    : {
        action: "Preparer la prochaine",
        detail: "Toutes les attestations connues sont envoyees. Continuez depuis les interventions.",
        label: "Conformite stable",
        tone: "emerald" as const,
      };

  return (
    <AppShell activePath="/certificates">
      <PageHeader
        action={
          <a
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/contracts"
          >
            Depuis un contrat
          </a>
        }
        description="Pilotez les attestations d'entretien, leur statut d'envoi et les références réglementaires rattachées à chaque intervention."
        eyebrow="Conformité"
        title="Attestations légales"
      />

      <section className="certificate-command-panel mt-6" data-od-id="certificate-proof-command">
        <div className="certificate-command-brief">
          <p>Commande conformite</p>
          <h2>{certificateCommand.label}</h2>
          <span>{certificateCommand.detail}</span>
        </div>
        <div className="certificate-command-decision" data-tone={certificateCommand.tone}>
          <small>Action prioritaire</small>
          <strong>{certificateCommand.action}</strong>
          {priorityCertificate ? (
            <span>
              {priorityCertificate.customer} - {priorityCertificate.equipment}
            </span>
          ) : (
            <span>Planifier une intervention pour generer la premiere attestation.</span>
          )}
          <a
            className="premium-action rounded-md text-sm font-semibold"
            href={priorityCertificate ? `/certificates/${priorityCertificate.id}` : "/interventions/new"}
          >
            Ouvrir le document
          </a>
        </div>
      </section>

      <section className="artisan-terrain-lanes mt-5" aria-label="Raccourcis attestation">
        <CertificateWorkTile
          count="+"
          detail="Partir d'une intervention ou d'un contrat de maintenance."
          href="/interventions/new"
          label="Generer attestation"
          step="1"
          tone="emerald"
        />
        <CertificateWorkTile
          count={String(pendingCount)}
          detail="Verifier la preuve, puis l'envoyer au client."
          href={priorityCertificate ? `/certificates/${priorityCertificate.id}` : "/interventions/new"}
          label="Envoyer au client"
          step="2"
          tone={pendingCount ? "amber" : "emerald"}
        />
        <CertificateWorkTile
          count={String(certificates.length)}
          detail="Retrouver les attestations et references conservees."
          href="/certificates"
          label="Registre preuves"
          step="3"
          tone="cyan"
        />
      </section>

      <details className="artisan-evidence-details mt-5">
        <summary className="worklist-summary">
          Voir les chiffres conformite
        </summary>
        <div className="grid gap-3 md:grid-cols-3">
        <article className="certificate-stat-card" data-tone="emerald">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Attestations
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-50">
            {certificates.length}
          </p>
          <p className="mt-2 text-sm text-zinc-400">Documents archivés</p>
        </article>
        <article className="certificate-stat-card" data-tone="amber">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            À envoyer
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-50">
            {pendingCount}
          </p>
          <p className="mt-2 text-sm text-zinc-400">Clients à notifier</p>
        </article>
        <article className="certificate-stat-card" data-tone="cyan">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Cadre suivi
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-50">
            {referencesCount}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Références réglementaires
          </p>
        </article>
        </div>
      </details>

      <details className="certificate-section mt-5 rounded-lg border">
        <summary className="worklist-summary">
          Voir toutes les attestations ({certificates.length})
        </summary>
        <div className="certificate-section-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Registre documentaire
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Attestations prêtes pour archivage et envoi client
            </h3>
          </div>
          <span className="certificate-sla-pill">
            {sentCount}/{certificates.length} envoyées
          </span>
        </div>

        {certificates.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Equipement</th>
                <th className="px-4 py-3 font-semibold">Emission</th>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {certificates.map((certificate) => (
                <tr className="certificate-table-row" key={certificate.id}>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-zinc-50">
                      {certificate.customer}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      ID {certificate.id}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {certificate.equipment}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-200">
                    {certificate.issuedAt}
                  </td>
                  <td className="px-4 py-4">
                    <span className="certificate-reference-pill">
                      {certificate.legalReference}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill>{certificate.status}</StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    <a
                      className="premium-inline-action"
                      href={`/certificates/${certificate.id}`}
                    >
                      Ouvrir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <ActivationEmptyState
              actionHref="/interventions/new"
              actionLabel="Planifier une intervention"
              eyebrow="Conformité entretien"
              proofPoints={[
                "Attestation liée à l'intervention",
                "Référence légale conservée",
                "Envoi client historisé",
              ]}
              secondaryHref="/contracts"
              secondaryLabel="Voir contrats"
              title="Générez les attestations depuis les interventions réalisées."
            />
          </div>
        )}
      </details>
    </AppShell>
  );
}
