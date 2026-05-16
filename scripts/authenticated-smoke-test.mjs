import {
  containsDashboardErrorBoundary,
  getDeploymentProtectionHeaders,
  getSessionCookie,
  getSmokeConfig,
  read,
} from "./smoke-test-helpers.mjs";

const { baseUrl, email, password } = getSmokeConfig("smoke:auth");

let login;
try {
  login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      ...getDeploymentProtectionHeaders(),
      "content-type": "application/json",
      "user-agent": "ContratPro authenticated smoke test",
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

const loginBody = await read(login);
if (!login.ok) {
  console.error(`FAIL /api/auth/login - ${login.status}`);
  console.error(loginBody.slice(0, 300));
  process.exit(1);
}

const cookie = getSessionCookie(login);

if (!cookie.includes("contratpro-access-token")) {
  console.error("FAIL cookie session - cookie d'acces absent apres connexion.");
  process.exit(1);
}

const me = await fetch(`${baseUrl}/api/auth/me`, {
  headers: {
    ...getDeploymentProtectionHeaders(),
    cookie,
    "user-agent": "ContratPro authenticated smoke test",
  },
});

const meBody = await read(me);
if (!me.ok || !meBody.includes(email)) {
  console.error(`FAIL /api/auth/me - ${me.status}`);
  console.error(meBody.slice(0, 300));
  process.exit(1);
}

const onboarding = await fetch(`${baseUrl}/onboarding`, {
  headers: {
    ...getDeploymentProtectionHeaders(),
    cookie,
    "user-agent": "ContratPro authenticated smoke test",
  },
  redirect: "manual",
});
const onboardingBody = await read(onboarding);

if (![200, 307, 308].includes(onboarding.status)) {
  console.error(`FAIL /onboarding - ${onboarding.status}`);
  console.error(onboardingBody.slice(0, 300));
  process.exit(1);
}

if (containsDashboardErrorBoundary(onboardingBody)) {
  console.error("FAIL /onboarding - l'ecran de reprise dashboard est affiche.");
  console.error(onboardingBody.slice(0, 300));
  process.exit(1);
}

console.log(`OK /api/auth/login - ${login.status}`);
console.log(`OK /api/auth/me - ${me.status}`);
console.log(`OK /onboarding - ${onboarding.status}`);
console.log(`\nSmoke test authentifie OK: ${email} peut se connecter sur ${baseUrl}.`);
