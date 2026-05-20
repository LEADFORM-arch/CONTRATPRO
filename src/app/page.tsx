import type { Metadata } from "next";

import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";
import { StructuredData } from "@/components/marketing/StructuredData";
import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
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
    "ContratPro aide les chauffagistes à retrouver leurs contrats d’entretien, automatiser les relances, générer les attestations et suivre les paiements.",
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
  "Les renouvellements restent dans Excel ou dans la tete du dirigeant.",
  "Les attestations et factures partent trop tard apres les visites.",
  "Les contrats annuels sont vendus, mais pas toujours relances ni encaisses.",
];

const homeWorkflow = [
  ["Importer", "Clients, equipements et contrats existants."],
  ["Surveiller", "Echeances, attestations et paiements recurrents."],
  ["Relancer", "Emails, actions commerciales et cron quotidien."],
  ["Encaisser", "Factures PDF, historique d'envoi et SEPA."],
];

const homeProofs = [
  ["15 min", "pour comprendre les contrats a sauver"],
  ["45 jours", "avant échéance pour relancer proprement"],
  ["SEPA", "pour fiabiliser le cash recurrent"],
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

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: CardTone;
}) {
  return (
    <article className="dashboard-stat-card" data-tone={tone}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
        {value}
      </strong>
      <p className="mt-2 text-sm text-zinc-400">{detail}</p>
    </article>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="dashboard-mini-metric">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <strong className="mt-2 block text-xl font-semibold text-zinc-50">
        {value}
      </strong>
    </div>
  );
}

