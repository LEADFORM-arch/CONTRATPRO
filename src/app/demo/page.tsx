import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";
import { Suspense } from "react";

import { DemoRequestForm } from "./DemoRequestForm";

const demoSteps = [
  ["1", "Importer", "Base clients Praxedo ou creation manuelle des premiers clients."],
  ["2", "Activer", "Contrats, equipements, echeances et prix annuels."],
  ["3", "Relancer", "Emails de renouvellement et cron quotidien."],
  ["4", "Encaisser", "SEPA, factures PDF, attestations et historique."],
];

const proofPoints = [
  "Vue dirigeant sur le chiffre d'affaires recurrent",
  "Documents conformes avec SIRET, TVA, RGE et mentions utiles",
  "Alertes internes si paiement, webhook ou cron se degrade",
  "Isolation Supabase/RLS par organisation",
];

export default function DemoPage() {
  return (
    <PublicShell>
      <PublicHero
        action={
          <>
            <a className="premium-action rounded-md text-sm font-semibold" href="#demande-demo">
              Programmer une demo
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/pricing">
              Voir le tarif
            </a>
          </>
        }
        description="Une demo structuree autour d'un cas concret : un chauffagiste importe son portefeuille, retrouve ses echeances, envoie ses documents et securise ses paiements."
        eyebrow="Demo commerciale"
        title="Montrez en 20 minutes comment ContratPro cree du revenu recurrent."
      />

      <PublicSection
        description="Le scenario de demonstration reste operationnel : pas de promesse abstraite, seulement les ecrans qui font gagner du temps et du cash."
        title="Trame de demonstration"
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

      <PublicSection title="Preuves a montrer">
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
            <h2>Demander une demonstration ContratPro</h2>
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
