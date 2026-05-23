import type { Metadata } from "next";

import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  alternates: {
    canonical: "/dpa",
  },
  description:
    "Accord de traitement des donnees ContratPro : roles RGPD, instructions, sous-traitants, securite, violation et restitution.",
  title: "DPA ContratPro",
};

const dpaSections = [
  {
    title: "1. Role des parties",
    text:
      "Pour les donnees des clients finaux importees par une entreprise CVC, le client professionnel agit comme responsable du traitement et ContratPro agit comme sous-traitant, selon les instructions documentees du client.",
  },
  {
    title: "2. Objet du traitement",
    text:
      "Les traitements couvrent l'hebergement, l'import, l'organisation, la consultation, la generation de documents, les relances, le suivi des paiements et la journalisation des actions liees aux contrats de maintenance CVC.",
  },
  {
    title: "3. Categories de donnees",
    text:
      "Les donnees peuvent inclure identite, coordonnees professionnelles ou client final, adresse d'intervention, equipement CVC, contrat, intervention, facture, attestation, statut de paiement, historique d'envoi et logs techniques.",
  },
  {
    title: "4. Instructions du client",
    text:
      "ContratPro traite les donnees uniquement pour fournir le service, securiser la plateforme, respecter les obligations legales applicables et executer les instructions raisonnables du client.",
  },
  {
    title: "5. Sous-traitants ulterieurs",
    text:
      "Les fournisseurs techniques identifies incluent notamment Supabase, Vercel, Resend, Stripe et GoCardless selon les modules actives. Leur usage doit etre maintenu dans un registre avec DPA et garanties de transfert.",
  },
  {
    title: "6. Securite",
    text:
      "ContratPro maintient des mesures techniques et organisationnelles proportionnees : controle d'acces, authentification, isolation des organisations, RLS, HTTPS, webhooks signes, journaux d'evenements et controles de deploiement.",
  },
  {
    title: "7. Violation de donnees",
    text:
      "En cas de violation de donnees personnelles affectant les donnees du client, ContratPro informe le client dans les meilleurs delais afin de l'aider a respecter ses obligations de notification.",
  },
  {
    title: "8. Restitution et suppression",
    text:
      "A la fin du contrat, les donnees doivent pouvoir etre exportees puis supprimees ou anonymisees selon les obligations legales, les delais contractuels et les instructions documentees du client.",
  },
  {
    title: "9. Audit et cooperation",
    text:
      "ContratPro fournit les informations raisonnablement necessaires pour demontrer le respect de ses obligations de sous-traitant, dans un cadre proportionne et compatible avec la securite de la plateforme.",
  },
];

export default function DpaPage() {
  return (
    <PublicShell>
      <PublicSection
        description="Base d'accord de traitement des donnees pour les clients B2B. A finaliser avec les informations societe et validation juridique."
        title="Accord de traitement des donnees"
      >
        <div className="public-legal-panel">
          <h1>DPA ContratPro</h1>
          <p>
            Ce document est une base de Data Processing Agreement pour les pilotes
            B2B. Il doit etre complete avec les informations legales de la societe,
            les sous-traitants reels et les conditions contractuelles finales avant
            signature client.
          </p>

          {dpaSections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
        </div>
      </PublicSection>
    </PublicShell>
  );
}
