import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import { getCurrentBillingStatus } from "@/server/billing";
import {
  getCertificates,
  getContracts,
  getCustomers,
  getInvoices,
  getOrganizationProfile,
  getPayments,
} from "@/server/contratpro-data";
import { isDemoTenant } from "@/server/tenant";

type MetricTone = "amber" | "cyan" | "emerald" | "rose";
type StepAccent = "amber" | "cyan" | "emerald" | "rose" | "violet";

type OnboardingStep = {
  accent: StepAccent;
  description: string;
  done: boolean;
  href: string;
  impact: string;
  title: string;
};

type FirstMinuteAction = {
  cta: string;
  detail: string;
  href: string;
  kicker: string;
  state: "done" | "primary" | "ready";
  title: string;
};

type ActivationDecision = {
  action: string;
  label: string;
  range: string;
  risk: string;
  signal: string;
  tone: "critical" | "ready" | "warning";
};

const activationDecisions: ActivationDecision[] = [
  {
    action: "Vendre le pilote Starter si l'import et les relances sont compris.",
    label: "Démarrage accompagné",
    range: "0-59",
    risk: "Le client voit encore ContratPro comme une maquette.",
    signal: "Identité incomplète, base vide ou aucun document généré.",
    tone: "critical",
  },
  {
    action: "Passer en pilote payant avec une liste courte d'actions.",
    label: "Pilote facturable",
    range: "60-84",
    risk: "Le client peut payer, mais le go-live doit rester accompagné.",
    signal: "Clients et contrats présents, SEPA ou documents encore à finaliser.",
    tone: "warning",
  },
  {
    action: "Ouvrir le Pro ou Business et surveiller les signaux ops.",
    label: "Go-live limité",
    range: "85-100",
    risk: "Le risque principal devient opérationnel : emails, webhooks, cron.",
    signal: "Cycle complet prêt : données, documents, cash-flow et sécurité.",
    tone: "ready",
  },
];

function OnboardingMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
}) {
  return (
    <article className="onboarding-metric" data-tone={tone}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <strong className="mt-3 block text-2xl font-black text-zinc-950">
        {value}
      </strong>
      <p className="mt-2 text-sm leading-5 text-zinc-500">{detail}</p>
    </article>
  );
}

function StepStatus({ done }: { done: boolean }) {
  return (
    <span className="onboarding-status-pill" data-state={done ? "done" : "todo"}>
      {done ? "Prêt" : "À faire"}
    </span>
  );
}

function qualityLabel(score: number) {
  if (score >= 85) {
    return "Prêt à vendre";
  }
  if (score >= 60) {
    return "Solide, à finaliser";
  }
  return "Mise en route";
}

function activationDecision(score: number) {
  if (score >= 85) {
    return activationDecisions[2];
  }
  if (score >= 60) {
    return activationDecisions[1];
  }
  return activationDecisions[0];
}

function firstMinuteActions({
  companyComplete,
  contractsCount,
  customersCount,
}: {
  companyComplete: boolean;
  contractsCount: number;
  customersCount: number;
}): FirstMinuteAction[] {
  return [
    {
      cta: "D\u00e9poser Excel",
      detail:
        customersCount > 0
          ? customersCount + " client(s) d\u00e9j\u00e0 pr\u00e9sents. Importer un autre fichier si besoin."
          : "Pour reprendre un portefeuille clients sans ressaisie.",
      href: "/import",
      kicker: "J'ai d\u00e9j\u00e0 une liste",
      state: customersCount > 0 ? "done" : "primary",
      title: "Importer mes clients",
    },
    {
      cta: "Cr\u00e9er contrat",
      detail:
        contractsCount > 0
          ? contractsCount + " contrat(s) d\u00e9j\u00e0 actifs dans le cockpit."
          : "Pour tester tout de suite client, \u00e9quipement, tarif et SEPA.",
      href: "/contracts/quick",
      kicker: "Je veux tester maintenant",
      state: contractsCount > 0 ? "done" : customersCount > 0 ? "primary" : "ready",
      title: "Cr\u00e9er un contrat",
    },
    {
      cta: "Compl\u00e9ter fiche",
      detail: companyComplete
        ? "Identit\u00e9 pr\u00eate pour factures, attestations et emails."
        : "SIRET, adresse, TVA et coordonn\u00e9es avant documents propres.",
      href: "/settings/company",
      kicker: "Je pr\u00e9pare les documents",
      state: companyComplete ? "done" : "ready",
      title: "Renseigner l'entreprise",
    },
  ];
}

