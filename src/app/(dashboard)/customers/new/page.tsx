import { AppShell, PageHeader } from "@/components/layout/AppShell";

import { CustomerForm } from "./CustomerForm";

export default function NewCustomerPage() {
  return (
    <AppShell activePath="/customers">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/customers"
          >
            Retour clients
          </a>
        }
        description="Saisissez le minimum terrain : nom, téléphone, ville, équipement et contrat prévu."
        eyebrow="Nouveau client"
        title="Ajouter un client en 1 minute"
      />

      <div className="customer-form-intro mt-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Saisie terrain
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
            Pas de fiche longue : enregistrez, puis créez le contrat.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Le chauffagiste note ce qu'il sait déjà. ContratPro garde
            l'équipement et le contrat prévu dans les notes pour préparer la
            suite.
          </p>
        </div>
        <div className="contract-form-intro-grid">
          <span>Nom</span>
          <span>Telephone</span>
          <span>Ville</span>
          <span>Equipement</span>
          <span>Contrat</span>
        </div>
      </div>

      <CustomerForm />
    </AppShell>
  );
}
