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
    label: "Demarrer accompagne",
    range: "0-59",
    risk: "Le client voit encore ContratPro comme une maquette.",
    signal: "Identite incomplete, base vide ou aucun document genere.",
    tone: "critical",
  },
  {
    action: "Passer en pilote payant avec une liste courte d'actions.",
    label: "Pilote facturable",
    range: "60-84",
    risk: "Le client peut payer, mais le go-live doit rester accompagne.",
    signal: "Clients et contrats presents, SEPA ou documents encore a finaliser.",
    tone: "warning",
  },
  {
    action: "Ouvrir le Pro ou Business et surveiller les signaux ops.",
    label: "Go-live limite",
    range: "85-100",
    risk: "Le risque principal devient operationnel : emails, webhooks, cron.",
    signal: "Cycle complet pret : donnees, documents, cash-flow et securite.",
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
      {done ? "Pret" : "A faire"}
    </span>
  );
}

function qualityLabel(score: number) {
  if (score >= 85) {
    return "Pret a vendre";
  }
  if (score >= 60) {
    return "Solide, a finaliser";
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
      title: "Identite entreprise",
      description: "Nom, SIRET, TVA, RGE, email et adresse pour documents propres.",
      href: "/settings/company",
      accent: "emerald",
      done: companyComplete,
      impact: "Credibilite devis, factures et attestations.",
    },
    {
      title: "Base clients",
      description: "Importer Praxedo ou creer les premiers clients manuellement.",
      href: "/import",
      accent: "cyan",
      done: customers.length > 0,
      impact: "Point de depart du revenu recurrent.",
    },
    {
      title: "Contrats actifs",
      description: "Rattacher equipements, echeances et prix annuels.",
      href: "/contracts/quick",
      accent: "amber",
      done: contracts.length > 0,
      impact: "Tableau de bord et relances deviennent exploitables.",
    },
    {
      title: "Documents legaux",
      description: "Generer au moins une facture et une attestation PDF.",
      href: invoices.length ? "/certificates" : "/invoices/new",
      accent: "rose",
      done: documentsReady,
      impact: "Preuve que le cycle client est livrable de bout en bout.",
    },
    {
      title: "Paiement recurrent",
      description: "Preparer SEPA et verifier la future facturation ContratPro.",
      href: sepaPayments.length ? "/payments" : "/settings/billing",
      accent: "violet",
      done: sepaPayments.length > 0 && billingReady,
      impact: "Cash et abonnement sous controle.",
    },
    {
      title: "Securite production",
      description: "Auth, RLS, billing lock et environnement hors demo.",
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

  return (
    <AppShell activePath="/onboarding">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href={nextStep?.href ?? "/"}>
            {nextStep ? "Continuer" : "Voir le pilotage"}
          </a>
        }
        description="Un parcours d'activation concu pour faire passer une entreprise CVC d'un compte brut a un outil pret a vendre, facturer et renouveler."
        eyebrow="Mise en route"
        title="Activation ContratPro"
      />

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
                : "Tous les fondamentaux sont en place pour une demonstration client propre."}
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
              Decider quoi vendre selon la maturite reelle.
            </h3>
          </div>
          <span className="onboarding-architect-pill" data-status={decision.tone}>
            {decision.label}
          </span>
        </div>

        <div className="onboarding-decision-grid">
          <article className="onboarding-decision-card" data-status={decision.tone}>
            <span>Decision maintenant</span>
            <strong>{decision.action}</strong>
            <p>{decision.risk}</p>
          </article>
          <article className="onboarding-decision-card">
            <span>Signal observe</span>
            <strong>{decision.signal}</strong>
            <p>
              Le prochain clic doit faire avancer ce signal, sinon l'onboarding
              devient cosmetique.
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
          detail={`${completed} jalons valides sur ${steps.length}`}
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
          detail="Potentiel annuel rattache aux contrats actifs"
          label="ARR client"
          tone="amber"
          value={formatEuro(annualRevenue)}
        />
        <OnboardingMetric
          detail={billing.required ? "Billing lock actif" : "Billing lock desactive"}
          label="Abonnement"
          tone={billing.active ? "emerald" : "rose"}
          value={billing.active ? "Actif" : "A verifier"}
        />
      </div>

      <section className="mt-6">
        <div className="onboarding-summary flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">
              Plan d'activation client
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              Chaque jalon valide un morceau du cycle complet : donnees,
              contrats, documents, encaissement et securite.
            </p>
          </div>
          <span className="onboarding-score">
            {completed}/{steps.length} valides
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
