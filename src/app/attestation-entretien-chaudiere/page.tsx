import type { Metadata } from "next";

import { PublicShell } from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  title: "Attestation entretien chaudiere et PAC - modele CVC | ContratPro",
  description:
    "Guide pour chauffagistes : entretien annuel chaudiere, pompe a chaleur, attestation sous 15 jours, mentions utiles et automatisation ContratPro.",
  alternates: {
    canonical: "/attestation-entretien-chaudiere",
  },
};

const requiredItems = [
  "Identite du professionnel et de l'entreprise CVC",
  "Adresse du logement ou du site entretenu",
  "Type d'equipement : chaudiere, pompe a chaleur, VMC ou appareil associe",
  "Marque, modele, puissance et numero de serie quand disponibles",
  "Date de visite, operations realisees, nettoyage, reglage et controles",
  "Resultats utiles : rendement, emissions, monoxyde de carbone si concerne",
  "Conseils remis au client et prochaine echeance d'entretien",
];

const workflow = [
  ["1", "Planifier", "ContratPro repere les contrats dont l'echeance arrive."],
  ["2", "Intervenir", "Le technicien retrouve client, equipement et historique terrain."],
  ["3", "Generer", "L'attestation PDF reprend les donnees entreprise, client et intervention."],
  ["4", "Envoyer", "L'email client et l'historique d'envoi sont conserves dans le dossier."],
];

const faq = [
  {
    answer:
      "Service-Public rappelle que l'entretien annuel concerne notamment les chaudieres fioul, gaz, bois, charbon ou multicombustible de 4 a 400 kW, ainsi que les pompes a chaleur et appareils de chauffage avec ventilation.",
    question: "Quels equipements sont concernes par l'entretien annuel ?",
  },
  {
    answer:
      "Le chauffagiste doit remettre une attestation d'entretien dans un delai de 15 jours suivant la visite. Le client la conserve comme preuve de suivi.",
    question: "Quand remettre l'attestation au client ?",
  },
  {
    answer:
      "Elle doit permettre d'identifier l'equipement, les controles effectues, les resultats utiles et les conseils donnes au client. Le contenu exact depend du type d'installation et des textes applicables.",
    question: "Que doit contenir une attestation d'entretien ?",
  },
  {
    answer:
      "Oui. ContratPro genere le PDF cote serveur, l'envoie au client par email et garde un historique d'envoi rattache a l'organisation.",
    question: "ContratPro peut-il automatiser l'attestation ?",
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
            Attestation d'entretien chaudiere et pompe a chaleur : quoi remettre au client ?
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            L'entretien annuel cree une obligation documentaire simple mais
            critique : remettre une attestation propre, traçable et exploitable
            pour le client comme pour l'entreprise CVC.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="premium-action rounded-md text-sm font-semibold" href="/demo">
              Voir la demo documents
            </a>
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold" href="/pricing">
              Automatiser les attestations
            </a>
          </div>
        </div>

        <aside className="seo-summary-card">
          <span>Point cle</span>
          <strong>Attestation sous 15 jours apres la visite.</strong>
          <p>
            Pour un chauffagiste, le risque n'est pas seulement de generer le
            PDF : c'est d'oublier l'envoi, la preuve et le renouvellement suivant.
          </p>
        </aside>
      </section>

      <section className="seo-band mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="seo-panel">
          <div>
            <p className="text-sm font-semibold text-cyan-300">Reglementation</p>
            <h2>Ce que disent les sources officielles</h2>
          </div>
          <div className="seo-source-grid">
            <article>
              <strong>Entretien annuel</strong>
              <p>
                L'entretien concerne les chaudieres de 4 a 400 kW et s'etend
                aussi aux pompes a chaleur et appareils de chauffage avec ventilation.
              </p>
              <a href="https://www.service-public.fr/particuliers/vosdroits/F20760">
                Source Service-Public
              </a>
            </article>
            <article>
              <strong>Attestation detaillee</strong>
              <p>
                Le ministere rappelle la remise d'une attestation avec evaluation,
                mesure de monoxyde de carbone lorsque pertinente et conseils.
              </p>
              <a href="https://www.ecologie.gouv.fr/politiques-publiques/entretien-inspection-systemes-chauffage-climatisation">
                Source ministere
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-zinc-50">
            Mentions utiles a prevoir dans le modele
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Cette liste sert de base operationnelle. Elle doit etre adaptee au
            type d'equipement, a l'organisation de l'entreprise et aux textes applicables.
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
            <h2>Transformer l'attestation en processus automatique</h2>
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
            <h2>Pourquoi cette page convertit mieux qu'une simple fiche produit</h2>
            <p>
              Le chauffagiste ne cherche pas d'abord un logiciel. Il cherche a
              savoir quoi remettre au client, comment rester propre en cas de
              demande, et comment ne plus perdre de temps apres chaque visite.
            </p>
            <a className="premium-action mt-5 rounded-md text-sm font-semibold" href="/simulateur">
              Calculer le ROI des contrats suivis
            </a>
          </article>
          <article>
            <h2>Ce que ContratPro apporte</h2>
            <ul>
              <li>Generation PDF serveur pour attestations et factures.</li>
              <li>Envoi email client avec historique d'envoi.</li>
              <li>Contrats, interventions et documents rattaches au meme dossier.</li>
              <li>Relances de renouvellement pour conserver le revenu recurrent.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-zinc-50">Questions frequentes</h2>
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
