import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import { getProspectionLeads } from "@/server/contratpro-data";

import { LeadForm } from "./LeadForm";
import { LeadStatusControls } from "./LeadStatusControls";

export default async function ProspectionPage() {
  await requireAdminUser("/prospection");
  const leads = await getProspectionLeads();
  const hotLeads = leads.filter((lead) => lead.score >= 80);
  const contacted = leads.filter((lead) =>
    ["CONTACTED", "REPLIED", "DEMO_SCHEDULED", "WON"].includes(lead.rawStatus),
  );
  const demos = leads.filter((lead) => lead.rawStatus === "DEMO_SCHEDULED");
  const won = leads.filter((lead) => lead.rawStatus === "WON");
  const conversionRate =
    leads.length > 0 ? Math.round((won.length / leads.length) * 100) : 0;

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
          ["Contactes", contacted.length, "Relations lancees", "emerald"],
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
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head">
                <th className="px-4 py-3 font-semibold">Entreprise</th>
                <th className="px-4 py-3 font-semibold">Canal</th>
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
                  </td>
                  <td className="px-4 py-4">
                    <span className="prospection-source-pill">{lead.source}</span>
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
