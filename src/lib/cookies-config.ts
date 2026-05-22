export const COOKIE_BANNER_VERSION = "v1-2026-05" as const;
export const COOKIE_CONSENT_STORAGE_KEY = "contratpro_cookie_consent" as const;
export const COOKIE_CONSENT_EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export type ConsentCategory = "essential" | "preferences" | "statistics" | "marketing";

export type CookieCategory = {
  id: ConsentCategory;
  label: string;
  description: string;
  required: boolean;
  defaultValue: boolean;
  cookies: Array<{
    name: string;
    purpose: string;
    duration: string;
  }>;
};

export type StoredCookieConsent = {
  version: typeof COOKIE_BANNER_VERSION;
  timestamp: string;
  choices: Record<ConsentCategory, boolean>;
  bannerId: string;
};

export const COOKIE_BANNER_ID = `banner-${COOKIE_BANNER_VERSION}` as const;

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    label: "Essentiels",
    description:
      "Necessaires au fonctionnement du service : authentification, securite de session et protection contre les abus.",
    required: true,
    defaultValue: true,
    cookies: [
      {
        name: "contratpro-access-token",
        purpose: "Session authentifiee ContratPro",
        duration: "Session",
      },
      {
        name: "contratpro-refresh-token",
        purpose: "Maintien securise de la session",
        duration: "30 jours",
      },
      {
        name: "stripe_*",
        purpose: "Paiement et prevention de la fraude lorsque Stripe est utilise",
        duration: "Selon Stripe",
      },
    ],
  },
  {
    id: "preferences",
    label: "Preferences",
    description:
      "Memorisent vos choix de confidentialite afin de ne pas redemander le consentement a chaque visite.",
    required: true,
    defaultValue: true,
    cookies: [
      {
        name: COOKIE_CONSENT_STORAGE_KEY,
        purpose: "Preuve horodatee de vos choix cookies dans le stockage local",
        duration: "6 mois",
      },
    ],
  },
  {
    id: "statistics",
    label: "Statistiques",
    description:
      "Mesure d'audience et d'usage pour ameliorer ContratPro. Aucun outil statistique ne doit etre charge sans votre accord.",
    required: false,
    defaultValue: false,
    cookies: [
      {
        name: "analytics_*",
        purpose: "Mesure d'audience si un outil statistique est active plus tard",
        duration: "13 mois maximum",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "ContratPro ne depose pas de cookie marketing aujourd'hui. Cette categorie reste disponible si un futur outil publicitaire est ajoute.",
    required: false,
    defaultValue: false,
    cookies: [],
  },
];

export function buildDefaultCookieChoices() {
  return Object.fromEntries(
    COOKIE_CATEGORIES.map((category) => [category.id, category.defaultValue]),
  ) as Record<ConsentCategory, boolean>;
}

export function buildRejectedCookieChoices() {
  return Object.fromEntries(
    COOKIE_CATEGORIES.map((category) => [category.id, category.required]),
  ) as Record<ConsentCategory, boolean>;
}

export function buildAcceptedCookieChoices() {
  return Object.fromEntries(
    COOKIE_CATEGORIES.map((category) => [category.id, true]),
  ) as Record<ConsentCategory, boolean>;
}
