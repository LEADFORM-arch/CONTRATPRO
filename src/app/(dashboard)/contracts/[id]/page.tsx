import { notFound } from "next/navigation";

import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import { getContractDetail } from "@/server/contratpro-data";

import { MandateSetupForm } from "./MandateSetupForm";

type ContractDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="contract-detail-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function SectionShell({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="contract-detail-section">
      <div className="contract-detail-section-header">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-zinc-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ContractNextAction({
  contractId,
  hasMandate,
}: {
  contractId: string;
  hasMandate: boolean;
}) {
  return (
    <section className="contract-next-action mt-6" data-od-id="contract-next-action">
      <div className="contract-next-action-brief">
        <p>Prochaine action</p>
        <h3>Transformer ce contrat en encaissement suivi.</h3>
        <span>
          Facturez maintenant, puis préparez le mandat SEPA quand les infos
          GoCardless finales sont en place.
        </span>
      </div>
      <div className="contract-next-action-grid">
        <a
          className="contract-next-action-card"
          data-tone="emerald"
          href={`/invoices/new?contractId=${contractId}`}
        >
          <span>01</span>
          <strong>Creer facture</strong>
          <small>Reprendre client, contrat, TVA et montant TTC.</small>
        </a>
        <a
          className="contract-next-action-card"
          data-tone={hasMandate ? "cyan" : "amber"}
          href="/payments/new"
        >
          <span>02</span>
          <strong>{hasMandate ? "Programmer SEPA" : "Preparer SEPA"}</strong>
          <small>
            {hasMandate
              ? "Mandat detecte: programmer le paiement recurrent."
              : "Mandat GoCardless a renseigner avant soumission."}
          </small>
        </a>
      </div>
    </section>
  );
}

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  const { id } = await params;
  const contract = await getContractDetail(id);

  if (!contract) {
    notFound();
  }

  return (
    <AppShell activePath="/contracts">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/contracts"
          >
            Retour contrats
          </a>
        }
        description={`${contract.equipment} - ${contract.city}`}
        eyebrow="Dossier contrat"
        title={contract.customer}
      />

      <div className="contract-detail-hero mt-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">Contrat annuel</p>
          <h3 className="mt-2 text-4xl font-semibold text-zinc-950">
            {formatEuro(contract.priceTtc)}
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            {contract.billingCycle} - {contract.paymentMethod}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill>{contract.status}</StatusPill>
          <span className="contract-payment-pill">{contract.endDate}</span>
        </div>
      </div>

      <ContractNextAction
        contractId={contract.id}
        hasMandate={Boolean(contract.mandate)}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionShell
          description="Prix, TVA, calendrier et conditions de paiement."
          title="Cadre contractuel"
        >
          <dl className="grid gap-3 p-4 sm:grid-cols-2">
            <DetailItem label="Debut" value={contract.startDate} />
            <DetailItem label="Echeance" value={contract.endDate} />
            <DetailItem label="Facturation" value={contract.billingCycle} />
            <DetailItem label="Paiement" value={contract.paymentMethod} />
            <DetailItem label="Prix HT" value={formatEuro(contract.priceHt)} />
            <DetailItem label="TVA" value={`${contract.vatRate}%`} />
          </dl>
        </SectionShell>

        <SectionShell
          action={
            contract.customerId ? (
              <a
                className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
                href={`/customers/${contract.customerId}`}
              >
                Fiche client
              </a>
            ) : null
          }
          description="Coordonnees rattachees au dossier de maintenance."
          title="Client"
        >
          <dl className="grid gap-3 p-4 sm:grid-cols-2">
            <DetailItem label="Contact" value={contract.contact} />
            <DetailItem label="Telephone" value={contract.phone} />
            <DetailItem label="Email" value={contract.email} />
            <DetailItem label="Adresse" value={contract.address} />
          </dl>
        </SectionShell>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionShell title="Installation CVC">
          <dl className="grid gap-3 p-4 sm:grid-cols-2">
            <DetailItem label="Equipement" value={contract.equipment} />
            <DetailItem label="Famille" value={contract.equipmentType} />
            <DetailItem label="Puissance" value={contract.powerKw} />
            <DetailItem label="Numero serie" value={contract.serialNumber} />
            <DetailItem label="Emplacement" value={contract.location} />
          </dl>
        </SectionShell>

        <SectionShell
          action={
            <a
              className="premium-inline-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/certificates"
            >
              Attestations
            </a>
          }
          description="Visites rattachees au contrat et aux attestations legales."
          title="Historique interventions"
        >
          <div className="divide-y divide-zinc-100 p-4">
            {contract.interventions.length ? (
              contract.interventions.map((intervention) => (
                <article className="contract-timeline-row" key={intervention.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-zinc-950">
                      {intervention.performedAt}
                    </p>
                    <StatusPill>{intervention.status}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    Technicien : {intervention.technician}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">
                    {intervention.report}
                  </p>
                </article>
              ))
            ) : (
              <p className="py-4 text-sm text-zinc-500">
                Aucune intervention enregistree pour ce contrat.
              </p>
            )}
          </div>
        </SectionShell>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionShell title="Conformite">
          <div className="divide-y divide-zinc-100 p-4">
            {contract.certificates.length ? (
              contract.certificates.map((certificate) => (
                <article className="contract-timeline-row" key={certificate.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-zinc-950">
                      {certificate.fileName}
                    </p>
                    <StatusPill>{certificate.status}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    {certificate.issuedAt} - {certificate.legalReference}
                  </p>
                </article>
              ))
            ) : (
              <p className="py-4 text-sm text-zinc-500">
                Aucune attestation rattachee.
              </p>
            )}
          </div>
        </SectionShell>

        <SectionShell title="Paiements recurrents">
          <div className="p-4">
            <div className="contract-mandate-box">
              <p className="text-sm text-zinc-500">Mandat SEPA</p>
              <p className="mt-1 font-semibold text-zinc-950">
                {contract.mandate
                  ? `${contract.mandate.status} - ${contract.mandate.providerId}`
                  : "Aucun mandat actif"}
              </p>
              <p className="mt-2 text-sm leading-5 text-zinc-500">
                {contract.mandate
                  ? "GoCardless peut etre soumis depuis les paiements programmes."
                  : "Le contrat est marque SEPA. Ajoutez le mandat GoCardless quand les informations finales sont disponibles."}
              </p>
              <a
                className="premium-secondary-action mt-3 inline-flex rounded-md px-3 py-2 text-sm font-semibold"
                href="/payments/new"
              >
                {contract.mandate ? "Programmer paiement" : "Preparer SEPA"}
              </a>
            </div>
            <MandateSetupForm
              contractId={contract.id}
              customerProviderId={contract.mandate?.customerProviderId}
              mandateProviderId={contract.mandate?.providerId}
              status={contract.mandate?.status}
            />
            <div className="mt-3 divide-y divide-zinc-100">
              {contract.payments.length ? (
                contract.payments.map((payment) => (
                  <article
                    className="contract-payment-row"
                    key={payment.id}
                  >
                    <div>
                      <p className="font-semibold text-zinc-950">
                        {payment.description}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {payment.chargeDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-zinc-950">
                        {formatEuro(payment.amount)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {payment.status}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="py-4 text-sm text-zinc-500">
                  Aucun paiement planifie.
                </p>
              )}
            </div>
          </div>
        </SectionShell>
      </div>
    </AppShell>
  );
}
