const rawBaseUrl = process.argv[2] ?? process.env.CONTRATPRO_DEPLOYMENT_URL;
const email = process.env.CONTRATPRO_SMOKE_EMAIL;
const password = process.env.CONTRATPRO_SMOKE_PASSWORD;

if (!rawBaseUrl) {
  console.error("Usage: npm run deploy:smoke:journey -- https://votre-deploiement.vercel.app");
  console.error("Ou definir CONTRATPRO_DEPLOYMENT_URL.");
  process.exit(1);
}

if (!email || !password) {
  console.error("CONTRATPRO_SMOKE_EMAIL et CONTRATPRO_SMOKE_PASSWORD sont requis.");
  console.error("Utiliser un compte pilote dedie, jamais un mot de passe client reel partage.");
  process.exit(1);
}

const baseUrl = rawBaseUrl.replace(/\/+$/, "");

async function read(response) {
  return response.text().catch(() => "");
}

async function loginAndGetCookie() {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "ContratPro customer journey smoke test",
    },
    body: JSON.stringify({ email, password }),
    redirect: "manual",
  });

  if (!response.ok) {
    console.error(`FAIL /api/auth/login - ${response.status}`);
    console.error((await read(response)).slice(0, 300));
    process.exit(1);
  }

  const cookies = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : response.headers.get("set-cookie")?.split(/,(?=[^;]+?=)/) ?? [];
  const cookie = cookies.map((value) => value.split(";")[0]).join("; ");

  if (!cookie.includes("contratpro-access-token")) {
    console.error("FAIL cookie session - cookie d'acces absent apres connexion.");
    process.exit(1);
  }

  return cookie;
}

const journeyChecks = [
  {
    includes: ["Pilotage commercial", "Revenu annuel"],
    label: "Dashboard dirigeant",
    path: "/",
  },
  {
    includes: ["Activation ContratPro", "Progression"],
    label: "Onboarding",
    path: "/onboarding",
  },
  {
    includes: ["Import Excel/CSV", "dry-run"],
    label: "Import clients et contrats",
    path: "/import",
  },
  {
    includes: ["Clients finaux"],
    label: "Clients",
    path: "/customers",
  },
  {
    includes: ["Contrats de maintenance", "echeances"],
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
    includes: ["Attestations legales"],
    label: "Attestations",
    path: "/certificates",
  },
  {
    includes: ["Paiements et mandats SEPA"],
    label: "Paiements SEPA",
    path: "/payments",
  },
  {
    includes: ["Identite entreprise"],
    label: "Entreprise",
    path: "/settings/company",
  },
  {
    includes: ["Abonnement ContratPro"],
    label: "Billing",
    path: "/settings/billing",
  },
  {
    includes: ["Securite", "multi-tenant"],
    label: "Securite",
    path: "/settings/security",
  },
];

const cookie = await loginAndGetCookie();
const results = [];

const me = await fetch(`${baseUrl}/api/auth/me`, {
  headers: {
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
        check.includes.every((value) => body.toLowerCase().includes(value.toLowerCase()))) ||
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
