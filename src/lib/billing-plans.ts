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
    description: "Pour un artisan solo qui veut sortir du tableur sans complexite.",
    features: [
      "Clients et contrats annuels",
      "Relances de renouvellement",
      "Attestations et factures PDF",
      "Import CSV/XLSX accompagne",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "99 EUR",
    unitAmount: 9900,
    envKey: "STRIPE_PRICE_ID_PRO",
    lookupKey: "contratpro_pro_monthly_99_eur",
    description: "Pour une TPE CVC qui veut piloter relances, documents et cash.",
    features: [
      "Tout Starter",
      "Paiements SEPA GoCardless",
      "Cron de relance quotidien",
      "Notifications internes",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceLabel: "199 EUR",
    unitAmount: 19900,
    envKey: "STRIPE_PRICE_ID_BUSINESS",
    lookupKey: "contratpro_business_monthly_199_eur",
    description: "Pour une equipe 3-10 techniciens avec besoin de supervision.",
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
