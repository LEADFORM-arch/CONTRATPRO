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
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800"
            href="/invoices"
          >
            Retour factures
          </a>
        }
        description="Generez une facture propre depuis un contrat de maintenance CVC, avec TVA et echeance de paiement."
        eyebrow="Facturation"
        title="Nouvelle facture"
      />
      <InvoiceForm
        contracts={contracts}
        defaultDueDate={isoDateInput(dueDate)}
        defaultIssueDate={isoDateInput(today)}
        initialContractId={params?.contractId}
      />
    </AppShell>
  );
}
