import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { formatEuro } from "@/lib/mock-data";
import { getPayments } from "@/server/contratpro-data";

import { PaymentSubmitButton } from "./PaymentSubmitButton";
import { PaymentStatusControls } from "./PaymentStatusControls";

type PaymentTone = "amber" | "cyan" | "emerald" | "rose";

function PaymentWorkTile({
  count,
  detail,
  href,
  label,
  step,
  tone,
}: {
  count: string;
  detail: string;
  href: string;
  label: string;
  step: string;
  tone: PaymentTone;
}) {
  return (
    <a className="artisan-terrain-tile" data-tone={tone} href={href}>
      <span>{step}</span>
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
      <em>{count}</em>
    </a>
  );
}

export default async function PaymentsPage() {
  const payments = await getPayments();
  const pending = payments.filter((payment) =>
    ["PENDING_SUBMISSION", "SUBMITTED"].includes(payment.rawStatus),
  );
  const failed = payments.filter((payment) => payment.rawStatus === "FAILED");
  const confirmed = payments.filter((payment) =>
    ["CONFIRMED", "PAID_OUT"].includes(payment.rawStatus),
  );
  const amountToCollect = pending.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const amountConfirmed = confirmed.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const amountFailed = failed.reduce((sum, payment) => sum + payment.amount, 0);
  const collectionRate =
    payments.length > 0 ? Math.round((confirmed.length / payments.length) * 100) : 0;
  const nextPayment = failed[0] ?? pending[0] ?? payments[0];
  const cashCommand = failed.length
    ? {
        action: "Corriger le rejet",
        detail: `${failed.length} rejet(s), ${formatEuro(amountFailed)} à récupérer avant perte client.`,
        label: "Incident cash-flow",
        tone: "rose" as const,
      }
    : pending.length
      ? {
          action: "Soumettre les prélèvements",
          detail: `${pending.length} paiement(s), ${formatEuro(amountToCollect)} en cours d'encaissement.`,
          label: "Cash à encaisser",
          tone: "amber" as const,
        }
      : {
          action: "Contrôler les mandats",
          detail: "Aucun incident actif. Gardez les mandats alignés avec les contrats à renouveler.",
          label: "Encaissement stable",
          tone: "emerald" as const,
        };
  const priorityPayments = (failed.length ? failed : pending.length ? pending : payments).slice(0, 3);

  return (
    <AppShell activePath="/payments">
      <PageHeader
        action={
          <a
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/payments/new"
          >
            Créer paiement
          </a>
        }
        description="Une seule question : quel prélèvement faut-il encaisser ou corriger maintenant ?"
        eyebrow="Trésorerie récurrente"
        title="Paiements et mandats SEPA"
      />

      <section className="payment-command-panel mt-6" data-od-id="payment-cash-command">
        <div className="payment-command-brief">
          <p>Commande cash-flow</p>
          <h2>{cashCommand.label}</h2>
          <span>{cashCommand.detail}</span>
        </div>
        <div className="payment-command-decision" data-tone={cashCommand.tone}>
          <small>Action prioritaire</small>
          <strong>{cashCommand.action}</strong>
          {nextPayment ? (
            <span>
              {nextPayment.customer} - {formatEuro(nextPayment.amount)} - {nextPayment.status}
            </span>
          ) : (
            <span>Créer un premier paiement pour alimenter le cockpit.</span>
          )}
          <a className="premium-action rounded-md text-sm font-semibold" href={nextPayment?.contractId ? `/contracts/${nextPayment.contractId}` : "/payments/new"}>
            Ouvrir le dossier
          </a>
        </div>
      </section>

      {priorityPayments.length ? (
        <section className="artisan-action-queue mt-5" aria-label="Paiements prioritaires">
          {priorityPayments.map((payment, index) => (
            <a
              className="artisan-action-card"
              data-tone={
                payment.rawStatus === "FAILED"
                  ? "rose"
                  : ["PENDING_SUBMISSION", "SUBMITTED"].includes(payment.rawStatus)
                    ? "amber"
                    : "emerald"
              }
              href={payment.contractId ? `/contracts/${payment.contractId}` : "/payments/new"}
              key={payment.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{payment.customer}</strong>
                <p>{payment.status} · {payment.dueDate}</p>
              </div>
              <em>{formatEuro(payment.amount)}</em>
            </a>
          ))}
        </section>
      ) : null}

      <section className="artisan-terrain-lanes mt-5" aria-label="Raccourcis paiement">
        <PaymentWorkTile
          count={String(failed.length)}
          detail="Rejets ou echecs a corriger avant relance client."
          href="/payments"
          label="Corriger un rejet"
          step="1"
          tone={failed.length ? "rose" : "emerald"}
        />
        <PaymentWorkTile
          count={formatEuro(amountToCollect)}
          detail="Prelevements programmes ou a envoyer au provider."
          href="/payments/new"
          label="Encaisser maintenant"
          step="2"
          tone={pending.length ? "amber" : "emerald"}
        />
        <PaymentWorkTile
          count="+"
          detail="Creer un paiement depuis un mandat actif et un contrat."
          href="/payments/new"
          label="Nouveau paiement"
          step="3"
          tone="cyan"
        />
      </section>

      <details className="artisan-evidence-details mt-5">
        <summary className="worklist-summary">
          Voir les chiffres cash-flow
        </summary>
        <div className="grid gap-3 md:grid-cols-4">
        <article className="payment-stat-card" data-tone="cyan">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Paiements suivis
          </p>
          <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
            {payments.length}
          </strong>
          <p className="mt-2 text-sm text-zinc-400">Échéances en portefeuille</p>
        </article>
        <article className="payment-stat-card" data-tone="amber">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            À encaisser
          </p>
          <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
            {formatEuro(amountToCollect)}
          </strong>
          <p className="mt-2 text-sm text-zinc-400">Prélèvements en cours</p>
        </article>
        <article className="payment-stat-card" data-tone="emerald">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Confirmé
          </p>
          <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
            {formatEuro(amountConfirmed)}
          </strong>
          <p className="mt-2 text-sm text-zinc-400">
            Taux {collectionRate}% sur la période
          </p>
        </article>
        <article className="payment-stat-card" data-tone="rose">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Rejets
          </p>
          <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
            {failed.length}
          </strong>
          <p className="mt-2 text-sm text-zinc-400">{formatEuro(amountFailed)} à récupérer</p>
        </article>
        </div>
      </details>

      <details className="payment-section mt-5 rounded-lg border">
        <summary className="worklist-summary">
          Voir tous les paiements ({payments.length})
        </summary>
        <div className="payment-section-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Encaissement récurrent
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Mandats actifs, prélèvements programmés et incidents
            </h3>
          </div>
          <span className="payment-risk-pill">
            {failed.length} rejet{failed.length > 1 ? "s" : ""}
          </span>
        </div>

        {payments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Libellé</th>
                <th className="px-4 py-3 font-semibold">Méthode</th>
                <th className="px-4 py-3 font-semibold">Échéance</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Provider</th>
                <th className="px-4 py-3 font-semibold">Décision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {payments.map((payment) => (
                <tr className="payment-table-row" key={payment.id}>
                  <td className="px-4 py-4">
                    {payment.contractId ? (
                      <a
                        className="font-semibold text-zinc-50 hover:text-emerald-300"
                        href={`/contracts/${payment.contractId}`}
                      >
                        {payment.customer}
                      </a>
                    ) : (
                      <span className="font-semibold text-zinc-50">
                        {payment.customer}
                      </span>
                    )}
                    <p className="mt-1 text-xs text-zinc-500">
                      Mandat {payment.mandateStatus}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    <span>{payment.description}</span>
                    {payment.failureReason ? (
                      <p className="payment-failure-note mt-2 text-xs">
                        {payment.failureReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <span className="payment-method-pill">{payment.method}</span>
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-300">
                    {payment.dueDate}
                  </td>
                  <td className="px-4 py-4 text-base font-semibold text-zinc-50">
                    {formatEuro(payment.amount)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill>{payment.status}</StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    {payment.providerPaymentId ? (
                      <span className="payment-provider-pill">
                        {payment.providerPaymentId}
                      </span>
                    ) : (
                      <PaymentSubmitButton
                        disabled={payment.rawStatus !== "PENDING_SUBMISSION"}
                        paymentId={payment.id}
                      />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <PaymentStatusControls
                      currentStatus={payment.rawStatus}
                      paymentId={payment.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <ActivationEmptyState
              actionHref="/payments/new"
              actionLabel="Créer un paiement"
              eyebrow="Cash-flow CVC"
              proofPoints={[
                "Suivre mandat et échéance",
                "Contrôler les rejets",
                "Relier paiement et contrat",
              ]}
              secondaryHref="/contracts"
              secondaryLabel="Voir contrats"
              title="Ajoutez un premier paiement pour sécuriser l'encaissement récurrent."
            />
          </div>
        )}
      </details>
    </AppShell>
  );
}
