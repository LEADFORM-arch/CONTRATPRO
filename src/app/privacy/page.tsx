import type { Metadata } from "next";

import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  alternates: {
    canonical: "/privacy",
  },
  description:
    "Politique de confidentialite ContratPro : donnees traitees, finalites, sous-traitants, droits RGPD et securite.",
  title: "Politique de confidentialite ContratPro",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const rgpdEmail = contactEmail || "adresse RGPD a completer avant lancement public";

const sections = [
  {
    title: "1. Responsable et perimetre",
    text:
      "Cette politique decrit les traitements realises pour l'application ContratPro, logiciel B2B de gestion des contrats de maintenance CVC. Les informations de societe, SIRET, RCS, capital, siege et representant legal doivent etre completees avant commercialisation publique.",
  },
  {
    title: "2. Donnees traitees",
    text:
      "ContratPro traite les donnees necessaires au service : entreprise cliente, utilisateurs, clients finaux, coordonnees professionnelles, equipements CVC, contrats, interventions, attestations, factures, relances, paiements, journaux techniques et preuves d'envoi.",
  },
  {
    title: "3. Finalites",
    text:
      "Les donnees servent a fournir le service, securiser l'acces, importer les fichiers clients, suivre les contrats, generer les documents, preparer les relances, suivre les paiements, assurer le support et maintenir la supervision technique.",
  },
  {
    title: "4. Bases juridiques",
    text:
      "Les traitements reposent selon les cas sur l'execution du contrat, l'obligation legale, l'interet legitime de securite et de gestion B2B, ou le consentement pour les cookies non essentiels et certains usages marketing.",
  },
  {
    title: "5. Role de ContratPro",
    text:
      "Pour les donnees des entreprises clientes, ContratPro agit comme responsable du traitement. Pour les donnees des clients finaux importees par un chauffagiste, ContratPro agit en principe comme sous-traitant du chauffagiste, selon ses instructions documentees.",
  },
  {
    title: "6. Sous-traitants",
    text:
      "Les sous-traitants techniques peuvent inclure Supabase, Vercel, Resend, Stripe et GoCardless selon les modules actives. Chaque fournisseur doit etre verifie avant mise en production : DPA, localisation, transferts hors UE, garanties contractuelles et mesures de securite.",
  },
  {
    title: "7. Conservation",
    text:
      "Les durees de conservation doivent etre limitees aux finalites : donnees de compte pendant l'abonnement puis delai d'export, donnees contractuelles selon prescription applicable, donnees comptables selon obligations legales, logs techniques selon besoin de securite.",
  },
  {
    title: "8. Securite",
    text:
      "ContratPro met en oeuvre des mesures de securite proportionnees : HTTPS, authentification, isolation par organisation, politiques RLS Supabase, controles d'acces, webhooks signes, journaux d'evenements et controles de deploiement.",
  },
  {
    title: "9. Cookies",
    text:
      "Les cookies essentiels servent au fonctionnement du service. Les cookies statistiques ou marketing ne sont pas charges sans consentement. Les choix peuvent etre modifies depuis le lien Gerer mes cookies.",
  },
  {
    title: "10. Droits des personnes",
    text:
      "Les personnes concernees peuvent demander acces, rectification, effacement, limitation, opposition ou portabilite lorsque ces droits sont applicables. Les demandes sont traitees via l'adresse de contact RGPD indiquee ci-dessous.",
  },
];

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PublicSection
        description="Base RGPD B2B reprise depuis les documents fournis. A valider juridiquement avant lancement commercial public."
        title="Politique de confidentialite"
      >
        <div className="public-legal-panel">
          <p>
            Derniere mise a jour : a completer avant publication officielle. Cette
            page est une base de travail operationnelle pour le pilote ContratPro.
          </p>

          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}

          <section>
            <h2>Contact RGPD</h2>
            <p>
              Pour exercer un droit ou poser une question :{" "}
              {contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : rgpdEmail}
              . Une adresse dediee de type rgpd@votre-domaine.fr devra etre
              configuree avec le domaine final.
            </p>
          </section>
        </div>
      </PublicSection>
    </PublicShell>
  );
}
