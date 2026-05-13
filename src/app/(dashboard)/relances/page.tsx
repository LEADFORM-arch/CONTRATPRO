import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import {
  getRenewalActions,
  getRenewalPipeline,
} from "@/server/contratpro-data";
import { analyzeRenewalAgent } from "@/server/renewal-agent";

import { CopyScriptButton } from "./CopyScriptButton";
import { LogRenewalButton } from "./LogRenewalButton";
import { RenewalActionControls } from "./RenewalActionControls";
import { SendRenewalEmailButton } from "./SendRenewalEmailButton";

type RelanceTone = "amber" | "cyan" | "emerald" | "rose";

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: RelanceTone;
}) {
  return (
    <article className="relance-stat-card" data-tone={tone}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <strong className="mt-3 block text-3xl font-semibold text-zinc-950">
        {value}
      </strong>
      <p className="mt-2 text-sm leading-5 text-zinc-500">{detail}</p>
    </article>
  );
}

function ActionStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: RelanceTone;
}) {
  return (
    <div className="relance-action-stat" data-tone={tone}>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <strong className="mt-1 block text-xl text-zinc-950">{value}</strong>
    </div>
  );
}

function urgencyTone(daysRemaining: number): RelanceTone {
  if (daysRemaining <= 15) {
    return "rose";
  }
  if (daysRemaining <= 45) {
    return "amber";
  }
  return "emerald";
}

function agentTone(level: "critical" | "high" | "watch"): RelanceTone {
  if (level === "critical") {
    return "rose";
  }
  if (level === "high") {
    return "amber";
  }
  return "cyan";
}

