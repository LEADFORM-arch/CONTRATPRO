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
              href="/contracts"
            >
              Retour contrats
            </a>
          </div>
        }
        description="Creez le client, la chaudiere ou PAC et le contrat annuel dans un seul flux court, puis facturez ou preparez le SEPA plus tard."
        eyebrow="Contrat rapide"
        title="Premier contrat en 5 minutes"
      />

      <div className="contract-form-intro quick-contract-intro mt-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Parcours terrain
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
            Capturer le revenu avant de completer le dossier.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Pour M. Martin, l'objectif n'est pas de tout documenter maintenant:
            c'est de rendre le contrat actif, facturable et visible dans les
            relances.
          </p>
        </div>
        <div className="contract-form-intro-grid">
          <span>5-7 champs</span>
          <span>Contrat actif</span>
          <span>Facture suivante</span>
        </div>
      </div>

      <QuickContractForm
        defaultEndDate={dateInputValue(nextYear)}
        defaultStartDate={dateInputValue(today)}
      />
    </AppShell>
  );
}