export default async function OnboardingPage() {
  const [organization, customers, contracts, invoices, certificates, payments, billing] =
    await Promise.all([
      getOrganizationProfile(),
      getCustomers(),
      getContracts(),
      getInvoices(),
      getCertificates(),
      getPayments(),
      getCurrentBillingStatus(),
    ]);

  const annualRevenue = contracts.reduce((sum, contract) => sum + contract.value, 0);
  const sepaPayments = payments.filter((payment) => payment.method === "SEPA");
  const companyComplete = Boolean(
    organization.name &&
      organization.email &&
      organization.siret &&
      organization.address &&
      organization.city,
  );
  const documentsReady = invoices.length > 0 && certificates.length > 0;
  const securityReady = !isDemoTenant();
  const billingReady = !billing.required || billing.active;

  const steps: OnboardingStep[] = [
    {
      title: "Identité entreprise",
      description: "Nom, SIRET, TVA, RGE, email et adresse pour documents propres.",
      href: "/settings/company",
      accent: "emerald",
      done: companyComplete,
      impact: "Crédibilité devis, factures et attestations.",
    },
    {
      title: "Base clients",
      description: "Importer Praxedo ou créer les premiers clients manuellement.",
      href: "/import",
      accent: "cyan",
      done: customers.length > 0,
      impact: "Point de départ du revenu récurrent.",
    },
    {
      title: "Contrats actifs",
      description: "Rattacher équipements, échéances et prix annuels.",
      href: "/contracts/quick",
      accent: "amber",
      done: contracts.length > 0,
      impact: "Tableau de bord et relances deviennent exploitables.",
    },
    {
      title: "Documents légaux",
      description: "Générer au moins une facture et une attestation PDF.",
      href: invoices.length ? "/certificates" : "/invoices/new",
      accent: "rose",
      done: documentsReady,
      impact: "Preuve que le cycle client est livrable de bout en bout.",
    },
    {
      title: "Paiement récurrent",
      description: "Préparer SEPA et vérifier la future facturation ContratPro.",
      href: sepaPayments.length ? "/payments" : "/settings/billing",
      accent: "violet",
      done: sepaPayments.length > 0 && billingReady,
      impact: "Cash et abonnement sous contrôle.",
    },
    {
      title: "Sécurité production",
      description: "Auth, RLS, billing lock et environnement hors démo.",
      href: "/settings/security",
      accent: "emerald",
      done: securityReady && billingReady,
      impact: "Isolation client et exploitation production.",
    },
  ];

  const completed = steps.filter((step) => step.done).length;
  const completionRate = Math.round((completed / steps.length) * 100);
  const nextStep = steps.find((step) => !step.done);
  const decision = activationDecision(completionRate);
  const quickStartActions = firstMinuteActions({
    companyComplete,
    contractsCount: contracts.length,
    customersCount: customers.length,
  });

  return (
    <AppShell activePath="/onboarding">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href={nextStep?.href ?? "/"}>
            {nextStep ? "Continuer" : "Voir le pilotage"}
          </a>
        }
        description="Choisissez le point de départ. Le reste vient après."
        eyebrow="Mise en route"
        title="Activation ContratPro"
      />

      <section className="onboarding-first-run mt-6 rounded-lg border p-5">
        <div className="onboarding-first-run-copy">
          <p>{"Premi\u00e8re minute apr\u00e8s connexion"}</p>
          <h2>{"Que voulez-vous faire maintenant ?"}</h2>
          <span>
            {"Un seul choix suffit pour démarrer : importer, créer un contrat ou compléter l'entreprise."}
          </span>
        </div>
        <div className="onboarding-first-run-actions">
          {quickStartActions.map((action) => (
            <a
              className="onboarding-first-run-action"
              data-state={action.state}
              href={action.href}
              key={action.title}
            >
              <span>{action.kicker}</span>
              <strong>{action.title}</strong>
              <p>{action.detail}</p>
              <small>{action.cta}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="onboarding-command mt-6 rounded-lg border p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Score de lancement
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <strong className="text-6xl font-black tracking-normal text-zinc-50">
                {completionRate}
                <span className="text-2xl text-zinc-500">/100</span>
              </strong>
              <span className="onboarding-launch-pill">{qualityLabel(completionRate)}</span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
              {nextStep
                ? `Prochaine action prioritaire : ${nextStep.title}. ${nextStep.impact}`
                : "Tous les fondamentaux sont en place pour une démonstration client propre."}
            </p>
          </div>

          <div className="onboarding-next-card">
            <span>Prochaine action</span>
            <strong>{nextStep?.title ?? "Pilotage"}</strong>
            <p>{nextStep?.description ?? "Surveiller relances, documents et paiements."}</p>
          </div>
        </div>
      </section>

      <section className="onboarding-architect mt-6 rounded-lg border shadow-sm" data-od-id="onboarding-ai-architect">
        <div className="onboarding-architect-header">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Architecte IA activation</p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">
              Décider quoi vendre selon la maturité réelle.
            </h3>
          </div>
          <span className="onboarding-architect-pill" data-status={decision.tone}>
            {decision.label}
          </span>
        </div>

        <div className="onboarding-decision-grid">
          <article className="onboarding-decision-card" data-status={decision.tone}>
            <span>Décision maintenant</span>
            <strong>{decision.action}</strong>
            <p>{decision.risk}</p>
          </article>
          <article className="onboarding-decision-card">
            <span>Signal observé</span>
            <strong>{decision.signal}</strong>
            <p>
              Le prochain clic doit faire avancer ce signal, sinon l'onboarding
              devient cosmétique.
            </p>
          </article>
        </div>

        <div className="onboarding-band-grid">
          {activationDecisions.map((item) => (
            <article className="onboarding-band-card" data-status={item.tone} key={item.label}>
              <div>
                <span>{item.range}</span>
                <strong>{item.label}</strong>
              </div>
              <p>{item.action}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OnboardingMetric
          detail={`${completed} jalons validés sur ${steps.length}`}
          label="Progression"
          tone="emerald"
          value={`${completionRate}%`}
        />
        <OnboardingMetric
          detail={`${customers.length} clients et ${contracts.length} contrats`}
          label="Portefeuille"
          tone="cyan"
          value={organization.name}
        />
        <OnboardingMetric
          detail="Potentiel annuel rattaché aux contrats actifs"
          label="ARR client"
          tone="amber"
          value={formatEuro(annualRevenue)}
        />
        <OnboardingMetric
          detail={billing.required ? "Billing lock actif" : "Billing lock désactivé"}
          label="Abonnement"
          tone={billing.active ? "emerald" : "rose"}
          value={billing.active ? "Actif" : "À vérifier"}
        />
      </div>

      <section className="mt-6">
        <div className="onboarding-summary flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">
              Plan d'activation client
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              Chaque jalon valide un morceau du cycle complet : données,
              contrats, documents, encaissement et sécurité.
            </p>
          </div>
          <span className="onboarding-score">
            {completed}/{steps.length} validés
          </span>
        </div>

        <div className="onboarding-progress mt-5">
          <div
            className="onboarding-progress-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        <div className="mt-5 grid gap-3">
          {steps.map((step, index) => (
            <article
              className="onboarding-step grid gap-4 p-4 lg:grid-cols-[1fr_260px] lg:items-center"
              data-accent={step.accent}
              data-state={step.done ? "done" : "todo"}
              key={step.title}
            >
              <div className="flex items-start gap-4">
                <div
                  className="onboarding-step-index"
                  data-state={step.done ? "done" : "todo"}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="font-semibold text-zinc-950">{step.title}</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-500">
                    {step.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {step.impact}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:justify-end">
                <StepStatus done={step.done} />
                <a
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    step.done
                      ? "premium-secondary-action"
                      : "premium-inline-action"
                  }`}
                  href={step.href}
                >
                  Ouvrir
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
