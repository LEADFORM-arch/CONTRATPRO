import { PublicShell } from "@/components/marketing/PublicShell";

const painPoints = [
  {
    problem: "Excel ne relance personne",
    solution: "ContratPro signale les contrats à sauver avant la date critique.",
  },
  {
    problem: "Les attestations partent trop tard",
    solution: "Le dossier client garde contrats, interventions, factures et PDF au même endroit.",
  },
  {
    problem: "Le revenu récurrent reste invisible",
    solution: "L'agent classe les actions par urgence, valeur annuelle et probabilité de perte.",
  },
];

const agentSteps = [
  {
    label: "DIAGNOSTIQUER",
    text: "Repère les contrats proches de l'échéance, les clients sans action récente et le revenu récurrent à risque.",
  },
  {
    label: "PRIORISER",
    text: "Classe les relances par score, urgence, valeur annuelle et risque commercial.",
  },
  {
    label: "PREPARER",
    text: "Propose un brief, un angle de relance et des variantes email, téléphone et SMS.",
  },
  {
    label: "VALIDER",
    text: "Maintient une validation humaine obligatoire avant toute sortie client.",
  },
];

const proofPoints = [
  "File de validation humaine dans les relances",
  "Score IA lisible par contrat et par client",
  "ROI potentiel calculé sur les contrats récupérables",
  "Messages proposés, jamais envoyés sans accord",
];

const faqs = [
  {
    answer:
      "Non. L'agent prépare la relance et explique son score. L'envoi reste bloqué jusqu'à validation humaine.",
    question: "L'IA envoie-t-elle des messages seule ?",
  },
  {
    answer:
      "Oui. L'import CSV/XLSX est prévu pour transformer un portefeuille existant en base exploitable sans ressaisie.",
    question: "Peut-on partir d'un fichier Excel ?",
  },
  {
    answer:
      "Les chauffagistes, climaticiens et entreprises CVC qui veulent sécuriser leurs contrats d'entretien.",
    question: "Pour qui est conçu ContratPro ?",
  },
];

export default function ArchitecteIaPage() {
  return (
    <PublicShell variant="openDesign">
      <section className="od-hero">
        <div className="od-hero-inner">
          <div className="od-hero-copy">
            <p className="od-eyebrow">ARCHITECTE IA DE CROISSANCE CVC</p>
            <h1>Ne perdez plus un contrat. Gagnez du temps.</h1>
            <p>
              ContratPro analyse vos contrats d'entretien, détecte les
              renouvellements à risque et prépare les relances les plus rentables
              pour protéger vos revenus récurrents avant qu'un client ne disparaisse.
            </p>
            <div className="od-actions">
              <a className="od-button od-button-success" href="/demo">
                VOIR LA DÉMO
              </a>
              <a className="od-button od-button-ghost" href="/pricing">
                COMPARER LES OFFRES
              </a>
            </div>
            <div className="od-trust-row" aria-label="Garanties ContratPro">
              <span>Import Excel</span>
              <span>Validation humaine</span>
              <span>Mobile terrain</span>
            </div>
          </div>

          <div className="od-product-shot" aria-label="Aperçu du tableau de bord ContratPro">
            <div className="od-shot-header">
              <span>Relances prioritaires</span>
              <strong>12 actions</strong>
            </div>
            <div className="od-score-card">
              <div>
                <span>ROI potentiel</span>
                <strong>8 460 EUR</strong>
              </div>
              <span className="od-score-pill">Score IA 91</span>
            </div>
            <div className="od-renewal-list">
              <div>
                <span>Chaudière gaz - Dupont</span>
                <strong>VALIDER</strong>
              </div>
              <div>
                <span>PAC air/eau - Martin</span>
                <strong>APPELER</strong>
              </div>
              <div>
                <span>Contrat annuel - Moreau</span>
                <strong>ENVOYER</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="od-section od-section-split">
        <div>
          <p className="od-eyebrow">PROBLÈME / SOLUTION</p>
          <h2>Vous perdez du revenu sur l'administratif ?</h2>
          <p>
            Un artisan CVC ne perd pas seulement du temps dans ses tableaux. Il
            perd des contrats quand les échéances ne sont pas visibles au bon
            moment.
          </p>
        </div>
        <div className="od-problem-stack">
          {painPoints.map((item) => (
            <article key={item.problem}>
              <strong>{item.problem}</strong>
              <p>{item.solution}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="od-section">
        <div className="od-section-heading">
          <p className="od-eyebrow">AGENT IA</p>
          <h2>Un copilote commercial, pas un automate aveugle.</h2>
          <p>
            L'Architecte IA transforme la base contrats en file d'actions
            commerciales. Chaque recommandation reste explicable et validable.
          </p>
        </div>
        <div className="od-agent-grid">
          {agentSteps.map((step) => (
            <article key={step.label}>
              <strong>{step.label}</strong>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="od-section od-band">
        <div className="od-section-heading">
          <p className="od-eyebrow">PREUVES</p>
          <h2>Conçu pour le terrain, pas pour impressionner un comité.</h2>
        </div>
        <div className="od-proof-grid">
          {proofPoints.map((point) => (
            <article key={point}>{point}</article>
          ))}
        </div>
      </section>

      <section className="od-section od-pricing-strip">
        <div>
          <p className="od-eyebrow">OFFRES</p>
          <h2>Commencez petit, gardez le ROI visible.</h2>
          <p>
            Les paliers 49 / 99 / 199 EUR permettent de vendre d'abord la valeur :
            import, relances, SEPA et supervision selon la maturité du client.
          </p>
        </div>
        <a className="od-button od-button-primary" href="/pricing">
          CHOISIR UNE OFFRE
        </a>
      </section>

      <section className="od-section od-faq">
        <div className="od-section-heading">
          <p className="od-eyebrow">QUESTIONS</p>
          <h2>Les points à clarifier avant la démo.</h2>
        </div>
        <div className="od-faq-grid">
          {faqs.map((item) => (
            <article key={item.question}>
              <strong>{item.question}</strong>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
        <div className="od-final-cta">
          <h2>Prêt à ne plus perdre de contrats ?</h2>
          <a className="od-button od-button-success" href="/demo">
            PROGRAMMER LA DÉMO
          </a>
        </div>
      </section>
    </PublicShell>
  );
}
