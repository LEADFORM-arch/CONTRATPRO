import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import { getPilotScorecard } from "@/server/pilot-scorecard";

export default async function AdminPilotsPage() {
  const admin = await requireAdminUser("/admin/pilots");
  const scorecard = getPilotScorecard();
  const architect = scorecard.architect;

  return (
    <AppShell activePath="/admin/pilots" showInternalTools>
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/import"
            >
              Ouvrir import
            </a>
            <a
              className="premium-action rounded-md text-sm font-semibold"
              href="/admin/launch"
            >
              Go-live
            </a>
          </div>
        }
        description={`Cockpit reserve a ${admin.email}. Sert a mener les 3 premiers pilotes avec une grille identique, mesurable et orientee decision d'achat.`}
        eyebrow="Pilotes chauffagistes"
        title="Scorecard pilote terrain"
      />

      <section className="pilot-command mt-6 rounded-lg border p-5 shadow-sm" data-od-id="pilot-executive-summary">
        <div className="grid gap-5 xl:grid-cols-[1fr_360px] xl:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Architecte IA pilote</p>
            <h3 className="mt-2 text-2xl font-black text-zinc-50">
              Obtenir une decision claire apres 3 pilotes.
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
              {architect.thesis}
            </p>
          </div>
          <div className="pilot-decision-box">
            <span>Decision attendue</span>
            <strong>Vendre / Iterer / Stop</strong>
            <p>Une sortie ecrite apres chaque rendez-vous.</p>
          </div>
        </div>
      </section>

      <section className="pilot-kpi-grid mt-6" data-od-id="pilot-kpis">
        {architect.kpis.map((kpi) => (
          <article className="pilot-kpi-card" key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <p>{kpi.delta}</p>
          </article>
        ))}
      </section>

      <section className="pilot-architect mt-6 rounded-lg border shadow-sm" data-od-id="pilot-ai-architect">
        <div className="pilot-architect-header">
          <div>
            <p className="text-sm font-semibold text-cyan-300">{architect.headline}</p>
            <h3>Decision premium apres rendez-vous</h3>
            <p>{architect.nextMove}</p>
          </div>
          <div className="pilot-architect-metrics">
            <div>
              <span>Objectif</span>
              <strong>{architect.primaryMetric}</strong>
            </div>
            <div>
              <span>Seuil</span>
              <strong>{architect.secondaryMetric}</strong>
            </div>
          </div>
        </div>
        <div className="pilot-signal-panel" data-od-id="pilot-signal-chart">
          <div>
            <span>Lecture des signaux</span>
            <strong>Courbe attendue du pilote ideal</strong>
            <p>
              Si la courbe chute sur Terrain ou Prix, l'Architecte IA classe en
              iteration avant toute nouvelle promesse commerciale.
            </p>
          </div>
          <div className="pilot-signal-bars" aria-label="Signaux pilote">
            {architect.signalSequence.map((point) => (
              <div className="pilot-signal-bar" key={point.label}>
                <span style={{ height: `${point.score}%` }} />
                <small>{point.label}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="pilot-architect-grid">
          {architect.insights.map((insight) => (
            <article className="pilot-architect-card" data-decision={insight.decision} key={insight.label}>
              <span>{insight.label}</span>
              <strong>{insight.signal}</strong>
              <p>Preuve: {insight.evidence}</p>
              <small>{insight.action}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]" data-od-id="pilot-workflow">
        <article className="pilot-panel rounded-lg border shadow-sm" data-od-id="pilot-qualification">
          <div className="pilot-panel-header">
            <h3>Qualification du bon pilote</h3>
            <StatusPill>{scorecard.criteria.length} criteres</StatusPill>
          </div>
          <div className="pilot-grid">
            {scorecard.criteria.map((criterion) => (
              <article className="pilot-card" key={criterion.label}>
                <strong>{criterion.label}</strong>
                <p>{criterion.target}</p>
                <small>{criterion.warning}</small>
              </article>
            ))}
          </div>
        </article>

        <article className="pilot-panel rounded-lg border shadow-sm" data-od-id="pilot-session-plan">
          <div className="pilot-panel-header">
            <h3>Scenario 90 minutes</h3>
            <StatusPill>{scorecard.sessionBlocks.length} blocs</StatusPill>
          </div>
          <div className="divide-y divide-zinc-800/80">
            {scorecard.sessionBlocks.map((block) => (
              <div className="pilot-session-row" key={block.label}>
                <span>{block.duration}</span>
                <div>
                  <strong>{block.label}</strong>
                  <p>{block.goal}</p>
                  <small>Preuve: {block.proof}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="pilot-panel mt-6 rounded-lg border shadow-sm" data-od-id="pilot-questions">
        <div className="pilot-panel-header">
          <div>
            <h3>Questions a poser pendant le rendez-vous</h3>
            <p className="mt-1 text-sm text-zinc-400">
              A remplir a chaud dans la fiche du pilote ou dans le CRM fondateur.
            </p>
          </div>
          <StatusPill>{scorecard.questions.length} questions</StatusPill>
        </div>
        <div className="pilot-question-grid">
          {scorecard.questions.map((question) => (
            <article className="pilot-question-card" key={question.label}>
              <span>{question.label}</span>
              <strong>{question.prompt}</strong>
              <p>Signal OK: {question.successSignal}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pilot-go mt-6 rounded-lg border p-5" data-od-id="pilot-go-no-go">
        <div>
          <p className="text-sm font-semibold text-emerald-300">Regle de decision</p>
          <h3 className="mt-1 text-lg font-bold text-zinc-50">GO apres 3 pilotes seulement si...</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            "2 pilotes sur 3 importent une vraie base.",
            "2 pilotes sur 3 identifient des contrats a relancer.",
            "1 pilote accepte Starter ou Pro.",
            "Aucun blocage juridique ou securite critique.",
          ].map((item) => (
            <div className="pilot-go-item" key={item}>{item}</div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
