import { AppShell, PageHeader } from "@/components/layout/AppShell";

import { QuickContractForm } from "./QuickContractForm";

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function QuickContractPage() {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  return (
    <AppShell activePath="/contracts">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/contracts/new"
            >
              Formulaire complet
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/import"
            >
              Importer Excel
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/contracts"
            >
              Retour contrats
            </a>
          </div>
        }
        description="Avancez par groupes numerotes: client, equipement, contrat, paiement, puis validation. Le chauffagiste ne voit pas les details techniques GoCardless."
        eyebrow="Contrat guide"
        title="Creer un contrat avec paiement"
      />

      <div className="contract-form-intro quick-contract-intro mt-6">
        <div>
          <p className="quick-contract-intro-eyebrow">
            Parcours terrain numerote
          </p>
          <h3>
            Un contrat comme sur papier, puis le paiement en plus.
          </h3>
          <p className="quick-contract-intro-copy">
            Le chauffagiste suit les chiffres dans l'ordre naturel. ContratPro
            cree le client, l'equipement, le contrat et, si besoin, le lien de
            signature SEPA.
          </p>
        </div>
        <div className="contract-form-intro-grid">
          <span>1 Client</span>
          <span>4 Paiement</span>
          <span>5 Validation</span>
        </div>
      </div>

      <QuickContractForm
        defaultEndDate={dateInputValue(nextYear)}
        defaultStartDate={dateInputValue(today)}
      />
    </AppShell>
  );
}
