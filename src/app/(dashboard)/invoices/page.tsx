import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { AgentPanel, StatCard } from "@/components/ui";
import { formatEuro } from "@/lib/mock-data";
import { getInvoices } from "@/server/contratpro-data";

import { InvoiceStatusControls } from "./InvoiceStatusControls";

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  const openInvoices = invoices.filter((invoice) =>
    ["DRAFT", "SENT", "OVERDUE"].includes(invoice.rawStatus),
  );
  const paidInvoices = invoices.filter((invoice) => invoice.rawStatus === "PAID");
  const overdueInvoices = invoices.filter((invoice) => invoice.rawStatus === "OVERDUE");
  const openAmount = openInvoices.reduce(
    (sum, invoice) => sum + invoice.amountTtc,
    0,
  );
  const overdueAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + invoice.amountTtc,
    0,
  );
  const paidAmount = paidInvoices.reduce(
    (sum, invoice) => sum + invoice.amountTtc,
    0,
  );
  const paidRate =
    invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 0;
  const priorityInvoice = overdueInvoices[0] ?? openInvoices[0] ?? invoices[0];
  const invoiceCommand = overdueInvoices.length
    ? {
        action: "Relancer la facture",
        detail: `${overdueInvoices.length} retard(s), ${formatEuro(overdueAmount)} à récupérer.`,
        label: "Retard à traiter",
        tone: "rose" as const,
      }
    : openInvoices.length
      ? {
          action: "Envoyer ou suivre",
          detail: `${openInvoices.length} facture(s), ${formatEuro(openAmount)} encore ouvert.`,
          label: "Solde ouvert",
          tone: "amber" as const,
        }
      : {
          action: "Créer la prochaine facture",
          detail: "Aucune facture ouverte. Continuez à transformer les contrats actifs en documents facturables.",
          label: "Facturation stable",
          tone: "emerald" as const,
        };

  return (
    <AppShell activePath="/invoices">
      <PageHeader
        action={<a className="cp-btn cp-btn-primary cp-btn-sm" href="/invoices/new">Créer facture</a>}
        description="Suivez les factures issues des contrats de maintenance, les montants ouverts et les paiements confirmés."
        eyebrow="Facturation"
        title="Factures contrats CVC"
      />

      <AgentPanel
        eyebrow="Commande facturation"
        thesis={invoiceCommand.label}
        proof={
          <>
            {invoiceCommand.detail}
            {priorityInvoice ? (
              <span className="mt-3 block" style={{ color: "var(--text-primary)" }}>
                <strong>{priorityInvoice.number}</strong> — {priorityInvoice.customer} — {formatEuro(priorityInvoice.amountTtc)}
              </span>
            ) : (
              <span className="mt-3 block">Créer une première facture pour alimenter le registre.</span>
            )}
          </>
        }
        action={
          <div className="flex flex-col items-end gap-2">
            <span className="cp-pill cp-pill-dot" data-tone={invoiceCommand.tone}>{invoiceCommand.action}</span>
            <a className="cp-btn cp-btn-primary cp-btn-sm" href={priorityInvoice ? `/invoices/${priorityInvoice.id}` : "/invoices/new"}>
              Ouvrir le dossier
            </a>
          </div>
        }
      />

      <section className="cp-work-lanes">
        <a className="cp-work-tile" data-tone="emerald" href="/invoices/new">
          <span className="cp-work-tile-step">1</span>
          <div><strong>Créer facture</strong><p>Choisir un contrat, vérifier le montant, générer le PDF.</p></div>
          <em>+</em>
        </a>
        <a className="cp-work-tile" data-tone={overdueInvoices.length ? "rose" : openInvoices.length ? "amber" : "emerald"} href={priorityInvoice ? `/invoices/${priorityInvoice.id}` : "/invoices/new"}>
          <span className="cp-work-tile-step">2</span>
          <div><strong>Traiter les ouvertes</strong><p>Envoyer, suivre ou relancer les factures ouvertes.</p></div>
          <em>{openInvoices.length}</em>
        </a>
        <a className="cp-work-tile" data-tone="cyan" href="/invoices">
          <span className="cp-work-tile-step">3</span>
          <div><strong>Registre factures</strong><p>Retrouver toutes les factures et décisions d'encaissement.</p></div>
          <em>{invoices.length}</em>
        </a>
      </section>

      <div className="cp-stat-grid">
        <StatCard label="Factures" value={String(invoices.length)} detail="Documents émis" tone="cyan" />
        <StatCard label="À encaisser" value={formatEuro(openAmount)} detail="Solde ouvert" tone="amber" />
        <StatCard label="Encaissé" value={formatEuro(paidAmount)} detail={`${paidRate}% réglé`} tone="emerald" />
        <StatCard label="Retards" value={formatEuro(overdueAmount)} detail={`${overdueInvoices.length} facture(s)`} tone="rose" />
      </div>

      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">Registre de facturation</h3>
            <p className="cp-section-desc">Factures maintenance, échéances et décisions d'encaissement.</p>
          </div>
          <span className="cp-pill" data-tone="amber">{formatEuro(openAmount)} ouvert</span>
        </header>

        {invoices.length ? (
          <div className="overflow-x-auto">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Facture</th>
                  <th>Client</th>
                  <th>Émission</th>
                  <th>Échéance</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Décision</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <a className="cp-deal-link" href={`/invoices/${invoice.id}`}>{invoice.number}</a>
                      <p className="cp-cell-sub">{invoice.equipment}</p>
                    </td>
                    <td>
                      {invoice.contractId ? (
                        <a className="cp-deal-link" href={`/contracts/${invoice.contractId}`}>{invoice.customer}</a>
                      ) : (
                        <span className="cp-cell-strong">{invoice.customer}</span>
                      )}
                      <p className="cp-cell-sub">{invoice.city}</p>
                    </td>
                    <td>{invoice.issueDate}</td>
                    <td className="cp-cell-strong">{invoice.dueDate}</td>
                    <td className="cp-cell-amount">{formatEuro(invoice.amountTtc)}</td>
                    <td><StatusPill>{invoice.status}</StatusPill></td>
                    <td><InvoiceStatusControls currentStatus={invoice.rawStatus} invoiceId={invoice.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cp-section-body">
            <ActivationEmptyState
              actionHref="/invoices/new"
              actionLabel="Créer une facture"
              eyebrow="Facturation pilote"
              proofPoints={["Numérotation propre", "TVA et échéance visibles", "PDF prêt à envoyer"]}
              secondaryHref="/contracts"
              secondaryLabel="Voir contrats"
              title="Créez une première facture pour vérifier le flux document et encaissement."
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
