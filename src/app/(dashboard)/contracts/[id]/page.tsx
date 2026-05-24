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
  id,
  title,
  description,
  children,
  action,
  defaultOpen = false,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="contract-detail-section contract-evidence-section"
      id={id}
      open={defaultOpen}
    >
      <summary className="contract-detail-section-header">
        <div>
          <span className="contract-evidence-kicker">Preuve dossier</span>
          <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-zinc-500">{description}</p>
          ) : null}
        </div>
        {action}
      </summary>
      <div className="contract-evidence-body">{children}</div>
    </details>
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
        <p>À faire maintenant</p>
        <h3>Facturer, encaisser, puis prouver l'entretien.</h3>
        <span>
          Trois gestes suffisent pour rendre ce dossier exploitable : sortir la
          facture, faire signer le SEPA sandbox, puis produire l'attestation.
        </span>
      </div>
      <div className="contract-next-action-grid">
        <a
          className="contract-next-action-card"
          data-tone="emerald"
          href={`/invoices/new?contractId=${contractId}`}
        >
          <span>01</span>
          <strong>Créer facture</strong>
          <small>Reprendre client, contrat, TVA et montant TTC.</small>
        </a>
        <a
          className="contract-next-action-card"
          data-tone={hasMandate ? "cyan" : "amber"}
          href={hasMandate ? "/payments/new" : "#sepa-sandbox"}
        >
          <span>02</span>
          <strong>{hasMandate ? "Programmer SEPA" : "Préparer SEPA"}</strong>
          <small>
            {hasMandate
              ? "Mandat détecté : programmer le paiement récurrent."
              : "Créer le lien de signature sandbox avant le paiement."}
          </small>
        </a>
        <a
          className="contract-next-action-card"
          data-tone="blue"
          href={`/interventions/new?contractId=${contractId}`}
        >
          <span>03</span>
          <strong>Visite + attestation</strong>
          <small>Planifier le passage et préparer la preuve d'entretien.</small>
        </a>
      </div>
    </section>
  );
}

function ContractPriorityAction({
  contractId,
  hasMandate,
}: {
  contractId: string;
  hasMandate: boolean;
}) {
  return (
    <section
      className="contract-next-action contract-priority-action mt-6"
      data-od-id="contract-next-action"
    >
      <div className="contract-next-action-brief">
        <p>Dossier 3 actions</p>
        <h3>Choisissez une seule suite.</h3>
        <span>
          Le contrat est cree. La suite normale : facture, SEPA sandbox ou
          attestation apres visite. Rien d'autre a comprendre maintenant.
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
          <small>Sortir le document client depuis le contrat.</small>
        </a>
        <a
          className="contract-next-action-card"
          data-tone={hasMandate ? "cyan" : "amber"}
          href={hasMandate ? "/payments/new" : "#sepa-sandbox"}
        >
          <span>02</span>
          <strong>{hasMandate ? "Programmer SEPA" : "Preparer SEPA"}</strong>
          <small>
            {hasMandate
              ? "Mandat actif : programmer l'encaissement."
              : "Faire signer le lien sandbox avant paiement."}
          </small>
        </a>
        <a
          className="contract-next-action-card"
          data-tone="blue"
          href={`/interventions/new?contractId=${contractId}`}
        >
          <span>03</span>
          <strong>Attestation</strong>
          <small>Creer la visite et la preuve d'entretien.</small>
        </a>
      </div>
    </section>
  );
}

