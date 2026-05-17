import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import {
  getFacebookSettings,
  getProspectionLeads,
} from "@/server/contratpro-data";

import { ProspectionCopyButton } from "./ProspectionCopyButton";

type SkillModule = {
  cadence: string;
  evidence: string;
  name: string;
  output: string;
};

const facebookSkillModules: SkillModule[] = [
  {
    cadence: "Avant de publier",
    evidence: "Page claire, bio CVC, CTA vers demo",
    name: "Page Facebook",
    output: "Verifier nom, bio, mots-cles et post epingle.",
  },
  {
    cadence: "3 fois / semaine",
    evidence: "Douleur concrete puis une seule action",
    name: "Posts terrain",
    output: "Formats probleme, chiffre, legal et question.",
  },
  {
    cadence: "5 a 10 DMs / jour",
    evidence: "Message court, personnalise, sans lien au premier contact",
    name: "DM fondateur",
    output: "Froid, chaud, Excel, relance ou closing.",
  },
  {
    cadence: "Chaque vendredi",
    evidence: "CPL, reponses, demos et objections notees",
    name: "KPI 90 jours",
    output: "Garder, iterer ou couper chaque angle.",
  },
];

const facebookSkillCadence = [
  ["Lundi 6h30", "Post probleme -> solution sur contrats oublies."],
  ["Mercredi 12h15", "Question d'engagement sans CTA produit."],
  ["Vendredi 19h00", "Post preuve ou chiffre avec lien demo trace."],
  ["Chaque jour", "5 DMs cibles: commentaire, like, Excel, relance, closing."],
] as const;

const facebookSkillKpis = [
  ["Taux reponse DM", "15-25%", "Changer accroche si < 10%"],
  ["Clics demo", "3-5%", "Revoir CTA si < 2%"],
  ["Demos bookees", "2 / semaine", "Prioriser les leads score 80+"],
  ["Decision", "90 jours", "Vendre, iterer ou couper"],
] as const;

const facebookDmScript = `Salut [Prenom], j'ai vu ton commentaire sur les relances et les contrats d'entretien.

Quand tout est dans Excel ou dans la tete, un renouvellement peut passer sans bruit et le client part ailleurs.

Je travaille sur ContratPro pour aider les chauffagistes a voir ces contrats avant qu'ils expirent.

Tu sais combien de contrats tu as pu perdre comme ca sur les 12 derniers mois ?`;

function buildFacebookPostScript(demoUrl: string) {
  return `Il a rappele son client pour l'entretien annuel.
Le client avait deja pris quelqu'un d'autre.

Son contrat avait expire 4 mois plus tot.
Personne ne l'avait relance.
180 EUR de revenu recurrent. Parti.

Avec ContratPro, les contrats a renouveler remontent avant l'echeance, avec la prochaine action a faire.
Le chauffagiste garde son portefeuille vivant au lieu de le decouvrir trop tard.

Essai pilote: ${demoUrl}

#chauffagiste #contratentretien #CVCpro #artisan #chauffage`;
}

