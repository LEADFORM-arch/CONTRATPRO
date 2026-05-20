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
        description="Choisissez le mandat. Vérifiez le montant. Programmez l'encaissement."
        eyebrow="Nouveau prélèvement"
        title="Créer un paiement SEPA"
      />

      <section className="payment-new-brief mt-6 rounded-lg border p-5">
        <div>
          <p>Cash-flow contrat</p>
          <h2>1 mandat signé. 1 montant. 1 encaissement.</h2>
          <span>
            Le chauffagiste voit le client et le montant. Le reste reste caché.
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
