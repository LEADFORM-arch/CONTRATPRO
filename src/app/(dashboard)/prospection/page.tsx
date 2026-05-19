import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import { getProspectionLeads } from "@/server/contratpro-data";

import { LeadCommercialLogForm } from "./LeadCommercialLogForm";
import { LeadDmCopyButton } from "./LeadDmCopyButton";
import { LeadForm } from "./LeadForm";
import { LeadStatusControls } from "./LeadStatusControls";
import { PilotBriefCopyButton } from "./PilotBriefCopyButton";

type ProspectionLead = Awaited<ReturnType<typeof getProspectionLeads>>[number];

function firstName(contact: string) {
  const clean = contact && contact !== "-" ? contact.trim() : "";
  return clean.split(/\s+/)[0] || "[Prenom]";
}

function leadSignal(lead: ProspectionLead) {
  const evidence = [lead.source, lead.attribution, lead.notes, lead.nextAction]
    .filter((value) => value && value !== "-")
    .join(" | ");
  return evidence || "votre activite CVC";
}

function leadDmScenario(lead: ProspectionLead) {
  const signal = leadSignal(lead).toLowerCase();

  if (lead.rawStatus === "REPLIED") {
    return "réponse";
  }

  if (lead.rawStatus === "CONTACTED") {
    return "relance";
  }

  if (lead.source === "PUBLIC_DEMO" || lead.rawStatus === "DEMO_SCHEDULED") {
    return "demo";
  }

  if (signal.includes("excel")) {
    return "excel";
  }

  if (lead.score >= 80) {
    return "chaud";
  }

  return "froid";
}

function leadFounderAction(lead: ProspectionLead) {
  const scenario = leadDmScenario(lead);

  if (scenario === "réponse") {
    return {
      decision: "Proposer deux créneaux démo",
      nextMove: "Copier le DM, envoyer, puis passer le lead en Démo si un créneau est choisi.",
      proof: "Le prospect a déjà répondu.",
    };
  }

  if (scenario === "relance") {
    return {
      decision: "Relancer une seule fois",
      nextMove: "Copier le DM de relance. Sans réponse, garder l'objection ou couper le lead.",
      proof: "Le lead a déjà été contacté.",
    };
  }

  if (scenario === "demo") {
    return {
      decision: "Qualifier le contexte démo",
      nextMove: "Copier le DM, obtenir le contexte métier, puis préparer une démo sur contrats.",
      proof: "Le lead vient du formulaire ou d'une démo planifiée.",
    };
  }

  if (scenario === "excel") {
    return {
      decision: "Tester la douleur Excel",
      nextMove: "Copier le DM, demander le volume clients, puis qualifier le parc contrats.",
      proof: "Le signal parle d'Excel ou d'organisation fichier.",
    };
  }

  if (scenario === "chaud") {
    return {
      decision: "Contacter maintenant",
      nextMove: "Copier le DM, envoyer aujourd'hui, puis marquer Contacté dans le pipeline.",
      proof: "Score 80+ ou signal commercial fort.",
    };
  }

  return {
    decision: "Ouvrir sans vendre",
    nextMove: "Copier le DM, attendre une réponse, puis ne relancer qu'avec un signal clair.",
    proof: "Lead encore froid ou peu qualifié.",
  };
}

function latestCommercialLog(lead: ProspectionLead) {
  const latest = lead.notes
    .split("\n")
    .filter((line) => line.includes("Suivi commercial"))
    .reverse()[0];

  if (!latest) {
    return null;
  }

  const valueOf = (key: string) => {
    const match = latest.match(new RegExp(`${key}=([^|]+)`));
    return match?.[1]?.trim() || "-";
  };
  const dateMatch = latest.match(/Suivi commercial ([^|]+)/);
  const date = dateMatch?.[1]?.trim();
  const dateValue = date ? new Date(date) : null;
  const daysElapsed =
    dateValue && !Number.isNaN(dateValue.getTime())
      ? Math.max(
          0,
          Math.floor((Date.now() - dateValue.getTime()) / (1000 * 60 * 60 * 24)),
        )
      : null;

  return {
    action: valueOf("action"),
    channel: valueOf("canal"),
    date: date ? new Date(date).toLocaleDateString("fr-FR") : "-",
    dateIso: date ?? "",
    daysElapsed,
    objection: valueOf("objection"),
    relance: valueOf("relance"),
    scenario: valueOf("scenario"),
  };
}

