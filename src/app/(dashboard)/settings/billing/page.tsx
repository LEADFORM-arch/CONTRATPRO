import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { getCurrentBillingStatus } from "@/server/billing";
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

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
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

export default async function BillingSettingsPage() {
  const billing = await getCurrentBillingStatus();
  const tone = statusTone(billing.status, billing.active);
  const stripeReady = isStripeConfigured();
  const webhookReady = isStripeWebhookConfigured();

  return (
    <AppShell activePath="/settings/billing">
      <PageHeader
        action={<BillingActions hasCustomer={Boolean(billing.customerId)} />}
        description="Activation de l'abonnement ContratPro Pro a 200 EUR par mois, suivi via Stripe et synchronise avec Supabase."
        eyebrow="Parametres"
        title="Abonnement SaaS"
      />

      <section className="billing-hero mt-6 rounded-lg border p-5 shadow-sm" data-status={tone}>
        <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-300">ContratPro Pro</p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <strong className="text-5xl font-black text-zinc-50">200 EUR</strong>
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
              detail="Optionnel : sinon ContratPro cree un prix dynamique a 200 EUR/mois."
              label="STRIPE_PRICE_ID"
              ready={Boolean(process.env.STRIPE_PRICE_ID)}
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
