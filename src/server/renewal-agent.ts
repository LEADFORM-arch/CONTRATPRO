type RenewalInput = {
  channel: string;
  city: string;
  contact: string;
  customer: string;
  daysRemaining: number;
  endDate: string;
  equipment: string;
  id: string;
  paymentMethod: string;
  priority: string;
  script: string;
  value: number;
};

type RenewalActionInput = {
  contractId: string;
  rawStatus: string;
};

export type RenewalAgentRecommendation = {
  action: string;
  contractId: string;
  customer: string;
  decisionBrief: string;
  expectedValue: number;
  humanValidation: "required";
  message: string;
  messageVariants: Array<{
    channel: "email" | "phone" | "sms";
    label: string;
    text: string;
  }>;
  reasons: string[];
  riskLevel: "critical" | "high" | "watch";
  roiLabel: string;
  score: number;
  subject: string;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function hasRecentAction(actions: RenewalActionInput[], contractId: string) {
  return actions.some(
    (action) =>
      action.contractId === contractId &&
      ["SENT", "REPLIED", "WON"].includes(action.rawStatus),
  );
}

function scoreRenewal(renewal: RenewalInput, actions: RenewalActionInput[]) {
  let score = 20;

  if (renewal.daysRemaining <= 0) {
    score += 45;
  } else if (renewal.daysRemaining <= 15) {
    score += 35;
  } else if (renewal.daysRemaining <= 30) {
    score += 25;
  } else if (renewal.daysRemaining <= 45) {
    score += 15;
  }

  if (renewal.value >= 500) {
    score += 18;
  } else if (renewal.value >= 250) {
    score += 12;
  } else if (renewal.value >= 120) {
    score += 7;
  }

  if (renewal.paymentMethod.includes("SEPA")) {
    score += 8;
  }

  if (renewal.contact === "-") {
    score += 10;
  }

  if (hasRecentAction(actions, renewal.id)) {
    score -= 35;
  }

  return clamp(score);
}

function riskLevel(score: number): RenewalAgentRecommendation["riskLevel"] {
  if (score >= 75) {
    return "critical";
  }
  if (score >= 55) {
    return "high";
  }
  return "watch";
}

function nextAction(renewal: RenewalInput, score: number) {
  if (renewal.contact === "-") {
    return "Compléter le contact client avant relance.";
  }
  if (score >= 75 && renewal.daysRemaining <= 15) {
    return "Valider un email court puis appeler le client le même jour.";
  }
  if (renewal.paymentMethod.includes("SEPA")) {
    return "Valider l'email avec rappel du mandat SEPA et suivi automatique.";
  }
  return "Valider l'email de renouvellement et journaliser le retour client.";
}

function decisionBrief(renewal: RenewalInput, score: number) {
  if (score >= 75) {
    return `${renewal.customer} doit être traité en priorité : ${renewal.value.toLocaleString(
      "fr-FR",
    )} € annuels et échéance ${renewal.endDate}.`;
  }
  if (score >= 55) {
    return `${renewal.customer} est dans la fenêtre commerciale active : valider le message puis suivre la réponse.`;
  }
  return `${renewal.customer} reste en surveillance : action utile mais non prioritaire aujourd'hui.`;
}

function messageVariants(renewal: RenewalInput) {
  const emailText = renewal.script;
  const phoneText = `Bonjour ${renewal.customer}, je vous appelle car votre contrat d'entretien pour ${renewal.equipment} arrive à échéance le ${renewal.endDate}. Je voulais vérifier avec vous si on le renouvelle pour maintenir le suivi annuel et l'attestation.`;
  const smsText = `Bonjour, votre contrat d'entretien ${renewal.equipment} arrive à échéance le ${renewal.endDate}. Souhaitez-vous le renouveler ?`;

  return [
    {
      channel: "email" as const,
      label: "Email principal",
      text: emailText,
    },
    {
      channel: "phone" as const,
      label: "Script appel",
      text: phoneText,
    },
    {
      channel: "sms" as const,
      label: "SMS court",
      text: smsText,
    },
  ];
}

function reasons(renewal: RenewalInput, score: number) {
  const items: string[] = [];

  if (renewal.daysRemaining <= 0) {
    items.push("Contrat déjà arrivé à échéance.");
  } else if (renewal.daysRemaining <= 15) {
    items.push("Échéance à moins de 15 jours.");
  } else if (renewal.daysRemaining <= 45) {
    items.push("Fenêtre commerciale active avant échéance.");
  }

  if (renewal.value >= 250) {
    items.push("Montant annuel significatif à protéger.");
  }

  if (renewal.paymentMethod.includes("SEPA")) {
    items.push("Paiement SEPA exploitable pour réduire la friction.");
  }

  if (score < 55) {
    items.push("À surveiller sans action urgente.");
  }

  return items;
}

export function analyzeRenewalAgent(
  renewals: RenewalInput[],
  actions: RenewalActionInput[],
) {
  const recommendations = renewals
    .map((renewal) => {
      const score = scoreRenewal(renewal, actions);
      return {
        action: nextAction(renewal, score),
        contractId: renewal.id,
        customer: renewal.customer,
        decisionBrief: decisionBrief(renewal, score),
        expectedValue: renewal.value,
        humanValidation: "required" as const,
        message: renewal.script,
        messageVariants: messageVariants(renewal),
        reasons: reasons(renewal, score),
        riskLevel: riskLevel(score),
        roiLabel: `${renewal.value.toLocaleString("fr-FR")} EUR a securiser`,
        score,
        subject: `Renouvellement contrat entretien - ${renewal.customer}`,
      };
    })
    .sort((a, b) => b.score - a.score);

  const critical = recommendations.filter((item) => item.riskLevel === "critical");
  const high = recommendations.filter((item) => item.riskLevel === "high");

  return {
    criticalCount: critical.length,
    highCount: high.length,
    recommendations,
    topRecommendations: recommendations.slice(0, 3),
    totalExpectedValue: recommendations
      .filter((item) => item.score >= 55)
      .reduce((sum, item) => sum + item.expectedValue, 0),
    validationQueue: recommendations.filter((item) => item.score >= 55).length,
  };
}