export default async function RelancesPage() {
  const [renewals, actions] = await Promise.all([
    getRenewalPipeline(),
    getRenewalActions(),
  ]);
  const atRisk = renewals.filter((renewal) => renewal.daysRemaining <= 45);
  const critical = renewals.filter((renewal) => renewal.daysRemaining <= 15);
  const valueAtRisk = atRisk.reduce((sum, renewal) => sum + renewal.value, 0);
  const sepaReady = renewals.filter((renewal) =>
    renewal.paymentMethod.includes("SEPA"),
  );
  const agent = analyzeRenewalAgent(renewals, actions);
  const recommendationsByContract = new Map(
    agent.recommendations.map((recommendation) => [
      recommendation.contractId,
      recommendation,
    ]),
  );
  const actionStats = {
    lost: actions.filter((action) => action.rawStatus === "LOST").length,
    sent: actions.filter((action) => action.rawStatus === "SENT").length,
    todo: actions.filter((action) => action.rawStatus === "TODO").length,
    won: actions.filter((action) => action.rawStatus === "WON").length,
  };

  return (
    <AppShell activePath="/relances">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/contracts/new">
            Nouveau contrat
          </a>
        }
        description="Priorisez les renouvellements, choisissez le bon canal et lancez les relances avec un discours coherent."
        eyebrow="Agent IA de croissance"
        title="Relances renouvellement"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail="recommandations a valider par un humain"
          label="File agent"
          tone="cyan"
          value={String(agent.validationQueue)}
        />
        <StatCard
          detail="contrats avec score IA critique"
          label="Critiques"
          tone="amber"
          value={String(agent.criticalCount)}
        />
        <StatCard
          detail="revenu annuel priorise par l'agent"
          label="ROI potentiel"
          tone="rose"
          value={formatEuro(agent.totalExpectedValue)}
        />
        <StatCard
          detail="peuvent etre renouveles avec mandat"
          label="SEPA pret"
          tone="emerald"
          value={String(sepaReady.length)}
        />
      </div>

      <section className="relance-agent-panel mt-6 rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-300">
              Architecte IA de croissance
            </p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">
              Agent de relance CVC
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              L'agent trie les contrats par risque commercial, montant a proteger,
              friction de paiement et historique de relance. Chaque action reste
              soumise a validation humaine avant envoi.
            </p>
          </div>
          <span className="relance-agent-badge">
            {agent.highCount + agent.criticalCount} priorite(s)
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {agent.topRecommendations.map((recommendation) => (
            <article
              className="relance-agent-card"
              data-tone={agentTone(recommendation.riskLevel)}
              key={recommendation.contractId}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-50">
                    {recommendation.customer}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {recommendation.roiLabel}
                  </p>
                </div>
                <strong>{recommendation.score}</strong>
              </div>
              <p className="mt-3 text-sm leading-5 text-zinc-300">
                {recommendation.action}
              </p>
              <p className="relance-agent-brief mt-3">
                {recommendation.decisionBrief}
              </p>
              <ul className="mt-3 space-y-1 text-xs leading-5 text-zinc-500">
                {recommendation.reasons.slice(0, 3).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <a
                className="premium-secondary-action mt-4 inline-flex rounded-md px-3 py-2 text-sm font-semibold"
                href={`/contracts/${recommendation.contractId}`}
              >
                Valider
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="relance-section mt-6">
        <div className="relance-section-header flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">
              File commerciale
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Tri par echeance, avec la prochaine action conseillee.
            </p>
          </div>
          <span className="relance-critical-pill">
            {critical.length} critique(s)
          </span>
        </div>

        <div className="grid gap-4 p-4">
          {renewals.map((renewal) => {
            const recommendation = recommendationsByContract.get(renewal.id);
            return (
            <article
              className="relance-deal-card"
              data-tone={urgencyTone(renewal.daysRemaining)}
              key={renewal.id}
            >
              <div className="grid gap-5 xl:grid-cols-[1.25fr_0.9fr_auto] xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      className="text-lg font-semibold text-zinc-950"
                      href={`/contracts/${renewal.id}`}
                    >
                      {renewal.customer}
                    </a>
                    <StatusPill>{renewal.priority}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    {renewal.city} - {renewal.equipment}
                  </p>
                  <p className="relance-script mt-4 text-sm leading-6">
                    {renewal.script}
                  </p>
                  {recommendation ? (
                    <div className="relance-agent-note mt-3">
                      <span>Score IA {recommendation.score}</span>
                      <p>{recommendation.action}</p>
                      <div className="relance-agent-variants">
                        {recommendation.messageVariants.map((variant) => (
                          <details key={variant.label}>
                            <summary>{variant.label}</summary>
                            <p>{variant.text}</p>
                          </details>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="relance-detail-cell">
                    <dt>Echeance</dt>
                    <dd>{renewal.endDate}</dd>
                  </div>
                  <div className="relance-detail-cell">
                    <dt>Jours</dt>
                    <dd>{renewal.daysRemaining}</dd>
                  </div>
                  <div className="relance-detail-cell">
                    <dt>Montant</dt>
                    <dd>{formatEuro(renewal.value)}</dd>
                  </div>
                  <div className="relance-detail-cell">
                    <dt>Canal</dt>
                    <dd>{renewal.channel}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2 xl:flex-col">
                  <SendRenewalEmailButton
                    channel={renewal.channel}
                    contractId={renewal.id}
                    message={renewal.script}
                  />
                  <CopyScriptButton script={renewal.script} />
                  <LogRenewalButton
                    channel={renewal.channel}
                    contractId={renewal.id}
                    message={renewal.script}
                  />
                  <a
                    className="premium-inline-action rounded-md px-3 py-2 text-center text-sm font-semibold"
                    href={`/contracts/${renewal.id}`}
                  >
                    Dossier
                  </a>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      <section className="relance-section mt-6">
        <div className="relance-section-header flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">
              Journal des relances
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Historique commercial pret pour le suivi, les stats et les
              automatisations.
            </p>
          </div>
          <StatusPill>{actions.length} action(s)</StatusPill>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-4">
          <ActionStat label="A faire" tone="amber" value={actionStats.todo} />
          <ActionStat label="Envoyees" tone="cyan" value={actionStats.sent} />
          <ActionStat label="Gagnees" tone="emerald" value={actionStats.won} />
          <ActionStat label="Perdues" tone="rose" value={actionStats.lost} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Canal</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Echeance</th>
                <th className="px-4 py-3 font-semibold">Issue</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {actions.length ? (
                actions.map((action) => (
                  <tr className="dashboard-table-row" key={action.id}>
                    <td className="px-4 py-4">
                      <a
                        className="font-semibold text-emerald-700"
                        href={`/contracts/${action.contractId}`}
                      >
                        {action.customer}
                      </a>
                    </td>
                    <td className="px-4 py-4 font-medium">{action.channel}</td>
                    <td className="max-w-md px-4 py-4 text-zinc-600">
                      {action.message}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">{action.dueAt}</td>
                    <td className="px-4 py-4 text-zinc-600">{action.outcome}</td>
                    <td className="px-4 py-4">
                      <StatusPill>{action.status}</StatusPill>
                    </td>
                    <td className="px-4 py-4">
                      <RenewalActionControls
                        actionId={action.id}
                        currentStatus={action.rawStatus}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-sm text-zinc-500" colSpan={7}>
                    Aucune relance journalisee pour le moment. Cliquez sur
                    Journaliser dans la file commerciale.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
