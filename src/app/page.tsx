import type { Metadata } from "next";

import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";
import { StructuredData } from "@/components/marketing/StructuredData";
import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import {
  AgentPanel,
  ButtonLink,
  EmptyState,
  Gauge,
  Metric,
  StatCard,
} from "@/components/ui";
import { billingPlans } from "@/lib/billing-plans";
import { formatEuro } from "@/lib/mock-data";
import { getCurrentAdminUser } from "@/server/admin";
import { getCurrentUser } from "@/server/auth";
import {
  getCertificates,
  getContracts,
  getCustomers,
  getInvoices,
  getPayments,
  getRenewalPipeline,
} from "@/server/contratpro-data";
import { isAuthEnforced } from "@/server/tenant";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logiciel contrats entretien CVC pour chauffagistes",
  description:
    "ContratPro aide les chauffagistes a retrouver leurs contrats d'entretien avant le rush, l'oubli, le litige ou l'impaye.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    description:
      "Contrats d'entretien, relances, attestations, factures et paiements recurrents pour entreprises CVC.",
    title: "ContratPro - Ne laissez plus vos contrats d'entretien dormir dans Excel",
    url: "/",
  },
};

type CardTone = "amber" | "cyan" | "emerald" | "rose";

const homeProblems = [
  "Au premier froid, les pannes arrivent et les contrats caches dans Excel deviennent urgents.",
  "Un client absent, un report ou une attestation oubliee peut casser la journee.",
  "Quand un client dit \"avant ca marchait\", le dossier doit retrouver les preuves.",
  "Un contrat annuel vendu mais non relance reste du revenu laisse dehors.",
];

const homeWorkflow = [
  ["Importez", "Vos clients, equipements et contrats existants."],
  ["Voyez", "Les echeances, attestations et paiements a suivre."],
  ["Relancez", "Les contrats avant qu'ils sortent du radar."],
  ["Encaissez", "Factures PDF, historique d'envoi et SEPA."],
];

const homeProofs = [
  ["Avant froid", "les contrats a reprendre sortent de la pile"],
  ["15 jours", "pour garder l'attestation visible apres visite"],
  ["Preuves", "facture, intervention, attestation et paiement lies"],
];

const homeTradeZones = [
  ["Chaudières", "Attestations, visites annuelles, facture prête."],
  ["PAC", "Contrats air/eau et air/air avec échéance visible."],
  ["VMC", "Suivi des sites, relances et preuves d'entretien."],
  ["Clim", "Parc réversible, renouvellement et cash sous contrôle."],
];

const homeOutcomeCards = [
  ["1 Importez", "Votre fichier Excel devient une base clients exploitable."],
  ["2 Traitez", "Vous ouvrez le dossier qui demande une action avant le rush."],
  ["3 Prouvez", "Facture, attestation, intervention et paiement restent rattaches."],
];

const homeFrustrationSolutions = [
  [
    "Rush au premier froid",
    "File du jour",
    "ContratPro remonte les contrats a traiter avant que les pannes saturent l'agenda.",
  ],
  [
    "Client absent ou report",
    "Dossier terrain",
    "Telephone, adresse, installation et prochaine action restent au meme endroit.",
  ],
  [
    "Avant ca marchait",
    "Preuves liees",
    "Intervention, attestation, facture et paiement restent rattaches au contrat.",
  ],
  [
    "Attestation oubliee",
    "Document visible",
    "La preuve d'entretien ressort comme une action, pas comme une tache cachee.",
  ],
  [
    "Pression prix",
    "Revenu protege",
    "Le cockpit montre ce que valent les contrats relances et encaisses proprement.",
  ],
];

const homeStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description:
      "Logiciel de gestion des contrats d'entretien CVC pour chauffagistes.",
    inLanguage: "fr-FR",
    name: "ContratPro",
    url: "https://contratpro-dun.vercel.app/",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Chauffagistes et entreprises CVC",
    },
    description:
      "ContratPro centralise contrats d'entretien CVC, relances, attestations, factures et paiements recurrents.",
    name: "ContratPro",
    offers: billingPlans.map((plan) => ({
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      name: `ContratPro ${plan.name}`,
      price: String(plan.unitAmount / 100),
      priceCurrency: "EUR",
      url: `https://contratpro-dun.vercel.app/pricing#${plan.id}`,
    })),
    operatingSystem: "Web",
    url: "https://contratpro-dun.vercel.app/",
  },
];

