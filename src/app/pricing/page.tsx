import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";

const features = [
  "Contrats annuels et echeances de renouvellement",
  "PDF factures et attestations serveur",
  "Relances email et cron quotidien",
  "Paiements SEPA et suivi provider",
  "Import Praxedo et base clients",
  "Supervision production et alertes internes",
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
        description="Un tarif clair pour les chauffagistes et TPE CVC qui veulent transformer l'entretien annuel en revenu recurrent pilotable."
        eyebrow="Tarif SaaS"
        title="ContratPro Pro, 200 EUR par mois et par entreprise."
      />

      <PublicSection
        description="Un prix unique, comprehensible en rendez-vous commercial, avec toutes les briques indispensables incluses."
        title="Ce qui est inclus"
      >
        <div className="public-pricing-grid">
          <article className="public-price-panel">
            <p className="text-sm font-semibold text-emerald-300">ContratPro Pro</p>
            <strong>200 EUR</strong>
            <span>/ mois</span>
            <p>
              Pense pour un dirigeant CVC qui veut suivre ses contrats, relances,
              documents et paiements sans tableur disperse.
            </p>
            <a className="premium-action rounded-md text-sm font-semibold" href="/demo">
              Demander une demo
            </a>
          </article>

          <div className="public-feature-list">
            {features.map((feature) => (
              <div key={feature}>
                <span />
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </PublicSection>
    </PublicShell>
  );
}