function relanceDelayDays(relance: string) {
  const match = relance.match(/J\+(\d+)/i);
  return match ? Number(match[1]) : 2;
}

function leadFollowUpSignal(lead: ProspectionLead) {
  const latestLog = latestCommercialLog(lead);

  if (["WON", "LOST"].includes(lead.rawStatus)) {
    return null;
  }

  if (!latestLog) {
    if (lead.score >= 80 || ["CONTACTED", "REPLIED", "DEMO_SCHEDULED"].includes(lead.rawStatus)) {
      return {
        decision: "Tracer le dernier contact",
        detail: "Aucune action journalisee: reprendre le fil avant de relancer.",
        lead,
        latestLog,
        priority: 1,
        reason: "Suivi manquant",
        tone: "watch",
      };
    }

    return null;
  }

  const delay = relanceDelayDays(latestLog.relance);
  const elapsed = latestLog.daysElapsed ?? 0;

  if (elapsed >= delay) {
    return {
      decision: "Relancer maintenant",
      detail: `${elapsed} jour(s) depuis le dernier suivi pour une cadence ${latestLog.relance}.`,
      lead,
      latestLog,
      priority: 3,
      reason: "Relance due",
      tone: "due",
    };
  }

  if (elapsed + 1 >= delay) {
    return {
      decision: "Préparer la relance",
      detail: `Relance ${latestLog.relance} à préparer: dernier suivi il y a ${elapsed} jour(s).`,
      lead,
      latestLog,
      priority: 2,
      reason: "À surveiller",
      tone: "soon",
    };
  }

  return {
    decision: "Laisser respirer",
    detail: `Dernier contact récent: relance prévue ${latestLog.relance}.`,
    lead,
    latestLog,
    priority: 0,
    reason: "Cadence saine",
    tone: "calm",
  };
}

function followUpArchitectSummary(queue: NonNullable<ReturnType<typeof leadFollowUpSignal>>[]) {
  const due = queue.filter((item) => item.tone === "due");
  const missing = queue.filter((item) => item.tone === "watch");

  if (due.length) {
    return {
      decision: "Relancer sans attendre",
      evidence: `${due.length} compte(s) ont dépassé la cadence prévue.`,
      move: "Copier le DM de relance, envoyer, puis journaliser l'objection ou le créneau obtenu.",
    };
  }

  if (missing.length) {
    return {
      decision: "Reprendre le fil commercial",
      evidence: `${missing.length} compte(s) chauds n'ont pas encore de suivi journalisé.`,
      move: "Tracer le dernier contact avant toute nouvelle relance.",
    };
  }

  return {
    decision: "Cadence sous contrôle",
    evidence: "Aucune relance urgente dans la file prioritaire.",
    move: "Continuer les nouveaux DMs et surveiller les réponses chaudes.",
  };
}

function pilotReadinessSignal(lead: ProspectionLead) {
  const latestLog = latestCommercialLog(lead);
  const hasObjection = Boolean(latestLog?.objection && latestLog.objection !== "-");

  if (lead.rawStatus === "DEMO_SCHEDULED") {
    return {
      checklist: [
        "Confirmer le nombre de contrats d'entretien actifs.",
        "Demander le fichier Excel ou la méthode de suivi actuelle.",
        "Préparer une démo sur renouvellements, documents et relances.",
      ],
      decision: "Préparer la démo pilote",
      lead,
      latestLog,
      note: "Le rendez-vous existe déjà: transformer la démo en diagnostic cash-flow CVC.",
      proof: "Démo planifiée",
      score: 100,
      tone: "sell",
    };
  }

  if (lead.rawStatus === "REPLIED" || lead.score >= 85) {
    return {
      checklist: [
        "Obtenir un créneau de 15 minutes.",
        "Qualifier Excel, agenda ou logiciel métier actuel.",
        "Isoler une objection avant de parler prix.",
      ],
      decision: "Proposer un créneau pilote",
      lead,
      latestLog,
      note: "Signal commercial assez fort pour sortir du DM et passer en rendez-vous.",
      proof: lead.rawStatus === "REPLIED" ? "Reponse prospect" : "Score 85+",
      score: 85,
      tone: "sell",
    };
  }

  if (hasObjection || lead.rawStatus === "CONTACTED") {
    return {
      checklist: [
        "Clarifier l'objection avant toute proposition.",
        "Reformuler la douleur: contrat oublie, Excel, relance, cash-flow.",
        "Relancer une seule fois avec une question courte.",
      ],
      decision: "Qualifier avant pilote",
      lead,
      latestLog,
      note: "Le compte mérite un suivi, mais pas encore une démo forte.",
      proof: hasObjection ? `Objection: ${latestLog?.objection}` : "Lead contacte",
      score: 65,
      tone: "iterate",
    };
  }

  return {
    checklist: [
      "Ne pas forcer la démo sans réponse.",
      "Chercher un signal métier plus précis.",
      "Garder le lead en prospection froide.",
    ],
    decision: "Rester en prospection",
    lead,
    latestLog,
    note: "Le signal ne justifie pas encore un rendez-vous pilote.",
    proof: "Signal faible",
    score: 35,
    tone: "stop",
  };
}

