import type { Metadata } from "next";

import { PublicShell } from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  title: "Attestation entretien chaudière et PAC - modèle CVC | ContratPro",
  description:
    "Guide pour chauffagistes : entretien annuel chaudière, pompe à chaleur, attestation sous 15 jours, mentions utiles et automatisation ContratPro.",
  alternates: {
    canonical: "/attestation-entretien-chaudiere",
  },
};

const requiredItems = [
  "Identité du professionnel et de l’entreprise CVC",
  "Adresse du logement ou du site entretenu",
  "Type d’équipement : chaudière, pompe à chaleur, VMC ou appareil associé",
  "Marque, modèle, puissance et numéro de série quand disponibles",
  "Date de visite, opérations réalisées, nettoyage, réglage et contrôles",
  "Résultats utiles : rendement, émissions, monoxyde de carbone si concerné",
  "Conseils remis au client et prochaine échéance d’entretien",
];

const workflow = [
  ["1", "Planifier", "ContratPro repère les contrats dont l’échéance arrive."],
  ["2", "Intervenir", "Le technicien retrouve client, équipement et historique terrain."],
  ["3", "Générer", "L’attestation PDF reprend les données entreprise, client et intervention."],
  ["4", "Envoyer", "L’email client et l’historique d’envoi sont conservés dans le dossier."],
];

const faq = [
  {
    answer:
      "Service-Public rappelle que l’entretien annuel concerne notamment les chaudières fioul, gaz, bois, charbon ou multicombustible de 4 à 400 kW, ainsi que les pompes à chaleur et appareils de chauffage avec ventilation.",
    question: "Quels équipements sont concernés par l’entretien annuel ?",
  },
  {
    answer:
      "Le chauffagiste doit remettre une attestation d’entretien dans un délai de 15 jours suivant la visite. Le client la conserve comme preuve de suivi.",
    question: "Quand remettre l’attestation au client ?",
  },
  {
    answer:
      "Elle doit permettre d’identifier l’équipement, les contrôles effectués, les résultats utiles et les conseils donnés au client. Le contenu exact dépend du type d’installation et des textes applicables.",
    question: "Que doit contenir une attestation d’entretien ?",
  },
  {
    answer:
      "Oui. ContratPro génère le PDF côté serveur, l’envoie au client par email et garde un historique d’envoi rattaché à l’organisation.",
    question: "ContratPro peut-il automatiser l’attestation ?",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
    name: item.question,
  })),
};

export default function BoilerCertificateSeoPage() {
  return (
    <PublicShell>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <section className="seo-hero mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-300">
            Guide chauffagiste
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-normal text-zinc-50 sm:text-5xl">
            Attestation d’entretien chaudière et pompe à chaleur : quoi remettre au client ?
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            L’entretien annuel crée une obligation documentaire simple mais
            critique : remettre une attestation propre, traçable et exploitable
            pour le client comme pour l’entreprise CVC.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="premium-action rounded-md text-sm font-semibold" href="/demo">
              Voir la démo documents
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/pricing">
              Automatiser les attestations
            </a>
          </div>
        </div>

        <aside className="seo-summary-card">
          <span>Point clé</span>
          <strong>Attestation sous 15 jours après la visite.</strong>
          <p>
            Pour un chauffagiste, le risque n’est pas seulement de générer le
            PDF : c’est d’oublier l’envoi, la preuve et le renouvellement suivant.
          </p>
        </aside>
      </section>

      <section className="seo-band mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="seo-panel">
          <div>
            <p className="text-sm font-semibold text-cyan-300">Réglementation</p>
            <h2>Ce que disent les sources officielles</h2>
          </div>
          <div className="seo-source-grid">
            <article>
              <strong>Entretien annuel</strong>
              <p>
                L’entretien concerne les chaudières de 4 à 400 kW et s’étend
                aussi aux pompes à chaleur et appareils de chauffage avec ventilation.
              </p>
              <a href="https://www.service-public.fr/particuliers/vosdroits/F20760">
                Source Service-Public
              </a>
            </article>
            <article>
              <strong>Attestation détaillée</strong>
              <p>
                Le ministère rappelle la remise d’une attestation avec évaluation,
                mesure de monoxyde de carbone lorsque pertinente et conseils.
              </p>
              <a href="https://www.ecologie.gouv.fr/politiques-publiques/entretien-inspection-systemes-chauffage-climatisation">
                Source ministère
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-zinc-50">
            Mentions utiles à prévoir dans le modèle
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Cette liste sert de base opérationnelle. Elle doit être adaptée au
            type d’équipement, à l’organisation de l’entreprise et aux textes applicables.
          </p>
        </div>
        <div className="seo-check-grid">
          {requiredItems.map((item) => (
            <article key={item}>
              <span />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="seo-panel">
          <div>
            <p className="text-sm font-semibold text-emerald-300">ContratPro</p>
            <h2>Transformer l’attestation en processus automatique</h2>
          </div>
          <div className="seo-workflow-grid">
            {workflow.map(([number, title, detail]) => (
              <article key={title}>
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="seo-two-column">
          <article>
            <h2>Pourquoi cette page convertit mieux qu’une simple fiche produit</h2>
            <p>
              Le chauffagiste ne cherche pas d’abord un logiciel. Il cherche à
              savoir quoi remettre au client, comment rester propre en cas de
              demande, et comment ne plus perdre de temps après chaque visite.
            </p>
            <a className="premium-action mt-5 rounded-md text-sm font-semibold" href="/simulateur">
              Calculer le ROI des contrats suivis
            </a>
          </article>
          <article>
            <h2>Ce que ContratPro apporte</h2>
            <ul>
              <li>Génération PDF serveur pour attestations et factures.</li>
              <li>Envoi email client avec historique d’envoi.</li>
              <li>Contrats, interventions et documents rattachés au même dossier.</li>
              <li>Relances de renouvellement pour conserver le revenu récurrent.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-zinc-50">Questions fréquentes</h2>
        </div>
        <div className="seo-faq-grid">
          {faq.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
