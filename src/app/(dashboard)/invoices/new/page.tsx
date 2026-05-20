import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { getInvoiceContractOptions } from "@/server/contratpro-data";

import { InvoiceForm } from "./InvoiceForm";

function isoDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

type NewInvoicePageProps = {
  searchParams?: Promise<{ contractId?: string }>;
};

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const params = await searchParams;
  const contracts = await getInvoiceContractOptions();
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  return (
    <AppShell activePath="/invoices">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/invoices"
          >
            Retour factures
          </a>
        }
        description="Générez une facture propre depuis un contrat de maintenance CVC, avec montant repris, TVA et échéance de paiement."
        eyebrow="Facturation"
        title="Nouvelle facture"
      />
      <section className="invoice-new-brief mt-6 rounded-lg border p-5">
        <div>
          <p>Document prêt à sortir</p>
          <h2>Choisir le contrat, vérifier le montant, créer la facture.</h2>
          <span>
            Le contrat porte déjà le client, l'équipement et le tarif. La facture
            ne demande plus qu'une vérification rapide avant génération du PDF.
          </span>
        </div>
        <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/settings/company">
          Vérifier l'entreprise
        </a>
      </section>
      <InvoiceForm
        contracts={contracts}
        defaultDueDate={isoDateInput(dueDate)}
        defaultIssueDate={isoDateInput(today)}
        initialContractId={params?.contractId}
      />
    </AppShell>
  );
}
