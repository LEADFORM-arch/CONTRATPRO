const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");

const repoRoot = path.resolve(__dirname, "../../..");
const outDir = path.join(repoRoot, "videos/contratpro-demo/assets/screenshots");
const localAppData =
  process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || "", "AppData/Local");
const npxRoot = path.join(localAppData, "npm-cache/_npx");

function findPuppeteerRequire() {
  const entries = fs.existsSync(npxRoot) ? fs.readdirSync(npxRoot) : [];

  for (const entry of entries) {
    const packageJson = path.join(npxRoot, entry, "node_modules/puppeteer-core/package.json");
    if (fs.existsSync(packageJson)) {
      return createRequire(packageJson);
    }
  }

  throw new Error("puppeteer-core introuvable. Lancez d'abord: npx.cmd hyperframes --version");
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Serveur ContratPro indisponible: ${baseUrl}`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const requireFromPuppeteer = findPuppeteerRequire();
  const puppeteer = requireFromPuppeteer("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  const baseUrl = process.env.CONTRATPRO_CAPTURE_URL || "http://localhost:3000";
  const targets = [
    ["cockpit", "/"],
    ["relances", "/relances"],
    ["onboarding", "/onboarding"],
    ["import", "/import"],
    ["contracts", "/contracts"],
    ["invoices", "/invoices"],
    ["payments", "/payments"],
    ["terrain", "/terrain"],
    ["demo", "/demo"],
    ["pricing", "/pricing"],
  ];
  const results = [];

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await waitForServer(baseUrl);

  for (const [name, route] of targets) {
    const file = path.join(outDir, `${name}.png`);
    try {
      const response = await page.goto(`${baseUrl}${route}`, {
        waitUntil: "networkidle2",
        timeout: 45000,
      });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await page.screenshot({ path: file, fullPage: false });
      results.push({
        file: path.relative(repoRoot, file),
        name,
        route,
        status: response ? response.status() : null,
        url: page.url(),
      });
    } catch (error) {
      results.push({ error: error.message, name, route });
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
