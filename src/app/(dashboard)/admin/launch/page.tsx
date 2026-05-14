import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import type { LaunchStatus } from "@/server/launch-readiness";
import {
  getLaunchReadiness,
  getPilotReadinessPlan,
  getProductionActivationPlan,
} from "@/server/launch-readiness";

const statusLabels: Record<LaunchStatus, string> = {
  critical: "Bloquant",
  ready: "Pret",
  warning: "A verrouiller",
};

const statusCopy: Record<LaunchStatus, string> = {
  critical: "ContratPro tourne, mais certains prerequis business bloquent encore un lancement payant complet.",
  ready: "Tous les signaux critiques sont au vert pour ouvrir commercialement.",
  warning: "Le produit est exploitable en lancement controle, avec quelques points a fermer.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function LaunchPage() {
  const admin = await requireAdminUser("/admin/launch");
  const readiness = getLaunchReadiness();
  const pilotPlan = getPilotReadinessPlan();
  const activationPlan = getProductionActivationPlan();

  return (
    <AppShell activePath="/admin/launch" showInternalTools>
      <PageHeader
        action={
          readiness.appUrl ? (
            <a className="premium-action rounded-md text-sm font-semibold" href={readiness.appUrl}>
              Ouvrir la prod
            </a>
          ) : null
        }
        description={`Cockpit reserve a ${admin.email}. Il se concentre sur le passage de produit en ligne a SaaS vendable: revenus, securite, operations et preuves de production.`}
        eyebrow="Go-live fondateur"
        title="Readiness commerciale"
      />

      <section className="launch-command mt-6 rounded-lg border p-5 shadow-sm" data-status={readiness.status}>
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Score go-live</p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <strong className="text-6xl font-black tracking-normal text-zinc-50">
                {readiness.score}
                <span className="text-2xl text-zinc-500">/100</span>
              </strong>
              <span className="launch-status-pill" data-status={readiness.status}>
                {statusLabels[readiness.status]}
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
              {statusCopy[readiness.status]}
            </p>
          </div>

          <div className="launch-summary">
            <div>
              <span>Bloquants</span>
              <strong>{readiness.blockers.length}</strong>
            </div>
            <div>
              <span>Dernier controle</span>
              <strong>{formatDate(readiness.generatedAt)}</strong>
            </div>
            <div>
              <span>URL</span>
              <strong>{readiness.appUrl ? "Configuree" : "Absente"}</strong>
            </div>
          </div>
        </div>
      </section>

      {readiness.blockers.length ? (
        <section className="launch-blockers mt-6 rounded-lg border p-5">
          <div>
            <p className="text-sm font-semibold text-rose-300">Priorite immediate</p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">Bloquants avant vente forte</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {readiness.blockers.map((blocker) => (
              <article className="launch-blocker-row" key={blocker.label}>
                <div>
                  <strong>{blocker.label}</strong>
                  <p>{blocker.action}</p>
                </div>
                <span>{blocker.owner}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        {readiness.sections.map((section) => (
          <article className="launch-panel rounded-lg border shadow-sm" key={section.label}>
            <div className="launch-panel-header">
              <h3>{section.label}</h3>
              <span>{section.items.length} checks</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {section.items.map((item) => (
                <div className="launch-check-row" data-status={item.status} key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                    <small>{item.action}</small>
                  </div>
                  <span>{statusLabels[item.status]}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="launch-activation mt-6 rounded-lg border shadow-sm" data-od-id="production-live-activation">
        <div className="launch-activation-header">
          <div>
            <p className="text-sm font-semibold text-cyan-300">Activation production live</p>
            <h3>Passer de MVP pret a SaaS encaissable.</h3>
            <p>
              Cette sequence se joue dans l'ordre : freeze, backup, secrets,
              providers live, smoke tests, rollback. Aucun raccourci avant vrais clients.
            </p>
          </div>
          <span>{activationPlan.length} checks live</span>
        </div>
        <div className="launch-activation-grid">
          {activationPlan.map((step) => (
            <article className="launch-activation-card" data-risk={step.risk} key={step.label}>
              <div className="launch-activation-top">
                <strong>{step.label}</strong>
                <span>{step.owner}</span>
              </div>
              <p>{step.objective}</p>
              <code>{step.command}</code>
              <small>Preuve: {step.evidence}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="launch-panel mt-6 rounded-lg border shadow-sm">
        <div className="launch-panel-header">
          <div>
            <h3>Plan pilote terrain</h3>
            <p className="mt-1 text-sm text-zinc-400">
              A executer avec 1 a 3 chauffagistes avant publicite ou prospection large.
            </p>
          </div>
          <span>{pilotPlan.length} etapes</span>
        </div>
        <div className="launch-pilot-grid">
          {pilotPlan.map((step) => (
            <article className="launch-pilot-card" key={step.label}>
              <div className="flex items-start justify-between gap-3">
                <strong>{step.label}</strong>
                <span>{step.owner}</span>
              </div>
              <p>{step.objective}</p>
              <small>Succes: {step.successCriteria}</small>
              <em>Preuve: {step.evidence}</em>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
