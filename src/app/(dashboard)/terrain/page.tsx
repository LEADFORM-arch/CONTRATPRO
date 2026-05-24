import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import { getInterventions } from "@/server/contratpro-data";

function actionLabel(certificateStatus: string) {
  if (certificateStatus.includes("generer") || certificateStatus.includes("générer")) {
    return "Generer PDF";
  }

  if (certificateStatus.includes("envoyer")) {
    return "Envoyer";
  }

  return "Consulter";
}

function certificateHref(certificateId: string) {
  return certificateId ? `/certificates/${certificateId}` : "/certificates";
}

export default async function TerrainPage() {
  const interventions = await getInterventions();
  const planned = interventions.filter((item) => item.status.includes("Planifi"));
  const done = interventions.filter((item) => item.status.includes("Realis") || item.status.includes("Réalis"));
  const certificateQueue = interventions.filter(
    (item) =>
      item.certificateStatus.includes("generer") ||
      item.certificateStatus.includes("générer") ||
      item.certificateStatus.includes("envoyer"),
  );
  const priorityIntervention = certificateQueue[0] ?? planned[0] ?? interventions[0];
  const protectedRevenue = interventions.reduce((sum, item) => sum + item.value, 0);

  return (
    <AppShell activePath="/terrain">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/interventions/new">
            Planifier
          </a>
        }
        description="Vue mobile pour retrouver le bon dossier, traiter la prochaine visite et sortir le document sans chercher."
        eyebrow="PWA terrain"
        title="Interventions mobile"
      />

      <section className="terrain-command-panel mt-6" data-od-id="terrain-next-action">
        <div>
          <p className="terrain-kicker">Action terrain maintenant</p>
          <h3>
            {priorityIntervention
              ? `${priorityIntervention.customer} - ${priorityIntervention.city}`
              : "Planifier la premiere visite"}
          </h3>
          <p>
            {priorityIntervention
              ? `${priorityIntervention.equipment} - ${priorityIntervention.performedAt}. Ouvrez le dossier ou sortez l'attestation.`
              : "Aucune intervention chargee. Creez une visite rattachee a un contrat pour demarrer le suivi terrain."}
          </p>
        </div>
        <div className="terrain-command-actions">
          {priorityIntervention?.contractId ? (
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-center text-sm font-semibold"
              href={`/contracts/${priorityIntervention.contractId}`}
            >
              Ouvrir dossier
            </a>
          ) : null}
          <a
            className="premium-action rounded-md text-sm font-semibold"
            href={
              priorityIntervention
                ? certificateHref(priorityIntervention.certificateId)
                : "/interventions/new"
            }
          >
            {priorityIntervention ? actionLabel(priorityIntervention.certificateStatus) : "Creer visite"}
          </a>
        </div>
      </section>

      <div className="terrain-metrics mt-4">
        <article>
          <span>A faire</span>
          <strong>{planned.length}</strong>
          <p>visites visibles</p>
        </article>
        <article>
          <span>Documents</span>
          <strong>{certificateQueue.length}</strong>
          <p>PDF a produire ou envoyer</p>
        </article>
        <article>
          <span>Realisees</span>
          <strong>{done.length}</strong>
          <p>visites terminees</p>
        </article>
        <article>
          <span>Protege</span>
          <strong>{formatEuro(protectedRevenue)}</strong>
          <p>revenu rattache</p>
        </article>
      </div>

      <section className="terrain-list mt-4">
        <div className="terrain-list-header">
          <div>
            <h3>File terrain</h3>
            <p>Chaque carte donne le client, l'equipement et les deux gestes utiles.</p>
          </div>
          <StatusPill>{interventions.length} visite(s)</StatusPill>
        </div>

        <div className="terrain-cards">
          {interventions.map((intervention) => (
            <article className="terrain-card" key={intervention.id}>
              <div className="terrain-card-top">
                <div>
                  <span>{intervention.performedAt}</span>
                  <strong>{intervention.customer}</strong>
                  <p>{intervention.city}</p>
                </div>
                <StatusPill>{intervention.status}</StatusPill>
              </div>

              <dl className="terrain-details">
                <div>
                  <dt>Equipement</dt>
                  <dd>{intervention.equipment}</dd>
                </div>
                <div>
                  <dt>Prochaine</dt>
                  <dd>{intervention.nextVisitDate}</dd>
                </div>
                <div>
                  <dt>Technicien</dt>
                  <dd>{intervention.technician}</dd>
                </div>
                <div>
                  <dt>Attestation</dt>
                  <dd>{intervention.certificateStatus}</dd>
                </div>
              </dl>

              <div className="terrain-actions">
                {intervention.contractId ? (
                  <a
                    className="premium-secondary-action rounded-md px-3 py-2 text-center text-sm font-semibold"
                    href={`/contracts/${intervention.contractId}`}
                  >
                    Dossier
                  </a>
                ) : null}
                <a
                  className="premium-action rounded-md text-sm font-semibold"
                  href={certificateHref(intervention.certificateId)}
                >
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
