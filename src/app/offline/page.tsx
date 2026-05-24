import type { Metadata } from "next";

import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Hors ligne",
};

export default function OfflinePage() {
  return (
    <PublicShell>
      <PublicSection
        description="La connexion semble coupee. ContratPro garde un ecran de secours pour les techniciens terrain, sans stocker les donnees clients hors ligne."
        title="Mode hors ligne"
      >
        <div className="public-legal-panel">
          <h1>Revenir au dossier des que le reseau revient</h1>
          <p>
            Les caves, chaufferies et sous-sols peuvent couper le reseau. Cette
            page confirme que l'application est installee, mais les dossiers
            clients restent proteges et ne sont pas mis en cache localement.
          </p>
          <h2>Action terrain</h2>
          <p>
            Reconnectez-vous au reseau, puis rouvrez la file terrain ou le dossier
            contrat. Les prochaines evolutions offline devront etre validees avec
            des pilotes chauffagistes avant de stocker des informations sensibles.
          </p>
          <p>
            <a className="premium-action rounded-md text-sm font-semibold" href="/terrain">
              Retour terrain
            </a>
          </p>
        </div>
      </PublicSection>
    </PublicShell>
  );
}
