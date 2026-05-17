import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";

import { ProspectionCopyButton } from "../ProspectionCopyButton";

type ContentStatus = "Brouillon" | "Pret" | "Publie" | "Teste";

type ContentAsset = {
  angle: string;
  channel: string;
  copy: string;
  format: string;
  kpi: string;
  nextAction: string;
  slot: string;
  status: ContentStatus;
  title: string;
  visualPrompt: string;
};

const contentAssets: ContentAsset[] = [
  {
    angle: "Contrats qui sortent du radar",
    channel: "Facebook page",
    copy: `Il a rappele son client pour l'entretien annuel.
Le client avait deja pris quelqu'un d'autre.

Son contrat avait expire 4 mois plus tot.
Personne ne l'avait relance.
180 EUR de revenu recurrent. Parti.

ContratPro sert a voir ces echeances avant qu'elles deviennent du chiffre perdu.

Essai pilote: [URL_DEMO_UTM]`,
    format: "Post epingle",
    kpi: "Clic demo + commentaires metier",
    nextAction: "Publier en premier, epingler, puis DM les commentaires utiles.",
    slot: "J0",
    status: "Pret",
    title: "Post epingle lancement",
    visualPrompt:
      "Bandeau social premium pour chauffagistes CVC, cockpit sombre, carte de contrats d'entretien, alerte echeance, palette noir zinc bleu acier vert validation cyan diagnostic, style utilitaire haut de gamme, texte lisible mobile: Contrats d'entretien: ne laissez plus les echeances sortir du radar.",
  },
  {
    angle: "2 700 EUR de revenu recurrent oublie",
    channel: "Facebook feed",
    copy: `2 700 EUR.

C'est ce qu'un chauffagiste avec 150 clients peut perdre chaque annee si 10% des contrats d'entretien ne sont pas relances.

Le probleme, ce n'est pas le travail.
C'est le contrat qui sort du radar.

ContratPro remet les echeances devant vous avant qu'elles deviennent du chiffre perdu.`,
    format: "Post chiffre",
    kpi: "Partages + clics demo",
    nextAction: "Publier vendredi 19h, suivre les clics UTM, relancer les likes chauds.",
    slot: "S1 vendredi",
    status: "Brouillon",
    title: "Chiffre choc contrats oublies",
    visualPrompt:
      "Miniature Facebook premium 1080x1350, grand chiffre 2700 EUR, fond noir zinc, ligne diagnostic cyan, petites cartes contrat entretien et chaudiere gaz, ambiance outil pro CVC, aucune decoration startup.",
  },
  {
    angle: "Question terrain sans vendre",
    channel: "Facebook feed",
    copy: `Chauffagistes, honnetement: comment vous gerez vos relances de contrats d'entretien ?

Excel et on croise les doigts
Agenda papier
De tete
Logiciel metier
Secretaire ou conjoint administratif

Sans jugement, je cherche a comprendre ce qui marche vraiment sur le terrain.`,
    format: "Question engagement",
    kpi: "Commentaires qualifiables",
    nextAction: "Repondre aux commentaires puis ouvrir un DM sans lien.",
    slot: "S1 mercredi",
    status: "Pret",
    title: "Sondage relances",
    visualPrompt:
      "Visuel carre Facebook sobre pour chauffagistes, checklist de methodes: Excel, agenda, tete, logiciel metier, secretaire, fond atelier CVC sombre, accents ambre et cyan, typographie technique lisible.",
  },
  {
    angle: "Excel ne relance pas tout seul",
    channel: "Messenger",
    copy: `Salut [Prenom], j'ai vu que le sujet Excel revient dans ton organisation.

Ce n'est pas une critique, beaucoup de chauffagistes travaillent comme ca.

Le vrai risque, c'est surtout ce qu'Excel ne signale pas tout seul: les contrats qui approchent de l'echeance.

Tu as deja calcule combien ca peut representer sur une annee ?`,
    format: "DM Excel",
    kpi: "Taux reponse DM",
    nextAction: "Envoyer seulement si le signal Excel est visible.",
    slot: "Routine matin",
    status: "Teste",
    title: "DM utilisateur Excel",
    visualPrompt:
      "Pas de visuel. Utiliser comme message Messenger uniquement, sans lien au premier contact.",
  },
  {
    angle: "Preuve operationnelle",
    channel: "Facebook feed",
    copy: `Un bon outil CVC ne doit pas demander plus d'administration.

Il doit montrer les contrats a renouveler, les attestations a envoyer et les clients a relancer.

Le reste, c'est du bruit.

ContratPro part de cette logique: proteger le portefeuille existant avant de promettre autre chose.`,
    format: "Post manifeste",
    kpi: "Commentaires dirigeants",
    nextAction: "Publier apres le post chiffre pour clarifier le positionnement premium.",
    slot: "S2 lundi",
    status: "Brouillon",
    title: "Manifeste portefeuille contrats",
    visualPrompt:
      "Image Facebook premium, bureau technique CVC de nuit, ecran avec portefeuille contrats, attestations et relances, style cabinet haut de gamme, noir zinc, bleu acier, vert validation, pas de personnage corporate.",
  },
  {
    angle: "Offre pilote accompagne",
    channel: "Facebook page",
    copy: `Je cherche 3 chauffagistes pour tester ContratPro sur un vrai portefeuille de contrats d'entretien.

Objectif: voir en 30 minutes si des contrats peuvent etre relances, securises ou mieux suivis.

Pas de CB. Pas de promesse floue. On regarde les echeances, les relances et les documents.

Interessé ? Repondez "pilote" en commentaire ou envoyez un message.`,
    format: "Offre pilote",
    kpi: "Demos planifiees",
    nextAction: "Publier quand le bandeau et le post epingle sont en ligne.",
    slot: "S2 vendredi",
    status: "Brouillon",
    title: "Offre 3 pilotes chauffagistes",
    visualPrompt:
      "Miniature verticale premium, 3 places pilote, chauffagiste CVC, contrats entretien, ecran diagnostic, fond noir zinc, accent vert validation, texte: 3 pilotes chauffagistes recherches.",
  },
];

