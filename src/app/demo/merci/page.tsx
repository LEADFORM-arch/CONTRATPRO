import type { Metadata } from "next";

import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";
import { StructuredData } from "@/components/marketing/StructuredData";

export const metadata: Metadata = {
  title: "Demande démo reçue",
  description:
    "Votre demande de démonstration ContratPro a bien été transmise. Préparez votre fichier clients, vos contrats et vos questions avant l’échange.",
  alternates: {
    canonical: "/demo/merci",
  },
  robots: {
    follow: false,
    index: false,
  },
};

const nextSteps = [
  [
    "1",
    "Qualification",
    "Votre demande remonte dans le cockpit prospection avec le plan visé, la ville et le nombre de contrats.",
  ],
  [
    "2",
    "Préparation",
    "La démonstration est adaptée à votre situation : Excel, Praxedo, contrats actifs, attestations et relances.",
  ],
  [
    "3",
    "Décision",
    "Vous repartez avec le bon plan, les données à importer et une estimation claire du revenu récurrent à sécuriser.",
  ],
];

const checklist = [
  "Préparer votre fichier clients ou export Praxedo",
  "Estimer le nombre de contrats actifs et renouvellements annuels",
  "Lister vos modèles actuels : facture, attestation, relance",
  "Noter les questions SEPA, TVA, RGE ou mentions légales",
];

const thankYouStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  description:
    "Page de confirmation après demande de démonstration ContratPro.",
  inLanguage: "fr-FR",
  isPartOf: {
    "@type": "WebSite",
    name: "ContratPro",
    url: "https://contratpro-dun.vercel.app",
  },
  name: "Demande démo reçue",
  url: "https://contratpro-dun.vercel.app/demo/merci",
};

function valueFromParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) {
    return null;
  }

  const normalized = rawValue.trim().replace(/\s+/g, " ");
  return normalized.slice(0, 80);
}

export default async function DemoThanksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const company = valueFromParam(params.company);
  const plan = valueFromParam(params.plan);
  const companyLabel = company ? ` pour ${company}` : "";
  const planLabel = plan ? `Plan demandé : ${plan}.` : "Plan à confirmer pendant l’échange.";

  return (
    <PublicShell>
      <StructuredData data={thankYouStructuredData} />
      <PublicHero
        action={
          <>
            <a className="premium-action rounded-md text-sm font-semibold" href="/simulateur">
              Calculer le ROI
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/pricing">
              Revoir le tarif
            </a>
          </>
        }
        description={`Votre demande${companyLabel} est bien arrivée. ${planLabel} La prochaine étape consiste à transformer votre portefeuille contrats en démonstration concrète.`}
        eyebrow="Demande reçue"
        title="Votre demande démo est bien arrivée."
      />

      <PublicSection
        description="La confirmation ne s’arrête pas à un message de succès : elle guide le prospect vers une préparation simple et utile."
        title="Prochaines étapes"
      >
        <div className="public-demo-steps">
          {nextSteps.map(([number, title, detail]) => (
            <article key={title}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        description="Ces éléments rendent la démonstration plus rapide, plus concrète et plus proche de votre quotidien terrain."
        title="Avant l'appel"
      >
        <div className="public-proof-grid">
          {checklist.map((item) => (
            <article key={item}>{item}</article>
          ))}
        </div>
      </PublicSection>
    </PublicShell>
  );
}