function ContractProofShield({
  contractId,
  hasCertificate,
  hasIntervention,
  hasMandate,
}: {
  contractId: string;
  hasCertificate: boolean;
  hasIntervention: boolean;
  hasMandate: boolean;
}) {
  const proofItems = [
    {
      action: hasIntervention ? "Historique present" : "Planifier visite",
      detail: hasIntervention
        ? "Le passage terrain est rattache au contrat."
        : "Une visite doit creer la trace de depart.",
      href: hasIntervention ? "#interventions" : `/interventions/new?contractId=${contractId}`,
      label: "Client absent / report",
      tone: "cyan",
    },
    {
      action: hasCertificate ? "Preuve prete" : "Creer attestation",
      detail: hasCertificate
        ? "L'attestation est retrouvee depuis ce dossier."
        : "Le document doit sortir apres la visite.",
      href: hasCertificate ? "#certificates" : `/interventions/new?contractId=${contractId}`,
      label: "Attestation sous 15 jours",
      tone: "amber",
    },
    {
      action: "Creer facture",
      detail: "La facture reprend client, TVA et montant pour separer entretien et supplement.",
      href: `/invoices/new?contractId=${contractId}`,
      label: "Entretien vs reparation",
      tone: "emerald",
    },
    {
      action: hasMandate ? "SEPA pret" : "Faire signer",
      detail: hasMandate
        ? "Le mandat evite la chasse au paiement."
        : "Le client signe le mandat avant paiement.",
      href: hasMandate ? "/payments/new" : "#sepa-sandbox",
      label: "Impayes / relances",
      tone: "blue",
    },
  ];

  return (
    <section className="contract-proof-shield mt-4" aria-label="Solutions aux litiges et oublis">
      <div className="contract-proof-shield-brief">
        <p>Bouclier terrain</p>
        <h3>Repondre aux phrases qui font perdre du temps.</h3>
        <span>
          "Le client etait absent", "avant votre passage ca marchait",
          "l'attestation n'est pas arrivee" : le dossier doit garder les preuves
          au meme endroit.
        </span>
      </div>
      <div className="contract-proof-grid">
        {proofItems.map((item) => (
          <a className="contract-proof-card" data-tone={item.tone} href={item.href} key={item.label}>
            <small>{item.label}</small>
            <strong>{item.action}</strong>
            <span>{item.detail}</span>
          </a>
        ))}
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

      <div className="contract-dossier-strip mt-3" aria-label="Fiche express contrat">
        <div>
          <span>1 Client</span>
          <strong>{contract.contact}</strong>
          <small>{contract.city}</small>
        </div>
        <div>
          <span>2 Installation</span>
          <strong>{contract.equipment}</strong>
          <small>{contract.equipmentType}</small>
        </div>
        <div>
          <span>Échéance</span>
          <strong>{contract.endDate}</strong>
          <small>Renouvellement à surveiller</small>
        </div>
        <div>
          <span>4 Encaissement</span>
          <strong>{contract.mandate ? "SEPA prêt" : "SEPA à signer"}</strong>
          <small>{contract.paymentMethod}</small>
        </div>
      </div>

      <ContractPriorityAction
        contractId={contract.id}
        hasMandate={Boolean(contract.mandate)}
      />

      <details className="contract-proof-drawer mt-4">
        <summary>
          <span>Preuves secondaires</span>
          <strong>Litiges, absences et attestations</strong>
          <small>Ouvrir seulement si le dossier doit justifier une preuve.</small>
        </summary>
        <ContractProofShield
          contractId={contract.id}
          hasCertificate={contract.certificates.length > 0}
          hasIntervention={contract.interventions.length > 0}
          hasMandate={Boolean(contract.mandate)}
        />
      </details>

      <div className="contract-evidence-grid mt-6">
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
          description="Coordonnées rattachées au dossier de maintenance."
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

      <div className="contract-evidence-grid mt-4">
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
          id="interventions"
          action={
            <a
              className="premium-inline-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/certificates"
            >
              Attestations
            </a>
          }
          description="Visites rattachées au contrat et aux attestations légales."
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

      <div className="contract-evidence-grid mt-4">
        <SectionShell id="certificates" title="Conformite">
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

        <SectionShell
          defaultOpen={!contract.mandate}
          id="sepa-sandbox"
          title="Paiements recurrents"
        >
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
                  : "Commencez par créer le lien GoCardless sandbox. Après signature, le paiement pourra être programmé."}
              </p>
              <a
                className="premium-secondary-action mt-3 inline-flex rounded-md px-3 py-2 text-sm font-semibold"
                href={contract.mandate ? "/payments/new" : "#sepa-sandbox"}
              >
                {contract.mandate ? "Programmer paiement" : "Préparer SEPA"}
              </a>
            </div>
            <details className="contract-mandate-technical mt-3" open={!contract.mandate}>
              <summary>
                {contract.mandate
                  ? "Sandbox avancé : identifiants GoCardless"
                  : "Préparer SEPA sandbox avec GoCardless"}
              </summary>
              <MandateSetupForm
                contractId={contract.id}
                customerProviderId={contract.mandate?.customerProviderId}
                mandateProviderId={contract.mandate?.providerId}
                status={contract.mandate?.status}
              />
            </details>
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
