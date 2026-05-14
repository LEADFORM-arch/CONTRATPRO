import type { Metadata } from "next";

import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";
import { StructuredData } from "@/components/marketing/StructuredData";

export const metadata: Metadata = {
  title: "Demande demo recue",
  description:
    "Votre demande de demonstration ContratPro a bien ete transmise. Preparez votre fichier clients, vos contrats et vos questions avant l'echange.",
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
    "Votre demande remonte dans le cockpit prospection avec le plan vise, la ville et le nombre de contrats.",
  ],
  [
    "2",
    "Preparation",
    "La demonstration est adaptee a votre situation : Excel, Praxedo, contrats actifs, attestations et relances.",
  ],
  [
    "3",
    "Decision",
    "Vous repartez avec le bon plan, les donnees a importer et une estimation claire du revenu recurrent a securiser.",
  ],
];

const checklist = [
  "Preparer votre fichier clients ou export Praxedo",
  "Estimer le nombre de contrats actifs et renouvellements annuels",
  "Lister vos modeles actuels : facture, attestation, relance",
  "Noter les questions SEPA, TVA, RGE ou mentions legales",
];

const thankYouStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  description:
    "Page de confirmation apres demande de demonstration ContratPro.",
  inLanguage: "fr-FR",
  isPartOf: {
    "@type": "WebSite",
    name: "ContratPro",
    url: "https://contratpro-dun.vercel.app",
  },
  name: "Demande demo recue",
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
  const planLabel = plan ? `Plan demande : ${plan}.` : "Plan a confirmer pendant l'echange.";

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
        description={`Votre demande${companyLabel} est bien arrivee. ${planLabel} La prochaine etape consiste a transformer votre portefeuille contrats en demonstration concrete.`}
        eyebrow="Demande recue"
        title="Votre demande demo est bien arrivee."
      />

      <PublicSection
        description="La confirmation ne s'arrete pas a un message de succes : elle guide le prospect vers une preparation simple et utile."
        title="Prochaines etapes"
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
        description="Ces elements rendent la demonstration plus rapide, plus concrete et plus proche de votre quotidien terrain."
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
