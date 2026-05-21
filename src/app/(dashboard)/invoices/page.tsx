import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { formatEuro } from "@/lib/mock-data";
import { getInvoices } from "@/server/contratpro-data";

import { InvoiceStatusControls } from "./InvoiceStatusControls";

type InvoiceTone = "amber" | "cyan" | "emerald" | "rose";

function InvoiceWorkTile({
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
  tone: InvoiceTone;
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
        action={
          <a
            className="premium-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/invoices/new"
          >
            Créer facture
          </a>
        }
        description="Suivez les factures issues des contrats de maintenance, les montants ouverts et les paiements confirmés."
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
            <span>Créer une première facture pour alimenter le registre.</span>
          )}
          <a className="premium-action rounded-md text-sm font-semibold" href={priorityInvoice ? `/invoices/${priorityInvoice.id}` : "/invoices/new"}>
            Ouvrir le dossier
          </a>
        </div>
      </section>

      <section className="artisan-terrain-lanes mt-5" aria-label="Raccourcis facture">
        <InvoiceWorkTile
          count="+"
          detail="Choisir un contrat, verifier le montant, generer le PDF."
          href="/invoices/new"
          label="Creer facture"
          step="1"
          tone="emerald"
        />
        <InvoiceWorkTile
          count={String(openInvoices.length)}
          detail="Envoyer, suivre ou relancer les factures ouvertes."
          href={priorityInvoice ? `/invoices/${priorityInvoice.id}` : "/invoices/new"}
          label="Traiter les ouvertes"
          step="2"
          tone={overdueInvoices.length ? "rose" : openInvoices.length ? "amber" : "emerald"}
        />
        <InvoiceWorkTile
          count={String(invoices.length)}
          detail="Retrouver toutes les factures et decisions d'encaissement."
          href="/invoices"
          label="Registre factures"
          step="3"
          tone="cyan"
        />
      </section>

      <details className="artisan-evidence-details mt-5">
        <summary className="worklist-summary">
          Voir les chiffres facturation
        </summary>
        <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Factures", invoices.length, "Documents émis", "cyan"],
          ["À encaisser", formatEuro(openAmount), "Solde ouvert", "amber"],
          ["Encaissé", formatEuro(paidAmount), `${paidRate}% réglé`, "emerald"],
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
      </details>

      <details className="invoice-section mt-5 rounded-lg border">
        <summary className="worklist-summary">
          Voir toutes les factures ({invoices.length})
        </summary>
        <div className="invoice-section-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Registre de facturation
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Factures maintenance, échéances et décisions d'encaissement
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
                <th className="px-4 py-3 font-semibold">Émission</th>
                <th className="px-4 py-3 font-semibold">Échéance</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Décision</th>
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
              actionLabel="Créer une facture"
              eyebrow="Facturation pilote"
              proofPoints={[
                "Numérotation propre",
                "TVA et échéance visibles",
                "PDF prêt à envoyer",
              ]}
              secondaryHref="/contracts"
              secondaryLabel="Voir contrats"
              title="Créez une première facture pour vérifier le flux document et encaissement."
            />
          </div>
        )}
      </details>
    </AppShell>
  );
}
