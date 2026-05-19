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
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm"
            href="/payments"
          >
            Retour paiements
          </a>
        }
        description="Programmez un paiement récurrent depuis un mandat SEPA actif et suivez son cycle d’encaissement."
        eyebrow="Nouveau prélèvement"
        title="Créer un paiement SEPA"
      />

      <PaymentForm
        defaultChargeDate={dateInputValue(new Date())}
        mandates={mandates}
      />
    </AppShell>
  );
}
