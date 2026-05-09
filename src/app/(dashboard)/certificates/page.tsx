import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { getCertificates } from "@/server/contratpro-data";

export default async function CertificatesPage() {
  const certificates = await getCertificates();
  const sentCount = certificates.filter(
    (certificate) => certificate.status === "Envoyee",
  ).length;
  const pendingCount = certificates.length - sentCount;
  const referencesCount = new Set(
    certificates.map((certificate) => certificate.legalReference),
  ).size;

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
        description="Pilotez les attestations d'entretien, leur statut d'envoi et les references reglementaires rattachees a chaque intervention."
        eyebrow="Conformite"
        title="Attestations legales"
      />

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <article className="certificate-stat-card" data-tone="emerald">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Attestations
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-50">
            {certificates.length}
          </p>
          <p className="mt-2 text-sm text-zinc-400">Documents archives</p>
        </article>
        <article className="certificate-stat-card" data-tone="amber">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            A envoyer
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-50">
            {pendingCount}
          </p>
          <p className="mt-2 text-sm text-zinc-400">Clients a notifier</p>
        </article>
        <article className="certificate-stat-card" data-tone="cyan">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Cadre suivi
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-50">
            {referencesCount}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            References reglementaires
          </p>
        </article>
      </section>

      <section className="certificate-section mt-5 rounded-lg border">
        <div className="certificate-section-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Registre documentaire
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Attestations pretes pour archivage et envoi client
            </h3>
          </div>
          <span className="certificate-sla-pill">
            {sentCount}/{certificates.length} envoyees
          </span>
        </div>

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
      </section>
    </AppShell>
  );
}
