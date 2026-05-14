import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import { getProspectionLeads } from "@/server/contratpro-data";

import { LeadForm } from "./LeadForm";
import { LeadStatusControls } from "./LeadStatusControls";

export default async function ProspectionPage() {
  await requireAdminUser("/prospection");
  const leads = await getProspectionLeads();
  const hotLeads = leads.filter((lead) => lead.score >= 80);
  const inboundDemoLeads = leads.filter((lead) => lead.source === "PUBLIC_DEMO");
  const toQualify = leads.filter((lead) => lead.rawStatus === "TO_QUALIFY");
  const replied = leads.filter((lead) => lead.rawStatus === "REPLIED");
  const contacted = leads.filter((lead) =>
    ["CONTACTED", "REPLIED", "DEMO_SCHEDULED", "WON"].includes(lead.rawStatus),
  );
  const demos = leads.filter((lead) => lead.rawStatus === "DEMO_SCHEDULED");
  const won = leads.filter((lead) => lead.rawStatus === "WON");
  const conversionRate =
    leads.length > 0 ? Math.round((won.length / leads.length) * 100) : 0;
  const pipelineStages = [
    ["A qualifier", toQualify, "Appeler sous 24h"],
    ["Contactes", contacted.filter((lead) => lead.rawStatus !== "WON"), "Obtenir une reponse"],
    ["Demos", demos, "Montrer le cash-flow"],
    ["Gagnes", won, "Onboarding client"],
  ] as const;
  const priorityQueue = [...inboundDemoLeads, ...hotLeads, ...replied]
    .filter(
      (lead, index, list) => list.findIndex((item) => item.id === lead.id) === index,
    )
    .filter((lead) => !["WON", "LOST"].includes(lead.rawStatus))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <AppShell activePath="/prospection" showInternalTools>
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/settings/facebook"
          >
            Reglages acquisition
          </a>
        }
        description="Espace interne fondateur pour trouver des chauffagistes, qualifier les meilleurs comptes et convertir les premiers clients ContratPro."
        eyebrow="Acquisition interne"
        title="Pipeline de prospection ContratPro"
      />

      <section className="internal-notice mt-6 rounded-lg border p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
          Non visible client
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Ce module sert a ton acquisition commerciale. Il ne fait pas partie du
          produit livre aux chauffagistes: il pilote tes leads, tes messages et
          tes demonstrations.
        </p>
      </section>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["Leads", leads.length, "Comptes identifies", "cyan"],
          ["Prioritaires", hotLeads.length, "Score 80+", "amber"],
          ["Demandes demo", inboundDemoLeads.length, "Entrantes site", "emerald"],
          ["Demos", demos.length, `${conversionRate}% gagne`, "rose"],
        ].map(([label, value, helper, tone]) => (
          <article
            className="prospection-stat-card"
            data-tone={tone}
            key={label}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {label}
            </p>
            <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
              {value}
            </strong>
            <p className="mt-2 text-sm text-zinc-400">{helper}</p>
          </article>
        ))}
      </div>

      <section className="sales-command mt-5 rounded-lg border p-4">
        <div className="sales-command-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Command center
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              File d'appel fondateur
            </h3>
          </div>
          <StatusPill>{priorityQueue.length} priorites</StatusPill>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3">
            {priorityQueue.length ? (
              priorityQueue.map((lead, index) => (
                <article className="sales-priority-card" key={lead.id}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      #{index + 1} - {lead.source}
                    </p>
                    <h4 className="mt-1 text-base font-semibold text-zinc-50">
                      {lead.company}
                    </h4>
                    <p className="mt-1 text-sm text-zinc-400">
                      {lead.contact} - {lead.city} - {lead.phone}
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {lead.nextAction}
                    </p>
                    <p className="mt-2 text-xs text-emerald-300">
                      Attribution: {lead.attribution}
                    </p>
                  </div>
                  <span className="prospection-score" data-hot={lead.score >= 80}>
                    {lead.score}<span>/100</span>
                  </span>
                </article>
              ))
            ) : (
              <article className="sales-priority-card">
                <div>
                  <h4 className="text-base font-semibold text-zinc-50">
                    Aucun lead urgent
                  </h4>
                  <p className="mt-1 text-sm text-zinc-400">
                    Le prochain formulaire demo alimente cette file d'appel.
                  </p>
                </div>
              </article>
            )}
          </div>

          <div className="sales-playbook rounded-lg border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Cadence premium
            </p>
            <div className="mt-4 grid gap-3">
              {[
                ["J0", "Appeler dans la journee, qualifier parc et Excel actuel."],
                ["J+2", "Envoyer recap ROI + lien demo si pas de reponse."],
                ["J+5", "Relancer sur contrat oublie et SEPA recurrent."],
              ].map(([day, action]) => (
                <div className="sales-playbook-step" key={day}>
                  <strong>{day}</strong>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="lead-stage-board mt-5">
        {pipelineStages.map(([label, stageLeads, objective]) => (
          <article className="lead-stage-card" key={label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {label}
                </p>
                <strong className="mt-2 block text-2xl text-zinc-50">
                  {stageLeads.length}
                </strong>
              </div>
              <StatusPill>{objective}</StatusPill>
            </div>
            <div className="mt-4 grid gap-2">
              {stageLeads.slice(0, 3).map((lead) => (
                <div className="lead-stage-mini" key={lead.id}>
                  <span>{lead.company}</span>
                  <strong>{lead.score}</strong>
                </div>
              ))}
              {!stageLeads.length ? (
                <p className="text-sm text-zinc-500">Aucun compte dans cette etape.</p>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6">
        <LeadForm />
      </section>

      <section className="prospection-section mt-6 rounded-lg border">
        <div className="prospection-section-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Pipeline commercial
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Comptes chauffagistes a qualifier et convertir
            </h3>
          </div>
          <span className="prospection-signal-pill">
            {hotLeads.length} signaux chauds
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1160px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head">
                <th className="px-4 py-3 font-semibold">Entreprise</th>
                <th className="px-4 py-3 font-semibold">Canal</th>
                <th className="px-4 py-3 font-semibold">Attribution</th>
                <th className="px-4 py-3 font-semibold">Specialite</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Prochaine action</th>
                <th className="px-4 py-3 font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {leads.map((lead) => (
                <tr className="prospection-table-row" key={lead.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-50">{lead.company}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {lead.contact} - {lead.city}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {lead.email} - {lead.phone}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Cree le {lead.createdAt}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="prospection-source-pill">{lead.source}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-zinc-400">
                    {lead.attribution}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{lead.specialty}</td>
                  <td className="px-4 py-4">
                    <span
                      className="prospection-score"
                      data-hot={lead.score >= 80}
                    >
                      {lead.score}<span>/100</span>
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill>{lead.status}</StatusPill>
                    <p className="mt-1 text-xs text-zinc-500">
                      Touch: {lead.lastTouch}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{lead.nextAction}</td>
                  <td className="px-4 py-4">
                    <LeadStatusControls
                      currentStatus={lead.rawStatus}
                      leadId={lead.id}
                    />
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
