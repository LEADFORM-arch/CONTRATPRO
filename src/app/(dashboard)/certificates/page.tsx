import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { AgentPanel, StatCard } from "@/components/ui";
import { getCertificates } from "@/server/contratpro-data";

export default async function CertificatesPage() {
  const certificates = await getCertificates();
  const pendingCertificates = certificates.filter(
    (certificate) => !certificate.status.toLowerCase().includes("envoy"),
  );
  const sentCount = certificates.filter(
    (certificate) => certificate.status.toLowerCase().includes("envoy"),
  ).length;
  const pendingCount = certificates.length - sentCount;
  const referencesCount = new Set(
    certificates.map((certificate) => certificate.legalReference),
  ).size;
  const priorityCertificate = pendingCertificates[0] ?? certificates[0];
  const certificateCommand = pendingCount
    ? {
        action: "Envoyer l'attestation",
        detail: `${pendingCount} document(s) à envoyer ou vérifier avant archivage client.`,
        label: "Preuve à sortir",
        tone: "amber" as const,
      }
    : {
        action: "Préparer la prochaine",
        detail: "Toutes les attestations connues sont envoyées. Continuez depuis les interventions.",
        label: "Conformité stable",
        tone: "emerald" as const,
      };

  return (
    <AppShell activePath="/certificates">
      <PageHeader
        action={<a className="cp-btn cp-btn-primary cp-btn-sm" href="/contracts">Depuis un contrat</a>}
        description="Pilotez les attestations d'entretien, leur statut d'envoi et les références réglementaires rattachées à chaque intervention."
        eyebrow="Conformité"
        title="Attestations légales"
      />

      <AgentPanel
        eyebrow="Commande conformité"
        thesis={certificateCommand.label}
        proof={
          <>
            {certificateCommand.detail}
            {priorityCertificate ? (
              <span className="mt-3 block" style={{ color: "var(--text-primary)" }}>
                <strong>{priorityCertificate.customer}</strong> — {priorityCertificate.equipment}
              </span>
            ) : (
              <span className="mt-3 block">Planifier une intervention pour générer la première attestation.</span>
            )}
          </>
        }
        action={
          <div className="flex flex-col items-end gap-2">
            <span className="cp-pill cp-pill-dot" data-tone={certificateCommand.tone}>{certificateCommand.action}</span>
            <a className="cp-btn cp-btn-primary cp-btn-sm" href={priorityCertificate ? `/certificates/${priorityCertificate.id}` : "/interventions/new"}>
              Ouvrir le document
            </a>
          </div>
        }
      />

      <section className="cp-work-lanes">
        <a className="cp-work-tile" data-tone="emerald" href="/interventions/new">
          <span className="cp-work-tile-step">1</span>
          <div><strong>Générer attestation</strong><p>Partir d'une intervention ou d'un contrat de maintenance.</p></div>
          <em>+</em>
        </a>
        <a className="cp-work-tile" data-tone={pendingCount ? "amber" : "emerald"} href={priorityCertificate ? `/certificates/${priorityCertificate.id}` : "/interventions/new"}>
          <span className="cp-work-tile-step">2</span>
          <div><strong>Envoyer au client</strong><p>Vérifier la preuve, puis l'envoyer au client.</p></div>
          <em>{pendingCount}</em>
        </a>
        <a className="cp-work-tile" data-tone="cyan" href="/certificates">
          <span className="cp-work-tile-step">3</span>
          <div><strong>Registre preuves</strong><p>Retrouver les attestations et références conservées.</p></div>
          <em>{certificates.length}</em>
        </a>
      </section>

      <div className="cp-stat-grid">
        <StatCard label="Attestations" value={String(certificates.length)} detail="Documents archivés" tone="emerald" />
        <StatCard label="À envoyer" value={String(pendingCount)} detail="Clients à notifier" tone="amber" />
        <StatCard label="Cadre suivi" value={String(referencesCount)} detail="Références réglementaires" tone="cyan" />
      </div>

      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">Registre documentaire</h3>
            <p className="cp-section-desc">Attestations prêtes pour archivage et envoi client.</p>
          </div>
          <span className="cp-pill" data-tone="emerald">{sentCount}/{certificates.length} envoyées</span>
        </header>

        {certificates.length ? (
          <div className="overflow-x-auto">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Équipement</th>
                  <th>Émission</th>
                  <th>Référence</th>
                  <th>Statut</th>
                  <th>Document</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => (
                  <tr key={certificate.id}>
                    <td>
                      <p className="cp-cell-strong">{certificate.customer}</p>
                      <p className="cp-cell-sub">ID {certificate.id}</p>
                    </td>
                    <td>{certificate.equipment}</td>
                    <td className="cp-cell-strong">{certificate.issuedAt}</td>
                    <td><span className="cp-pill">{certificate.legalReference}</span></td>
                    <td><StatusPill>{certificate.status}</StatusPill></td>
                    <td><a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/certificates/${certificate.id}`}>Ouvrir</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cp-section-body">
            <ActivationEmptyState
              actionHref="/interventions/new"
              actionLabel="Planifier une intervention"
              eyebrow="Conformité entretien"
              proofPoints={["Attestation liée à l'intervention", "Référence légale conservée", "Envoi client historisé"]}
              secondaryHref="/contracts"
              secondaryLabel="Voir contrats"
              title="Générez les attestations depuis les interventions réalisées."
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
