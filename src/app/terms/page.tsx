import type { Metadata } from "next";

import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  alternates: {
    canonical: "/terms",
  },
  description:
    "Conditions generales ContratPro : objet du service, abonnement, responsabilites, donnees et resiliation.",
  title: "Conditions generales ContratPro",
};

const clauses = [
  [
    "Objet",
    "ContratPro fournit un logiciel de gestion des contrats de maintenance CVC : clients, equipements, contrats, echeances, relances, factures, attestations, paiements et supervision.",
  ],
  [
    "Acces au service",
    "Le service est reserve aux professionnels. L'acces peut etre soumis a authentification, abonnement actif et respect des conditions de securite de l'organisation cliente.",
  ],
  [
    "Prix",
    "Les offres ContratPro sont commercialisees a partir de 49 EUR HT par mois et peuvent evoluer selon le palier choisi, l'accompagnement, le volume et les accords commerciaux specifiques.",
  ],
  [
    "Responsabilite client",
    "Le client reste responsable de l'exactitude des donnees saisies ou importees, de ses obligations metier CVC, de la validation des documents envoyes et de l'information de ses propres clients finaux.",
  ],
  [
    "Donnees personnelles",
    "Les traitements de donnees sont decrits dans la politique de confidentialite et, lorsque ContratPro agit comme sous-traitant, dans l'accord de traitement des donnees.",
  ],
  [
    "Paiements",
    "Les paiements SaaS peuvent etre traites par Stripe. Les prelevements SEPA des contrats CVC peuvent etre prepares via GoCardless selon la configuration activee et les validations juridiques necessaires.",
  ],
  [
    "Disponibilite",
    "ContratPro met en oeuvre des moyens raisonnables pour maintenir le service, surveiller les incidents et informer les administrateurs en cas de signal critique.",
  ],
  [
    "Resiliation",
    "L'abonnement peut etre gere via le portail de facturation lorsque celui-ci est active en production. Les conditions de sortie, export et suppression doivent etre precisees dans le contrat client final.",
  ],
];

export default function TermsPage() {
  return (
    <PublicShell>
      <PublicSection
        description="Base de conditions generales B2B a faire valider juridiquement avant signature client."
        title="Conditions generales de vente"
      >
        <div className="public-legal-panel">
          <p>
            Cette page constitue une base de travail. Elle ne remplace pas des
            CGV relues et validees par un professionnel du droit avant lancement
            commercial public.
          </p>
          {clauses.map(([title, text]) => (
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
