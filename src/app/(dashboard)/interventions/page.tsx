import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui";
import { formatEuro } from "@/lib/mock-data";
import { getInterventions } from "@/server/contratpro-data";

import { CertificateAction } from "./CertificateAction";

function needsCertificate(certificateStatus: string) {
  const lower = certificateStatus.toLowerCase();
  return lower.includes("générer") || lower.includes("generer") || lower.includes("envoyer");
}

function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits && phone !== "-" ? `tel:${digits}` : "";
}

function mapsHref(address: string) {
  return address && address !== "-"
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "";
}

export default async function InterventionsPage() {
  const interventions = await getInterventions();
  const scheduled = interventions.filter((intervention) =>
    intervention.status.toLowerCase().includes("planif"),
  );
  const completed = interventions.filter(
    (intervention) =>
      intervention.status.toLowerCase().includes("réalis") ||
      intervention.status.toLowerCase().includes("realis"),
  );
  const certificatesToGenerate = interventions.filter((intervention) =>
    needsCertificate(intervention.certificateStatus),
  );
  const priorityIntervention = certificatesToGenerate[0] ?? scheduled[0] ?? interventions[0];
  const protectedRevenue = interventions.reduce(
    (sum, intervention) => sum + intervention.value,
    0,
  );

  return (
    <AppShell activePath="/interventions">
      <PageHeader
        action={<a className="cp-btn cp-btn-primary cp-btn-sm" href="/interventions/new">Planifier visite</a>}
        description="Pilotez les visites CVC rattachées aux contrats, puis sortez l'attestation sans double saisie."
        eyebrow="Opérations terrain"
        title="Planning interventions"
      />

      <section className="cp-terrain-command intervention-command-panel" data-od-id="intervention-next-action">
        <div>
          <p className="cp-eyebrow">Prochaine action</p>
          <h3 className="cp-terrain-command-title">
            {priorityIntervention
              ? `${priorityIntervention.customer} — ${priorityIntervention.equipment}`
              : "Planifier une visite terrain"}
          </h3>
          <p className="cp-cell-sub">
            {priorityIntervention
              ? `${priorityIntervention.performedAt} — ${priorityIntervention.certificateStatus}`
              : "Aucune visite à traiter. Commencez par rattacher une intervention à un contrat."}
          </p>
        </div>
        <div className="cp-terrain-command-actions">
          {priorityIntervention?.phone && phoneHref(priorityIntervention.phone) ? (
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href={phoneHref(priorityIntervention.phone)}>Appeler client</a>
          ) : null}
          {priorityIntervention?.address && mapsHref(priorityIntervention.address) ? (
            <a aria-label="Itineraire" className="cp-btn cp-btn-secondary cp-btn-sm" href={mapsHref(priorityIntervention.address)} rel="noreferrer" target="_blank">Itinéraire</a>
          ) : null}
          {priorityIntervention?.contractId ? (
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/contracts/${priorityIntervention.contractId}`}>Ouvrir dossier</a>
          ) : null}
          {priorityIntervention ? (
            <CertificateAction certificateId={priorityIntervention.certificateId} contractId={priorityIntervention.contractId} interventionId={priorityIntervention.id} />
          ) : (
            <a className="cp-btn cp-btn-primary cp-btn-sm" href="/interventions/new">Créer visite</a>
          )}
        </div>
      </section>

      <div className="cp-stat-grid">
        <StatCard label="Total" value={String(interventions.length)} detail="visites dans le planning" tone="cyan" />
        <StatCard label="Planifiées" value={String(scheduled.length)} detail="à réaliser ou confirmer" tone="amber" />
        <StatCard label="Documents" value={String(certificatesToGenerate.length)} detail="attestations à produire" tone="rose" />
        <StatCard label="Revenu protégé" value={formatEuro(protectedRevenue)} detail="contrats couverts par ces visites" tone="emerald" />
      </div>

      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">File terrain</h3>
            <p className="cp-section-desc">Client, équipement, date, dossier et PDF restent sur une seule ligne.</p>
          </div>
          <StatusPill>{completed.length} réalisée(s)</StatusPill>
        </header>

        <div className="overflow-x-auto">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Équipement</th>
                <th>Intervention</th>
                <th>Technicien</th>
                <th>Prochaine</th>
                <th>Attestation</th>
                <th>Statut</th>
                <th>Dossier</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((intervention) => (
                <tr key={intervention.id}>
                  <td>
                    <p className="cp-cell-strong">{intervention.customer}</p>
                    <p className="cp-cell-sub">{intervention.city}</p>
                    <p className="cp-cell-sub" style={{ color: "var(--accent-cyan)" }}>{intervention.phone}</p>
                    {mapsHref(intervention.address) ? (
                      <a className="cp-deal-link" style={{ fontSize: "var(--text-xs)" }} href={mapsHref(intervention.address)} rel="noreferrer" target="_blank">Itinéraire</a>
                    ) : null}
                  </td>
                  <td>{intervention.equipment}</td>
                  <td className="cp-cell-strong">{intervention.performedAt}</td>
                  <td>{intervention.technician}</td>
                  <td>{intervention.nextVisitDate}</td>
                  <td><span className="cp-pill">{intervention.certificateStatus}</span></td>
                  <td><StatusPill>{intervention.status}</StatusPill></td>
                  <td>
                    {intervention.contractId ? (
                      <a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/contracts/${intervention.contractId}`}>Ouvrir</a>
                    ) : "-"}
                  </td>
                  <td>
                    <CertificateAction certificateId={intervention.certificateId} contractId={intervention.contractId} interventionId={intervention.id} />
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