function SafetySignal({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: CardTone;
}) {
  return (
    <article className="contract-safety-signal" data-tone={tone}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function DashboardActionRow({
  action,
  count,
  detail,
  href,
  tone,
}: {
  action: string;
  count: number;
  detail: string;
  href: string;
  tone: CardTone;
}) {
  return (
    <a className="dashboard-today-action" data-tone={tone} href={href}>
      <span>{count}</span>
      <div>
        <strong>{action}</strong>
        <small>{detail}</small>
      </div>
    </a>
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

function TodayQueueItem({
  action,
  detail,
  href,
  label,
  tone,
}: {
  action: string;
  detail: string;
  href: string;
  label: string;
  tone: CardTone;
}) {
  return (
    <a className="dashboard-priority-item" data-tone={tone} href={href}>
      <span>{action}</span>
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
            <a className="premium-action rounded-md text-sm font-semibold" href="/demo">
              Programmer une demo
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/simulateur">
              Calculer mes contrats oublies
            </a>
          </>
        }
        description="ContratPro aide les chauffagistes et entreprises CVC a transformer leur portefeuille d'entretien en revenu recurrent pilote : relances, attestations, factures et encaissements au meme endroit."
        eyebrow="Logiciel contrats de maintenance CVC"
        title="Ne laissez plus vos contrats d'entretien dormir dans Excel."
      />

      <section className="home-proof-strip mx-auto grid max-w-6xl gap-3 px-5 pb-4 sm:px-8 md:grid-cols-3">
        {homeProofs.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <PublicSection
        description="Le logiciel se concentre sur ce qui fait vraiment perdre du revenu a une entreprise CVC : l'oubli, le retard administratif et les paiements non automatises."
        title="Le probleme n'est pas de vendre un contrat. C'est de le retrouver au bon moment."
      >
        <div className="public-proof-grid">
          {homeProblems.map((problem) => (
            <article key={problem}>{problem}</article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Un parcours court, pense pour un dirigeant terrain : importer, voir les urgences, relancer, encaisser."
        title="Une methode simple pour recuperer du cash recurrent"
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
                className="premium-secondary-action mt-4 inline-flex rounded-md px-4 py-2 text-sm font-semibold"
                href={`/pricing#${plan.id}`}
              >
                Voir {plan.name}
              </a>
            </article>
          ))}
        </div>
      </PublicSection>

      <section className="home-final-cta mx-auto max-w-6xl px-5 py-8 sm:px-8">
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
        <a className="premium-action rounded-md text-sm font-semibold" href="/simulateur">
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
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <a
                className="premium-secondary-action rounded-md px-4 py-2 text-sm font-medium"
                href="/admin/prospection"
              >
                Admin prospection
              </a>
            ) : null}
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-medium" href="/relances">
              Voir relances
            </a>
            <a className="premium-action rounded-md text-sm font-semibold" href="/contracts/quick">
              Nouveau contrat
            </a>
          </div>
        }
        description="Les echeances, attestations, factures et paiements qui demandent une action aujourd'hui."
        eyebrow="Cockpit dirigeant"
        title="Securisation des contrats CVC"
      />

      <section className="dashboard-artisan-home mt-6">
        <div className="dashboard-artisan-copy">
          <p>Aujourd'hui</p>
          <h2>Ce qui mérite votre attention maintenant.</h2>
          <span>
            Pas besoin de tout lire : traitez une action, puis retour terrain.
          </span>
        </div>

        <div className="dashboard-today-counts">
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

        <div className="dashboard-quick-actions">
          <a className="premium-action rounded-md text-sm font-semibold" href="/contracts/quick">
            Créer contrat
          </a>
          <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/import">
            Importer Excel
          </a>
          <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/invoices/new">
            Créer facture
          </a>
        </div>

        <div className="dashboard-priority-list">
          <div className="dashboard-priority-header">
            <strong>File courte</strong>
            <span>{priorityQueue.length || "0"} priorité(s)</span>
          </div>
          {priorityQueue.length ? (
            priorityQueue.map((item) => (
              <TodayQueueItem
                action={item.action}
                detail={item.detail}
                href={item.href}
                key={`${item.action}-${item.label}-${item.detail}`}
                label={item.label}
                tone={item.tone}
              />
            ))
          ) : (
            <div className="dashboard-priority-empty">
              <strong>Aucune urgence.</strong>
              <p>Le portefeuille est calme. Vous pouvez créer un contrat ou vérifier les échéances.</p>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-next-move mt-6" data-tone={dashboardNextMove.tone}>
        <div>
          <p>{dashboardNextMove.label}</p>
          <h2>{dashboardNextMove.title}</h2>
          <span>{dashboardNextMove.detail}</span>
        </div>
        <a className="premium-action rounded-md text-sm font-semibold" href={dashboardNextMove.href}>
          {dashboardNextMove.cta}
        </a>
      </section>

      {!hasPortfolio ? (
        <section className="dashboard-empty-cockpit mt-6" data-od-id="dashboard-empty-cockpit">
          <div>
            <p>Activation portefeuille</p>
            <h2>Importez votre base pour voir le revenu à sécuriser.</h2>
            <span>
              Le cockpit devient utile des que vos clients, equipements et contrats
              annuels sont presents. Commencez par un dry-run, sans creation irreversible.
            </span>
          </div>
          <div className="dashboard-empty-actions">
            <a className="premium-action rounded-md text-sm font-semibold" href="/import">
              Importer mes contrats
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/contracts/quick">
              Créer un contrat
            </a>
          </div>
        </section>
      ) : null}

      <section className="contract-safety-cockpit mt-6">
        <div className="contract-safety-brief">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Cockpit revenu recurrent
            </p>
            <h2>Securiser les contrats avant qu'ils ne fuient.</h2>
            <p>
              Lecture dirigeant des échéances, documents, paiements et mandats
              qui menacent directement le revenu annuel.
            </p>
          </div>
          <div className="contract-safety-gauge" data-tone={safetyTone}>
            <span>Score securite</span>
            <strong>{safetyScore}</strong>
            <small>/100</small>
          </div>
        </div>

        <div className="contract-safety-grid">
          <SafetySignal
            detail={`${atRiskRenewals.length} contrat(s) sous 45 jours`}
            label="Revenu a risque"
            tone="rose"
            value={formatEuro(renewalValueAtRisk)}
          />
          <SafetySignal
            detail={`${criticalRenewals.length} critique(s) sous 15 jours`}
            label="Echeances critiques"
            tone="amber"
            value={String(criticalRenewals.length)}
          />
          <SafetySignal
            detail={`${pendingPayments.length} en cours de traitement`}
            label="Paiements rejetes"
            tone="rose"
            value={String(failedPayments.length)}
          />
          <SafetySignal
            detail={`${renewalsWithoutSepa.length} renouvellement(s) sans mandat`}
            label="SEPA a activer"
            tone="cyan"
            value={`${sepaShare}%`}
          />
        </div>

        <div className="contract-safety-command">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Action du jour
            </p>
            <h3>
              {nextSecuringAction?.action ?? "Portefeuille sous contrôle"}
            </h3>
            <p>
              {nextSecuringAction?.detail ??
                "Aucune fuite urgente détectée. Continuez à suivre les prochaines échéances."}
            </p>
          </div>
          <a
            className="premium-action rounded-md text-sm font-semibold"
            href={nextSecuringAction?.href ?? "/relances"}
          >
            Ouvrir la file
          </a>
        </div>

        <div className="contract-safety-actions">
          {safetyActions.map((item) => (
            <a
              className="contract-safety-action"
              data-tone={item.tone}
              href={item.href}
              key={item.action}
            >
              <span>{item.count}</span>
              <strong>{item.action}</strong>
              <small>{item.detail}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="dashboard-command-grid mt-6" data-od-id="dashboard-contract-architect">
        <article className="dashboard-architect-panel" data-tone={architectDecision.tone}>
          <div>
            <p className="text-sm font-semibold text-cyan-300">Architecte IA contrats</p>
            <h3>{architectDecision.title}</h3>
            <span>{architectDecision.proof}</span>
          </div>
          <div className="dashboard-architect-decision">
            <small>Diagnostic</small>
            <strong>{architectDecision.label}</strong>
            <a className="premium-action rounded-md text-sm font-semibold" href={architectDecision.href}>
              {architectDecision.action}
            </a>
          </div>
        </article>

        <article className="dashboard-today-panel">
          <div className="dashboard-today-header">
            <div>
              <p>Aujourd'hui</p>
              <h3>Actions qui securisent le cash</h3>
            </div>
            <StatusPill>{actionCount} actions</StatusPill>
          </div>
          <div className="dashboard-today-list">
            {actionCount > 0 ? (
              safetyActions
                .filter((item) => item.count > 0)
                .map((item) => (
                  <DashboardActionRow
                    action={item.action}
                    count={item.count}
                    detail={item.detail}
                    href={item.href}
                    key={item.action}
                    tone={item.tone}
                  />
                ))
            ) : (
              <div className="dashboard-today-empty">
                <strong>Aucune action urgente.</strong>
                <p>Le portefeuille est calme. Continuez par le suivi des prochains contrats.</p>
                <a href="/contracts">Voir les contrats</a>
              </div>
            )}
          </div>
        </article>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail={`${contracts.length} contrats suivis`}
          label="Revenu annuel"
          tone="emerald"
          value={formatEuro(annualRevenue)}
        />
        <StatCard
          detail={`${customers.length} fiches clients actives`}
          label="Portefeuille"
          tone="cyan"
          value={String(customers.length)}
        />
        <StatCard
          detail={`${certificatesToSend.length} attestations a traiter`}
          label="Conformite"
          tone="amber"
          value={String(certificates.length)}
        />
        <StatCard
          detail={`${sepaPayments.length} paiements SEPA suivis`}
          label="SEPA"
          tone="rose"
          value={`${sepaShare}%`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="dashboard-section overflow-hidden">
          <div className="dashboard-section-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-50">
                Renouvellements prioritaires
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Triés par échéance pour déclencher les relances au bon moment.
              </p>
            </div>
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/contracts"
            >
              Voir tous
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="dashboard-table-head text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Equipement</th>
                  <th className="px-4 py-3 font-semibold">Echeance</th>
                  <th className="px-4 py-3 font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {renewals.map((contract) => (
                  <tr className="dashboard-table-row" key={contract.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-zinc-50">
                        {contract.customer}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {contract.city}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {contract.equipment}
                    </td>
                    <td className="px-4 py-4 text-zinc-200">
                      {contract.renewal}
                    </td>
                    <td className="px-4 py-4 font-semibold text-zinc-50">
                      {formatEuro(contract.value)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill>{contract.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-section p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-50">
                Situation dirigeant
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Les signaux qui parlent chiffre d'affaires, cash et risque.
              </p>
            </div>
            <span className="dashboard-live-pill">Live</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MiniMetric
              label="Panier contrat moyen"
              value={formatEuro(
                contracts.length ? Math.round(annualRevenue / contracts.length) : 0,
              )}
            />
            <MiniMetric
              label="Revenu client moyen"
              value={formatEuro(
                customers.length ? Math.round(annualRevenue / customers.length) : 0,
              )}
            />
            <MiniMetric
              label="Attestations en attente"
              value={String(certificatesToSend.length)}
            />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="dashboard-section p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-50">
                Paiements a surveiller
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Prelevements, virements et relances issus du modele Supabase.
              </p>
            </div>
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/payments"
            >
              Paiements
            </a>
          </div>

          <div className="mt-5 divide-y divide-zinc-800/80">
            {paymentQueue.map((payment) => (
              <div
                className="dashboard-list-row grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                key={payment.id}
              >
                <div>
                  <p className="font-medium text-zinc-50">{payment.customer}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {payment.method} - {payment.dueDate}
                  </p>
                </div>
                <strong className="text-sm text-zinc-50">
                  {formatEuro(payment.amount)}
                </strong>
                <StatusPill>{payment.status}</StatusPill>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-50">
                Conformite entretien
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Attestations legales rattachees aux interventions et contrats.
              </p>
            </div>
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/certificates"
            >
              Attestations
            </a>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {certificates.slice(0, 3).map((certificate) => (
              <article className="dashboard-certificate-card" key={certificate.id}>
                <p className="text-sm font-semibold text-zinc-50">
                  {certificate.customer}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  {certificate.equipment}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {certificate.issuedAt}
                </p>
                <div className="mt-3">
                  <StatusPill>{certificate.status}</StatusPill>
                </div>
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
