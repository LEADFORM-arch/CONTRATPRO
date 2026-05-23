import type { Metadata } from "next";

import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  alternates: {
    canonical: "/legal",
  },
  description:
    "Mentions legales ContratPro : editeur, hebergement, contact et responsabilite de publication.",
  title: "Mentions legales ContratPro",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

const legalFields = [
  "Denomination sociale",
  "Forme juridique",
  "Capital social",
  "SIREN / SIRET",
  "RCS",
  "Adresse du siege",
  "Representant legal",
  "Numero de TVA intracommunautaire le cas echeant",
];

export default function LegalPage() {
  return (
    <PublicShell>
      <PublicSection
        description="Mentions legales de base pour ContratPro. Les champs societe doivent etre completes avec les informations definitives avant lancement public."
        title="Mentions legales"
      >
        <div className="public-legal-panel">
          <h1>Editeur du service</h1>
          <p>
            ContratPro est un service SaaS B2B de gestion des contrats de
            maintenance CVC. Les informations legales definitives de la societe
            exploitante doivent etre renseignees avant commercialisation publique.
          </p>

          <h2>Informations a completer</h2>
          <ul>
            {legalFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>

          <h2>Hebergement</h2>
          <p>
            Application hebergee sur Vercel. Donnees applicatives stockees dans
            Supabase. Les informations exactes d'hebergement, regions, DPA et
            garanties contractuelles doivent etre confirmees avec les comptes de
            production utilises.
          </p>

          <h2>Contact</h2>
          <p>
            Contact :{" "}
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            ) : (
              "adresse a completer avant lancement public"
            )}
            .
          </p>

          <h2>Responsabilite</h2>
          <p>
            Les informations publiees sur ce site presentent ContratPro et ses
            fonctionnalites. Les documents contractuels et juridiques doivent
            etre relus avant signature client ou encaissement live.
          </p>
        </div>
      </PublicSection>
    </PublicShell>
  );
}
