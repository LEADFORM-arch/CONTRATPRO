import { loadLocalEnv } from "./smoke-test-helpers.mjs";

loadLocalEnv();

const apiKey = process.env.RESEND_API_KEY?.trim();
const from = (process.env.RESEND_FROM_EMAIL || process.env.CONTRATPRO_FROM_EMAIL || "").trim();
const testTo = process.env.CONTRATPRO_RESEND_TEST_TO?.trim();

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK ${message}`);
}

function extractEmail(value) {
  const bracket = value.match(/<([^>]+)>/);
  return (bracket?.[1] ?? value).trim().toLowerCase();
}

function domainOf(email) {
  return email.includes("@") ? email.split("@").pop() : "";
}

function domainRows(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
}

function isVerifiedStatus(value) {
  return ["active", "success", "verified"].includes(String(value ?? "").toLowerCase());
}

if (!apiKey) {
  fail("RESEND_API_KEY absent.");
}

if (!from) {
  fail("RESEND_FROM_EMAIL absent.");
}

const fromEmail = extractEmail(from);
const fromDomain = domainOf(fromEmail);

if (!fromEmail || !fromDomain) {
  fail(`RESEND_FROM_EMAIL invalide: ${from}`);
}

if (fromDomain === "resend.dev" || fromDomain.includes("example") || fromDomain.includes("votre-domaine")) {
  fail(`RESEND_FROM_EMAIL doit utiliser un domaine verifie, pas ${fromDomain}.`);
}

ok("Variables Resend presentes");
ok(`Expediteur configure sur ${fromDomain}`);

const domainsResponse = await fetch("https://api.resend.com/domains", {
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": "ContratPro resend readiness",
  },
});
const domainsPayload = await domainsResponse.json().catch(() => null);

if (!domainsResponse.ok) {
  fail(`Resend domains ${domainsResponse.status} - ${JSON.stringify(domainsPayload).slice(0, 220)}`);
}

const domains = domainRows(domainsPayload);
const matchingDomain = domains.find((domain) => String(domain.name ?? "").toLowerCase() === fromDomain);

if (!matchingDomain) {
  fail(`Domaine ${fromDomain} introuvable dans le compte Resend.`);
}

if (!isVerifiedStatus(matchingDomain.status)) {
  fail(`Domaine ${fromDomain} non verifie dans Resend (status: ${matchingDomain.status ?? "inconnu"}).`);
}

ok(`Domaine Resend verifie: ${fromDomain}`);

if (testTo) {
  const emailResponse = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: "<p>Test technique ContratPro : Resend est pret pour les factures, attestations et relances.</p>",
      subject: "ContratPro - test Resend",
      text: "Test technique ContratPro : Resend est pret pour les factures, attestations et relances.",
      to: [testTo],
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "ContratPro resend readiness",
    },
    method: "POST",
  });
  const emailPayload = await emailResponse.json().catch(() => null);

  if (!emailResponse.ok) {
    fail(`Email test ${emailResponse.status} - ${JSON.stringify(emailPayload).slice(0, 220)}`);
  }

  ok(`Email test envoye: ${emailPayload?.id ?? "id non retourne"}`);
} else {
  ok("Email test non envoye (definir CONTRATPRO_RESEND_TEST_TO pour tester l'envoi reel).");
}

console.log("\nResend OK: domaine et expediteur prets pour factures, attestations et relances.");