function buildPilotBrief(item: ReturnType<typeof pilotReadinessSignal>) {
  const latest = item.latestLog
    ? `Dernier suivi: ${item.latestLog.channel}, scenario ${item.latestLog.scenario}, objection ${item.latestLog.objection}.`
    : "Dernier suivi: a journaliser avant rendez-vous.";

  return `Fiche passage démo/pilote - ${item.lead.company}

Décision: ${item.decision}
Preuve: ${item.proof}
Contact: ${item.lead.contact} - ${item.lead.phone} - ${item.lead.email}
Contexte: ${item.lead.specialty} - ${item.lead.city} - score ${item.lead.score}/100
${latest}

Angle rendez-vous:
${item.note}

Checklist:
- ${item.checklist.join("\n- ")}

Prochaine action:
${item.lead.nextAction}`;
}

function buildLeadDmScript(lead: ProspectionLead) {
  const name = firstName(lead.contact);
  const scenario = leadDmScenario(lead);
  const specialty = lead.specialty !== "-" ? lead.specialty : "CVC";
  const city = lead.city !== "-" ? ` sur ${lead.city}` : "";

  if (scenario === "réponse") {
    return `Salut ${name}, merci pour ton retour.

Vu ce que tu me dis sur ${specialty}${city}, le plus simple est de prendre 15 minutes.

Je te montre comment ContratPro repère les contrats à relancer, et tu me dis si ça colle à ta façon de travailler.

Tu préfères un créneau demain matin ou en fin de journée ?`;
  }

  if (scenario === "relance") {
    return `Salut ${name}, je te relance une seule fois sur les contrats d'entretien.

Si ce n'est pas le moment, aucun souci.

Je voulais surtout savoir si les renouvellements oublies sont un vrai sujet chez toi, ou pas du tout.

Tu es plutôt équipé avec Excel, agenda, ou un logiciel métier ?`;
  }

  if (scenario === "demo") {
    return `Salut ${name}, j'ai vu ta demande autour de ContratPro.

Le point intéressant à vérifier, ce n'est pas toutes les fonctions: c'est combien de contrats d'entretien peuvent être relancés ou sécurisés rapidement.

Si tu as 15 minutes, je peux te montrer le parcours sur un cas concret.

Tu veux qu'on parte sur ${specialty}${city} comme contexte de démo ?`;
  }

  if (scenario === "excel") {
    return `Salut ${name}, j'ai vu que le sujet Excel revient dans ton organisation.

Ce n'est pas une critique, beaucoup de chauffagistes travaillent comme ça.

Le vrai risque, c'est surtout ce qu'Excel ne signale pas tout seul: les contrats qui approchent de l'échéance.

Tu as déjà calculé combien ça peut représenter sur une année ?`;
  }

  if (scenario === "chaud") {
    return `Salut ${name}, ton profil ressort comme prioritaire sur le sujet contrats d'entretien.

Quand les relances reposent sur la mémoire ou un fichier, un client peut sortir du radar sans bruit.

ContratPro sert justement à voir ces échéances avant qu'elles deviennent du chiffre perdu.

Tu gères aujourd'hui tes renouvellements comment ?`;
  }

  return `Salut ${name}, je regarde comment les chauffagistes gèrent leurs contrats d'entretien${city}.

Quand tout est dans Excel, un agenda ou la tête, un renouvellement peut passer sans bruit.

Je travaille sur ContratPro pour aider à voir ces contrats avant qu'ils expirent.

Tu te reconnais dans ce sujet ?`;
}

