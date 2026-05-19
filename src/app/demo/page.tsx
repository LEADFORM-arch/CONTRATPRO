import type { Metadata } from "next";
import { Suspense } from "react";

import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";
import { StructuredData } from "@/components/marketing/StructuredData";

import { DemoRequestForm } from "./DemoRequestForm";

export const metadata: Metadata = {
  title: "Démo ContratPro pour chauffagistes CVC",
  description:
    "Programmez une démonstration ContratPro : import clients, contrats d’entretien, relances, attestations, factures et encaissements.",
  alternates: {
    canonical: "/demo",
  },
  openGraph: {
    description:
      "Voyez en 20 minutes comment ContratPro transforme un portefeuille d’entretien CVC en revenu récurrent pilote.",
    title: "Démo ContratPro pour contrats de maintenance CVC",
    url: "/demo",
  },
};

const demoSteps = [
  ["1", "Importer", "Base clients Praxedo ou création manuelle des premiers clients."],
  ["2", "Activer", "Contrats, équipements, échéances et prix annuels."],
  ["3", "Relancer", "Emails de renouvellement et cron quotidien."],
  ["4", "Encaisser", "SEPA, factures PDF, attestations et historique."],
];

const proofPoints = [
  "Vue dirigeant sur le chiffre d’affaires récurrent",
  "Documents conformes avec SIRET, TVA, RGE et mentions utiles",
  "Alertes internes si paiement, webhook ou cron se dégrade",
  "Isolation Supabase/RLS par organisation",
];

const demoStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  description:
    "Page de demande de démonstration ContratPro pour chauffagistes et entreprises CVC.",
  inLanguage: "fr-FR",
  name: "Démo ContratPro",
  potentialAction: {
    "@type": "ScheduleAction",
    name: "Programmer une démo ContratPro",
    target: "https://contratpro-dun.vercel.app/demo#demande-demo",
  },
  url: "https://contratpro-dun.vercel.app/demo",
};

export default function DemoPage() {
  return (
    <PublicShell>
      <StructuredData data={demoStructuredData} />
      <PublicHero
        action={
          <>
            <a className="premium-action rounded-md text-sm font-semibold" href="#demande-demo">
              Programmer une démo
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/pricing">
              Voir le tarif
            </a>
          </>
        }
        description="Une démo structurée autour d’un cas concret : un chauffagiste importe son portefeuille, retrouve ses échéances, envoie ses documents et sécurise ses paiements."
        eyebrow="Démo commerciale"
        title="Montrez en 20 minutes comment ContratPro crée du revenu récurrent."
      />

      <PublicSection
        description="Le scénario de démonstration reste opérationnel : pas de promesse abstraite, seulement les écrans qui font gagner du temps et du cash."
        title="Trame de démonstration"
      >
        <div className="public-demo-steps">
          {demoSteps.map(([number, title, detail]) => (
            <article key={title}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection title="Preuves à montrer">
        <div className="public-proof-grid">
          {proofPoints.map((point) => (
            <article key={point}>{point}</article>
          ))}
        </div>
      </PublicSection>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8" id="demande-demo">
        <div className="demo-request-panel">
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Capture lead
            </p>
            <h2>Demander une démonstration ContratPro</h2>
            <p>
              Cette demande alimente directement le pipeline prospection
              fondateur, avec scoring et notification interne.
            </p>
          </div>
          <Suspense fallback={<div className="demo-form-success">Chargement du formulaire...</div>}>
            <DemoRequestForm />
          </Suspense>
        </div>
      </section>
    </PublicShell>
  );
}
