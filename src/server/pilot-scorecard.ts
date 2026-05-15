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

export type PilotDemoScriptStep = {
  label: string;
  line: string;
  objective: string;
  proof: string;
  timing: string;
};

export type PilotObjection = {
  answer: string;
  objection: string;
  pivot: string;
};

export type PilotDecisionNote = {
  checklist: string[];
  decision: "sell" | "iterate" | "stop";
  label: string;
  nextAction: string;
  note: string;
  trigger: string;
};

export type PilotArchitectInsight = {
  action: string;
  decision: "sell" | "iterate" | "stop";
  evidence: string;
  label: string;
  signal: string;
};

export type PilotArchitectKpi = {
  delta: string;
  label: string;
  value: string;
};

export type PilotSignalPoint = {
  label: string;
  score: number;
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

export const pilotDemoScript: PilotDemoScriptStep[] = [
  {
    label: "Ouverture",
    line: "Je ne vais pas vous vendre un logiciel aujourd'hui. Je veux voir si ContratPro vous fait gagner ou recuperer de l'argent sur vos contrats d'entretien.",
    objective: "Installer une posture de diagnostic, pas de demo catalogue.",
    proof: "Le pilote accepte de parler fichier, relances et prix des les 5 premieres minutes.",
    timing: "5 min",
  },
  {
    label: "Fichier reel",
    line: "Montrez-moi comment vous retrouvez aujourd'hui les clients a relancer ce mois-ci.",
    objective: "Faire emergir la douleur actuelle avant de montrer l'interface.",
    proof: "Le pilote cite Excel, agenda, papier, memoire ou logiciel generaliste.",
    timing: "10 min",
  },
  {
    label: "Import",
    line: "On va commencer par un dry-run: rien n'est cree tant que le rapport n'est pas compris.",
    objective: "Reduire la peur de casser la base client.",
    proof: "Le pilote comprend les colonnes corrigeables et les doublons.",
    timing: "15 min",
  },
  {
    label: "Valeur",
    line: "Ces contrats-la, est-ce que vous les relanceriez vraiment si ContratPro les sortait chaque semaine ?",
    objective: "Relier la demo au revenu recuperable.",
    proof: "Le pilote nomme au moins 3 clients ou montants.",
    timing: "15 min",
  },
  {
    label: "Prix",
    line: "Si ContratPro vous evite d'oublier 3 contrats par an, est-ce que 49 euros par mois est coherent ? Et 99 euros avec SEPA ?",
    objective: "Tester l'intention de payer sans attendre la fin.",
    proof: "Starter ou Pro obtient un oui, une objection claire ou un non explicite.",
    timing: "10 min",
  },
  {
    label: "Cloture",
    line: "Je vous classe en Vendre, Iterer ou Stop. Quelle est la seule chose qui vous empecherait de continuer le pilote ?",
    objective: "Sortir avec une decision exploitable.",
    proof: "Une prochaine action datee ou une objection bloquante ecrite.",
    timing: "5 min",
  },
];

export const pilotObjections: PilotObjection[] = [
  {
    objection: "J'ai deja Excel.",
    answer: "Justement. ContratPro ne remplace pas votre fichier le premier jour: il transforme ce fichier en relances, documents et encaissements suivis.",
    pivot: "Ouvrir /import et montrer le dry-run sans creation.",
  },
  {
    objection: "49 euros, c'est cher.",
    answer: "On ne le justifie pas au temps gagne, mais au contrat recupere. Un seul renouvellement de 180 a 300 euros couvre plusieurs mois.",
    pivot: "Ouvrir /simulateur ou /relances et isoler 3 contrats concrets.",
  },
  {
    objection: "Je n'aime pas le prelevement SEPA.",
    answer: "SEPA n'est pas obligatoire au depart. Starter sert a securiser les echeances; Pro sert a automatiser l'encaissement quand vous etes pret.",
    pivot: "Ouvrir /pricing puis /payments sans declencher d'encaissement.",
  },
  {
    objection: "Il me faut une app terrain complete.",
    answer: "ContratPro n'est pas une GMAO lourde. Le pari est de proteger le revenu recurrent avant d'ajouter toute la tournee.",
    pivot: "Ouvrir /terrain et demander ce qui bloque vraiment l'usage mobile.",
  },
];

export const pilotDecisionNotes: PilotDecisionNote[] = [
  {
    checklist: [
      "Le pilote a identifie au moins 3 contrats relancables.",
      "Le prix Starter ou Pro n'a pas bloque la discussion.",
      "La prochaine action est datee avec une personne responsable.",
    ],
    decision: "sell",
    label: "Vendre",
    nextAction: "Envoyer une proposition Starter/Pro et planifier l'import complet sous 48h.",
    note:
      "Decision: Vendre. Le pilote comprend la valeur cash-flow de ContratPro, voit des contrats a relancer et accepte un prix Starter/Pro. Prochaine etape: proposition commerciale + import accompagne.",
    trigger: "Signal achat clair",
  },
  {
    checklist: [
      "La douleur relance ou cash-flow existe vraiment.",
      "Une objection produit precise empeche la signature.",
      "La correction peut etre livree sans devier du coeur contrats.",
    ],
    decision: "iterate",
    label: "Iterer",
    nextAction: "Documenter l'objection, corriger le point bloquant puis refaire un test cible.",
    note:
      "Decision: Iterer. Le pilote voit la valeur, mais une objection terrain, import, document ou SEPA bloque l'achat. Ne pas ajouter de promesse floue: corriger le blocage unique et retester le prix.",
    trigger: "Valeur comprise, achat bloque",
  },
  {
    checklist: [
      "Pas de fichier exploitable ou moins de 10 contrats recurrents.",
      "Le pilote cherche surtout une GMAO ou une tournee technicien.",
      "Le prix acceptable reste sous 49 EUR/mois.",
    ],
    decision: "stop",
    label: "Stop",
    nextAction: "Ne pas relancer ce profil. Chercher un pilote avec base clients + contrats recurrents.",
    note:
      "Decision: Stop. Le profil ne valide pas le segment prioritaire: pas assez de contrats recurrents, pas de douleur relance ou besoin principal hors ContratPro. Garder l'apprentissage, mais ne pas vendre a ce segment maintenant.",
    trigger: "Mauvais segment",
  },
];

export const pilotArchitectInsights: PilotArchitectInsight[] = [
  {
    action: "Proposer Starter immediatement et programmer l'import complet.",
    decision: "sell",
    evidence: "Le pilote dit oui a 49 EUR/mois ou demande quand commencer.",
    label: "Signal achat",
    signal: "Le prix n'est plus discute, seule la mise en route reste a cadrer.",
  },
  {
    action: "Recentrer la demo sur SEPA + relances, puis retester le prix Pro.",
    decision: "iterate",
    evidence: "Le pilote voit la valeur mais bloque sur une fonction terrain.",
    label: "Signal iteration",
    signal: "La douleur cash-flow existe, mais le produit n'est pas encore assez complet.",
  },
  {
    action: "Ne pas relancer ce segment, documenter l'objection et chercher un meilleur profil.",
    decision: "stop",
    evidence: "Pas de fichier, pas de contrats recurrents, pas de douleur relance.",
    label: "Signal stop",
    signal: "Le pilote veut un logiciel de tournee complet, pas un moteur de cash-flow.",
  },
];

export const pilotArchitectKpis: PilotArchitectKpi[] = [
  {
    delta: "seuil minimum",
    label: "Pilotes a mener",
    value: "3",
  },
  {
    delta: "avant prospection large",
    label: "Intention de payer",
    value: "1",
  },
  {
    delta: "comprehension import",
    label: "Dry-run compris",
    value: "15 min",
  },
  {
    delta: "Starter ou Pro",
    label: "Prix teste",
    value: "49/99",
  },
];

export const pilotSignalSequence: PilotSignalPoint[] = [
  { label: "Fichier", score: 72 },
  { label: "Import", score: 84 },
  { label: "Relance", score: 91 },
  { label: "Terrain", score: 68 },
  { label: "SEPA", score: 78 },
  { label: "Prix", score: 86 },
];

export function getPilotArchitectSummary() {
  return {
    headline: "Architecte IA pilote",
    kpis: pilotArchitectKpis,
    thesis:
      "Ne cherche pas une validation polie. Cherche un signal d'achat: fichier reel importe, contrats a relancer identifies, prix accepte ou objection bloquante explicite.",
    primaryMetric: "3 pilotes",
    secondaryMetric: "1 intention de payer",
    insights: pilotArchitectInsights,
    nextMove:
      "Apres chaque rendez-vous, classer le pilote en Vendre / Iterer / Stop avant d'ajouter une nouvelle feature.",
    signalSequence: pilotSignalSequence,
  };
}

export function getPilotScorecard() {
  return {
    architect: getPilotArchitectSummary(),
    criteria: pilotCriteria,
    demoScript: pilotDemoScript,
    decisionNotes: pilotDecisionNotes,
    objections: pilotObjections,
    questions: pilotQuestions,
    sessionBlocks: pilotSessionBlocks,
  };
}
