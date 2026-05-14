import { billingPlans } from "@/lib/billing-plans";
import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";

const setupItems = [
  "Import CSV/XLSX clients et contrats",
  "Activation SEPA GoCardless sur les contrats recurrents",
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
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/simulateur">
              Calculer le ROI
            </a>
          </>
        }
        description="Trois paliers pour demarrer bas, prouver le ROI, puis ajouter SEPA, relances automatiques et supervision."
        eyebrow="Cash-flow CVC"
        title="Encaissez vos contrats d'entretien sans courir apres les relances."
      />

      <PublicSection
        description="Le prix doit se lire comme un investissement : contrats recuperes, impayes reduits, temps administratif evite."
        title="Choisir le niveau de cash-flow"
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
              <a
                className="premium-action mt-4 rounded-md text-sm font-semibold"
                href={`/login?plan=${plan.id}`}
              >
                Choisir {plan.name}
              </a>
              <a
                className="premium-secondary-action mt-3 inline-flex rounded-md px-4 py-2 text-sm font-semibold"
                href={`/simulateur?plan=${plan.id}`}
              >
                Tester le ROI
              </a>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Recommande pour les 5 premiers clients pilotes : on vend un revenu recurrent plus fiable, pas un logiciel de plus."
        title="Passage en production accompagne"
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
