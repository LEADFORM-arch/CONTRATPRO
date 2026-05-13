export type BillingPlanId = "starter" | "pro" | "business";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  priceLabel: string;
  unitAmount: number;
  envKey: string;
  lookupKey: string;
  description: string;
  features: string[];
};

export const billingPlans: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "49 EUR",
    unitAmount: 4900,
    envKey: "STRIPE_PRICE_ID_STARTER",
    lookupKey: "contratpro_starter_monthly_49_eur",
    description: "Pour transformer un Excel en portefeuille relancable sans changer tout le logiciel terrain.",
    features: [
      "Import clients et contrats",
      "Relances email de renouvellement",
      "Attestations et factures PDF",
      "Tableau ROI des contrats a sauver",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "99 EUR",
    unitAmount: 9900,
    envKey: "STRIPE_PRICE_ID_PRO",
    lookupKey: "contratpro_pro_monthly_99_eur",
    description: "Pour ajouter l'encaissement SEPA automatique et mesurer le cash-flow recupere.",
    features: [
      "Tout Starter",
      "Paiements SEPA GoCardless",
      "Cron de relance quotidien",
      "Notifications impayes et webhooks",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceLabel: "199 EUR",
    unitAmount: 19900,
    envKey: "STRIPE_PRICE_ID_BUSINESS",
    lookupKey: "contratpro_business_monthly_199_eur",
    description: "Pour une equipe qui veut un passage en production accompagne et surveille.",
    features: [
      "Tout Pro",
      "Supervision production",
      "Onboarding prioritaire",
      "Support fondateur et pilotage go-live",
    ],
  },
];

export const defaultBillingPlanId: BillingPlanId = "pro";

export function getBillingPlan(planId: string | null | undefined) {
  return billingPlans.find((plan) => plan.id === planId) ?? billingPlans[1];
}
