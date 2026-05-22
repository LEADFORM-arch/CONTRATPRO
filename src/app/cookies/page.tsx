import type { Metadata } from "next";

import { PublicSection, PublicShell } from "@/components/marketing/PublicShell";
import {
  COOKIE_BANNER_VERSION,
  COOKIE_CATEGORIES,
  COOKIE_CONSENT_EXPIRY_MS,
} from "@/lib/cookies-config";

export const metadata: Metadata = {
  alternates: {
    canonical: "/cookies",
  },
  description:
    "Politique cookies ContratPro : categories, durees, consentement et gestion des preferences.",
  title: "Politique cookies ContratPro",
};

const expiryMonths = Math.round(COOKIE_CONSENT_EXPIRY_MS / (30 * 24 * 60 * 60 * 1000));

export default function CookiesPage() {
  return (
    <PublicShell>
      <PublicSection
        description="ContratPro ne charge aucun traceur statistique ou marketing sans consentement. Les cookies essentiels servent uniquement a faire fonctionner le service."
        title="Politique cookies"
      >
        <div className="public-legal-panel">
          <h1>Gestion du consentement</h1>
          <p>
            Votre choix est conserve pendant {expiryMonths} mois dans le stockage
            local du navigateur avec la version de bandeau {COOKIE_BANNER_VERSION}.
            Si la finalite des traceurs change, la version est modifiee et un
            nouveau choix est demande.
          </p>

          <h2>Categories utilisees</h2>
          <div className="cookie-policy-grid">
            {COOKIE_CATEGORIES.map((category) => (
              <article className="cookie-policy-card" key={category.id}>
                <div>
                  <h3>{category.label}</h3>
                  <span>{category.required ? "Obligatoire" : "Au choix"}</span>
                </div>
                <p>{category.description}</p>
                {category.cookies.length ? (
                  <ul>
                    {category.cookies.map((cookie) => (
                      <li key={cookie.name}>
                        <strong>{cookie.name}</strong>
                        <small>
                          {cookie.purpose} - {cookie.duration}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun traceur actuellement declare.</p>
                )}
              </article>
            ))}
          </div>

          <h2>Modifier vos choix</h2>
          <p>
            Le lien permanent "Gerer mes cookies" est disponible dans le pied de
            page. Il permet d'accepter, refuser ou personnaliser les categories
            non essentielles a tout moment.
          </p>
        </div>
      </PublicSection>
    </PublicShell>
  );
}
