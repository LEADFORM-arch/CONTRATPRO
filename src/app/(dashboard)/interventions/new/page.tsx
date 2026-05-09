import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { getContractOptions } from "@/server/contratpro-data";

import { InterventionForm } from "./InterventionForm";

function datetimeLocalValue(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default async function NewInterventionPage() {
  const contracts = await getContractOptions();

  return (
    <AppShell activePath="/interventions">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/interventions"
          >
            Retour planning
          </a>
        }
        description="Planifiez une visite, rattachez-la au contrat et preparez le cycle attestation / prochaine echeance."
        eyebrow="Nouvelle intervention"
        title="Planifier une visite CVC"
      />

      <div className="intervention-form-intro mt-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Operation terrain
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
            Une visite propre, une attestation prete.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Rattachez chaque passage au contrat pour alimenter le planning,
            l'historique client et la generation d'attestation.
          </p>
        </div>
        <div className="contract-form-intro-grid">
          <span>Contrat</span>
          <span>Visite</span>
          <span>Rapport</span>
        </div>
      </div>

      <InterventionForm
        contracts={contracts}
        defaultPerformedAt={datetimeLocalValue(new Date())}
      />
    </AppShell>
  );
}
