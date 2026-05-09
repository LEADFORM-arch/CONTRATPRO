import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { getCustomerOptions } from "@/server/contratpro-data";

import { ContractForm } from "./ContractForm";

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function NewContractPage() {
  const customers = await getCustomerOptions();
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  return (
    <AppShell activePath="/contracts">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/contracts"
          >
            Retour contrats
          </a>
        }
        description="Rattachez un client, son equipement CVC et le contrat annuel qui alimentera les relances et paiements."
        eyebrow="Nouveau contrat"
        title="Creer un contrat de maintenance"
      />

      <div className="contract-form-intro mt-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Saisie guidee
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
            Construire un revenu recurrent proprement.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Le formulaire cree l'installation, le contrat annuel, puis alimente
            automatiquement les vues relances, paiements et attestations.
          </p>
        </div>
        <div className="contract-form-intro-grid">
          <span>Client</span>
          <span>Installation</span>
          <span>Contrat</span>
        </div>
      </div>

      <ContractForm
        customers={customers}
        defaultEndDate={dateInputValue(nextYear)}
        defaultStartDate={dateInputValue(today)}
      />
    </AppShell>
  );
}
