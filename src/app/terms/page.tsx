import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";

const clauses = [
  [
    "Objet",
    "ContratPro fournit un logiciel de gestion des contrats de maintenance CVC, incluant suivi clients, contrats, documents, relances, paiements et supervision.",
  ],
  [
    "Prix",
    "Les offres ContratPro sont commercialisees a partir de 49 EUR HT par mois et peuvent evoluer selon le palier choisi, les options d'onboarding et les accords commerciaux specifiques.",
  ],
  [
    "Responsabilite",
    "Le client reste responsable de l'exactitude des donnees saisies, des obligations reglementaires applicables a son activite et de la validation des documents envoyes.",
  ],
  [
    "Disponibilite",
    "ContratPro met en oeuvre des moyens raisonnables pour maintenir le service, surveiller les incidents et informer les administrateurs en cas de signal critique.",
  ],
  [
    "Resiliation",
    "L'abonnement peut etre gere via le portail de facturation Stripe lorsque celui-ci est active en production.",
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
