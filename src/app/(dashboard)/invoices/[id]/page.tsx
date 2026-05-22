import { notFound } from "next/navigation";

import { DocumentSendButton } from "@/components/documents/DocumentSendButton";
import { DocumentSendHistory } from "@/components/documents/DocumentSendHistory";
import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import {
  getInvoiceDetail,
  getOrganizationProfile,
} from "@/server/contratpro-data";
import { getDocumentSends } from "@/server/document-sends";

import { InvoiceStatusControls } from "../InvoiceStatusControls";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: InvoicePageProps) {
  const { id } = await params;
  const [invoice, organization, sends] = await Promise.all([
    getInvoiceDetail(id),
    getOrganizationProfile(),
    getDocumentSends("INVOICE", id),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <AppShell activePath="/invoices">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href={`/api/invoices/${invoice.id}/pdf`}
            >
              PDF
            </a>
            <DocumentSendButton
              endpoint={`/api/invoices/${invoice.id}/send`}
              label="Envoyer client"
            />
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/invoices"
            >
              Retour factures
            </a>
          </div>
        }
        description="Vue facture imprimable avec client, contrat, TVA et statut d'encaissement."
        eyebrow="Facture"
        title={invoice.number}
      />

      <section className="document-next-action mt-6 print:hidden" data-tone="invoice">
        <div>
          <p>Document à sortir</p>
          <h3>Vérifier le montant, générer le PDF, envoyer au client.</h3>
          <span>
            La facture reprend le contrat, le client, la TVA et le total TTC. Le
            chauffagiste n'a plus qu'à contrôler puis envoyer.
          </span>
        </div>
        <div className="document-next-action-grid">
          <a
            className="document-next-action-card"
            data-tone="lime"
            href={`/api/invoices/${invoice.id}/pdf`}
          >
            <span>01</span>
            <strong>Ouvrir PDF</strong>
            <small>Contrôler la facture avant envoi.</small>
          </a>
          <div className="document-next-action-card" data-tone="emerald">
            <span>02</span>
            <strong>Envoyer client</strong>
            <small>Email journalisé dans l'historique.</small>
            <DocumentSendButton
              endpoint={`/api/invoices/${invoice.id}/send`}
              label="Envoyer"
            />
          </div>
          <a
            className="document-next-action-card"
            data-tone="cyan"
            href={`/contracts/${invoice.contractId}`}
          >
            <span>03</span>
            <strong>Retour contrat</strong>
            <small>Reprendre SEPA, visite ou attestation.</small>
          </a>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <article className="invoice-document rounded-lg border p-6 shadow-sm print:border-zinc-300 print:bg-white print:text-zinc-950 print:shadow-none">
          <div className="invoice-document-header flex flex-col gap-4 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300 print:text-emerald-800">
                {organization.name}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-zinc-50 print:text-zinc-950">
                {invoice.number}
              </h3>
              <p className="mt-2 text-sm text-zinc-400 print:text-zinc-600">
                Émise le {invoice.issueDate} - échéance {invoice.dueDate}
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-500 print:text-zinc-600">
                {organization.fullAddress}
                {organization.siret ? ` - SIRET ${organization.siret}` : ""}
                {organization.vatNumber ? ` - TVA ${organization.vatNumber}` : ""}
              </p>
            </div>
            <StatusPill>{invoice.status}</StatusPill>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section className="invoice-info-panel">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 print:text-zinc-600">
                Émetteur
              </h4>
              <p className="mt-3 font-semibold text-zinc-50 print:text-zinc-950">
                {organization.name}
              </p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">
                {organization.fullAddress}
              </p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">{organization.email}</p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">{organization.phone}</p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">
                {organization.rgeNumber ? `RGE ${organization.rgeNumber}` : ""}
              </p>
            </section>
            <section className="invoice-info-panel">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 print:text-zinc-600">
                Client facturé
              </h4>
              <p className="mt-3 font-semibold text-zinc-50 print:text-zinc-950">
                {invoice.customer}
              </p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">{invoice.contact}</p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">{invoice.address}</p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">{invoice.email}</p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">{invoice.phone}</p>
            </section>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section className="invoice-info-panel">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 print:text-zinc-600">
                Contrat et équipement
              </h4>
              <p className="mt-3 font-semibold text-zinc-50 print:text-zinc-950">
                {invoice.equipment}
              </p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">{invoice.equipmentType}</p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">
                Série : {invoice.serialNumber}
              </p>
              <p className="mt-1 text-sm text-zinc-400 print:text-zinc-600">
                Période : {invoice.contractPeriod}
              </p>
            </section>
          </div>

          <table className="invoice-lines mt-8 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500 print:border-zinc-200 print:text-zinc-600">
                <th className="py-3 font-semibold">Désignation</th>
                <th className="py-3 text-right font-semibold">HT</th>
                <th className="py-3 text-right font-semibold">TVA</th>
                <th className="py-3 text-right font-semibold">TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 print:border-zinc-100">
                <td className="py-4 text-zinc-100 print:text-zinc-950">
                  Contrat annuel de maintenance CVC
                  <p className="mt-1 text-xs text-zinc-500 print:text-zinc-600">{invoice.equipment}</p>
                </td>
                <td className="py-4 text-right text-zinc-200 print:text-zinc-950">{formatEuro(invoice.amountHt)}</td>
                <td className="py-4 text-right text-zinc-200 print:text-zinc-950">
                  {invoice.vatRate}% - {formatEuro(invoice.vatAmount)}
                </td>
                <td className="py-4 text-right font-semibold text-zinc-50 print:text-zinc-950">
                  {formatEuro(invoice.amountTtc)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="invoice-legal-note mt-6 text-xs leading-5">
            Facture payable à échéance. En cas de retard de paiement, pénalités
            de retard exigibles selon le taux légal applicable aux
            professionnels et indemnité forfaitaire de recouvrement de 40 EUR
            lorsque la réglementation l'autorise.
          </p>
        </article>

        <div className="grid gap-4">
          <aside className="invoice-side-panel rounded-lg border p-4 shadow-sm print:hidden">
            <h3 className="text-base font-semibold text-zinc-50">Encaissement</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">Statut</dt>
                <dd className="font-semibold text-zinc-50">{invoice.status}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Payée le</dt>
                <dd className="font-semibold text-zinc-50">{invoice.paidAt}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Total TTC</dt>
                <dd className="text-2xl font-semibold text-zinc-50">
                  {formatEuro(invoice.amountTtc)}
                </dd>
              </div>
            </dl>
            <div className="mt-5">
              <InvoiceStatusControls
                currentStatus={invoice.rawStatus}
                invoiceId={invoice.id}
              />
            </div>
          </aside>
          <DocumentSendHistory sends={sends} />
        </div>
      </section>
    </AppShell>
  );
}
