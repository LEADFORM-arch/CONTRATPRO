import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";

const sections = [
  [
    "Donnees traitees",
    "ContratPro traite les informations necessaires a la gestion CVC : entreprise, utilisateurs, clients finaux, equipements, contrats, interventions, attestations, factures, paiements et historiques d'envoi.",
  ],
  [
    "Finalites",
    "Les données servent à fournir le service ContratPro, sécuriser l’accès, générer les documents, envoyer les relances, suivre les paiements et assurer la supervision technique.",
  ],
  [
    "Sous-traitants",
    "Supabase, Vercel, Resend, Stripe et GoCardless peuvent intervenir selon les modules actives. Les comptes de production doivent etre configures avec les garanties contractuelles adaptees.",
  ],
  [
    "Droits",
    "Les utilisateurs peuvent demander accès, rectification, suppression ou export des données via l’adresse de contact de l’éditeur.",
  ],
];

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PublicSection
        description="Base de politique de confidentialite pour une exploitation B2B. A faire relire avant lancement commercial public."
        title="Politique de confidentialite"
      >
        <div className="public-legal-panel">
          {sections.map(([title, text]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </PublicSection>
    </PublicShell>
  );
}
