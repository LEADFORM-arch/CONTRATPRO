import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { getCustomerDetail } from "@/server/contratpro-data";

import { QuickContractForm } from "./QuickContractForm";

type QuickContractPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function QuickContractPage({
  searchParams,
}: QuickContractPageProps) {
  const params = (await searchParams) ?? {};
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const customerId = firstParam(params.customerId) ?? "";
  const customerDetail = customerId ? await getCustomerDetail(customerId) : null;
  const initialCustomer = customerId
    ? {
        address:
          firstParam(params.customerAddress) ??
          (customerDetail?.address === "-" ? "" : customerDetail?.address) ??
          "",
        city:
          firstParam(params.customerCity) ??
          (customerDetail?.city === "-" ? "" : customerDetail?.city) ??
          "",
        email:
          firstParam(params.customerEmail) ??
          (customerDetail?.email === "-" ? "" : customerDetail?.email) ??
          "",
        id: customerId,
        name: firstParam(params.customerName) ?? customerDetail?.name ?? "",
        phone:
          firstParam(params.customerPhone) ??
          (customerDetail?.phone === "-" ? "" : customerDetail?.phone) ??
          "",
        zipCode: firstParam(params.customerZipCode) ?? "",
      }
    : undefined;

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
        description={
          initialCustomer
            ? `Client repris : ${initialCustomer.name || "dossier client"}. Ajoutez l'equipement, le tarif annuel et le paiement.`
            : "Objectif : creer le client, l'equipement, le contrat et le lien SEPA sur une seule page."
        }
        eyebrow="Contrat guide"
        title={
          initialCustomer
            ? "Creer le contrat de ce client"
            : "Créer un contrat avec paiement"
        }
      />

      <div className="contract-form-intro quick-contract-intro mt-6">
        <div>
          <p className="quick-contract-intro-eyebrow">
            Parcours terrain numéroté
          </p>
          <h3>
            Un contrat comme sur papier, puis le paiement pret a signer.
          </h3>
          <p className="quick-contract-intro-copy">
            Le chauffagiste suit les chiffres dans l'ordre naturel. Il peut
            remplir seulement l'essentiel, controler le resume, puis creer le
            dossier sans comprendre GoCardless.
          </p>
        </div>
        <div className="contract-form-intro-grid">
          <span>1 Client</span>
          <span>2 Equipement</span>
          <span>3 Contrat</span>
          <span>4 Paiement</span>
          <span>5 Validation</span>
        </div>
      </div>

      <QuickContractForm
        defaultEndDate={dateInputValue(nextYear)}
        defaultStartDate={dateInputValue(today)}
        initialCustomer={initialCustomer}
      />
    </AppShell>
  );
}
