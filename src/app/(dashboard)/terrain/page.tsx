import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import { getInterventions } from "@/server/contratpro-data";

function actionLabel(certificateStatus: string) {
  if (certificateStatus.toLowerCase().includes("générer") || certificateStatus.toLowerCase().includes("generer")) {
    return "Générer PDF";
  }
  if (certificateStatus.toLowerCase().includes("envoyer")) {
    return "Envoyer";
  }
  return "Consulter";
}

function certificateHref(certificateId: string) {
  return certificateId ? `/certificates/${certificateId}` : "/certificates";
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

export default async function TerrainPage() {
  const interventions = await getInterventions();
  const planned = interventions.filter((item) => item.status.toLowerCase().includes("planif"));
  const done = interventions.filter((item) => item.status.toLowerCase().includes("réalis") || item.status.toLowerCase().includes("realis"));
  const certificateQueue = interventions.filter(
    (item) =>
      item.certificateStatus.toLowerCase().includes("générer") ||
      item.certificateStatus.toLowerCase().includes("generer") ||
      item.certificateStatus.toLowerCase().includes("envoyer"),
  );
  const priorityIntervention = certificateQueue[0] ?? planned[0] ?? interventions[0];
  const protectedRevenue = interventions.reduce((sum, item) => sum + item.value, 0);

  return (
    <AppShell activePath="/terrain">
      <PageHeader
        action={<a className="cp-btn cp-btn-primary cp-btn-sm" href="/interventions/new">Planifier</a>}
        description="Vue mobile pour retrouver le bon dossier, traiter la prochaine visite et sortir le document sans chercher."
        eyebrow="PWA terrain"
        title="Interventions mobile"
      />

      {/* Action terrain maintenant */}
      <section className="cp-terrain-command terrain-command-panel" data-od-id="terrain-next-action">
        <div>
          <p className="cp-eyebrow">Action terrain maintenant</p>
          <h3 className="cp-terrain-command-title">
            {priorityIntervention
              ? `${priorityIntervention.customer} — ${priorityIntervention.city}`
              : "Planifier la première visite"}
          </h3>
          <p className="cp-cell-sub">
            {priorityIntervention
              ? `${priorityIntervention.equipment} — ${priorityIntervention.performedAt}. Ouvrez le dossier ou sortez l'attestation.`
              : "Aucune intervention chargée. Créez une visite rattachée à un contrat pour démarrer le suivi terrain."}
          </p>
        </div>
        <div className="cp-terrain-command-actions">
          {priorityIntervention?.phone && phoneHref(priorityIntervention.phone) ? (
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href={phoneHref(priorityIntervention.phone)}>Appeler</a>
          ) : null}
          {priorityIntervention?.address && mapsHref(priorityIntervention.address) ? (
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href={mapsHref(priorityIntervention.address)} rel="noreferrer" target="_blank">Itinéraire</a>
          ) : null}
          {priorityIntervention?.contractId ? (
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/contracts/${priorityIntervention.contractId}`}>Ouvrir dossier</a>
          ) : null}
          <a className="cp-btn cp-btn-primary cp-btn-sm" href={priorityIntervention ? certificateHref(priorityIntervention.certificateId) : "/interventions/new"}>
            {priorityIntervention ? actionLabel(priorityIntervention.certificateStatus) : "Créer visite"}
          </a>
        </div>
      </section>

      {/* Métriques terrain */}
      <div className="cp-stat-grid cp-stat-grid-terrain">
        <article className="cp-stat" data-tone="amber">
          <p className="cp-stat-label">À faire</p>
          <strong className="cp-stat-value">{planned.length}</strong>
          <p className="cp-stat-detail">visites visibles</p>
        </article>
        <article className="cp-stat" data-tone="cyan">
          <p className="cp-stat-label">Documents</p>
          <strong className="cp-stat-value">{certificateQueue.length}</strong>
          <p className="cp-stat-detail">PDF à produire ou envoyer</p>
        </article>
        <article className="cp-stat" data-tone="emerald">
          <p className="cp-stat-label">Réalisées</p>
          <strong className="cp-stat-value">{done.length}</strong>
          <p className="cp-stat-detail">visites terminées</p>
        </article>
        <article className="cp-stat" data-tone="rose">
          <p className="cp-stat-label">Protégé</p>
          <strong className="cp-stat-value">{formatEuro(protectedRevenue)}</strong>
          <p className="cp-stat-detail">revenu rattaché</p>
        </article>
      </div>

      {/* File terrain — cartes tactiles */}
      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">File terrain</h3>
            <p className="cp-section-desc">Chaque carte donne le client, l'équipement et les gestes utiles.</p>
          </div>
          <StatusPill>{interventions.length} visite(s)</StatusPill>
        </header>

        <div className="cp-terrain-cards">
          {interventions.map((intervention) => (
            <article className="cp-terrain-card terrain-card" key={intervention.id}>
              <div className="cp-terrain-card-top">
                <div>
                  <span className="cp-cell-sub">{intervention.performedAt}</span>
                  <strong className="cp-terrain-card-customer">{intervention.customer}</strong>
                  <p className="cp-cell-sub">{intervention.city}</p>
                </div>
                <StatusPill>{intervention.status}</StatusPill>
              </div>

              <dl className="cp-terrain-details">
                <div className="cp-detail-item"><dt>Équipement</dt><dd>{intervention.equipment}</dd></div>
                <div className="cp-detail-item"><dt>Prochaine</dt><dd>{intervention.nextVisitDate}</dd></div>
                <div className="cp-detail-item"><dt>Technicien</dt><dd>{intervention.technician}</dd></div>
                <div className="cp-detail-item"><dt>Attestation</dt><dd>{intervention.certificateStatus}</dd></div>
              </dl>

              <div className="cp-terrain-contact terrain-contact-strip">
                <span className="cp-cell-sub">{intervention.address}</span>
                <div className="cp-terrain-contact-actions">
                  {mapsHref(intervention.address) ? (
                    <a aria-label="Itineraire" href={mapsHref(intervention.address)} rel="noreferrer" target="_blank">Itinéraire</a>
                  ) : null}
                  {phoneHref(intervention.phone) ? (
                    <a href={phoneHref(intervention.phone)}>Appeler {intervention.phone}</a>
                  ) : (
                    <span className="cp-cell-sub">Téléphone non renseigné</span>
                  )}
                </div>
              </div>

              <div className="cp-terrain-actions">
                {intervention.contractId ? (
                  <a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/contracts/${intervention.contractId}`}>Dossier</a>
                ) : null}
                <a className="cp-btn cp-btn-primary cp-btn-sm" href={certificateHref(intervention.certificateId)}>
                  {actionLabel(intervention.certificateStatus)}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
