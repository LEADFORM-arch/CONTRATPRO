import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";

import { ProspectionCopyButton } from "../ProspectionCopyButton";

const dailyRoutine = [
  {
    action: "Envoyer 5 a 10 DMs personnalises",
    moment: "Matin",
    proof: "Chaque message part d'un signal observe: commentaire, like, Excel, relance.",
  },
  {
    action: "Qualifier les réponses",
    moment: "Midi",
    proof: "Les prospects utiles passent dans /prospection avec source et prochaine action.",
  },
  {
    action: "Relancer les conversations ouvertes",
    moment: "Soir",
    proof: "Chaque objection est notée avant de proposer une démo.",
  },
];

const weeklyCadence = [
  ["Lundi 6h30", "Post probleme -> solution", "Contrats oubliés, Excel, revenu perdu"],
  ["Mercredi 12h15", "Question d'engagement", "Comprendre la methode actuelle sans vendre"],
  ["Vendredi 19h00", "Preuve ou chiffre", "Clic démo trace et DM chaud"],
  ["Vendredi soir", "Scorecard KPI", "Vendre, itérer ou couper l'angle"],
] as const;

const scorecardRows = [
  ["DMs envoyes", "25-50 / semaine", "Volume suffisant mais encore humain"],
  ["Reponses DM", "15-25%", "Changer accroche si moins de 10%"],
  ["Démos planifiées", "2+ / semaine", "Prioriser les leads score 80+"],
  ["Objection dominante", "1 claire", "Ne corriger qu'un blocage a la fois"],
] as const;

const promptDm = `Utilise le skill prospection Facebook ContratPro.
Genere un DM froid de 4 phrases maximum pour ce prospect:

Prenom:
Ville:
Spécialité:
Signal observe:
Douleur probable:

Contraintes:
- pas de lien;
- ton pair-a-pair;
- une seule question finale;
- ne pas dire "notre solution".`;

const promptAnalyse = `Utilise le skill prospection Facebook ContratPro.
Analyse ces résultats et donne une décision garder / itérer / couper.

DMs envoyes:
Reponses:
Démos:
Clics démo:
Posts publies:
Commentaires utiles:
Objections:

Donne:
- decision;
- preuve;
- correction a faire cette semaine;
- action prioritaire demain matin.`;

const dmExcel = `Salut [Prenom], j'ai vu que tu geres encore tes contrats sur Excel.

Ce n'est pas une critique, beaucoup de chauffagistes font pareil.
Le vrai sujet, c'est surtout ce qu'Excel ne signale pas tout seul: les contrats qui approchent de l'échéance.

Tu as déjà calculé combien ça peut représenter sur une année ?`;

const weeklyNote = `Semaine:
Angle teste:
Canal principal:
DMs envoyes:
Reponses:
Démos:
Meilleure phrase:
Objection dominante:
Décision: vendre / itérer / couper
Action lundi matin:`;

export default async function ProspectionSkillGuidePage() {
  const admin = await requireAdminUser("/admin/prospection/guide");

  return (
    <AppShell activePath="/admin/prospection/guide" showInternalTools>
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/admin/prospection/content"
            >
              Bibliotheque contenus
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/admin/prospection"
            >
              Retour dashboard
            </a>
            <a
              className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/prospection"
            >
              Ouvrir pipeline
            </a>
          </div>
        }
        description={`Mode d'emploi reserve a ${admin.email}. Utilise-le pour transformer le skill Facebook en routine de vente mesurable.`}
        eyebrow="Skill admin"
        title="Guide prospection Facebook"
      />

      <section className="prospection-guide-hero mt-6 rounded-lg border p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Architecte IA acquisition
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
            Une semaine doit produire une decision, pas seulement du contenu.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Le guide te donne les gestes a faire, les textes a copier, les
            prompts Codex et la scorecard pour savoir si un angle Facebook doit
            être gardé, itéré ou coupé.
          </p>
        </div>
        <div className="prospection-guide-decision">
          <strong>Décision vendredi</strong>
          <span>Vendre / Iterer / Couper</span>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <article className="prospection-guide-panel rounded-lg border p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Routine quotidienne
              </p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-50">
                Trois moments, trois preuves
              </h3>
            </div>
            <StatusPill>20 a 55 minutes</StatusPill>
          </div>
          <div className="prospection-guide-routine mt-4">
            {dailyRoutine.map((item) => (
              <article className="prospection-guide-step" key={item.moment}>
                <strong>{item.moment}</strong>
                <span>{item.action}</span>
                <p>{item.proof}</p>
              </article>
            ))}
          </div>
        </article>

        <aside className="prospection-guide-panel rounded-lg border p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Regle dure
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-50">
            Pas de lien dans le premier DM
          </h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Le premier message doit ouvrir une conversation. Le lien démo arrive
            après un signal clair: réponse, douleur explicite ou demande.
          </p>
        </aside>
      </section>

      <section className="prospection-guide-panel mt-5 rounded-lg border p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Cadence editoriale
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              La semaine Facebook minimale
            </h3>
          </div>
          <StatusPill>3 posts + DMs</StatusPill>
        </div>
        <div className="prospection-guide-grid mt-4">
          {weeklyCadence.map(([slot, action, evidence]) => (
            <article className="prospection-guide-card" key={slot}>
              <p>{slot}</p>
              <strong>{action}</strong>
              <span>{evidence}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <article className="skill-script-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Template
              </p>
              <h3 className="mt-1 font-semibold text-zinc-50">DM Excel</h3>
            </div>
            <ProspectionCopyButton label="Copier DM" text={dmExcel} />
          </div>
          <pre>{dmExcel}</pre>
        </article>

        <article className="skill-script-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Scorecard
              </p>
              <h3 className="mt-1 font-semibold text-zinc-50">Note vendredi</h3>
            </div>
            <ProspectionCopyButton label="Copier note" text={weeklyNote} />
          </div>
          <pre>{weeklyNote}</pre>
        </article>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <article className="skill-script-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                Prompt Codex
              </p>
              <h3 className="mt-1 font-semibold text-zinc-50">Générer un DM</h3>
            </div>
            <ProspectionCopyButton label="Copier prompt" text={promptDm} />
          </div>
          <pre>{promptDm}</pre>
        </article>

        <article className="skill-script-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                Prompt Codex
              </p>
              <h3 className="mt-1 font-semibold text-zinc-50">
                Analyser une semaine
              </h3>
            </div>
            <ProspectionCopyButton label="Copier prompt" text={promptAnalyse} />
          </div>
          <pre>{promptAnalyse}</pre>
        </article>
      </section>

      <section className="prospection-guide-panel mt-5 rounded-lg border p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            KPI scorecard 90 jours
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-50">
            Seuils de decision Architecte IA
          </h3>
        </div>
        <div className="prospection-guide-scorecard mt-4">
          {scorecardRows.map(([metric, target, action]) => (
            <article className="prospection-guide-score" key={metric}>
              <p>{metric}</p>
              <strong>{target}</strong>
              <span>{action}</span>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
