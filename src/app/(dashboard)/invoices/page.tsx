import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
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
        detail: `${overdueInvoices.length} retard(s), ${formatEuro(overdueAmount)} a recuperer.`,
        label: "Retard a traiter",
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
          action: "Creer la prochaine facture",
          detail: "Aucune facture ouverte. Continuez a transformer les contrats actifs en documents facturables.",
          label: "Facturation stable",
          tone: "emerald" as const,
        };

  return (
    <AppShell activePath="/invoices">
      <PageHeader
        action={
          <a
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/invoices/new"
          >
            Creer facture
          </a>
        }
        description="Suivez les factures issues des contrats de maintenance, les montants ouverts et les paiements confirmes."
        eyebrow="Facturation"
        title="Factures contrats CVC"
      />

      <section className="invoice-command-panel mt-6" data-od-id="invoice-billing-command">
        <div className="invoice-command-brief">
          <p>Commande facturation</p>
          <h2>{invoiceCommand.label}</h2>
          <span>{invoiceCommand.detail}</span>
        </div>
        <div className="invoice-command-decision" data-tone={invoiceCommand.tone}>
          <small>Action prioritaire</small>
          <strong>{invoiceCommand.action}</strong>
          {priorityInvoice ? (
            <span>
              {priorityInvoice.number} - {priorityInvoice.customer} - {formatEuro(priorityInvoice.amountTtc)}
            </span>
          ) : (
            <span>Creer une premiere facture pour alimenter le registre.</span>
          )}
          <a className="premium-action rounded-md text-sm font-semibold" href={priorityInvoice ? `/invoices/${priorityInvoice.id}` : "/invoices/new"}>
            Ouvrir le dossier
          </a>
        </div>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ["Factures", invoices.length, "Documents emis", "cyan"],
          ["A encaisser", formatEuro(openAmount), "Solde ouvert", "amber"],
          ["Encaisse", formatEuro(paidAmount), `${paidRate}% regle`, "emerald"],
          ["Retards", formatEuro(overdueAmount), `${overdueInvoices.length} facture(s)`, "rose"],
        ].map(([label, value, helper, tone]) => (
          <article
            className="invoice-stat-card"
            data-tone={tone}
            key={label}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {label}
            </p>
            <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
              {value}
            </strong>
            <p className="mt-2 text-sm text-zinc-400">{helper}</p>
          </article>
        ))}
      </div>

      <section className="invoice-section mt-5 rounded-lg border">
        <div className="invoice-section-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Registre de facturation
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Factures maintenance, echeances et decisions d'encaissement
            </h3>
          </div>
          <span className="invoice-open-pill">{formatEuro(openAmount)} ouvert</span>
        </div>

        {invoices.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head">
                <th className="px-4 py-3 font-semibold">Facture</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Emission</th>
                <th className="px-4 py-3 font-semibold">Echeance</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {invoices.map((invoice) => (
                <tr className="invoice-table-row" key={invoice.id}>
                  <td className="px-4 py-4">
                    <a
                      className="font-semibold text-zinc-50 hover:text-emerald-300"
                      href={`/invoices/${invoice.id}`}
                    >
                      {invoice.number}
                    </a>
                    <p className="mt-1 text-xs text-zinc-500">
                      {invoice.equipment}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {invoice.contractId ? (
                      <a
                        className="font-semibold text-zinc-100 hover:text-emerald-300"
                        href={`/contracts/${invoice.contractId}`}
                      >
                        {invoice.customer}
                      </a>
                    ) : (
                      <span className="font-semibold text-zinc-100">
                        {invoice.customer}
                      </span>
                    )}
                    <p className="mt-1 text-xs text-zinc-500">{invoice.city}</p>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{invoice.issueDate}</td>
                  <td className="px-4 py-4 font-medium text-zinc-300">
                    {invoice.dueDate}
                  </td>
                  <td className="px-4 py-4 text-base font-semibold text-zinc-50">
                    {formatEuro(invoice.amountTtc)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill>{invoice.status}</StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    <InvoiceStatusControls
                      currentStatus={invoice.rawStatus}
                      invoiceId={invoice.id}
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
              actionHref="/invoices/new"
              actionLabel="Creer une facture"
              eyebrow="Facturation pilote"
              proofPoints={[
                "Numerotation propre",
                "TVA et echeance visibles",
                "PDF pret a envoyer",
              ]}
              secondaryHref="/contracts"
              secondaryLabel="Voir contrats"
              title="Creez une premiere facture pour verifier le flux document et encaissement."
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
