export type PilotCriterion = {
  label: string;
  target: string;
  warning: string;
};

export type PilotQuestion = {
  label: string;
  prompt: string;
  successSignal: string;
};

export type PilotSessionBlock = {
  label: string;
  duration: string;
  goal: string;
  proof: string;
};

export const pilotCriteria: PilotCriterion[] = [
  {
    label: "Base clients",
    target: "50 a 300 clients exportables",
    warning: "Pas de fichier exploitable = test non prioritaire",
  },
  {
    label: "Contrats recurrents",
    target: "10 contrats d'entretien minimum",
    warning: "Moins de 10 contrats = ROI difficile a prouver",
  },
  {
    label: "Douleur cash-flow",
    target: "Relances, impayes ou echeances oubliees",
    warning: "Douleur faible = vente longue et prix conteste",
  },
  {
    label: "Decisionnaire",
    target: "Dirigeant ou conjoint administratif present",
    warning: "Technicien seul = retour terrain utile mais pas achat",
  },
];

export const pilotQuestions: PilotQuestion[] = [
  {
    label: "Import",
    prompt: "Importerais-tu ton vrai fichier dans ContratPro demain ?",
    successSignal: "Oui, avec moins de 3 corrections de colonnes.",
  },
  {
    label: "Relances",
    prompt: "Vois-tu au moins 3 contrats que tu relancerais vraiment ?",
    successSignal: "Le pilote cite les clients ou montants sans aide.",
  },
  {
    label: "Terrain",
    prompt: "La page mobile suffit-elle pour une visite entre deux clients ?",
    successSignal: "Oui pour consulter; objections notees pour offline/signature.",
  },
  {
    label: "SEPA",
    prompt: "Accepterais-tu de proposer le mandat SEPA a tes clients d'entretien ?",
    successSignal: "Oui sur nouveaux contrats ou renouvellements.",
  },
  {
    label: "Prix",
    prompt: "Signerais-tu a 49 EUR/mois ? Et a 99 EUR/mois avec SEPA ?",
    successSignal: "Au moins Starter accepte sans negociation lourde.",
  },
  {
    label: "Blocage",
    prompt: "Quelle fonction manquante t'empecherait de payer ?",
    successSignal: "Un blocage clair, pas une liste floue de souhaits.",
  },
];

export const pilotSessionBlocks: PilotSessionBlock[] = [
  {
    duration: "15 min",
    goal: "Comprendre le fichier reel et les colonnes disponibles.",
    label: "Qualification fichier",
    proof: "Fichier accepte + problemes de format notes.",
  },
  {
    duration: "20 min",
    goal: "Lancer le dry-run, lire erreurs et doublons avec le pilote.",
    label: "Import dry-run",
    proof: "Capture du rapport import.",
  },
  {
    duration: "20 min",
    goal: "Afficher contrats, relances IA et revenu recuperable.",
    label: "Cash-flow",
    proof: "3 contrats a relancer identifies.",
  },
  {
    duration: "15 min",
    goal: "Verifier page terrain, contrat, PDF et attestation.",
    label: "Terrain + documents",
    proof: "Un PDF ou une fiche contrat validee.",
  },
  {
    duration: "20 min",
    goal: "Tester la reaction prix, SEPA et prochaine etape.",
    label: "Decision",
    proof: "Scorecard remplie avec go/no-go.",
  },
];

export function getPilotScorecard() {
  return {
    criteria: pilotCriteria,
    questions: pilotQuestions,
    sessionBlocks: pilotSessionBlocks,
  };
}
