import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { AgentPanel, StatCard } from "@/components/ui";
import { formatEuro } from "@/lib/mock-data";
import { getPayments } from "@/server/contratpro-data";

import { PaymentSubmitButton } from "./PaymentSubmitButton";
import { PaymentStatusControls } from "./PaymentStatusControls";

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
          <a className="cp-btn cp-btn-primary cp-btn-sm" href="/payments/new">Créer paiement</a>
        }
        description="Une seule question : quel prélèvement faut-il encaisser ou corriger maintenant ?"
        eyebrow="Trésorerie récurrente"
        title="Paiements et mandats SEPA"
      />

      <div className="cp-sandbox-note">
        <div>
          <p className="cp-eyebrow">Mode sandbox GoCardless</p>
          <strong>Testez le parcours sans vrai prélèvement bancaire.</strong>
        </div>
        <span className="cp-cell-sub">Le chauffagiste suit le client, le montant et le statut. Les identifiants provider restent dans les détails avancés.</span>
      </div>

      <div data-od-id="payment-cash-command">
        <AgentPanel
          eyebrow="Commande cash-flow"
          thesis={cashCommand.label}
          proof={
            <>
              {cashCommand.detail}
              {nextPayment ? (
                <span className="mt-3 block" style={{ color: "var(--text-primary)" }}>
                  <strong>{nextPayment.customer}</strong> — {formatEuro(nextPayment.amount)} — {nextPayment.status}
                </span>
              ) : (
                <span className="mt-3 block">Créer un premier paiement pour alimenter le cockpit.</span>
              )}
            </>
          }
          action={
            <div className="flex flex-col items-end gap-2">
              <span className="cp-kicker">Action prioritaire</span>
              <span className="cp-pill cp-pill-dot" data-tone={cashCommand.tone}>{cashCommand.action}</span>
              <a className="cp-btn cp-btn-primary cp-btn-sm" href={nextPayment?.contractId ? `/contracts/${nextPayment.contractId}` : "/payments/new"}>
                Ouvrir le dossier
              </a>
            </div>
          }
        />
      </div>

      {priorityPayments.length ? (
        <section className="cp-priority-queue">
          {priorityPayments.map((payment, index) => (
            <a
              className="cp-priority-card"
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
              <span className="cp-priority-num">{String(index + 1).padStart(2, "0")}</span>
              <div className="cp-priority-body">
                <strong>{payment.customer}</strong>
                <p>{payment.status} · {payment.dueDate}</p>
              </div>
              <em className="cp-priority-amount">{formatEuro(payment.amount)}</em>
            </a>
          ))}
        </section>
      ) : null}

      <section className="cp-work-lanes">
        <a className="cp-work-tile" data-tone={failed.length ? "rose" : "emerald"} href="/payments">
          <span className="cp-work-tile-step">1</span>
          <div><strong>Corriger un rejet</strong><p>Rejets ou échecs à corriger avant relance client.</p></div>
          <em>{failed.length}</em>
        </a>
        <a className="cp-work-tile" data-tone={pending.length ? "amber" : "emerald"} href="/payments/new">
          <span className="cp-work-tile-step">2</span>
          <div><strong>Encaisser maintenant</strong><p>Prélèvements programmés ou à envoyer au provider.</p></div>
          <em>{formatEuro(amountToCollect)}</em>
        </a>
        <a className="cp-work-tile" data-tone="cyan" href="/payments/new">
          <span className="cp-work-tile-step">3</span>
          <div><strong>Nouveau paiement</strong><p>Créer un paiement depuis un mandat actif et un contrat.</p></div>
          <em>+</em>
        </a>
      </section>

      <div className="cp-stat-grid">
        <StatCard label="Paiements suivis" value={String(payments.length)} detail="Échéances en portefeuille" tone="cyan" />
        <StatCard label="À encaisser" value={formatEuro(amountToCollect)} detail="Prélèvements en cours" tone="amber" />
        <StatCard label="Confirmé" value={formatEuro(amountConfirmed)} detail={`Taux ${collectionRate}% sur la période`} tone="emerald" />
        <StatCard label="Rejets" value={String(failed.length)} detail={`${formatEuro(amountFailed)} à récupérer`} tone="rose" />
      </div>

      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">Mandats actifs, prélèvements et incidents</h3>
            <p className="cp-section-desc">Encaissement récurrent suivi contrat par contrat.</p>
          </div>
          <span className="cp-pill" data-tone={failed.length ? "rose" : "emerald"}>
            {failed.length} rejet{failed.length > 1 ? "s" : ""}
          </span>
        </header>

        {payments.length ? (
          <div className="overflow-x-auto">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Libellé</th>
                  <th>Méthode</th>
                  <th>Échéance</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Suivi SEPA</th>
                  <th>Décision</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {payment.contractId ? (
                        <a className="cp-deal-link" href={`/contracts/${payment.contractId}`}>{payment.customer}</a>
                      ) : (
                        <span className="cp-cell-strong">{payment.customer}</span>
                      )}
                      <p className="cp-cell-sub">Mandat {payment.mandateStatus}</p>
                    </td>
                    <td>
                      <span>{payment.description}</span>
                      {payment.failureReason ? (
                        <p className="cp-payment-failure">{payment.failureReason}</p>
                      ) : null}
                    </td>
                    <td><span className="cp-pill">{payment.method}</span></td>
                    <td>{payment.dueDate}</td>
                    <td className="cp-cell-amount">{formatEuro(payment.amount)}</td>
                    <td><StatusPill>{payment.status}</StatusPill></td>
                    <td>
                      {payment.providerPaymentId ? (
                        <span className="cp-pill cp-pill-dot" data-tone="emerald">Confirmé sandbox</span>
                      ) : (
                        <PaymentSubmitButton disabled={payment.rawStatus !== "PENDING_SUBMISSION"} paymentId={payment.id} />
                      )}
                    </td>
                    <td><PaymentStatusControls currentStatus={payment.rawStatus} paymentId={payment.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cp-section-body">
            <ActivationEmptyState
              actionHref="/payments/new"
              actionLabel="Créer un paiement"
              eyebrow="Cash-flow CVC"
              proofPoints={["Suivre mandat et échéance", "Contrôler les rejets", "Relier paiement et contrat"]}
              secondaryHref="/contracts"
              secondaryLabel="Voir contrats"
              title="Ajoutez un premier paiement pour sécuriser l'encaissement récurrent."
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
