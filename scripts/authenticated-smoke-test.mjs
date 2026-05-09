const rawBaseUrl = process.argv[2] ?? process.env.CONTRATPRO_DEPLOYMENT_URL;
const email = process.env.CONTRATPRO_SMOKE_EMAIL;
const password = process.env.CONTRATPRO_SMOKE_PASSWORD;

if (!rawBaseUrl) {
  console.error("Usage: npm run deploy:smoke:auth -- https://votre-deploiement.vercel.app");
  console.error("Ou definir CONTRATPRO_DEPLOYMENT_URL.");
  process.exit(1);
}

if (!email || !password) {
  console.error("CONTRATPRO_SMOKE_EMAIL et CONTRATPRO_SMOKE_PASSWORD sont requis.");
  console.error("Ne pas les ecrire dans le repo: definir ces variables seulement dans le terminal courant.");
  process.exit(1);
}

const baseUrl = rawBaseUrl.replace(/\/+$/, "");

async function read(response) {
  return response.text().catch(() => "");
}

const login = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "user-agent": "ContratPro authenticated smoke test",
  },
  body: JSON.stringify({ email, password }),
  redirect: "manual",
});

const loginBody = await read(login);
if (!login.ok) {
  console.error(`FAIL /api/auth/login - ${login.status}`);
  console.error(loginBody.slice(0, 300));
  process.exit(1);
}

const setCookie = login.headers.getSetCookie
  ? login.headers.getSetCookie()
  : login.headers.get("set-cookie")?.split(/,(?=[^;]+?=)/) ?? [];
const cookie = setCookie.map((value) => value.split(";")[0]).join("; ");

if (!cookie.includes("contratpro-access-token")) {
  console.error("FAIL cookie session - cookie d'acces absent apres connexion.");
  process.exit(1);
}

const me = await fetch(`${baseUrl}/api/auth/me`, {
  headers: {
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
    cookie,
    "user-agent": "ContratPro authenticated smoke test",
  },
  redirect: "manual",
});

if (![200, 307, 308].includes(onboarding.status)) {
  console.error(`FAIL /onboarding - ${onboarding.status}`);
  console.error((await read(onboarding)).slice(0, 300));
  process.exit(1);
}

console.log(`OK /api/auth/login - ${login.status}`);
console.log(`OK /api/auth/me - ${me.status}`);
console.log(`OK /onboarding - ${onboarding.status}`);
console.log(`\nSmoke test authentifie OK: ${email} peut se connecter sur ${baseUrl}.`);
