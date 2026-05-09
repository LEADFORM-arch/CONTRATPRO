const rawBaseUrl = process.argv[2] ?? process.env.CONTRATPRO_DEPLOYMENT_URL;

if (!rawBaseUrl) {
  console.error("Usage: npm run deploy:smoke -- https://votre-deploiement.vercel.app");
  console.error("Ou definir CONTRATPRO_DEPLOYMENT_URL.");
  process.exit(1);
}

const baseUrl = rawBaseUrl.replace(/\/+$/, "");

const checks = [
  { path: "/api/health", includes: ["ok", "ContratPro"] },
  { path: "/login", includes: ["Connexion", "ContratPro"] },
  { path: "/pricing", includes: ["200", "ContratPro"] },
  { path: "/demo", includes: ["demo", "ContratPro"] },
  { path: "/legal", includes: ["Mentions", "ContratPro"] },
  { path: "/privacy", includes: ["confidentialite", "ContratPro"] },
  { path: "/terms", includes: ["conditions", "ContratPro"] },
];

const results = [];

for (const item of checks) {
  const url = `${baseUrl}${item.path}`;
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "ContratPro smoke test" },
      redirect: "manual",
    });
    const body = await response.text();
    const passed =
      response.status >= 200 &&
      response.status < 300 &&
      item.includes.every((value) => body.toLowerCase().includes(value.toLowerCase()));
    results.push({
      detail: `${response.status} ${url}`,
      label: item.path,
      passed,
    });
  } catch (error) {
    results.push({
      detail: `${url} - ${error instanceof Error ? error.message : "erreur inconnue"}`,
      label: item.path,
      passed: false,
    });
  }
}

const failures = results.filter((item) => !item.passed);

for (const item of results) {
  const symbol = item.passed ? "OK" : "FAIL";
  console.log(`${symbol} ${item.label} - ${item.detail}`);
}

if (failures.length) {
  console.error(`\nSmoke test echoue: ${failures.length} route(s) a verifier.`);
  process.exit(1);
}

console.log(`\nSmoke test OK: ${baseUrl} repond sur les routes publiques critiques.`);
