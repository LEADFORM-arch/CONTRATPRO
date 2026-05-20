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
        description="Choisissez le contrat. Vérifiez le montant. Créez la facture."
        eyebrow="Facturation"
        title="Nouvelle facture"
      />
      <section className="invoice-new-brief mt-6 rounded-lg border p-5">
        <div>
          <p>Document prêt à sortir</p>
          <h2>1 contrat. 1 montant. 1 facture.</h2>
          <span>
            Tout est repris du contrat : client, équipement, tarif et TVA.
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
