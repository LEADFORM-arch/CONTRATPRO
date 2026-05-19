import {
  getDeploymentProtectionHeaders,
  getSessionCookie,
  getSmokeConfig,
  read,
} from "./smoke-test-helpers.mjs";

const { baseUrl, email, password } = getSmokeConfig("smoke:demo");
const sendEmail = process.env.CONTRATPRO_DEMO_SEND_EMAIL === "true";
const stamp = Date.now();

const commonHeaders = {
  ...getDeploymentProtectionHeaders(),
  "content-type": "application/json",
  "user-agent": "ContratPro demo journey smoke test",
};

async function loginAndGetCookie() {
  let response;
  try {
    response = await fetch(`${baseUrl}/api/auth/login`, {
      body: JSON.stringify({ email, password }),
      headers: commonHeaders,
      method: "POST",
      redirect: "manual",
    });
  } catch (error) {
    console.error(`FAIL /api/auth/login - impossible de joindre ${baseUrl}.`);
    console.error("Demarrez le serveur avec npm run dev, ou passez une URL en argument.");
    console.error(error instanceof Error ? error.message : "Erreur reseau inconnue.");
    process.exit(1);
  }

  if (!response.ok) {
    throw new Error(`login ${response.status} - ${(await read(response)).slice(0, 180)}`);
  }

  return getSessionCookie(response);
}

async function postJson(path, cookie, body, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`, {
    body: JSON.stringify(body),
    headers: { ...commonHeaders, cookie },
    method: "POST",
    redirect: "manual",
  });
  const payload = await response.json().catch(() => ({}));

  if (response.status !== expectedStatus) {
    throw new Error(`${path} ${response.status} - ${JSON.stringify(payload).slice(0, 260)}`);
  }

  return payload;
}

async function getOk(path, cookie) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      ...getDeploymentProtectionHeaders(),
      cookie,
      "user-agent": "ContratPro demo journey smoke test",
    },
    redirect: "manual",
  });

  if (!response.ok) {
    throw new Error(`${path} ${response.status} - ${(await read(response)).slice(0, 180)}`);
  }

  return response;
}

function logStep(label, detail) {
  console.log(`OK ${label}${detail ? ` - ${detail}` : ""}`);
}

const importRows = [
  {
    "raison sociale": `Martin Habitat Demo ${stamp}`,
    prenom: "Paul",
    "nom de famille": "Martin",
    email: `paul.martin.demo+${stamp}@example.fr`,
    telephone: "06 45 12 78 90",
    adresse: "8 avenue des Artisans",
    "code postal": "59000",
    ville: "Lille",
    equipement: "PAC air/eau",
    marque: "Atlantic",
    modele: "Alfea Extensa",
    "numero serie": `ATL-PAC-${stamp}`,
    puissance: "8",
    "debut contrat": "15/02/2026",
    echeance: "14/02/2027",
    "montant annuel": "264,00",
    tva: "10",
    "mode paiement": "Virement",
    notes: "Ligne demo import ContratPro",
  },
];

const cookie = await loginAndGetCookie();
logStep("Connexion smoke", baseUrl);

const dryRun = await postJson("/api/import/clients", cookie, {
  fileName: `demo-martin-${stamp}.csv`,
  mode: "dry-run",
  rows: importRows,
}, 200);

if (dryRun.validRows < 1 || dryRun.invalidRows > 0) {
  throw new Error(`dry-run import inattendu - ${JSON.stringify(dryRun).slice(0, 260)}`);
}
logStep("Import dry-run", `${dryRun.validRows} ligne valide, ${dryRun.contractsToCreate} contrat`);

const imported = await postJson("/api/import/clients", cookie, {
  fileName: `demo-martin-${stamp}.csv`,
  mode: "execute",
  rows: importRows,
}, 201);
logStep(
  "Import execute",
  `${imported.customersCreated} client, ${imported.installationsCreated} equipement, ${imported.contractsCreated} contrat`,
);

const quickContract = await postJson("/api/contracts/quick", cookie, {
  brand: "Saunier Duval",
  contactFirstName: "Paul",
  contactLastName: "Martin",
  contractNotes: "Entretien annuel chaudiere gaz avec attestation apres visite",
  customerAddress: "12 rue des Artisans",
  customerCity: "Lille",
  customerEmail: `paul.martin.sepa+${stamp}@example.fr`,
  customerName: `Martin Depannage Chauffage ${stamp}`,
  customerPhone: "06 00 00 00 00",
  customerZipCode: "59000",
  durationMonths: "12",
  equipmentType: "BOILER_GAS",
  location: "Cuisine",
  model: "ThemaPlus Condens F25",
  paymentMethod: "SEPA",
  powerKw: "25",
  priceTtc: "216",
  serialNumber: `SD-F25-${stamp}`,
  vatRate: "10",
  visibleStartDate: "2026-05-19",
}, 201);
logStep("Contrat SEPA rapide", quickContract.id);

const mandate = await postJson(
  `/api/contracts/${quickContract.id}/mandate/authorisation`,
  cookie,
  {},
  201,
);
if (!mandate.authorisationUrl) {
  throw new Error("Lien GoCardless absent dans la reponse mandat.");
}
logStep("Lien mandat GoCardless sandbox", "pret");

const invoice = await postJson("/api/invoices", cookie, {
  amountTtc: "216",
  contractId: quickContract.id,
  dueDate: "2026-06-18",
  issueDate: "2026-05-19",
  status: "DRAFT",
  vatRate: "10",
}, 201);
logStep("Facture demo creee", invoice.id);

await getOk(`/api/invoices/${invoice.id}/pdf`, cookie);
logStep("PDF facture", "generation OK");

if (sendEmail) {
  await postJson(`/api/invoices/${invoice.id}/send`, cookie, {}, 200);
  logStep("Email facture", "envoye via Resend");
} else {
  logStep("Email facture", "pret, envoi saute avec CONTRATPRO_DEMO_SEND_EMAIL=false");
}

console.log(
  `\nDemo M. Martin OK: import -> contrat -> SEPA -> facture -> PDF${sendEmail ? " -> email" : " -> email pret"} sur ${baseUrl}.`,
);
