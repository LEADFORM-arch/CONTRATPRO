import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import { getPilotScorecard } from "@/server/pilot-scorecard";

export default async function AdminPilotsPage() {
  const admin = await requireAdminUser("/admin/pilots");
  const scorecard = getPilotScorecard();

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

      <section className="pilot-command mt-6 rounded-lg border p-5 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_360px] xl:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Objectif priorite 1</p>
            <h3 className="mt-2 text-2xl font-black text-zinc-50">
              Obtenir une decision claire apres 3 pilotes.
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
              Le but n'est pas de faire une demo flatteuse. Le but est de savoir si
              un chauffagiste importe sa vraie base, trouve du cash a recuperer et
              accepte Starter ou Pro.
            </p>
          </div>
          <div className="pilot-decision-box">
            <span>Decision attendue</span>
            <strong>Vendre / Iterer / Stop</strong>
            <p>Une sortie ecrite apres chaque rendez-vous.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="pilot-panel rounded-lg border shadow-sm">
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

        <article className="pilot-panel rounded-lg border shadow-sm">
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

      <section className="pilot-panel mt-6 rounded-lg border shadow-sm">
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

      <section className="pilot-go mt-6 rounded-lg border p-5">
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
