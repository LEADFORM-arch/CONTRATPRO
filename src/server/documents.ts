import { formatEuro } from "@/lib/mock-data";
import {
  getCertificateDetail,
  getInvoiceDetail,
  getOrganizationProfile,
} from "@/server/contratpro-data";
import { createPdf } from "@/server/document-pdf";

type DocumentKind = "invoice" | "certificate";

function legalIdentity(organization: Awaited<ReturnType<typeof getOrganizationProfile>>) {
  return [
    organization.fullAddress,
    organization.siret ? `SIRET ${organization.siret}` : "",
    organization.vatNumber ? `TVA intracom ${organization.vatNumber}` : "",
    organization.rgeNumber ? `RGE ${organization.rgeNumber}` : "",
  ]
    .filter(Boolean)
    .join(" - ");
}

export async function buildInvoicePdf(id: string) {
  const [invoice, organization] = await Promise.all([
    getInvoiceDetail(id),
    getOrganizationProfile(),
  ]);

  if (!invoice) {
    return null;
  }

  const filename = `${invoice.number}.pdf`;
  const pdf = createPdf({
    title: invoice.number,
    subtitle: `Facture emise le ${invoice.issueDate} - echeance ${invoice.dueDate}`,
    badge: invoice.status,
    sections: [
      {
        title: "Emetteur",
        rows: [
          ["Entreprise", organization.name],
          ["Identite legale", legalIdentity(organization) || "-"],
          ["Email", organization.email || "-"],
          ["Telephone", organization.phone || "-"],
        ],
      },
      {
        title: "Client facture",
        rows: [
          ["Client", invoice.customer],
          ["Contact", invoice.contact],
          ["Adresse", invoice.address],
          ["Email", invoice.email],
          ["Telephone", invoice.phone],
        ],
      },
      {
        title: "Contrat et equipement",
        rows: [
          ["Equipement", invoice.equipment],
          ["Famille", invoice.equipmentType],
          ["Numero de serie", invoice.serialNumber],
          ["Periode", invoice.contractPeriod],
        ],
      },
      {
        title: "Ligne facture",
        rows: [
          ["Designation", `Contrat annuel de maintenance CVC - ${invoice.equipment}`],
          ["Total HT", formatEuro(invoice.amountHt)],
          ["TVA", `${invoice.vatRate}% - ${formatEuro(invoice.vatAmount)}`],
          ["Total TTC", formatEuro(invoice.amountTtc)],
        ],
      },
    ],
    notes: [
      "Facture payable a echeance. Tout retard de paiement peut entrainer des penalites de retard calculees au taux d'interet legal applicable aux professionnels, ainsi qu'une indemnite forfaitaire de recouvrement de 40 EUR lorsque la reglementation l'autorise.",
      "Document genere par ContratPro pour le suivi des contrats de maintenance CVC, attestations et encaissements recurrents.",
    ],
  });

  return {
    customerEmail: invoice.email,
    customerName: invoice.customer,
    filename,
    number: invoice.number,
    pdf,
    subject: `${invoice.number} - ${organization.name}`,
  };
}

export async function buildCertificatePdf(id: string) {
  const [certificate, organization] = await Promise.all([
    getCertificateDetail(id),
    getOrganizationProfile(),
  ]);

  if (!certificate) {
    return null;
  }

  const filename = certificate.fileName.endsWith(".pdf")
    ? certificate.fileName
    : `attestation-${certificate.id}.pdf`;
  const pdf = createPdf({
    title: "Attestation d'entretien CVC",
    subtitle: `${certificate.customer} - ${certificate.issuedAt}`,
    badge: certificate.status,
    sections: [
      {
        title: "Entreprise intervenante",
        rows: [
          ["Entreprise", organization.name],
          ["Identite legale", legalIdentity(organization) || "-"],
          ["Email", organization.email || "-"],
          ["Telephone", organization.phone || "-"],
        ],
      },
      {
        title: "Client",
        rows: [
          ["Client", certificate.customer],
          ["Contact", certificate.contact],
          ["Adresse", certificate.address],
          ["Email", certificate.email],
          ["Telephone", certificate.phone],
        ],
      },
      {
        title: "Equipement",
        rows: [
          ["Materiel", certificate.equipment],
          ["Famille", certificate.equipmentType],
          ["Puissance", certificate.powerKw],
          ["Numero de serie", certificate.serialNumber],
          ["Emplacement", certificate.location],
        ],
      },
      {
        title: "Intervention",
        rows: [
          ["Date entretien", certificate.performedAt],
          ["Technicien", certificate.technician],
          ["Contrat", certificate.contractId || "-"],
          ["Periode contrat", certificate.contractPeriod],
          ["Compte rendu", certificate.report],
        ],
      },
      {
        title: "Cadre legal",
        rows: [
          ["Reference", certificate.legalReference],
          ["Emission", certificate.issuedAt],
          ["Envoi client", certificate.sentAt],
        ],
      },
    ],
    notes: [
      "Attestation d'entretien a conserver par le client et l'entreprise dans le cadre du suivi annuel des equipements CVC.",
      "Document genere par ContratPro avec les informations connues au moment de l'emission.",
    ],
  });

  return {
    customerEmail: certificate.email,
    customerName: certificate.customer,
    filename,
    number: certificate.id,
    pdf,
    subject: `Attestation d'entretien - ${certificate.customer}`,
  };
}

export async function buildDocumentPdf(kind: DocumentKind, id: string) {
  return kind === "invoice" ? buildInvoicePdf(id) : buildCertificatePdf(id);
}
