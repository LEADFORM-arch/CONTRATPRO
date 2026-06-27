import type { Metadata } from "next";

import { billingPlans } from "@/lib/billing-plans";
import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";
import { StructuredData } from "@/components/marketing/StructuredData";

export const metadata: Metadata = {
  title: "Tarifs ContratPro Starter, Pro et Business",
  description:
    "Comparez les offres ContratPro pour chauffagistes : import contrats, relances, attestations, factures, SEPA et accompagnement.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    description:
      "Des offres lisibles pour récupérer du revenu récurrent sur les contrats d’entretien CVC.",
    title: "Tarifs ContratPro - Logiciel contrats entretien CVC",
    url: "/pricing",
  },
};

const setupItems = [
  "Import CSV/XLSX clients et contrats",
  "Activation SEPA GoCardless sur les contrats récurrents",
  "Contrôle des doublons avant mise en production",
  "Vérification Stripe, GoCardless et emails",
];

const pricingStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  brand: {
    "@type": "Brand",
    name: "ContratPro",
  },
  category: "Logiciel de gestion des contrats de maintenance CVC",
  description:
    "Offres ContratPro pour importer, relancer, documenter et encaisser les contrats d'entretien CVC.",
  name: "ContratPro",
  offers: billingPlans.map((plan) => ({
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    name: `ContratPro ${plan.name}`,
    price: String(plan.unitAmount / 100),
    priceCurrency: "EUR",
    url: `https://contratpro-dun.vercel.app/pricing#${plan.id}`,
  })),
  url: "https://contratpro-dun.vercel.app/pricing",
};

export default function PricingPage() {
  return (
    <PublicShell>
      <StructuredData data={pricingStructuredData} />
      <PublicHero
        action={
          <>
            <a className="cp-btn cp-btn-primary" href="/demo">
              Voir la démo
            </a>
            <a className="cp-btn cp-btn-secondary" href="/simulateur">
              Calculer le ROI
            </a>
          </>
        }
        description="Trois paliers pour démarrer bas, prouver le ROI, puis ajouter SEPA, relances automatiques et supervision."
        eyebrow="Cash-flow CVC"
        title="Encaissez vos contrats d’entretien sans courir après les relances."
      />

      <PublicSection
        description="Le prix doit se lire comme un investissement : contrats récupérés, impayés réduits, temps administratif évité."
        title="Choisir le niveau de cash-flow"
      >
        <div className="public-pricing-grid public-pricing-grid-three">
          {billingPlans.map((plan) => (
            <article className="public-price-panel" id={plan.id} key={plan.id}>
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
                className="cp-btn cp-btn-primary cp-btn-sm mt-4"
                href={`/login?plan=${plan.id}`}
              >
                Choisir {plan.name}
              </a>
              <a
                className="cp-btn cp-btn-secondary cp-btn-sm mt-3"
                href={`/simulateur?plan=${plan.id}`}
              >
                Tester le ROI
              </a>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Recommandé pour les 5 premiers clients pilotes : on vend un revenu récurrent plus fiable, pas un logiciel de plus."
        title="Passage en production accompagné"
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
