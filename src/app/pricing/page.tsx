import { billingPlans } from "@/lib/billing-plans";
import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";

const setupItems = [
  "Import CSV/XLSX clients et contrats",
  "Controle des doublons avant mise en production",
  "Verification Stripe, GoCardless et emails",
];

export default function PricingPage() {
  return (
    <PublicShell>
      <PublicHero
        action={
          <>
            <a className="premium-action rounded-md text-sm font-semibold" href="/demo">
              Voir la demo
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/login">
              Acces client
            </a>
          </>
        }
        description="Trois paliers pour demarrer bas, prouver le ROI, puis ajouter SEPA, relances automatiques et supervision."
        eyebrow="Tarifs SaaS"
        title="ContratPro securise les revenus recurrents CVC."
      />

      <PublicSection
        description="Un artisan peut commencer a 49 EUR/mois ; l'offre premium reste disponible avec onboarding accompagne."
        title="Choisir le bon niveau"
      >
        <div className="public-pricing-grid public-pricing-grid-three">
          {billingPlans.map((plan) => (
            <article className="public-price-panel" key={plan.id}>
              <p className="text-sm font-semibold text-emerald-300">
                ContratPro {plan.name}
              </p>
              <strong>{plan.priceLabel}</strong>
              <span>/ mois</span>
              <p>{plan.description}</p>
              <div className="public-feature-list public-feature-list-compact">
                {plan.features.map((feature) => (
                  <div key={feature}>
                    <span />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
              <a className="premium-action mt-4 rounded-md text-sm font-semibold" href="/demo">
                Demander une demo
              </a>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Recommande pour les 5 premiers clients pilotes : on vend un passage en production, pas seulement un acces logiciel."
        title="Setup accompagne"
      >
        <div className="public-feature-list">
          {setupItems.map((item) => (
            <div key={item}>
              <span />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </PublicSection>
    </PublicShell>
  );
}
