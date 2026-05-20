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
        description="Objectif : créer le client, l’équipement, le contrat et le lien SEPA sur une seule page. Aucun réglage technique à montrer au chauffagiste."
        eyebrow="Contrat guidé"
        title="Créer un contrat avec paiement"
      />

      <div className="contract-form-intro quick-contract-intro mt-6">
        <div>
          <p className="quick-contract-intro-eyebrow">
            Parcours terrain numéroté
          </p>
          <h3>
            Un contrat comme sur papier, puis le paiement prêt à signer.
          </h3>
          <p className="quick-contract-intro-copy">
            Le chauffagiste suit les chiffres dans l'ordre naturel. Il peut
            remplir seulement l'essentiel, contrôler le résumé, puis créer le
            dossier sans comprendre GoCardless.
          </p>
        </div>
        <div className="contract-form-intro-grid">
          <span>1 Client</span>
          <span>2 Équipement</span>
          <span>3 Contrat</span>
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