const statusOrder: ContentStatus[] = ["Brouillon", "Pret", "Publie", "Teste"];

function statusCount(status: ContentStatus) {
  return contentAssets.filter((asset) => asset.status === status).length;
}

export default async function ProspectionContentLibraryPage() {
  const admin = await requireAdminUser("/admin/prospection/content");

  return (
    <AppShell activePath="/admin/prospection/content" showInternalTools>
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/admin/prospection"
            >
              Dashboard acquisition
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/admin/prospection/guide"
            >
              Guide skill
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/facebook/contratpro-strategie-facebook.html"
              rel="noreferrer"
              target="_blank"
            >
              Strategie Claude
            </a>
            <a
              className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/settings/facebook"
            >
              Liens UTM
            </a>
          </div>
        }
        description={`Bibliotheque reservee a ${admin.email}. Range ici le kit Facebook Claude, les posts, les prompts visuels, les UTM et les statuts de publication.`}
        eyebrow="Admin acquisition"
        title="Bibliotheque contenus Facebook"
      />

      <section className="content-library-hero mt-6 rounded-lg border p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Architecte IA contenus
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
            Chaque contenu doit avoir un angle, un UTM et une decision de test.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Quand Claude livre le kit Facebook, colle les textes finaux dans ces
            emplacements: bandeau, post epingle, posts, miniatures et messages.
            Le but est de publier moins, mais de mesurer chaque signal.
          </p>
        </div>
        <div className="content-library-next">
          <strong>Prochaine action</strong>
          <span>Ouvrir la strategie Claude, extraire la V2, puis publier J0</span>
        </div>
      </section>

      <section className="content-status-strip mt-5">
        {statusOrder.map((status) => (
          <article className="content-status-card" data-status={status} key={status}>
            <p>{status}</p>
            <strong>{statusCount(status)}</strong>
            <span>contenus</span>
          </article>
        ))}
      </section>

      <section className="content-library-panel mt-5 rounded-lg border p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Reception kit Claude
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Ce qui doit arriver avant publication
            </h3>
          </div>
          <StatusPill>Kit Facebook premium</StatusPill>
        </div>
        <div className="content-intake-grid mt-4">
          {[
            [
              "Strategie Claude",
              "Artifact complet archive dans /facebook/contratpro-strategie-facebook.html.",
            ],
            ["Bandeau", "Desktop + mobile, texte lisible, jargon CVC."],
            ["Identite page", "Bio, description, CTA, Messenger, mots-cles."],
            ["Posts", "12 posts classes par angle, KPI et CTA."],
            ["Miniatures", "Prompts 1080x1080 et 1080x1350."],
            ["UTM", "Un lien par campagne, medium et contenu."],
            ["Scorecard", "Decision garder / iterer / couper chaque vendredi."],
          ].map(([label, detail]) => (
            <article className="content-intake-card" key={label}>
              <strong>{label}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-4">
        {contentAssets.map((asset) => (
          <article className="content-asset-card rounded-lg border p-4" key={asset.title}>
            <div className="content-asset-header">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {asset.slot} - {asset.channel}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-50">
                  {asset.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {asset.angle}
                </p>
              </div>
              <span className="content-status-pill" data-status={asset.status}>
                {asset.status}
              </span>
            </div>

            <div className="content-asset-body mt-4">
              <div className="content-copy-block">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      {asset.format}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">KPI: {asset.kpi}</p>
                  </div>
                  <ProspectionCopyButton label="Copier texte" text={asset.copy} />
                </div>
                <pre>{asset.copy}</pre>
              </div>

              <div className="content-copy-block">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                      Prompt visuel
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      A coller dans l'outil de creation image.
                    </p>
                  </div>
                  <ProspectionCopyButton
                    label="Copier prompt"
                    text={asset.visualPrompt}
                  />
                </div>
                <pre>{asset.visualPrompt}</pre>
              </div>
            </div>

            <div className="content-next-action mt-4">
              <strong>Action fondateur</strong>
              <span>{asset.nextAction}</span>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