function HomeLandingVisual() {
  return (
    <div className="home-hero-visual">
      <img
        alt="ContratPro sur tablette dans un local technique CVC"
        src="/images/contratpro-cvc-facebook-banner.png"
      />
      <div className="home-hero-visual-panel">
        <span>Action terrain</span>
        <strong>Importer ou ajouter un client</strong>
        <p>Vous savez tout de suite par ou demarrer.</p>
      </div>
    </div>
  );
}

function TodayCountCard({
  detail,
  href,
  label,
  tone,
  value,
}: {
  detail: string;
  href: string;
  label: string;
  tone: CardTone;
  value: number;
}) {
  return (
    <a className="dashboard-today-count" data-tone={tone} href={href}>
      <span>{value}</span>
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
    </a>
  );
}

function HomeLanding() {
  return (
    <PublicShell>
      <StructuredData data={homeStructuredData} />
      <PublicHero
        action={
          <>
            <a className="cp-btn cp-btn-primary" href="/demo">
              Programmer une démo
            </a>
            <a className="cp-btn cp-btn-secondary" href="/simulateur">
              Calculer mes contrats oubliés
            </a>
          </>
        }
        description="ContratPro aide les chauffagistes à retrouver le bon contrat au bon moment : avant le rush, avant l'oubli, avant le litige, avant l'impayé."
        eyebrow="Logiciel contrats de maintenance CVC"
        title="Ne laissez plus vos contrats d'entretien dormir dans Excel."
        visual={<HomeLandingVisual />}
      />

      <section className="home-proof-strip mx-auto grid max-w-[1500px] gap-3 px-5 pb-4 sm:px-8 md:grid-cols-3">
        {homeProofs.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="home-trade-band mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
        <div>
          <p>Fait pour le CVC</p>
          <h2>Chaudieres, PAC, VMC, clim : chaque contrat garde sa place.</h2>
        </div>
        <div className="home-trade-grid">
          {homeTradeZones.map(([label, detail]) => (
            <article key={label}>
              <strong>{label}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </div>
      </section>

      <PublicSection
        description="Quand les journees s'enchainent entre depannages, entretiens, devis et reports client, ContratPro garde la prochaine action visible."
        title="Avant le rush, l'oubli ou le litige."
      >
        <div className="public-proof-grid">
          {homeProblems.map((problem) => (
            <article key={problem}>{problem}</article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Chaque douleur terrain doit produire une action claire, pas un menu de plus."
        title="Les frustrations terrain deviennent des solutions simples."
      >
        <div className="home-solution-grid">
          {homeFrustrationSolutions.map(([pain, solution, detail], index) => (
            <article key={pain}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{pain}</p>
                <strong>{solution}</strong>
                <small>{detail}</small>
              </div>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Le dossier doit dire qui appeler, quoi envoyer, quoi facturer et quelle preuve garder. Pas besoin de chercher dans dix menus."
        title="Un ecran simple pour savoir quoi faire."
      >
        <div className="home-outcome-grid">
          {homeOutcomeCards.map(([label, detail]) => (
            <article key={label}>
              <strong>{label}</strong>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Vous importez votre base, vous voyez les urgences, vous relancez et vous encaissez plus proprement."
        title="Un parcours court pour reprendre le controle"
      >
        <div className="public-demo-steps">
          {homeWorkflow.map(([title, detail], index) => (
            <article key={title}>
              <span>{index + 1}</span>
              <strong>{title}</strong>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Commencez bas, prouvez le retour sur investissement, puis activez les automatisations plus avancees."
        title="Des offres lisibles pour artisans et TPE CVC"
      >
        <div className="public-pricing-grid public-pricing-grid-three">
          {billingPlans.map((plan) => (
            <article className="public-price-panel" key={plan.id}>
              <p className="text-sm font-semibold text-emerald-300">
                ContratPro {plan.name}
              </p>
              <strong>{plan.priceLabel}</strong>
              <span>/ mois</span>
              <p>{plan.description}</p>
              <a
                className="cp-btn cp-btn-secondary cp-btn-sm mt-4"
                href={`/pricing#${plan.id}`}
              >
                Voir {plan.name}
              </a>
            </article>
          ))}
        </div>
      </PublicSection>

      <section className="home-final-cta mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
        <div>
          <p className="text-sm font-semibold text-emerald-300">
            Premiere action
          </p>
          <h2>Calculez d'abord ce que valent vos contrats oublies.</h2>
          <p>
            Le simulateur donne une estimation immediate du revenu annuel que
            les relances structurees peuvent proteger.
          </p>
        </div>
        <a className="cp-btn cp-btn-primary" href="/simulateur">
          Lancer le simulateur
        </a>
      </section>
    </PublicShell>
  );
}

async function DashboardHome() {
  const [contracts, customers, certificates, invoices, payments, renewalPipeline] = await Promise.all([
    getContracts(),
    getCustomers(),
    getCertificates(),
    getInvoices(),
    getPayments(),
    getRenewalPipeline(),
  ]);
  const isAdmin = Boolean(await getCurrentAdminUser());

  const annualRevenue = contracts.reduce(
    (sum, contract) => sum + contract.value,
    0,
  );
  const sepaPayments = payments.filter((payment) => payment.method === "SEPA");
  const sepaShare = payments.length
    ? Math.round((sepaPayments.length / payments.length) * 100)
    : 0;
  const certificatesToSend = certificates.filter((certificate) =>
    certificate.status.toLowerCase().includes("envoyer"),
  );
  const atRiskRenewals = renewalPipeline.filter((renewal) => renewal.daysRemaining <= 45);
  const criticalRenewals = renewalPipeline.filter((renewal) => renewal.daysRemaining <= 15);
  const renewalValueAtRisk = atRiskRenewals.reduce(
    (sum, renewal) => sum + renewal.value,
    0,
  );
  const renewalsWithoutSepa = atRiskRenewals.filter(
    (renewal) => !renewal.paymentMethod.includes("SEPA"),
  );
  const failedPayments = payments.filter((payment) => payment.rawStatus === "FAILED");
  const pendingPayments = payments.filter((payment) =>
    ["PENDING_SUBMISSION", "SUBMITTED"].includes(payment.rawStatus),
  );
  const invoicesToFollow = invoices.filter((invoice) =>
    ["DRAFT", "SENT", "OVERDUE"].includes(invoice.rawStatus),
  );
  const safetyActions = [
    {
      action: "Relancer",
      count: criticalRenewals.length,
      detail: `${formatEuro(criticalRenewals.reduce((sum, renewal) => sum + renewal.value, 0))} a proteger sous 15 jours`,
      href: "/relances",
      tone: "rose",
    },
    {
      action: "Envoyer",
      count: certificatesToSend.length,
      detail: "documents entretien a transmettre au client",
      href: "/certificates",
      tone: "amber",
    },
    {
      action: "Facturer",
      count: invoicesToFollow.length,
      detail: `${formatEuro(invoicesToFollow.reduce((sum, invoice) => sum + invoice.amountTtc, 0))} a suivre`,
      href: "/invoices",
      tone: "cyan",
    },
    {
      action: "Activer SEPA",
      count: renewalsWithoutSepa.length,
      detail: "contrats à risque encore hors prélèvement",
      href: "/payments/new",
      tone: "cyan",
    },
  ] as const;
  const safetyScore = Math.max(
    0,
    Math.min(
      100,
      100 -
        criticalRenewals.length * 12 -
        certificatesToSend.length * 6 -
        failedPayments.length * 14 -
        invoicesToFollow.length * 4 -
        renewalsWithoutSepa.length * 5,
    ),
  );
  const safetyTone: CardTone =
    safetyScore >= 80 ? "emerald" : safetyScore >= 58 ? "amber" : "rose";
  const nextSecuringAction =
    [
      {
        action: "Reprendre les paiements rejetes",
        count: failedPayments.length,
        detail: "encaissements a corriger avant perte client",
        href: "/payments",
        tone: "rose" as const,
      },
      ...safetyActions,
    ].find((action) => action.count > 0);
  const actionCount = safetyActions.reduce((sum, action) => sum + action.count, 0);
  const renewals = contracts.slice(0, 5);
  const paymentQueue = payments.slice(0, 4);
  const hasPortfolio = contracts.length > 0 || customers.length > 0;
  const dashboardNextMove = !hasPortfolio
    ? {
        cta: "Importer Excel",
        detail:
          "Le cockpit se remplit apres une simulation d'import. Aucun client n'est cree sans confirmation.",
        href: "/import",
        label: "Premier demarrage",
        title: "Commencez par votre fichier clients.",
        tone: "cyan" as const,
      }
    : nextSecuringAction
      ? {
          cta: "Traiter maintenant",
          detail: nextSecuringAction.detail,
          href: nextSecuringAction.href,
          label: "A faire maintenant",
          title: `${nextSecuringAction.action} avant de quitter le cockpit.`,
          tone: nextSecuringAction.tone,
        }
      : {
          cta: "Voir contrats",
          detail:
            "Aucune urgence detectee. Le prochain controle utile reste la liste des echeances.",
          href: "/contracts",
          label: "Portefeuille calme",
          title: "Rien ne brule aujourd'hui.",
          tone: "emerald" as const,
        };
  const todayContractCount = criticalRenewals.length + renewalsWithoutSepa.length;
  const todayPaymentCount = failedPayments.length + pendingPayments.length;
  const todayDocumentCount = certificatesToSend.length + invoicesToFollow.length;
  const priorityQueue = [
    ...failedPayments.slice(0, 1).map((payment) => ({
      action: "Paiement",
      detail: `${formatEuro(payment.amount)} - ${payment.status}`,
      href: payment.contractId ? `/contracts/${payment.contractId}` : "/payments",
      label: payment.customer,
      tone: "rose" as const,
    })),
    ...criticalRenewals.slice(0, 2).map((renewal) => ({
      action: "Relance",
      detail: `${renewal.daysRemaining} jour(s) restants - ${formatEuro(renewal.value)}`,
      href: "/relances",
      label: renewal.customer,
      tone: "amber" as const,
    })),
    ...certificatesToSend.slice(0, 1).map((certificate) => ({
      action: "Attestation",
      detail: certificate.equipment,
      href: "/certificates",
      label: certificate.customer,
      tone: "cyan" as const,
    })),
    ...invoicesToFollow.slice(0, 1).map((invoice) => ({
      action: "Facture",
      detail: `${formatEuro(invoice.amountTtc)} - ${invoice.status}`,
      href: "/invoices",
      label: invoice.customer,
      tone: "emerald" as const,
    })),
  ].slice(0, 4);
  const architectDecision =
    criticalRenewals.length > 0 || failedPayments.length > 0
      ? {
          label: "Urgent",
          tone: "rose" as const,
          title: "Protegez le revenu avant la fin de semaine.",
          proof: `${criticalRenewals.length} échéance(s) critique(s), ${failedPayments.length} paiement(s) rejeté(s).`,
          action: "Ouvrir la file de relance",
          href: "/relances",
        }
      : atRiskRenewals.length > 0 || certificatesToSend.length > 0 || invoicesToFollow.length > 0
        ? {
            label: "A surveiller",
            tone: "amber" as const,
            title: "Le portefeuille est sain, mais des preuves restent a envoyer.",
            proof: `${atRiskRenewals.length} renouvellement(s), ${certificatesToSend.length} attestation(s), ${invoicesToFollow.length} facture(s).`,
            action: "Traiter les actions du jour",
            href: "/certificates",
          }
        : {
            label: "Stable",
            tone: "emerald" as const,
            title: "Aucune fuite prioritaire detectee aujourd'hui.",
            proof: "Relances, attestations et paiements ne presentent pas de blocage urgent.",
            action: "Verifier les prochains contrats",
            href: "/contracts",
          };

  return (
    <AppShell activePath="/" showInternalTools={isAdmin}>
      <PageHeader
        action={
          <>
            {isAdmin ? (
              <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/admin/prospection">
                Admin prospection
              </a>
            ) : null}
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/relances">
              Voir relances
            </a>
            <a className="cp-btn cp-btn-primary cp-btn-sm" href="/contracts/quick">
              Nouveau contrat
            </a>
          </>
        }
        description="Les échéances, attestations, factures et paiements qui demandent une action aujourd'hui."
        eyebrow="Cockpit dirigeant"
        title="Sécurisation des contrats CVC"
      />

      {/* Bandeau : jauge de sécurité + actions du jour */}
      <section className="cp-grid-cockpit-hero">
        <article className="cp-card cp-cockpit-score" data-tone={safetyTone}>
          <div className="cp-cockpit-score-head">
            <p className="cp-kicker">Score de sécurité</p>
            <span className="cp-pill cp-pill-dot" data-tone={safetyTone}>
              {safetyScore >= 80 ? "Sous contrôle" : safetyScore >= 58 ? "À surveiller" : "Critique"}
            </span>
          </div>
          <div className="cp-cockpit-gauge-row">
            <Gauge
              value={safetyScore}
              label={safetyScore}
              caption="/ 100"
              tone={safetyTone}
            />
            <div className="cp-cockpit-score-readout">
              <p className="cp-cockpit-score-thesis">
                {nextSecuringAction?.action ?? "Portefeuille sous contrôle"}
              </p>
              <p className="cp-cockpit-score-detail">
                {nextSecuringAction?.detail ??
                  "Aucune fuite urgente détectée. Continuez à suivre les prochaines échéances."}
              </p>
              <a className="cp-btn cp-btn-primary cp-btn-sm" href={nextSecuringAction?.href ?? "/relances"}>
                Ouvrir la file
              </a>
            </div>
          </div>
        </article>

        <div className="cp-cockpit-today">
          <TodayCountCard
            detail="relances ou SEPA à préparer"
            href="/contracts"
            label="Contrats à traiter"
            tone="amber"
            value={todayContractCount}
          />
          <TodayCountCard
            detail="en cours, rejetés ou à vérifier"
            href="/payments"
            label="Paiements à suivre"
            tone="cyan"
            value={todayPaymentCount}
          />
          <TodayCountCard
            detail="factures et attestations"
            href="/invoices"
            label="Documents à envoyer"
            tone="emerald"
            value={todayDocumentCount}
          />
        </div>
      </section>

      {/* File courte priorisée */}
      <section className="cp-section cp-cockpit-queue">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">File courte du jour</h3>
            <p className="cp-section-desc">Les dossiers qui méritent une action avant de retourner sur le terrain.</p>
          </div>
          <span className="cp-pill">{priorityQueue.length || "0"} priorité(s)</span>
        </header>
        <div className="cp-section-body">
          {priorityQueue.length ? (
            <div className="cp-queue-list">
              {priorityQueue.map((item) => (
                <a className="cp-queue-item" data-tone={item.tone} href={item.href} key={`${item.action}-${item.label}-${item.detail}`}>
                  <span className="cp-queue-action">{item.action}</span>
                  <div className="cp-queue-body">
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <span className="cp-queue-arrow">→</span>
                </a>
              ))}
            </div>
          ) : (
            <EmptyState
              diagnosis="Aucune urgence détectée."
              detail="Le portefeuille est calme. Vous pouvez créer un contrat ou vérifier les échéances à venir."
              action={<ButtonLink variant="primary" size="sm" href="/contracts">Voir les contrats</ButtonLink>}
            />
          )}
        </div>
      </section>

      {/* Agent Architecte IA */}
      <AgentPanel
        eyebrow="Architecte IA contrats"
        thesis={architectDecision.title}
        proof={architectDecision.proof}
        action={
          <div className="flex flex-col items-end gap-2">
            <span className="cp-pill cp-pill-dot" data-tone={architectDecision.tone}>{architectDecision.label}</span>
            <a className="cp-btn cp-btn-primary cp-btn-sm" href={architectDecision.href}>{architectDecision.action}</a>
          </div>
        }
      />

      {/* Signaux de sécurité (revenu à risque, échéances, SEPA) */}
      <div className="cp-safety-grid">
        <StatCard
          label="Revenu à risque"
          value={formatEuro(renewalValueAtRisk)}
          detail={`${atRiskRenewals.length} contrat(s) sous 45 jours`}
          tone="rose"
        />
        <StatCard
          label="Échéances critiques"
          value={String(criticalRenewals.length)}
          detail={`${criticalRenewals.length} critique(s) sous 15 jours`}
          tone="amber"
        />
        <StatCard
          label="Paiements rejetés"
          value={String(failedPayments.length)}
          detail={`${pendingPayments.length} en cours de traitement`}
          tone="rose"
        />
        <StatCard
          label="SEPA à activer"
          value={`${sepaShare}%`}
          detail={`${renewalsWithoutSepa.length} renouvellement(s) sans mandat`}
          tone="cyan"
        />
      </div>

      {/* Prochaine action dirigée */}
      <section className="cp-next-move" data-tone={dashboardNextMove.tone}>
        <div>
          <p className="cp-kicker">{dashboardNextMove.label}</p>
          <h2 className="cp-next-move-title">{dashboardNextMove.title}</h2>
          <p className="cp-next-move-detail">{dashboardNextMove.detail}</p>
        </div>
        <a className="cp-btn cp-btn-primary" href={dashboardNextMove.href}>{dashboardNextMove.cta}</a>
      </section>

      {!hasPortfolio ? (
        <section className="cp-card cp-onboarding-cta">
          <div>
            <p className="cp-eyebrow">Activation portefeuille</p>
            <h2 className="cp-onboarding-title">Importez votre base pour voir le revenu à sécuriser.</h2>
            <p className="cp-onboarding-detail">
              Le cockpit devient utile dès que vos clients, équipements et contrats annuels sont présents. Commencez par un dry-run, sans création irréversible.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="cp-btn cp-btn-primary" href="/import">Importer mes contrats</a>
            <a className="cp-btn cp-btn-secondary" href="/contracts/quick">Créer un contrat</a>
          </div>
        </section>
      ) : null}

      {/* Metrics globales tabulaires */}
      <div className="cp-stat-grid">
        <StatCard label="Revenu annuel" value={formatEuro(annualRevenue)} detail={`${contracts.length} contrats suivis`} tone="emerald" />
        <StatCard label="Portefeuille" value={String(customers.length)} detail={`${customers.length} fiches clients actives`} tone="cyan" />
        <StatCard label="Conformité" value={String(certificates.length)} detail={`${certificatesToSend.length} attestations à traiter`} tone="amber" />
        <StatCard label="SEPA" value={`${sepaShare}%`} detail={`${sepaPayments.length} paiements SEPA suivis`} tone="rose" />
      </div>

      <div className="cp-split-grid">
        <section className="cp-section">
          <header className="cp-section-header">
            <div>
              <h3 className="cp-section-title">Renouvellements prioritaires</h3>
              <p className="cp-section-desc">Triés par échéance pour déclencher les relances au bon moment.</p>
            </div>
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/contracts">Voir tous</a>
          </header>
          <div className="overflow-x-auto">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Équipement</th>
                  <th>Échéance</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {renewals.map((contract) => (
                  <tr key={contract.id}>
                    <td>
                      <p className="cp-cell-strong">{contract.customer}</p>
                      <p className="cp-cell-sub">{contract.city}</p>
                    </td>
                    <td>{contract.equipment}</td>
                    <td>{contract.renewal}</td>
                    <td className="cp-cell-amount">{formatEuro(contract.value)}</td>
                    <td><StatusPill>{contract.status}</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="cp-section">
          <header className="cp-section-header">
            <div>
              <h3 className="cp-section-title">Situation dirigeant</h3>
              <p className="cp-section-desc">Les signaux qui parlent chiffre d'affaires, cash et risque.</p>
            </div>
            <span className="cp-pill cp-pill-dot" data-tone="emerald">Live</span>
          </header>
          <div className="cp-section-body cp-metric-stack">
            <Metric label="Panier contrat moyen" value={formatEuro(contracts.length ? Math.round(annualRevenue / contracts.length) : 0)} />
            <Metric label="Revenu client moyen" value={formatEuro(customers.length ? Math.round(annualRevenue / customers.length) : 0)} />
            <Metric label="Attestations en attente" value={String(certificatesToSend.length)} />
          </div>
        </section>
      </div>

      <div className="cp-split-grid cp-split-grid-alt">
        <section className="cp-section">
          <header className="cp-section-header">
            <div>
              <h3 className="cp-section-title">Paiements à surveiller</h3>
              <p className="cp-section-desc">Prélèvements, virements et relances issus du moteur Supabase.</p>
            </div>
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/payments">Paiements</a>
          </header>
          <div className="cp-section-body cp-payment-list">
            {paymentQueue.map((payment) => (
              <div className="cp-payment-row" key={payment.id}>
                <div>
                  <p className="cp-cell-strong">{payment.customer}</p>
                  <p className="cp-cell-sub">{payment.method} — {payment.dueDate}</p>
                </div>
                <strong className="cp-cell-amount">{formatEuro(payment.amount)}</strong>
                <StatusPill>{payment.status}</StatusPill>
              </div>
            ))}
          </div>
        </section>

        <section className="cp-section">
          <header className="cp-section-header">
            <div>
              <h3 className="cp-section-title">Conformité entretien</h3>
              <p className="cp-section-desc">Attestations légales rattachées aux interventions et contrats.</p>
            </div>
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/certificates">Attestations</a>
          </header>
          <div className="cp-section-body cp-cert-grid">
            {certificates.slice(0, 3).map((certificate) => (
              <article className="cp-cert-card" key={certificate.id}>
                <p className="cp-cell-strong">{certificate.customer}</p>
                <p className="cp-cell-sub">{certificate.equipment}</p>
                <p className="cp-cert-date">{certificate.issuedAt}</p>
                <StatusPill>{certificate.status}</StatusPill>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default async function Home() {
  const authEnforced = isAuthEnforced();
  const user = authEnforced ? await getCurrentUser() : null;

  if (authEnforced && !user) {
    return <HomeLanding />;
  }

  return <DashboardHome />;
}
