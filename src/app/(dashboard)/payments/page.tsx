import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { PaymentEventTimeline } from "@/components/payments/PaymentEventTimeline";
import { formatEuro } from "@/lib/mock-data";
import { getPayments } from "@/server/contratpro-data";
import { getRecentPaymentEvents } from "@/server/payment-events";

import { PaymentSubmitButton } from "./PaymentSubmitButton";
import { PaymentStatusControls } from "./PaymentStatusControls";

export default async function PaymentsPage() {
  const [payments, events] = await Promise.all([
    getPayments(),
    getRecentPaymentEvents(),
  ]);
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
  const collectionRate =
    payments.length > 0 ? Math.round((confirmed.length / payments.length) * 100) : 0;

  return (
    <AppShell activePath="/payments">
      <PageHeader
        action={
          <a
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/payments/new"
          >
            Creer paiement
          </a>
        }
        description="Pilotez les mandats, les prelevements programmes et les relances en cas de paiement manuel ou rejet."
        eyebrow="Tresorerie recurrente"
        title="Paiements et mandats SEPA"
      />

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <article className="payment-stat-card" data-tone="cyan">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Paiements suivis
          </p>
          <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
            {payments.length}
          </strong>
          <p className="mt-2 text-sm text-zinc-400">Echeances en portefeuille</p>
        </article>
        <article className="payment-stat-card" data-tone="amber">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            A encaisser
          </p>
          <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
            {formatEuro(amountToCollect)}
          </strong>
          <p className="mt-2 text-sm text-zinc-400">Prelevements en cours</p>
        </article>
        <article className="payment-stat-card" data-tone="emerald">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Confirme
          </p>
          <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
            {formatEuro(amountConfirmed)}
          </strong>
          <p className="mt-2 text-sm text-zinc-400">
            Taux {collectionRate}% sur la periode
          </p>
        </article>
        <article className="payment-stat-card" data-tone="rose">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Rejets
          </p>
          <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
            {failed.length}
          </strong>
          <p className="mt-2 text-sm text-zinc-400">Relances a securiser</p>
        </article>
      </div>

      <section className="payment-section mt-5 rounded-lg border">
        <div className="payment-section-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Encaissement recurrent
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Mandats actifs, prelevements programmes et incidents
            </h3>
          </div>
          <span className="payment-risk-pill">
            {failed.length} rejet{failed.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1160px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Libelle</th>
                <th className="px-4 py-3 font-semibold">Methode</th>
                <th className="px-4 py-3 font-semibold">Echeance</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Provider</th>
                <th className="px-4 py-3 font-semibold">Decision</th>
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
      </section>

      <div className="mt-6">
        <PaymentEventTimeline events={events} />
      </div>
    </AppShell>
  );
}
