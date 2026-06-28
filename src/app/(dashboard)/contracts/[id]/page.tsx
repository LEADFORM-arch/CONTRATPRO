import { notFound } from "next/navigation";

import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { SectionPanel } from "@/components/ui";
import { formatEuro } from "@/lib/mock-data";
import { getContractDetail } from "@/server/contratpro-data";

import { MandateSetupForm } from "./MandateSetupForm";

type ContractDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="cp-detail-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
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
    <section className="cp-next-action-block" data-od-id="contract-next-action">
      <div className="cp-next-action-brief">
        <p className="cp-eyebrow">Dossier 3 actions</p>
        <h3 className="cp-next-action-title">Une seule suite suffit.</h3>
        <span className="cp-next-action-detail">
          Le contrat est créé. La suite normale : facture, SEPA ou attestation après visite. Rien d'autre à comprendre maintenant.
        </span>
      </div>
      <div className="cp-action-trio">
        <a className="cp-action-card" data-tone="emerald" href={`/invoices/new?contractId=${contractId}`}>
          <span className="cp-action-num">01</span>
          <strong>Créer facture</strong>
          <small>Sortir le document client depuis le contrat.</small>
        </a>
        <a className="cp-action-card" data-tone={hasMandate ? "cyan" : "amber"} href={hasMandate ? "/payments/new" : "#sepa-sandbox"}>
          <span className="cp-action-num">02</span>
          <strong>{hasMandate ? "Programmer SEPA" : "Préparer SEPA"}</strong>
          <small>
            {hasMandate
              ? "Mandat actif : programmer l'encaissement."
              : "Faire signer le lien avant paiement."}
          </small>
        </a>
        <a className="cp-action-card" data-tone="blue" href={`/interventions/new?contractId=${contractId}`}>
          <span className="cp-action-num">03</span>
          <strong>Attestation</strong>
          <small>Créer la visite et la preuve d'entretien.</small>
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
      action: hasIntervention ? "Historique présent" : "Planifier visite",
      detail: hasIntervention
        ? "Le passage terrain est rattaché au contrat."
        : "Une visite doit créer la trace de départ.",
      href: hasIntervention ? "#interventions" : `/interventions/new?contractId=${contractId}`,
      label: "Client absent / report",
      tone: "cyan",
    },
    {
      action: hasCertificate ? "Preuve prête" : "Créer attestation",
      detail: hasCertificate
        ? "L'attestation est retrouvée depuis ce dossier."
        : "Le document doit sortir après la visite.",
      href: hasCertificate ? "#certificates" : `/interventions/new?contractId=${contractId}`,
      label: "Attestation sous 15 jours",
      tone: "amber",
    },
    {
      action: "Créer facture",
      detail: "La facture sépare entretien et réparations pour éviter les litiges.",
      href: `/invoices/new?contractId=${contractId}`,
      label: "Entretien vs réparation",
      tone: "emerald",
    },
    {
      action: hasMandate ? "SEPA prêt" : "Faire signer",
      detail: hasMandate
        ? "Le mandat évite la chasse au paiement."
        : "Le client signe le mandat avant paiement.",
      href: hasMandate ? "/payments/new" : "#sepa-sandbox",
      label: "Impayés / relances",
      tone: "blue",
    },
  ];

  return (
    <section className="cp-proof-shield" aria-label="Solutions aux litiges et oublis">
      <div className="cp-proof-shield-brief">
        <p className="cp-eyebrow">Bouclier terrain</p>
        <h3 className="cp-proof-title">Répondre aux phrases qui font perdre du temps.</h3>
        <span className="cp-proof-detail">
          « Le client était absent », « avant votre passage ça marchait », « l'attestation n'est pas arrivée » : le dossier garde les preuves au même endroit.
        </span>
      </div>
      <div className="cp-proof-grid">
        {proofItems.map((item) => (
          <a className="cp-proof-card" data-tone={item.tone} href={item.href} key={item.label}>
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
          <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/contracts">
            ← Retour contrats
          </a>
        }
        description={`${contract.equipment} — ${contract.city}`}
        eyebrow="Dossier contrat"
        title={contract.customer}
      />

      <div className="cp-contract-hero">
        <div>
          <p className="cp-eyebrow">Contrat annuel</p>
          <h3 className="cp-contract-amount">{formatEuro(contract.priceTtc)}</h3>
          <p className="cp-contract-meta">{contract.billingCycle} — {contract.paymentMethod}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill>{contract.status}</StatusPill>
          <span className="cp-pill" data-tone="amber">Échéance {contract.endDate}</span>
        </div>
      </div>

      <div className="cp-dossier-strip">
        <div>
          <span className="cp-strip-step">1 Client</span>
          <strong>{contract.contact}</strong>
          <small>{contract.city}</small>
        </div>
        <div>
          <span className="cp-strip-step">2 Installation</span>
          <strong>{contract.equipment}</strong>
          <small>{contract.equipmentType}</small>
        </div>
        <div>
          <span className="cp-strip-step">3 Échéance</span>
          <strong>{contract.endDate}</strong>
          <small>Renouvellement à surveiller</small>
        </div>
        <div>
          <span className="cp-strip-step">4 Encaissement</span>
          <strong>{contract.mandate ? "SEPA prêt" : "SEPA à signer"}</strong>
          <small>{contract.paymentMethod}</small>
        </div>
      </div>

      <ContractPriorityAction
        contractId={contract.id}
        hasMandate={Boolean(contract.mandate)}
      />

      <details className="cp-proof-drawer contract-proof-drawer">
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

      <div className="cp-evidence-grid">
        <SectionPanel
          title="Cadre contractuel"
          description="Prix, TVA, calendrier et conditions de paiement."
        >
          <dl className="cp-detail-grid">
            <DetailItem label="Début" value={contract.startDate} />
            <DetailItem label="Échéance" value={contract.endDate} />
            <DetailItem label="Facturation" value={contract.billingCycle} />
            <DetailItem label="Paiement" value={contract.paymentMethod} />
            <DetailItem label="Prix HT" value={formatEuro(contract.priceHt)} />
            <DetailItem label="TVA" value={`${contract.vatRate}%`} />
          </dl>
        </SectionPanel>

        <SectionPanel
          title="Client"
          description="Coordonnées rattachées au dossier de maintenance."
          action={
            contract.customerId ? (
              <a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/customers/${contract.customerId}`}>
                Fiche client
              </a>
            ) : undefined
          }
        >
          <dl className="cp-detail-grid">
            <DetailItem label="Contact" value={contract.contact} />
            <DetailItem label="Téléphone" value={contract.phone} />
            <DetailItem label="Email" value={contract.email} />
            <DetailItem label="Adresse" value={contract.address} />
          </dl>
        </SectionPanel>
      </div>

      <div className="cp-evidence-grid">
        <SectionPanel title="Installation CVC">
          <dl className="cp-detail-grid">
            <DetailItem label="Équipement" value={contract.equipment} />
            <DetailItem label="Famille" value={contract.equipmentType} />
            <DetailItem label="Puissance" value={contract.powerKw} />
            <DetailItem label="N° de série" value={contract.serialNumber} />
            <DetailItem label="Emplacement" value={contract.location} />
          </dl>
        </SectionPanel>

        <SectionPanel
          title="Historique interventions"
          description="Visites rattachées au contrat et aux attestations légales."
          action={
            <a className="cp-btn cp-btn-ghost cp-btn-sm" href="/certificates">
              Attestations
            </a>
          }
        >
          <div className="cp-timeline">
            {contract.interventions.length ? (
              contract.interventions.map((intervention) => (
                <article className="cp-timeline-row" key={intervention.id}>
                  <div className="cp-timeline-head">
                    <p className="cp-cell-strong">{intervention.performedAt}</p>
                    <StatusPill>{intervention.status}</StatusPill>
                  </div>
                  <p className="cp-cell-sub">Technicien : {intervention.technician}</p>
                  <p className="cp-timeline-report">{intervention.report}</p>
                </article>
              ))
            ) : (
              <p className="cp-empty-inline">Aucune intervention enregistrée pour ce contrat.</p>
            )}
          </div>
        </SectionPanel>
      </div>

      <div className="cp-evidence-grid">
        <SectionPanel title="Conformité">
          <div className="cp-timeline">
            {contract.certificates.length ? (
              contract.certificates.map((certificate) => (
                <article className="cp-timeline-row" key={certificate.id}>
                  <div className="cp-timeline-head">
                    <p className="cp-cell-strong">{certificate.fileName}</p>
                    <StatusPill>{certificate.status}</StatusPill>
                  </div>
                  <p className="cp-cell-sub">{certificate.issuedAt} — {certificate.legalReference}</p>
                </article>
              ))
            ) : (
              <p className="cp-empty-inline">Aucune attestation rattachée.</p>
            )}
          </div>
        </SectionPanel>

        <SectionPanel title="Paiements récurrents">
          <div className="cp-mandate-box">
            <p className="cp-cell-sub">Mandat SEPA</p>
            <p className="cp-mandate-status">
              {contract.mandate
                ? `${contract.mandate.status} — ${contract.mandate.providerId}`
                : "Aucun mandat actif"}
            </p>
            <p className="cp-mandate-detail">
              {contract.mandate
                ? "GoCardless peut être soumis depuis les paiements programmés."
                : "Commencez par créer le lien GoCardless. Après signature, le paiement pourra être programmé."}
            </p>
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href={contract.mandate ? "/payments/new" : "#sepa-sandbox"}>
              {contract.mandate ? "Programmer paiement" : "Préparer SEPA"}
            </a>
          </div>
          <details className="cp-mandate-technical" open={!contract.mandate}>
            <summary>
              {contract.mandate
                ? "Avancé : identifiants GoCardless"
                : "Préparer le mandat SEPA avec GoCardless"}
            </summary>
            <MandateSetupForm
              contractId={contract.id}
              customerProviderId={contract.mandate?.customerProviderId}
              mandateProviderId={contract.mandate?.providerId}
              status={contract.mandate?.status}
            />
          </details>
          <div className="cp-timeline">
            {contract.payments.length ? (
              contract.payments.map((payment) => (
                <article className="cp-payment-row cp-payment-row-inline" key={payment.id}>
                  <div>
                    <p className="cp-cell-strong">{payment.description}</p>
                    <p className="cp-cell-sub">{payment.chargeDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="cp-cell-amount">{formatEuro(payment.amount)}</p>
                    <p className="cp-cell-sub">{payment.status}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="cp-empty-inline">Aucun paiement planifié.</p>
            )}
          </div>
        </SectionPanel>
      </div>
    </AppShell>
  );
}
