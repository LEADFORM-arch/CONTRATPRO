import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { billingPlans, getBillingPlan, type BillingPlanId } from "@/lib/billing-plans";
import { getCurrentBillingStatus, getRecentBillingEvents } from "@/server/billing";
import { isStripeConfigured, isStripeWebhookConfigured } from "@/server/stripe";

import { BillingActions } from "./BillingActions";

const labels: Record<string, string> = {
  active: "Actif",
  canceled: "Resilie",
  incomplete: "Incomplet",
  incomplete_expired: "Expire",
  missing: "Non configure",
  past_due: "Impayé",
  paused: "En pause",
  trialing: "Essai",
  unpaid: "Impayé",
};

const planArchitectCopy: Record<
  string,
  { decision: string; fit: string; signal: string }
> = {
  business: {
    decision: "Vendre si le dirigeant veut un go-live accompagne et surveille.",
    fit: "Equipe CVC avec portefeuille recurrent deja rentable.",
    signal: "Il demande une date de bascule, pas seulement un essai.",
  },
  pro: {
    decision: "Plan recommande pour prouver le ROI SEPA.",
    fit: "Chauffagiste qui a deja des contrats mais relance encore a la main.",
    signal: "Il parle d'impayes, de retard d'encaissement ou de charge admin.",
  },
  starter: {
    decision: "Utiliser comme entree simple depuis Excel.",
    fit: "TPE qui veut importer, voir les relances et tester sans changer son terrain.",
    signal: "Il accepte 49 EUR/mois pour eviter la ressaisie et les oublis.",
  },
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusTone(status: string, active: boolean) {
  if (active) {
    return "ready";
  }
  if (status === "missing" || status === "incomplete") {
    return "warning";
  }
  return "critical";
}

function planFromSearch(value: string | string[] | undefined): BillingPlanId | undefined {
  const plan = Array.isArray(value) ? value[0] : value;
  if (plan === "starter" || plan === "pro" || plan === "business") {
    return plan;
  }
  return undefined;
}

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedPlan = planFromSearch(resolvedSearchParams.plan);
  const requestedPlanLabel = requestedPlan ? getBillingPlan(requestedPlan).name : null;
  const [billing, billingEvents] = await Promise.all([
    getCurrentBillingStatus(),
    getRecentBillingEvents().catch(() => []),
  ]);
  const tone = statusTone(billing.status, billing.active);
  const stripeReady = isStripeConfigured();
  const webhookReady = isStripeWebhookConfigured();

  return (
    <AppShell activePath="/settings/billing">
      <PageHeader
        action={
          <BillingActions
            hasCustomer={Boolean(billing.customerId)}
            requestedPlan={requestedPlan}
          />
        }
        description="Activation de l'abonnement ContratPro Starter, Pro ou Business, suivi via Stripe et synchronise avec Supabase."
        eyebrow="Parametres"
        title="Abonnement SaaS"
      />

      <section className="billing-hero mt-6 rounded-lg border p-5 shadow-sm" data-status={tone}>
        <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-300">ContratPro SaaS</p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <strong className="text-5xl font-black text-zinc-50">49 / 99 / 199 EUR</strong>
              <span className="text-xl font-bold text-zinc-500">/ mois</span>
              <span className="billing-status-pill" data-status={tone}>
                {labels[billing.status] ?? billing.status}
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
              Le verrouillage produit s'active avec `CONTRATPRO_REQUIRE_BILLING=true`.
              Les statuts `active` et `trialing` donnent acces au SaaS ; les statuts
              impayes renvoient vers cette page.
            </p>
            {requestedPlan ? (
              <p className="billing-requested-plan mt-4">
                Plan demande depuis la page tarifs : ContratPro {requestedPlanLabel}.
              </p>
            ) : null}
          </div>

          <div className="billing-snapshot">
            <div>
              <span>Fin periode</span>
              <strong>{formatDate(billing.currentPeriodEnd)}</strong>
            </div>
            <div>
              <span>Annulation</span>
              <strong>{billing.cancelAtPeriodEnd ? "Planifiee" : "Non"}</strong>
            </div>
            <div>
              <span>Billing lock</span>
              <strong>{billing.required ? "Actif" : "Desactive"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="billing-architect mt-6 rounded-lg border shadow-sm" data-od-id="billing-ai-architect">
        <div className="billing-panel-header">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Architecte IA billing</p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">
              Vendre le bon palier, pas le plus cher.
            </h3>
          </div>
          <span className="billing-architect-badge">49 / 99 / 199 EUR</span>
        </div>
        <div className="billing-architect-grid">
          {billingPlans.map((plan) => {
            const copy = planArchitectCopy[plan.id];
            return (
              <article className="billing-plan-card" data-plan={plan.id} key={plan.id}>
                <div className="billing-plan-top">
                  <div>
                    <p>{plan.name}</p>
                    <strong>{plan.priceLabel}</strong>
                  </div>
                  <span>{plan.lookupKey}</span>
                </div>
                <p className="billing-plan-description">{plan.description}</p>
                <dl className="billing-plan-signal">
                  <div>
                    <dt>Fit pilote</dt>
                    <dd>{copy.fit}</dd>
                  </div>
                  <div>
                    <dt>Signal d'achat</dt>
                    <dd>{copy.signal}</dd>
                  </div>
                  <div>
                    <dt>Decision</dt>
                    <dd>{copy.decision}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <section className="billing-panel rounded-lg border shadow-sm">
          <div className="billing-panel-header">
            <div>
              <p className="text-sm font-semibold text-cyan-300">Stripe</p>
              <h3 className="mt-1 text-lg font-bold text-zinc-50">Configuration production</h3>
            </div>
          </div>
          <div className="divide-y divide-zinc-800">
            <CheckRow
              detail="Necessaire pour creer Checkout et le portail client."
              label="STRIPE_SECRET_KEY"
              ready={stripeReady}
            />
            <CheckRow
              detail="Necessaire pour synchroniser les abonnements apres paiement."
              label="STRIPE_WEBHOOK_SECRET"
              ready={webhookReady}
            />
            <CheckRow
              detail="Starter, Pro et Business peuvent avoir chacun leur price_id. STRIPE_PRICE_ID reste accepte pour Pro."
              label="STRIPE_PRICE_ID_STARTER / PRO / BUSINESS"
              ready={billingPlans.some((plan) => Boolean(process.env[plan.envKey])) || Boolean(process.env.STRIPE_PRICE_ID)}
              warningOnly
            />
          </div>
        </section>

        <aside className="billing-panel rounded-lg border shadow-sm">
          <div className="billing-panel-header">
            <div>
              <p className="text-sm font-semibold text-amber-300">Identifiants Stripe</p>
              <h3 className="mt-1 text-lg font-bold text-zinc-50">Synchronisation</h3>
            </div>
          </div>
          <dl className="grid gap-3 p-4 text-sm">
            <div className="billing-id-row">
              <dt>Customer</dt>
              <dd>{billing.customerId ?? "-"}</dd>
            </div>
            <div className="billing-id-row">
              <dt>Subscription</dt>
              <dd>{billing.subscriptionId ?? "-"}</dd>
            </div>
            <div className="billing-id-row">
              <dt>Trial end</dt>
              <dd>{formatDate(billing.trialEnd)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <section className="billing-panel mt-6 rounded-lg border shadow-sm">
        <div className="billing-panel-header">
          <div>
            <p className="text-sm font-semibold text-violet-300">Evenements</p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">Journal Stripe recent</h3>
          </div>
        </div>

        {billingEvents.length ? (
          <div className="billing-event-list">
            {billingEvents.map((event) => (
              <article className="billing-event-row" key={event.id}>
                <div>
                  <strong>{event.event_type}</strong>
                  <p>
                    {event.provider_event_id ?? "Evenement local"} · {formatDateTime(event.created_at)}
                  </p>
                </div>
                <span data-empty={!event.status}>{event.status ?? "sans statut"}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="billing-empty-state">
            <strong>Aucun evenement Stripe pour cette organisation.</strong>
            <p>
              Le journal se remplira apres le premier Checkout, une mise a jour
              d'abonnement ou une facture impayee recue par webhook.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function CheckRow({
  detail,
  label,
  ready,
  warningOnly = false,
}: {
  detail: string;
  label: string;
  ready: boolean;
  warningOnly?: boolean;
}) {
  const status = ready ? "ready" : warningOnly ? "warning" : "critical";
  return (
    <div className="billing-check-row" data-status={status}>
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
      <span>{ready ? "Pret" : warningOnly ? "Optionnel" : "A configurer"}</span>
    </div>
  );
}
