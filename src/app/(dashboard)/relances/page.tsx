import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { AgentPanel, StatCard } from "@/components/ui";
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
  const topRecommendation = agent.topRecommendations[0];
  const topRenewal =
    (topRecommendation
      ? renewals.find((renewal) => renewal.id === topRecommendation.contractId)
      : undefined) ??
    critical[0] ??
    atRisk[0] ??
    renewals[0];
  const priorityRenewals = (
    critical.length ? critical : atRisk.length ? atRisk : renewals
  ).slice(0, 3);
  const priorityValue = priorityRenewals.reduce(
    (sum, renewal) => sum + renewal.value,
    0,
  );
  const commandTone: RelanceTone =
    critical.length > 0 ? "rose" : atRisk.length > 0 ? "amber" : "emerald";
  const command = critical.length
    ? {
        action: "Relancer maintenant",
        label: "Risque critique",
        proof: `${critical.length} contrat(s) sous 15 jours. ${formatEuro(
          critical.reduce((sum, renewal) => sum + renewal.value, 0),
        )} à protéger immédiatement.`,
      }
    : atRisk.length
      ? {
          action: "Préparer les relances",
          label: "Fenêtre active",
          proof: `${atRisk.length} contrat(s) entrent dans la fenêtre de 45 jours. ${formatEuro(
            valueAtRisk,
          )} à sécuriser.`,
        }
      : {
          action: "Contrôler la file",
          label: "Portefeuille stable",
          proof: "Aucune urgence forte détectée. Gardez le rythme et surveillez les prochaines échéances.",
        };

  return (
    <AppShell activePath="/relances">
      <PageHeader
        action={
          <a className="cp-btn cp-btn-primary cp-btn-sm" href="/contracts/quick">
            Nouveau contrat
          </a>
        }
        description="Une seule mission : ne pas laisser un contrat rentable dormir trop longtemps."
        eyebrow="Agent IA de croissance"
        title="Relances renouvellement"
      />

      {/* Commande du jour — hero avec AgentPanel */}
      <div data-od-id="relance-revenue-command" className="relance-command-panel">
      <AgentPanel
        eyebrow="Commande du jour"
        thesis={command.label}
        proof={
          <>
            {command.proof}
            {topRenewal ? (
              <span className="mt-3 block" style={{ color: "var(--text-primary)" }}>
                <strong>{topRenewal.customer}</strong> — {formatEuro(topRenewal.value)} — J-{topRenewal.daysRemaining}
              </span>
            ) : (
              <span className="mt-3 block">Importer ou créer un contrat actif pour alimenter la file.</span>
            )}
          </>
        }
        action={
          <div className="relance-command-decision flex flex-col items-end gap-2">
            <span className="cp-pill cp-pill-dot" data-tone={commandTone}>Action prioritaire · {command.action}</span>
            <a className="cp-btn cp-btn-primary cp-btn-sm" href={topRenewal ? `/contracts/${topRenewal.id}` : "/contracts/quick"}>
              Ouvrir le dossier
            </a>
          </div>
        }
      />
      </div>

      {/* File du jour — 3 dossiers max */}
      {priorityRenewals.length ? (
        <section className="cp-relance-today">
          <header className="cp-relance-today-head">
            <div>
              <p className="cp-eyebrow">File du jour</p>
              <h3 className="cp-relance-today-title">3 dossiers maximum. On relance, puis on passe au chantier suivant.</h3>
            </div>
            <span className="cp-pill cp-pill-dot" data-tone="rose">{formatEuro(priorityValue)} à protéger</span>
          </header>
          <div className="cp-relance-today-grid">
            {priorityRenewals.map((renewal, index) => (
              <article className="cp-relance-card" data-tone={urgencyTone(renewal.daysRemaining)} key={renewal.id}>
                <div className="cp-relance-card-head">
                  <span className="cp-relance-card-num">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="cp-relance-card-urgency">J-{renewal.daysRemaining}</strong>
                </div>
                <h4 className="cp-relance-card-customer">{renewal.customer}</h4>
                <p className="cp-cell-sub">{renewal.equipment}</p>
                <dl className="cp-relance-card-meta">
                  <div>
                    <dt>À sauver</dt>
                    <dd className="cp-cell-amount">{formatEuro(renewal.value)}</dd>
                  </div>
                  <div>
                    <dt>Canal</dt>
                    <dd>{renewal.channel}</dd>
                  </div>
                </dl>
                <div className="cp-relance-card-actions">
                  <SendRenewalEmailButton channel={renewal.channel} contractId={renewal.id} message={renewal.script} />
                  <CopyScriptButton script={renewal.script} />
                  <a className="cp-btn cp-btn-ghost cp-btn-sm" href={`/contracts/${renewal.id}`}>Dossier</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Métriques agent */}
      <div className="cp-stat-grid">
        <StatCard label="File agent" value={String(agent.validationQueue)} detail="recommandations à valider par un humain" tone="cyan" />
        <StatCard label="Critiques" value={String(agent.criticalCount)} detail="contrats avec score IA critique" tone="amber" />
        <StatCard label="ROI potentiel" value={formatEuro(agent.totalExpectedValue)} detail="revenu annuel priorisé par l'agent" tone="rose" />
        <StatCard label="SEPA prêt" value={String(sepaReady.length)} detail="peuvent être renouvelés avec mandat" tone="emerald" />
      </div>

      {/* Top recommandations agent — sublimées */}
      <section className="cp-relance-agent relance-agent-panel">
        <header className="cp-relance-agent-head">
          <div>
            <p className="cp-eyebrow">Architecte IA de croissance</p>
            <h3 className="cp-relance-agent-title">Agent de relance CVC</h3>
            <p className="cp-relance-agent-desc">
              L'agent trie les contrats par risque commercial, montant à protéger, friction de paiement et historique de relance. Chaque action reste soumise à validation humaine avant envoi.
            </p>
          </div>
          <span className="cp-pill cp-pill-dot" data-tone="cyan">{agent.highCount + agent.criticalCount} priorité(s)</span>
        </header>
        <div className="cp-relance-agent-grid">
          {agent.topRecommendations.map((recommendation) => (
            <article className="cp-agent-card relance-agent-card" data-tone={agentTone(recommendation.riskLevel)} key={recommendation.contractId}>
              <div className="cp-agent-card-head">
                <div>
                  <p className="cp-cell-strong">{recommendation.customer}</p>
                  <p className="cp-cell-sub">{recommendation.roiLabel}</p>
                </div>
                <div className="cp-agent-score">
                  <span className="cp-agent-score-ring">{recommendation.score}</span>
                </div>
              </div>
              <p className="cp-agent-card-action">{recommendation.action}</p>
              <p className="cp-agent-card-brief">{recommendation.decisionBrief}</p>
              <ul className="cp-checklist">
                {recommendation.reasons.slice(0, 3).map((reason) => (
                  <li className="cp-check-item" key={reason}>{reason}</li>
                ))}
              </ul>
              <a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/contracts/${recommendation.contractId}`}>Valider</a>
            </article>
          ))}
        </div>
      </section>

      {/* File commerciale complète */}
      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">File commerciale</h3>
            <p className="cp-section-desc">Tri par échéance, avec la prochaine action conseillée.</p>
          </div>
          <span className="cp-pill" data-tone="rose">{critical.length} critique(s) · {renewals.length} total</span>
        </header>

        {renewals.length ? (
          <div className="cp-section-body cp-deal-list">
            {renewals.map((renewal) => {
              const recommendation = recommendationsByContract.get(renewal.id);
              return (
                <article className="cp-deal-card" data-tone={urgencyTone(renewal.daysRemaining)} key={renewal.id}>
                  <div className="cp-deal-main">
                    <div className="cp-deal-head">
                      <a className="cp-deal-customer" href={`/contracts/${renewal.id}`}>{renewal.customer}</a>
                      <StatusPill>{renewal.priority}</StatusPill>
                    </div>
                    <p className="cp-cell-sub">{renewal.city} — {renewal.equipment}</p>
                    <p className="cp-deal-script">{renewal.script}</p>
                    {recommendation ? (
                      <div className="cp-deal-agent-note relance-agent-note">
                        <span className="cp-pill" data-tone="cyan">Score IA {recommendation.score}</span>
                        <p>{recommendation.action}</p>
                        <div className="cp-deal-variants">
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

                  <dl className="cp-deal-meta">
                    <div className="cp-detail-item"><dt>Échéance</dt><dd>{renewal.endDate}</dd></div>
                    <div className="cp-detail-item"><dt>Jours</dt><dd>{renewal.daysRemaining}</dd></div>
                    <div className="cp-detail-item"><dt>Montant</dt><dd className="cp-cell-amount">{formatEuro(renewal.value)}</dd></div>
                    <div className="cp-detail-item"><dt>Canal</dt><dd>{renewal.channel}</dd></div>
                  </dl>

                  <div className="cp-deal-actions">
                    <SendRenewalEmailButton channel={renewal.channel} contractId={renewal.id} message={renewal.script} />
                    <CopyScriptButton script={renewal.script} />
                    <LogRenewalButton channel={renewal.channel} contractId={renewal.id} message={renewal.script} />
                    <a className="cp-btn cp-btn-ghost cp-btn-sm" href={`/contracts/${renewal.id}`}>Dossier</a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="cp-section-body">
            <ActivationEmptyState
              actionHref="/contracts/quick"
              actionLabel="Créer un contrat actif"
              eyebrow="Relance automatique"
              proofPoints={["Détecter les échéances", "Prioriser le revenu à risque", "Préparer scripts et emails"]}
              secondaryHref="/import"
              secondaryLabel="Importer contrats"
              title="Les relances apparaissent dès qu'un contrat actif possède une échéance."
            />
          </div>
        )}
      </section>

      {/* Journal des relances */}
      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">Journal des relances</h3>
            <p className="cp-section-desc">Historique commercial prêt pour le suivi, les stats et les automatisations.</p>
          </div>
          <StatusPill>{actions.length} action(s)</StatusPill>
        </header>

        <div className="cp-section-body cp-relance-stats">
          <StatCard label="À faire" value={String(actionStats.todo)} tone="amber" />
          <StatCard label="Envoyées" value={String(actionStats.sent)} tone="cyan" />
          <StatCard label="Gagnées" value={String(actionStats.won)} tone="emerald" />
          <StatCard label="Perdues" value={String(actionStats.lost)} tone="rose" />
        </div>

        <div className="overflow-x-auto">
          <table className="cp-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Canal</th>
                <th>Action</th>
                <th>Échéance</th>
                <th>Issue</th>
                <th>Statut</th>
                <th>Décision</th>
              </tr>
            </thead>
            <tbody>
              {actions.length ? (
                actions.map((action) => (
                  <tr key={action.id}>
                    <td><a className="cp-deal-link" href={`/contracts/${action.contractId}`}>{action.customer}</a></td>
                    <td className="cp-cell-strong">{action.channel}</td>
                    <td className="cp-deal-message">{action.message}</td>
                    <td>{action.dueAt}</td>
                    <td>{action.outcome}</td>
                    <td><StatusPill>{action.status}</StatusPill></td>
                    <td><RenewalActionControls actionId={action.id} currentStatus={action.rawStatus} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="cp-empty-inline" colSpan={7}>Aucune relance journalisée pour le moment. Cliquez sur Journaliser dans la file commerciale.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
