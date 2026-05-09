import { notFound } from "next/navigation";

import { DocumentSendButton } from "@/components/documents/DocumentSendButton";
import { DocumentSendHistory } from "@/components/documents/DocumentSendHistory";
import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import {
  getCertificateDetail,
  getOrganizationProfile,
} from "@/server/contratpro-data";
import { getDocumentSends } from "@/server/document-sends";

import { PrintButton } from "./PrintButton";

type CertificateDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="certificate-detail-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function CertificateDetailPage({
  params,
}: CertificateDetailPageProps) {
  const { id } = await params;
  const [certificate, organization, sends] = await Promise.all([
    getCertificateDetail(id),
    getOrganizationProfile(),
    getDocumentSends("CERTIFICATE", id),
  ]);

  if (!certificate) {
    notFound();
  }

  return (
    <AppShell activePath="/certificates">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/certificates"
            >
              Retour attestations
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href={`/api/certificates/${certificate.id}/pdf`}
            >
              PDF
            </a>
            <DocumentSendButton
              endpoint={`/api/certificates/${certificate.id}/send`}
              label="Envoyer client"
            />
            <PrintButton />
          </div>
        }
        description={`${certificate.equipment} - ${certificate.issuedAt}`}
        eyebrow="Attestation imprimable"
        title={certificate.customer}
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <article className="certificate-document rounded-lg border p-6 shadow-sm print:border-zinc-300 print:bg-white print:text-zinc-950 print:shadow-none">
          <div className="certificate-document-header flex flex-col gap-4 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300 print:text-emerald-800">
              ContratPro
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-zinc-50 print:text-zinc-950">
              Attestation d'entretien CVC
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 print:text-zinc-600">
              Document de suivi pour entretien annuel, conservation client et
              archivage entreprise.
            </p>
          </div>
            <div className="text-left sm:text-right">
              <StatusPill>{certificate.status}</StatusPill>
              <p className="mt-3 text-sm font-medium text-zinc-400 print:text-zinc-600">
                {certificate.fileName}
              </p>
            </div>
          </div>

          <div className="certificate-document-grid mt-6 grid gap-6 lg:grid-cols-2">
          <article>
            <h4 className="text-base font-semibold text-zinc-50 print:text-zinc-950">
              Entreprise intervenante
            </h4>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Nom" value={organization.name} />
              <DetailItem label="Adresse" value={organization.fullAddress} />
              <DetailItem label="SIRET" value={organization.siret || "-"} />
              <DetailItem label="TVA" value={organization.vatNumber || "-"} />
              <DetailItem label="RGE" value={organization.rgeNumber || "-"} />
              <DetailItem label="Email" value={organization.email || "-"} />
            </dl>
          </article>

          <article>
            <h4 className="text-base font-semibold text-zinc-50 print:text-zinc-950">
              Client
            </h4>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Nom" value={certificate.customer} />
              <DetailItem label="Contact" value={certificate.contact} />
              <DetailItem label="Telephone" value={certificate.phone} />
              <DetailItem label="Email" value={certificate.email} />
              <DetailItem label="Adresse" value={certificate.address} />
            </dl>
          </article>

          <article>
            <h4 className="text-base font-semibold text-zinc-50 print:text-zinc-950">
              Equipement
            </h4>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Materiel" value={certificate.equipment} />
              <DetailItem label="Famille" value={certificate.equipmentType} />
              <DetailItem label="Puissance" value={certificate.powerKw} />
              <DetailItem label="Numero serie" value={certificate.serialNumber} />
              <DetailItem label="Emplacement" value={certificate.location} />
            </dl>
          </article>
          </div>

          <div className="certificate-document-grid mt-6 grid gap-6 pt-6 lg:grid-cols-2">
          <article>
            <h4 className="text-base font-semibold text-zinc-50 print:text-zinc-950">
              Intervention
            </h4>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Date entretien" value={certificate.performedAt} />
              <DetailItem label="Technicien" value={certificate.technician} />
              <DetailItem label="Contrat" value={certificate.contractId || "-"} />
              <DetailItem label="Periode contrat" value={certificate.contractPeriod} />
            </dl>
          </article>

          <article>
            <h4 className="text-base font-semibold text-zinc-50 print:text-zinc-950">
              Cadre legal
            </h4>
            <dl className="mt-4 grid gap-4">
              <DetailItem label="Reference" value={certificate.legalReference} />
              <DetailItem label="Emission" value={certificate.issuedAt} />
              <DetailItem label="Envoi client" value={certificate.sentAt} />
            </dl>
          </article>
          </div>

          <section className="certificate-report mt-6 pt-6">
            <h4 className="text-base font-semibold text-zinc-50 print:text-zinc-950">
              Compte rendu
            </h4>
            <p className="certificate-report-box mt-3 rounded-md p-4 text-sm leading-6 print:bg-white">
              {certificate.report}
            </p>
          </section>

          <div className="certificate-signatures mt-10 grid gap-6 pt-6 sm:grid-cols-2">
            <div className="certificate-signature-box">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 print:text-zinc-600">
                Signature technicien
              </p>
              <div className="mt-12 border-t border-zinc-700 print:border-zinc-300" />
            </div>
            <div className="certificate-signature-box">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 print:text-zinc-600">
                Cachet entreprise
              </p>
              <div className="mt-12 border-t border-zinc-700 print:border-zinc-300" />
            </div>
          </div>
        </article>
        <DocumentSendHistory sends={sends} />
      </section>
    </AppShell>
  );
}
