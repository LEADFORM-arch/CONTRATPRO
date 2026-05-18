import { isAuthEnforced, isRlsExpected } from "@/server/tenant";

export type LaunchStatus = "ready" | "warning" | "critical";

export type LaunchItem = {
  action: string;
  detail: string;
  label: string;
  owner: string;
  status: LaunchStatus;
};

export type LaunchSection = {
  items: LaunchItem[];
  label: string;
};

export type PilotStep = {
  evidence: string;
  label: string;
  objective: string;
  owner: string;
  successCriteria: string;
};

export type ProductionActivationStep = {
  command: string;
  evidence: string;
  label: string;
  objective: string;
  owner: string;
  risk: "low" | "medium" | "high";
};

export type ProductionControlLink = {
  detail: string;
  href: string;
  label: string;
  proof: string;
};

export type ProductionArchitectSignal = {
  action: string;
  label: string;
  status: LaunchStatus;
  value: string;
};

export type ProductionArchitectDecision = {
  checklist: string[];
  decision: "live-ok" | "live-pause" | "rollback";
  label: string;
  note: string;
  trigger: string;
};

export type ProductionArchitectSummary = {
  controlLinks: ProductionControlLink[];
  decisions: ProductionArchitectDecision[];
  headline: string;
  nextMove: string;
  primaryMetric: string;
  recommendedDecision: ProductionArchitectDecision;
  secondaryMetric: string;
  signals: ProductionArchitectSignal[];
  thesis: string;
};

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value || ["[]", "{}", "\"\"", "''"].includes(value)) {
    return "";
  }
  return value.replace(/^["']|["']$/g, "");
}

function supabaseDashboardHref() {
  const projectRef = env("SUPABASE_PROJECT_REF");
  return projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}`
    : "https://supabase.com/dashboard";
}

export const productionControlLinks: ProductionControlLink[] = [
  {
    detail: "Projet Supabase officiel",
    href: supabaseDashboardHref(),
    label: "Supabase RLS + backup",
    proof: "verify_rls.sql en OK, backup connu, service role jamais expose.",
  },
  {
    detail: "Import/deploiement Vercel",
    href: "https://vercel.com/contratpro?repo=https%3A%2F%2Fgithub.com%2Fadmincairn%2FCONTRATPRO",
    label: "Vercel production",
    proof: "Build vert, variables production presentes, cron visible.",
  },
  {
    detail: "Depot source officiel",
    href: "https://github.com/admincairn/CONTRATPRO",
    label: "GitHub release",
    proof: "Commit note, CI verte, rollback sur deployment precedent.",
  },
];

function has(name: string) {
  return Boolean(env(name));
}

function hasStripePrices() {
  return (
    has("STRIPE_PRICE_ID_STARTER") &&
    (has("STRIPE_PRICE_ID_PRO") || has("STRIPE_PRICE_ID")) &&
    has("STRIPE_PRICE_ID_BUSINESS")
  );
}

function item({
  action,
  detail,
  label,
  owner,
  ready,
  statusWhenMissing = "critical",
}: {
  action: string;
  detail: string;
  label: string;
  owner: string;
  ready: boolean;
  statusWhenMissing?: LaunchStatus;
}): LaunchItem {
  return {
    action,
    detail,
    label,
    owner,
    status: ready ? "ready" : statusWhenMissing,
  };
}

function statusScore(status: LaunchStatus) {
  if (status === "ready") {
    return 1;
  }
  if (status === "warning") {
    return 0.5;
  }
  return 0;
}

export function getLaunchReadiness() {
  const appUrl = env("NEXT_PUBLIC_APP_URL") || env("CONTRATPRO_APP_URL");
  const isVercel = env("VERCEL") === "1" || env("VERCEL_ENV") === "production";
  const gitRepo = [env("VERCEL_GIT_REPO_OWNER"), env("VERCEL_GIT_REPO_SLUG")]
    .filter(Boolean)
    .join("/");
  const billingRequired = env("CONTRATPRO_REQUIRE_BILLING") === "true";
  const goCardlessLive = env("GOCARDLESS_ENVIRONMENT") === "live";
  const stripeConfigured = has("STRIPE_SECRET_KEY") && has("STRIPE_WEBHOOK_SECRET") && hasStripePrices();
  const resendConfigured = has("RESEND_API_KEY") && has("RESEND_FROM_EMAIL");

  const sections: LaunchSection[] = [
    {
      items: [
        item({
          action: "Conserver les deployments GitHub -> Vercel sur main.",
          detail: isVercel ? "Runtime Vercel detecte." : "Controle effectue hors Vercel.",
          label: "Runtime Vercel",
          owner: "Fondateur",
          ready: isVercel,
          statusWhenMissing: "warning",
        }),
        item({
          action: "Verifier l'alias Vercel ou connecter le domaine final.",
          detail: appUrl || "URL applicative absente.",
          label: "URL publique",
          owner: "Fondateur",
          ready: Boolean(appUrl),
        }),
        item({
          action: "Garder admincairn/CONTRATPRO connecte a Vercel.",
          detail: gitRepo || "Repo Git non detecte dans l'environnement courant.",
          label: "GitHub connecte",
          owner: "Fondateur",
          ready: gitRepo === "admincairn/CONTRATPRO",
          statusWhenMissing: "warning",
        }),
      ],
      label: "Socle production",
    },
    {
      items: [
        item({
          action: "Laisser CONTRATPRO_REQUIRE_AUTH=true.",
          detail: "Les pages dashboard exigent une session.",
          label: "Authentification",
          owner: "Produit",
          ready: isAuthEnforced(),
        }),
        item({
          action: "Executer supabase/verify_rls.sql apres chaque migration.",
          detail: "Isolation organisation attendue.",
          label: "RLS Supabase",
          owner: "Produit",
          ready: isRlsExpected(),
        }),
        item({
          action: "Maintenir CONTRATPRO_ADMIN_EMAILS avec l'email fondateur.",
          detail: env("CONTRATPRO_ADMIN_EMAILS") || "Aucun admin configure.",
          label: "Acces fondateur",
          owner: "Fondateur",
          ready: has("CONTRATPRO_ADMIN_EMAILS"),
        }),
      ],
      label: "Securite SaaS",
    },
    {
      items: [
        item({
          action: "Ajouter STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET et les price_id Starter/Pro/Business.",
          detail: stripeConfigured
            ? "Stripe configure avec les trois paliers."
            : billingRequired
              ? "Stripe incomplet: abonnement multi-paliers non encaissable."
              : "Stripe incomplet: pilote sans encaissement automatique.",
          label: "Stripe Billing",
          owner: "Revenus",
          ready: stripeConfigured,
          statusWhenMissing: billingRequired ? "critical" : "warning",
        }),
        item({
          action: "Passer CONTRATPRO_REQUIRE_BILLING=true apres validation Stripe.",
          detail: billingRequired ? "Billing obligatoire actif." : "Billing obligatoire desactive pour le lancement controle.",
          label: "Paywall SaaS",
          owner: "Revenus",
          ready: billingRequired,
          statusWhenMissing: "warning",
        }),
      ],
      label: "Monetisation",
    },
    {
      items: [
        item({
          action: "Ajouter le token GoCardless live avant d'ouvrir les prelevements.",
          detail: goCardlessLive ? "Mode live." : `Mode ${env("GOCARDLESS_ENVIRONMENT") || "non configure"}.`,
          label: "SEPA GoCardless",
          owner: "Finance",
          ready: has("GOCARDLESS_ACCESS_TOKEN") && goCardlessLive,
          statusWhenMissing: "warning",
        }),
        item({
          action: "Configurer RESEND_FROM_EMAIL sur un domaine verifie.",
          detail: resendConfigured
            ? "Resend configure avec expediteur verifie."
            : has("RESEND_API_KEY")
              ? "API Resend presente, expediteur a verifier plus tard."
              : "Resend a configurer avant les emails live.",
          label: "Emails documents",
          owner: "Support",
          ready: resendConfigured,
          statusWhenMissing: "warning",
        }),
        item({
          action: "Verifier le cron quotidien dans Vercel.",
          detail: has("CRON_SECRET") ? "Cron protege." : "Secret cron absent.",
          label: "Relances automatiques",
          owner: "Ops",
          ready: has("CRON_SECRET") || has("CONTRATPRO_CRON_SECRET"),
        }),
      ],
      label: "Operations CVC",
    },
  ];

  const items = sections.flatMap((section) => section.items);
  const score = Math.round(
    (items.reduce((total, current) => total + statusScore(current.status), 0) /
      items.length) *
      100,
  );
  const blockers = items.filter((current) => current.status === "critical");
  const status: LaunchStatus = blockers.length ? "critical" : score >= 90 ? "ready" : "warning";

  return {
    appUrl,
    blockers,
    generatedAt: new Date().toISOString(),
    score,
    sections,
    status,
  };
}

export function getProductionArchitectSummary(): ProductionArchitectSummary {
  const readiness = getLaunchReadiness();
  const stripeReady = has("STRIPE_SECRET_KEY") && has("STRIPE_WEBHOOK_SECRET") && hasStripePrices();
  const sepaReady = has("GOCARDLESS_ACCESS_TOKEN") && env("GOCARDLESS_ENVIRONMENT") === "live";
  const emailReady = has("RESEND_API_KEY") && has("RESEND_FROM_EMAIL");
  const cronReady = has("CRON_SECRET") || has("CONTRATPRO_CRON_SECRET");

  const signals: ProductionArchitectSignal[] = [
    {
      action: "Executer supabase/verify_rls.sql et garder la capture OK.",
      label: "Supabase tenant",
      status: isRlsExpected() ? "ready" : "critical",
      value: isRlsExpected() ? "RLS attendu" : "RLS non confirme",
    },
    {
      action: "Verifier les variables Vercel et deploy:preflight avant domaine final.",
      label: "Vercel secrets",
      status: readiness.blockers.length ? "critical" : readiness.status,
      value: readiness.appUrl ? "URL configuree" : "URL absente",
    },
    {
      action: "Brancher Stripe live, Resend domaine et GoCardless live avant vente large.",
      label: "Providers cash-flow",
      status: stripeReady && sepaReady && emailReady ? "ready" : "warning",
      value: `${[stripeReady, sepaReady, emailReady].filter(Boolean).length}/3 prets`,
    },
    {
      action: "Confirmer cron, smoke authentifie et URL Vercel precedente.",
      label: "Rollback pilote",
      status: cronReady ? "ready" : "warning",
      value: cronReady ? "Cron protege" : "Cron a verrouiller",
    },
  ];

  const decisionLabel =
    readiness.status === "ready" ? "LIVE OK" : readiness.status === "warning" ? "LIVE PAUSE" : "ROLLBACK";
  const decisionReason =
    readiness.status === "ready"
      ? "score go-live suffisant, aucun bloquant critique et providers controles"
      : readiness.status === "warning"
        ? "lancement pilote possible seulement avec surveillance et points ouverts ecrits"
        : "bloquants critiques encore presents avant vrais clients";

  const decisions: ProductionArchitectDecision[] = [
    {
      checklist: [
        "CI locale et GitHub vertes.",
        "Supabase RLS OK + backup connu.",
        "Smokes public et authentifie valides.",
      ],
      decision: "live-ok",
      label: "LIVE OK",
      note:
        "Decision: LIVE OK. ContratPro peut ouvrir un pilote client controle: CI verte, Supabase RLS OK, Vercel configure, providers critiques verifies et rollback documente.",
      trigger: "Aucun bloquant critique",
    },
    {
      checklist: [
        "Un ou plusieurs signaux restent en warning.",
        "Le pilote peut continuer sans encaissement risque.",
        "Le prochain controle est date et attribue.",
      ],
      decision: "live-pause",
      label: "LIVE PAUSE",
      note:
        "Decision: LIVE PAUSE. ContratPro reste exploitable en pilote accompagne, mais la vente large attend la fermeture des warnings Vercel, providers, cron ou smoke authentifie.",
      trigger: "Lancement controle seulement",
    },
    {
      checklist: [
        "Un bloquant critique touche auth, RLS, billing ou provider.",
        "La preuve de rollback n'est pas disponible.",
        "Aucun nouveau pilote n'est invite.",
      ],
      decision: "rollback",
      label: "ROLLBACK",
      note:
        "Decision: ROLLBACK. Ne pas inviter de pilote payant: bloquant critique sur securite, base, provider ou deploiement. Revenir au deployment stable puis reprendre la checklist live.",
      trigger: "Risque production",
    },
  ];
  const recommendedDecision =
    decisions.find((decision) => decision.label === decisionLabel) ?? decisions[1];

  return {
    controlLinks: productionControlLinks,
    decisions,
    headline: "Architecte IA production",
    nextMove: `Decision conseillee: ${decisionLabel}. Raison: ${decisionReason}.`,
    primaryMetric: `${readiness.score}/100`,
    recommendedDecision,
    secondaryMetric: `${readiness.blockers.length} bloquant(s)`,
    signals,
    thesis:
      "Ne pas confondre deploiement et mise en vente. Le live n'est autorise que si Supabase isole, Vercel deploie, les providers encaissent proprement et le rollback est arme.",
  };
}

export function getPilotReadinessPlan(): PilotStep[] {
  return [
    {
      evidence: "Fichier CSV/XLSX reel archive avec accord explicite du pilote.",
      label: "1. Fichier client reel",
      objective: "Tester avec une base chauffagiste existante, pas avec des donnees demo.",
      owner: "Fondateur",
      successCriteria: "50 a 300 clients importables, au moins 10 contrats d'entretien identifiables.",
    },
    {
      evidence: "Capture du rapport dry-run avec erreurs, doublons et lignes pretes.",
      label: "2. Import dry-run",
      objective: "Mesurer la friction d'entree et les colonnes manquantes avant toute ecriture.",
      owner: "Produit",
      successCriteria: "Aucune erreur bloquante non comprise par le pilote apres 15 minutes.",
    },
    {
      evidence: "Liste de 10 contrats avec montant, date d'echeance et statut relance.",
      label: "3. Portefeuille recurrent",
      objective: "Verifier que ContratPro montre le cash a proteger rapidement.",
      owner: "Revenus",
      successCriteria: "Le pilote identifie au moins 3 contrats a relancer ou encaisser.",
    },
    {
      evidence: "Une facture PDF, une attestation PDF et un email document envoyes en test.",
      label: "4. Documents metier",
      objective: "Valider que les documents produits suffisent a un usage commercial accompagne.",
      owner: "Support",
      successCriteria: "Le pilote accepte la structure du document avec au plus 2 corrections texte.",
    },
    {
      evidence: "Relance en dry-run, checkout Stripe test et evenement GoCardless sandbox.",
      label: "5. Relance + SEPA",
      objective: "Prouver la promesse cash-flow sans encaisser en live trop tot.",
      owner: "Finance",
      successCriteria: "Une relance est prete a envoyer et un mandat SEPA sandbox est trace.",
    },
    {
      evidence: "Scorecard remplie avec note adoption, prix accepte et prochaines objections.",
      label: "6. Decision go/no-go",
      objective: "Savoir si le pilote paierait, et pourquoi il bloquerait.",
      owner: "Fondateur",
      successCriteria: "Decision claire : payer, continuer en pilote, ou abandonner le segment.",
    },
  ];
}

export function getProductionActivationPlan(): ProductionActivationStep[] {
  return [
    {
      command: "git log -1 --oneline && npm run ci:verify",
      evidence: "Dernier commit note, CI locale verte, aucun fichier non commit.",
      label: "1. Freeze release",
      objective: "Bloquer le code avant de toucher aux secrets et providers live.",
      owner: "Fondateur",
      risk: "medium",
    },
    {
      command: "Executer supabase/verify_rls.sql dans Supabase SQL Editor",
      evidence: "Capture Supabase avec tous les checks RLS en OK + backup actif.",
      label: "2. Supabase backup + RLS",
      objective: "Verifier cloisonnement tenant et retour arriere base avant vrais clients.",
      owner: "Produit",
      risk: "high",
    },
    {
      command: "npm run deploy:preflight",
      evidence: "Variables Vercel production presentes et preflight OK.",
      label: "3. Variables Vercel",
      objective: "Confirmer auth, billing, cron, Supabase, Resend, Stripe et GoCardless.",
      owner: "Ops",
      risk: "high",
    },
    {
      command: "npm run stripe:readiness",
      evidence: "Webhook Stripe live et price_id Starter/Pro/Business verifies.",
      label: "4. Stripe live",
      objective: "Rendre l'abonnement encaissable sans casser le paywall.",
      owner: "Revenus",
      risk: "high",
    },
    {
      command: "Verifier GOCARDLESS_ENVIRONMENT=live puis tester un mandat pilote",
      evidence: "Mandat GoCardless live cree sur un compte pilote autorise.",
      label: "5. GoCardless live",
      objective: "Ouvrir le SEPA avec preuve de webhook et journal payment_events.",
      owner: "Finance",
      risk: "high",
    },
    {
      command: "npm run deploy:smoke -- https://votre-domaine.fr",
      evidence: "Smoke public OK + smoke authentifie OK avec compte admin.",
      label: "6. Smoke post-deploiement",
      objective: "Valider health, login, pages publiques et parcours dashboard minimal.",
      owner: "Support",
      risk: "medium",
    },
    {
      command: "Conserver l'URL Vercel stable precedente avant ouverture pilote",
      evidence: "Plan de rollback documente avec domaine, commit et backup associes.",
      label: "7. Rollback arme",
      objective: "Pouvoir revenir en arriere sans improviser pendant un rendez-vous client.",
      owner: "Fondateur",
      risk: "low",
    },
  ];
}
