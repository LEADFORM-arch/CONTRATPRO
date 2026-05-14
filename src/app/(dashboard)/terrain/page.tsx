import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import { getInterventions } from "@/server/contratpro-data";

function actionLabel(certificateStatus: string) {
  if (certificateStatus.includes("generer")) {
    return "GENERER PDF";
  }

  if (certificateStatus.includes("envoyer")) {
    return "ENVOYER";
  }

  return "CONSULTER";
}

export default async function TerrainPage() {
  const interventions = await getInterventions();
  const planned = interventions.filter((item) => item.status === "Planifiee");
  const done = interventions.filter((item) => item.status === "Realisee");
  const certificateQueue = interventions.filter((item) =>
    item.certificateStatus.includes("generer") ||
    item.certificateStatus.includes("envoyer"),
  );
  const protectedRevenue = interventions.reduce((sum, item) => sum + item.value, 0);

  return (
    <AppShell activePath="/terrain">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/interventions/new">
            PLANIFIER
          </a>
        }
        description="Vue smartphone pour enchainer les visites, retrouver le client, ouvrir le contrat et declencher les attestations."
        eyebrow="PWA terrain"
        title="Interventions mobile"
      />

      <section className="terrain-hero mt-6">
        <div>
          <p className="terrain-kicker">Mode installable</p>
          <h3>Votre file terrain dans la poche.</h3>
          <p>
            ContratPro peut etre installe sur mobile via le navigateur. Ce premier
            lot concentre les actions terrain critiques sans remplacer encore une
            vraie application offline.
          </p>
        </div>
        <div className="terrain-hero-metrics">
          <span>{planned.length} a faire</span>
          <span>{done.length} realisee(s)</span>
          <span>{formatEuro(protectedRevenue)} proteges</span>
        </div>
      </section>

      <div className="terrain-metrics mt-4">
        <article>
          <span>Planning</span>
          <strong>{interventions.length}</strong>
          <p>visites chargees</p>
        </article>
        <article>
          <span>Attestations</span>
          <strong>{certificateQueue.length}</strong>
          <p>a produire ou envoyer</p>
        </article>
      </div>

      <section className="terrain-list mt-4">
        <div className="terrain-list-header">
          <div>
            <h3>File d'interventions</h3>
            <p>Cartes lisibles sur smartphone, pensees pour une utilisation en deplacement.</p>
          </div>
          <StatusPill>{planned.length} planifiee(s)</StatusPill>
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
                  <dt>Technicien</dt>
                  <dd>{intervention.technician}</dd>
                </div>
                <div>
                  <dt>Prochaine visite</dt>
                  <dd>{intervention.nextVisitDate}</dd>
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
                    CONTRAT
                  </a>
                ) : null}
                <a
                  className="premium-action rounded-md text-sm font-semibold"
                  href={intervention.certificateId ? `/certificates/${intervention.certificateId}` : "/certificates"}
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
