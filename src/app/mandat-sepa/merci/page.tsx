import type { Metadata } from "next";

import { PublicHero, PublicSection, PublicShell } from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  title: "Mandat SEPA transmis",
  description:
    "Confirmation ContratPro apres le parcours de signature du mandat SEPA GoCardless.",
  alternates: {
    canonical: "/mandat-sepa/merci",
  },
  robots: {
    follow: false,
    index: false,
  },
};

export default async function MandateThanksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const interrupted = status === "interrompu";

  return (
    <PublicShell>
      <PublicHero
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/">
            Retour ContratPro
          </a>
        }
        description={
          interrupted
            ? "Le parcours GoCardless a ete interrompu. Le mandat peut etre repris depuis le lien transmis par votre chauffagiste."
            : "Votre autorisation est transmise a GoCardless. Le chauffagiste pourra suivre le mandat et les prochains prelevements depuis ContratPro."
        }
        eyebrow={interrupted ? "Mandat non finalise" : "Mandat transmis"}
        title={
          interrupted
            ? "Le mandat SEPA n'est pas encore finalise."
            : "Votre mandat SEPA est en cours de validation."
        }
      />

      <PublicSection
        description="ContratPro conserve le suivi operationnel cote chauffagiste : statut du mandat, prelevements programmes et incidents de paiement."
        title="Ce qui se passe ensuite"
      >
        <div className="public-proof-grid">
          <article>GoCardless valide les informations bancaires en environnement securise.</article>
          <article>Le contrat reste rattache au client, a l'equipement CVC et au montant prevu.</article>
          <article>Chaque prelevement apparait ensuite dans le suivi SEPA ContratPro.</article>
        </div>
      </PublicSection>
    </PublicShell>
  );
}