export default async function ProspectionPage() {
  await requireAdminUser("/prospection");
  const leads = await getProspectionLeads();
  const hotLeads = leads.filter((lead) => lead.score >= 80);
  const inboundDémoLeads = leads.filter((lead) => lead.source === "PUBLIC_DEMO");
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
    ["À qualifier", toQualify, "Appeler sous 24h"],
    ["Contactés", contacted.filter((lead) => lead.rawStatus !== "WON"), "Obtenir une réponse"],
    ["Démos", demos, "Montrer le cash-flow"],
    ["Gagnés", won, "Onboarding client"],
  ] as const;
  const priorityQueue = [...inboundDémoLeads, ...hotLeads, ...replied]
    .filter(
      (lead, index, list) => list.findIndex((item) => item.id === lead.id) === index,
    )
    .filter((lead) => !["WON", "LOST"].includes(lead.rawStatus))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const followUpQueue = leads
    .map(leadFollowUpSignal)
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.priority - a.priority || b.lead.score - a.lead.score)
    .slice(0, 5);
  const followUpSummary = followUpArchitectSummary(followUpQueue);
  const pilotQueue = leads
    .filter((lead) => !["WON", "LOST"].includes(lead.rawStatus))
    .map(pilotReadinessSignal)
    .sort((a, b) => b.score - a.score || b.lead.score - a.lead.score)
    .slice(0, 3);

  return (
    <AppShell activePath="/prospection" showInternalTools>
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/admin/prospection/guide"
            >
              Guide skill FB
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/settings/facebook"
            >
              Réglages acquisition
            </a>
          </div>
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
          Ce module sert à ton acquisition commerciale. Il ne fait pas partie du
          produit livré aux chauffagistes: il pilote tes leads, tes messages et
          tes démonstrations.
        </p>
      </section>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["Leads", leads.length, "Comptes identifiés", "cyan"],
          ["Prioritaires", hotLeads.length, "Score 80+", "amber"],
          ["Demandes démo", inboundDémoLeads.length, "Entrantes site", "emerald"],
          ["Démos", demos.length, `${conversionRate}% gagné`, "rose"],
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
              priorityQueue.map((lead, index) => {
                const dmScript = buildLeadDmScript(lead);
                const scenario = leadDmScenario(lead);
                const founderAction = leadFounderAction(lead);
                const latestLog = latestCommercialLog(lead);

                return (
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
                      <div className="lead-dm-panel mt-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                              DM skill - {scenario}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-zinc-300">
                              {dmScript.split("\n\n")[0]}
                            </p>
                          </div>
                          <LeadDmCopyButton script={dmScript} />
                        </div>
                      </div>
                      <div className="lead-founder-action mt-2">
                        <p>Action apres envoi</p>
                        <strong>{founderAction.decision}</strong>
                        <span>{founderAction.nextMove}</span>
                        <em>Preuve: {founderAction.proof}</em>
                      </div>
                      {latestLog ? (
                        <div className="lead-latest-log mt-2">
                          <p>Dernier suivi</p>
                          <strong>
                            {latestLog.channel} - {latestLog.scenario} - {latestLog.date}
                          </strong>
                          <span>
                            Relance: {latestLog.relance} | Objection: {latestLog.objection}
                          </span>
                          <em>{latestLog.action}</em>
                        </div>
                      ) : null}
                      <LeadCommercialLogForm
                        currentNotes={lead.notes}
                        currentStatus={lead.rawStatus}
                        defaultNextAction={lead.nextAction}
                        defaultScenario={scenario}
                        leadId={lead.id}
                      />
                    </div>
                    <span className="prospection-score" data-hot={lead.score >= 80}>
                      {lead.score}<span>/100</span>
                    </span>
                  </article>
                );
              })
            ) : (
              <article className="sales-priority-card">
                <div>
                  <h4 className="text-base font-semibold text-zinc-50">
                    Aucun lead urgent
                  </h4>
                  <p className="mt-1 text-sm text-zinc-400">
                    Le prochain formulaire démo alimente cette file d'appel.
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
                ["J0", "Appeler dans la journée, qualifier parc et Excel actuel."],
                ["J+2", "Envoyer récap ROI + lien démo si pas de réponse."],
                ["J+5", "Relancer sur contrat oublié et SEPA récurrent."],
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

      <section className="lead-followup-command mt-5 rounded-lg border p-4" data-od-id="lead-followup-architect">
        <div className="sales-command-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
              Architecte IA relance
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              File de relance commerciale
            </h3>
          </div>
          <StatusPill>{followUpQueue.length} comptes suivis</StatusPill>
        </div>

        <div className="lead-followup-layout mt-4">
          <article className="lead-followup-decision">
            <p>Décision du jour</p>
            <strong>{followUpSummary.decision}</strong>
            <span>{followUpSummary.evidence}</span>
            <em>{followUpSummary.move}</em>
          </article>

          <div className="lead-followup-list">
            {followUpQueue.length ? (
              followUpQueue.map((item) => {
                const dmScript = buildLeadDmScript(item.lead);

                return (
                  <article className="lead-followup-card" data-tone={item.tone} key={item.lead.id}>
                    <div>
                      <div className="lead-followup-card-header">
                        <span>{item.reason}</span>
                        <strong>{item.lead.score}/100</strong>
                      </div>
                      <h4>{item.lead.company}</h4>
                      <p>{item.decision}</p>
                      <small>{item.detail}</small>
                      {item.latestLog ? (
                        <em>
                          Dernier canal: {item.latestLog.channel} | Objection:{" "}
                          {item.latestLog.objection}
                        </em>
                      ) : null}
                    </div>
                    <LeadDmCopyButton script={dmScript} />
                  </article>
                );
              })
            ) : (
              <article className="lead-followup-card" data-tone="calm">
                <div>
                  <div className="lead-followup-card-header">
                    <span>File vide</span>
                    <strong>OK</strong>
                  </div>
                  <h4>Aucune relance a traiter</h4>
                  <p>Les leads chauds n'ont pas de retard commercial visible.</p>
                  <small>Continue la prospection Facebook et les demandes démo.</small>
                </div>
              </article>
            )}
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

      <section className="pilot-handoff-command mt-5 rounded-lg border p-4" data-od-id="pilot-handoff-command">
        <div className="sales-command-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Architecte IA démo pilote
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Passage lead vers rendez-vous
            </h3>
          </div>
          <StatusPill>{pilotQueue.length} fiches pretes</StatusPill>
        </div>

        <div className="pilot-handoff-grid mt-4">
          {pilotQueue.map((item) => {
            const brief = buildPilotBrief(item);

            return (
              <article className="pilot-handoff-card" data-tone={item.tone} key={item.lead.id}>
                <div className="pilot-handoff-card-head">
                  <span>{item.proof}</span>
                  <strong>{item.lead.score}/100</strong>
                </div>
                <h4>{item.lead.company}</h4>
                <p>{item.decision}</p>
                <em>{item.note}</em>
                <div className="pilot-handoff-proof">
                  <span>Dernier suivi</span>
                  <strong>
                    {item.latestLog
                      ? `${item.latestLog.channel} - ${item.latestLog.objection}`
                      : "À journaliser"}
                  </strong>
                </div>
                <ul>
                  {item.checklist.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
                <PilotBriefCopyButton brief={brief} />
              </article>
            );
          })}
        </div>
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
              Comptes chauffagistes à qualifier et convertir
            </h3>
          </div>
          <span className="prospection-signal-pill">
            {hotLeads.length} signaux chauds
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head">
                <th className="px-4 py-3 font-semibold">Entreprise</th>
                <th className="px-4 py-3 font-semibold">Canal</th>
                <th className="px-4 py-3 font-semibold">Attribution</th>
                <th className="px-4 py-3 font-semibold">Spécialité</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Prochaine action</th>
                <th className="px-4 py-3 font-semibold">DM skill</th>
                <th className="px-4 py-3 font-semibold">Décision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {leads.map((lead) => {
                const dmScript = buildLeadDmScript(lead);
                const scenario = leadDmScenario(lead);
                const latestLog = latestCommercialLog(lead);

                return (
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
                      <div className="lead-dm-table-action">
                        <span>{scenario}</span>
                        <LeadDmCopyButton script={dmScript} />
                      </div>
                      {latestLog ? (
                        <div className="lead-table-log mt-2">
                          <strong>{latestLog.channel}</strong>
                          <span>Relance {latestLog.relance}</span>
                          <em>Objection: {latestLog.objection}</em>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <LeadStatusControls
                        currentStatus={lead.rawStatus}
                        leadId={lead.id}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
