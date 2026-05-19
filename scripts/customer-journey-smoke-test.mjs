import {
  containsDashboardErrorBoundary,
  getDeploymentProtectionHeaders,
  getSessionCookie,
  getSmokeConfig,
  read,
} from "./smoke-test-helpers.mjs";

const { baseUrl, email, password } = getSmokeConfig("smoke:journey");

async function loginAndGetCookie() {
  let response;
  try {
    response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      ...getDeploymentProtectionHeaders(),
      "content-type": "application/json",
      "user-agent": "ContratPro customer journey smoke test",
    },
      body: JSON.stringify({ email, password }),
      redirect: "manual",
    });
  } catch (error) {
    console.error(`FAIL /api/auth/login - impossible de joindre ${baseUrl}.`);
    console.error("Demarrez le serveur avec npm run dev, ou passez une URL en argument.");
    console.error(error instanceof Error ? error.message : "Erreur reseau inconnue.");
    process.exit(1);
  }

  if (!response.ok) {
    console.error(`FAIL /api/auth/login - ${response.status}`);
    console.error((await read(response)).slice(0, 300));
    process.exit(1);
  }

  const cookie = getSessionCookie(response);

  if (!cookie.includes("contratpro-access-token")) {
    console.error("FAIL cookie session - cookie d'acces absent apres connexion.");
    process.exit(1);
  }

  return cookie;
}

const journeyChecks = [
  {
    includes: ["Securisation des contrats CVC", "Architecte IA contrats", "Revenu annuel"],
    label: "Dashboard dirigeant",
    path: "/",
  },
  {
    includes: ["Activation ContratPro", "Progression"],
    label: "Onboarding",
    path: "/onboarding",
  },
  {
    includes: ["Import Excel/CSV", "plan d&#x27;import"],
    label: "Import clients et contrats",
    path: "/import",
  },
  {
    includes: ["Clients finaux"],
    label: "Clients",
    path: "/customers",
  },
  {
    includes: ["Contrats de maintenance CVC", "échéances"],
    label: "Contrats",
    path: "/contracts",
  },
  {
    includes: ["Relances renouvellement"],
    label: "Relances",
    path: "/relances",
  },
  {
    includes: ["Factures contrats CVC"],
    label: "Factures",
    path: "/invoices",
  },
  {
    includes: ["Attestations légales"],
    label: "Attestations",
    path: "/certificates",
  },
  {
    includes: ["Paiements et mandats SEPA"],
    label: "Paiements SEPA",
    path: "/payments",
  },
  {
    includes: ["Identité entreprise"],
    label: "Entreprise",
    path: "/settings/company",
  },
  {
    includes: ["Abonnement ContratPro"],
    label: "Billing",
    path: "/settings/billing",
  },
  {
    includes: ["Sécurité", "espace isolé"],
    label: "Securite",
    path: "/settings/security",
  },
];

const cookie = await loginAndGetCookie();
const results = [];

const me = await fetch(`${baseUrl}/api/auth/me`, {
  headers: {
    ...getDeploymentProtectionHeaders(),
    cookie,
    "user-agent": "ContratPro customer journey smoke test",
  },
});
const meBody = await read(me);
results.push({
  detail: `${me.status} ${baseUrl}/api/auth/me`,
  label: "Session utilisateur",
  passed: me.ok && meBody.includes(email),
});

for (const check of journeyChecks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url, {
      headers: {
        ...getDeploymentProtectionHeaders(),
        cookie,
        "user-agent": "ContratPro customer journey smoke test",
      },
      redirect: "manual",
    });
    const body = await read(response);
    const redirectedToBilling =
      [307, 308].includes(response.status) &&
      (response.headers.get("location") ?? "").includes("/settings/billing");
    const passed =
      (response.ok &&
        check.includes.every((value) => body.toLowerCase().includes(value.toLowerCase())) &&
        !containsDashboardErrorBoundary(body)) ||
      redirectedToBilling;

    results.push({
      detail: `${response.status} ${url}`,
      label: check.label,
      passed,
    });
  } catch (error) {
    results.push({
      detail: `${url} - ${error instanceof Error ? error.message : "erreur inconnue"}`,
      label: check.label,
      passed: false,
    });
  }
}

for (const result of results) {
  console.log(`${result.passed ? "OK" : "FAIL"} ${result.label} - ${result.detail}`);
}

const failures = results.filter((result) => !result.passed);
if (failures.length) {
  console.error(`\nParcours client incomplet: ${failures.length} etape(s) a verifier.`);
  process.exit(1);
}

console.log(`\nParcours client OK: ${email} peut traverser les ecrans critiques sur ${baseUrl}.`);
