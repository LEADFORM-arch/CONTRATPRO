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
        description="Ajoutez un client final avant de rattacher une installation, un contrat annuel et les relances."
        eyebrow="Nouveau client"
        title="Creer une fiche client"
      />

      <div className="customer-form-intro mt-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Base commerciale
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-zinc-950">
            Une fiche propre avant tout contrat.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Centralisez les coordonnees utiles aux interventions, attestations,
            factures et relances de renouvellement.
          </p>
        </div>
        <div className="contract-form-intro-grid">
          <span>Identite</span>
          <span>Contact</span>
          <span>Adresse</span>
        </div>
      </div>

      <CustomerForm />
    </AppShell>
  );
}
