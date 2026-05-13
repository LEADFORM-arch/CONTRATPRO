import { PublicShell } from "@/components/marketing/PublicShell";

const painPoints = [
  {
    problem: "Excel ne relance personne",
    solution: "ContratPro signale les contrats a sauver avant la date critique.",
  },
  {
    problem: "Les attestations partent trop tard",
    solution: "Le dossier client garde contrats, interventions, factures et PDF au meme endroit.",
  },
  {
    problem: "Le revenu recurrent reste invisible",
    solution: "L'agent classe les actions par urgence, valeur annuelle et probabilite de perte.",
  },
];

const agentSteps = [
  {
    label: "DIAGNOSTIQUER",
    text: "Repere les contrats proches de l'echeance, les clients sans action recente et le revenu recurrent a risque.",
  },
  {
    label: "PRIORISER",
    text: "Classe les relances par score, urgence, valeur annuelle et risque commercial.",
  },
  {
    label: "PREPARER",
    text: "Propose un brief, un angle de relance et des variantes email, telephone et SMS.",
  },
  {
    label: "VALIDER",
    text: "Maintient une validation humaine obligatoire avant toute sortie client.",
  },
];

const proofPoints = [
  "File de validation humaine dans les relances",
  "Score IA lisible par contrat et par client",
  "ROI potentiel calcule sur les contrats recuperables",
  "Messages proposes, jamais envoyes sans accord",
];

const faqs = [
  {
    answer:
      "Non. L'agent prepare la relance et explique son score. L'envoi reste bloque jusqu'a validation humaine.",
    question: "L'IA envoie-t-elle des messages seule ?",
  },
  {
    answer:
      "Oui. L'import CSV/XLSX est prevu pour transformer un portefeuille existant en base exploitable sans ressaisie.",
    question: "Peut-on partir d'un fichier Excel ?",
  },
  {
    answer:
      "Les chauffagistes, climaticiens et entreprises CVC qui veulent securiser leurs contrats d'entretien.",
    question: "Pour qui est concu ContratPro ?",
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
              ContratPro analyse vos contrats d'entretien, detecte les
              renouvellements a risque et prepare les relances les plus rentables
              pour proteger vos revenus recurrents avant qu'un client ne disparaisse.
            </p>
            <div className="od-actions">
              <a className="od-button od-button-success" href="/demo">
                VOIR LA DEMO
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

          <div className="od-product-shot" aria-label="Apercu du tableau de bord ContratPro">
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
                <span>Chaudiere gaz - Dupont</span>
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
          <p className="od-eyebrow">PROBLEME / SOLUTION</p>
          <h2>Vous perdez du revenu sur l'administratif ?</h2>
          <p>
            Un artisan CVC ne perd pas seulement du temps dans ses tableaux. Il
            perd des contrats quand les echeances ne sont pas visibles au bon
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
          <h2>Concu pour le terrain, pas pour impressionner un comite.</h2>
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
            import, relances, SEPA et supervision selon la maturite du client.
          </p>
        </div>
        <a className="od-button od-button-primary" href="/pricing">
          CHOISIR UNE OFFRE
        </a>
      </section>

      <section className="od-section od-faq">
        <div className="od-section-heading">
          <p className="od-eyebrow">QUESTIONS</p>
          <h2>Les points a clarifier avant la demo.</h2>
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
          <h2>Pret a ne plus perdre de contrats ?</h2>
          <a className="od-button od-button-success" href="/demo">
            PROGRAMMER LA DEMO
          </a>
        </div>
      </section>
    </PublicShell>
  );
}