export default async function AdminProspectionDashboardPage() {
  const admin = await requireAdminUser("/admin/prospection");
  const [leads, settings] = await Promise.all([
    getProspectionLeads(),
    getFacebookSettings(),
  ]);
  const demoUrl = settings.demoUrl || "https://contratpro.fr/demo";
  const facebookPostScript = buildFacebookPostScript(demoUrl);
  const hotLeads = leads.filter((lead) => lead.score >= 80);
  const inboundDemoLeads = leads.filter((lead) => lead.source === "PUBLIC_DEMO");
  const toQualify = leads.filter((lead) => lead.rawStatus === "TO_QUALIFY");
  const replied = leads.filter((lead) => lead.rawStatus === "REPLIED");
  const contacted = leads.filter((lead) =>
    ["CONTACTED", "REPLIED", "DEMO_SCHEDULED", "WON"].includes(lead.rawStatus),
  );
  const demos = leads.filter((lead) => lead.rawStatus === "DEMO_SCHEDULED");
  const won = leads.filter((lead) => lead.rawStatus === "WON");
  const topLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 5);
  const connectedTools = [
    settings.bufferAccessTokenConfigured,
    settings.apifyTokenConfigured,
    settings.manychatTokenConfigured,
  ].filter(Boolean).length;
  const nextActions = topLeads
    .filter((lead) => lead.nextAction && lead.nextAction !== "-")
    .slice(0, 4);
  const founderQueue = [...inboundDemoLeads, ...hotLeads, ...replied]
    .filter(
      (lead, index, list) => list.findIndex((item) => item.id === lead.id) === index,
    )
    .filter((lead) => !["WON", "LOST"].includes(lead.rawStatus))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const connectorChecks: Array<[string, boolean]> = [
    ["Buffer", settings.bufferAccessTokenConfigured],
    ["Apify", settings.apifyTokenConfigured],
    ["ManyChat", settings.manychatTokenConfigured],
  ];
  const missingConnectors = connectorChecks
    .filter(([, configured]) => !configured)
    .map(([label]) => label);
  const attributionStats = Object.values(
    leads.reduce<
      Record<
        string,
        {
          demos: number;
          hot: number;
          label: string;
          leads: number;
          scoreTotal: number;
          won: number;
        }
      >
    >((acc, lead) => {
      const label = lead.attribution && lead.attribution !== "-" ? lead.attribution : lead.source;
      const current =
        acc[label] ??
        {
          demos: 0,
          hot: 0,
          label,
          leads: 0,
          scoreTotal: 0,
          won: 0,
        };

      current.leads += 1;
      current.scoreTotal += lead.score;
      if (lead.score >= 80) {
        current.hot += 1;
      }
      if (lead.rawStatus === "DEMO_SCHEDULED") {
        current.demos += 1;
      }
      if (lead.rawStatus === "WON") {
        current.won += 1;
      }
      acc[label] = current;
      return acc;
    }, {}),
  )
    .map((item) => ({
      ...item,
      averageScore: item.leads ? Math.round(item.scoreTotal / item.leads) : 0,
    }))
    .sort((a, b) => b.leads - a.leads || b.averageScore - a.averageScore)
    .slice(0, 6);

  return (
    <AppShell activePath="/admin/prospection" showInternalTools>
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
              href="/admin/prospection/guide"
            >
              Mode d'emploi skill
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/settings/facebook"
            >
              Reglages Facebook
            </a>
            <a
              className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/prospection"
            >
              Ouvrir pipeline
            </a>
          </div>
        }
        description={`Espace prive reserve a ${admin.email}. Pilote tes leads, ton canal Facebook et les actions de vente pour signer les premiers chauffagistes.`}
        eyebrow="Admin fondateur"
        title="Dashboard prospection ContratPro"
      />

      <section className="internal-notice mt-6 rounded-lg border p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
          Acces admin uniquement
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Ce cockpit n'est pas une fonctionnalite client. Il sert a vendre
          ContratPro: acquisition Facebook, qualification des leads, relances et
          demonstrations.
        </p>
      </section>
      <section className="prospection-skill-cockpit mt-5 rounded-lg border p-4" data-od-id="facebook-prospection-skill">
        <div className="skill-cockpit-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
              Skill Codex admin
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Architecte IA prospection Facebook
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Le skill que tu as ajoute devient un playbook fondateur: page,
              posts, DMs, calendrier et KPIs pour trouver les premiers
              chauffagistes sans attendre Resend ni GoCardless.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/admin/prospection/content"
            >
              Ouvrir contenus
            </a>
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/admin/prospection/guide"
            >
              Ouvrir guide
            </a>
            <StatusPill>4 modules prets</StatusPill>
          </div>
        </div>

        <div className="skill-module-grid mt-4">
          {facebookSkillModules.map((module) => (
            <article className="skill-module-card" key={module.name}>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {module.cadence}
              </p>
              <h4 className="mt-2 font-semibold text-zinc-50">{module.name}</h4>
              <p className="mt-2 text-sm leading-5 text-zinc-400">{module.output}</p>
              <p className="mt-3 text-xs leading-5 text-emerald-300">
                Preuve: {module.evidence}
              </p>
            </article>
          ))}
        </div>

        <div className="skill-copy-grid mt-4">
          <article className="skill-script-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  DM froid
                </p>
                <h4 className="mt-1 font-semibold text-zinc-50">
                  Premier message Facebook
                </h4>
              </div>
              <ProspectionCopyButton label="Copier DM" text={facebookDmScript} />
            </div>
            <pre>{facebookDmScript}</pre>
          </article>

          <article className="skill-script-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  Post probleme
                </p>
                <h4 className="mt-1 font-semibold text-zinc-50">
                  Publication prete a tracer
                </h4>
              </div>
              <ProspectionCopyButton label="Copier post" text={facebookPostScript} />
            </div>
            <pre>{facebookPostScript}</pre>
          </article>
        </div>

        <div className="skill-kpi-rail mt-4">
          {facebookSkillCadence.map(([slot, action]) => (
            <div className="skill-kpi-item" key={slot}>
              <strong>{slot}</strong>
              <span>{action}</span>
            </div>
          ))}
        </div>

        <div className="skill-kpi-rail mt-3">
          {facebookSkillKpis.map(([metric, target, warning]) => (
            <div className="skill-kpi-item" key={metric}>
              <strong>{metric}</strong>
              <span>{target} - {warning}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["Leads", leads.length, "Total pipeline", "cyan"],
          ["Chauds", hotLeads.length, "Score 80+", "amber"],
          ["Demandes demo", inboundDemoLeads.length, "Entrantes site", "emerald"],
          ["Demos", demos.length, `${won.length} gagne`, "rose"],
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

      <section className="settings-panel mt-5 rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Performance attribution
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Ce qui genere les meilleurs leads
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Lecture fondateur des campagnes tracees : volume, qualite et
              progression vers demo ou signature.
            </p>
          </div>
          <StatusPill>{attributionStats.length} sources suivies</StatusPill>
        </div>

        <div className="attribution-performance-grid mt-4 grid gap-3 lg:grid-cols-3">
          {attributionStats.length ? (
            attributionStats.map((item) => (
              <article className="attribution-performance-card rounded-lg border p-3" key={item.label}>
                <p className="break-words text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {item.label}
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Leads", item.leads],
                    ["Chauds", item.hot],
                    ["Demos", item.demos],
                    ["Gagnes", item.won],
                  ].map(([label, value]) => (
                    <div className="attribution-mini-stat" key={label}>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-zinc-400">
                  Score moyen : <strong className="text-zinc-100">{item.averageScore}/100</strong>
                </p>
              </article>
            ))
          ) : (
            <article className="attribution-performance-card rounded-lg border p-3 lg:col-span-3">
              <p className="font-semibold text-zinc-50">Aucune campagne tracee</p>
              <p className="mt-1 text-sm text-zinc-400">
                Cree un lien UTM dans Reglages Facebook, publie-le, puis les
                demandes demo alimenteront cette lecture.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="sales-command mt-5 rounded-lg border p-4">
        <div className="sales-command-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Priorite fondateur
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Appels demo a traiter aujourd'hui
            </h3>
          </div>
          <StatusPill>{toQualify.length} a qualifier</StatusPill>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          {founderQueue.length ? (
            founderQueue.map((lead) => (
              <article className="founder-queue-card" key={lead.id}>
                <div className="flex items-start justify-between gap-3">
                  <span className="prospection-source-pill">{lead.source}</span>
                  <span className="prospection-score" data-hot={lead.score >= 80}>
                    {lead.score}<span>/100</span>
                  </span>
                </div>
                <h4 className="mt-4 font-semibold text-zinc-50">{lead.company}</h4>
                <p className="mt-1 text-sm text-zinc-400">
                  {lead.contact} - {lead.city}
                </p>
                <p className="mt-3 text-sm text-zinc-300">{lead.nextAction}</p>
                <p className="mt-2 text-xs text-emerald-300">
                  {lead.attribution}
                </p>
              </article>
            ))
          ) : (
            <article className="founder-queue-card lg:col-span-5">
              <h4 className="font-semibold text-zinc-50">File d'appel vide</h4>
              <p className="mt-1 text-sm text-zinc-400">
                Les demandes du formulaire demo remonteront ici avec score et
                prochaine action.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <article className="prospection-section rounded-lg border">
          <div className="prospection-section-header">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Priorites commerciales
              </p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-50">
                Les comptes a travailler en premier
              </h3>
            </div>
            <span className="prospection-signal-pill">
              {hotLeads.length} signaux forts
            </span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {topLeads.map((lead) => (
              <div
                className="admin-lead-row grid gap-4 px-4 py-4 md:grid-cols-[1fr_120px_180px]"
                key={lead.id}
              >
                <div>
                  <p className="font-semibold text-zinc-50">{lead.company}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {lead.contact} - {lead.city} - {lead.specialty}
                  </p>
                  <p className="mt-2 text-sm text-zinc-300">{lead.nextAction}</p>
                  <p className="mt-2 text-xs text-emerald-300">
                    Attribution: {lead.attribution}
                  </p>
                </div>
                <div>
                  <span
                    className="prospection-score"
                    data-hot={lead.score >= 80}
                  >
                    {lead.score}<span>/100</span>
                  </span>
                </div>
                <div className="md:text-right">
                  <StatusPill>{lead.status}</StatusPill>
                  <p className="mt-2 text-xs text-zinc-500">
                    Touch: {lead.lastTouch}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="settings-panel rounded-lg border p-4 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-50">
            Canal Facebook
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Connecteurs internes pour generer, planifier et suivre les messages
            de prospection.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Buffer</span>
              <StatusPill>
                {settings.bufferAccessTokenConfigured ? "Pret" : "A configurer"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Apify</span>
              <StatusPill>
                {settings.apifyTokenConfigured ? "Pret" : "A configurer"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">ManyChat</span>
              <StatusPill>
                {settings.manychatTokenConfigured ? "Pret" : "A configurer"}
              </StatusPill>
            </div>
          </div>
          <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Sante acquisition
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-50">
              {connectedTools}/3
            </p>
            <p className="mt-1 text-sm text-zinc-400">connecteurs actifs</p>
          </div>
        </aside>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <article className="settings-panel rounded-lg border p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Actions de la semaine
              </p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-50">
                Ce qui doit faire avancer les ventes
              </h3>
            </div>
            <StatusPill>{nextActions.length} actions</StatusPill>
          </div>

          <div className="mt-4 grid gap-3">
            {nextActions.length ? (
              nextActions.map((lead) => (
                <div className="admin-action-card rounded-lg border p-3" key={lead.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-zinc-50">{lead.company}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {lead.nextAction}
                      </p>
                    </div>
                    <span
                      className="prospection-score"
                      data-hot={lead.score >= 80}
                    >
                      {lead.score}<span>/100</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-action-card rounded-lg border p-3">
                <p className="font-semibold text-zinc-50">
                  Aucune action prioritaire
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Ajoute une prochaine action sur tes leads chauds pour piloter
                  les relances.
                </p>
              </div>
            )}
          </div>
        </article>

        <aside className="settings-panel rounded-lg border p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Mise en route acquisition
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-50">
            Connecteurs a finaliser
          </h3>
          <div className="mt-4 grid gap-3">
            {missingConnectors.length ? (
              missingConnectors.map((connector) => (
                <div className="facebook-step-card rounded-lg border p-3" key={connector}>
                  <p className="font-semibold text-zinc-50">{connector}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    A renseigner dans Reglages Facebook.
                  </p>
                </div>
              ))
            ) : (
              <div className="facebook-step-card rounded-lg border p-3">
                <p className="font-semibold text-zinc-50">
                  Canal pret a piloter
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Les trois connecteurs critiques sont configures.
                </p>
              </div>
            )}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
