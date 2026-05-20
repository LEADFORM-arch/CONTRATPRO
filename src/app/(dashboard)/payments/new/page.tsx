import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { getMandateOptions } from "@/server/contratpro-data";

import { PaymentForm } from "./PaymentForm";

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function NewPaymentPage() {
  const mandates = await getMandateOptions();

  return (
    <AppShell activePath="/payments">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/payments"
          >
            Retour paiements
          </a>
        }
        description="Programmez un encaissement depuis un mandat SEPA actif, avec montant repris et date de prélèvement visible."
        eyebrow="Nouveau prélèvement"
        title="Créer un paiement SEPA"
      />

      <section className="payment-new-brief mt-6 rounded-lg border p-5">
        <div>
          <p>Cash-flow contrat</p>
          <h2>Choisir le mandat, vérifier le montant, programmer l'encaissement.</h2>
          <span>
            Le chauffagiste voit le client et le montant. Les identifiants GoCardless
            restent cachés dans le cockpit technique.
          </span>
        </div>
        <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/contracts">
          Voir contrats
        </a>
      </section>

      <PaymentForm
        defaultChargeDate={dateInputValue(new Date())}
        mandates={mandates}
      />
    </AppShell>
  );
}
