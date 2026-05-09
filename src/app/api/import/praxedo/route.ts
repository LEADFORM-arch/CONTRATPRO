import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  getResolvedOrganizationId,
  insertSupabaseRow,
  selectSupabaseRows,
  SupabaseWriteError,
} from "@/server/supabase-write";

type ParsedRow = Record<string, unknown>;

const equipmentTypes = new Set([
  "BOILER_GAS",
  "BOILER_OIL",
  "HEAT_PUMP_AIR_AIR",
  "HEAT_PUMP_AIR_WATER",
  "HEAT_PUMP_GEO",
  "AC_REVERSIBLE",
  "VMC",
  "OTHER",
]);

const statuses = new Set(["SCHEDULED", "COMPLETED", "CANCELLED"]);

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pick(row: ParsedRow, aliases: string[]) {
  const normalized = new Map(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
  );

  for (const alias of aliases) {
    const value = text(normalized.get(normalizeHeader(alias)));
    if (value) {
      return value;
    }
  }

  return null;
}

function numberValue(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function isoDate(value: string | null) {
  if (!value) {
    return null;
  }

  const frenchDate = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (frenchDate) {
    const [, day, month, year] = frenchDate;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`).toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function addOneYear(dateIso: string) {
  const date = new Date(dateIso);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function equipmentType(value: string | null) {
  const raw = value?.toUpperCase().replace(/[^A-Z0-9]+/g, "_") ?? "";
  if (equipmentTypes.has(raw)) {
    return raw;
  }

  const normalized = normalizeHeader(value ?? "");
  if (normalized.includes("clim")) {
    return "AC_REVERSIBLE";
  }
  if (normalized.includes("pac") || normalized.includes("pompe")) {
    return normalized.includes("air air")
      ? "HEAT_PUMP_AIR_AIR"
      : "HEAT_PUMP_AIR_WATER";
  }
  if (normalized.includes("chaudiere") && normalized.includes("fioul")) {
    return "BOILER_OIL";
  }
  if (normalized.includes("chaudiere")) {
    return "BOILER_GAS";
  }
  if (normalized.includes("vmc")) {
    return "VMC";
  }
  return "OTHER";
}

function interventionStatus(value: string | null) {
  const raw = value?.toUpperCase().replace(/[^A-Z0-9]+/g, "_") ?? "";
  if (statuses.has(raw)) {
    return raw;
  }

  const normalized = normalizeHeader(value ?? "");
  if (normalized.includes("annul")) {
    return "CANCELLED";
  }
  if (normalized.includes("plan") || normalized.includes("prevu")) {
    return "SCHEDULED";
  }
  return "COMPLETED";
}

async function findExistingCustomer(
  email: string | null,
  companyName: string,
  organizationId: string,
) {
  if (email) {
    const rows = await selectSupabaseRows<{ id: string }>(
      "customers",
      `select=id&organization_id=eq.${encodeURIComponent(organizationId)}&email=eq.${encodeURIComponent(email)}&limit=1`,
    );
    if (rows[0]) {
      return rows[0].id;
    }
  }

  const rows = await selectSupabaseRows<{ id: string }>(
    "customers",
    `select=id&organization_id=eq.${encodeURIComponent(organizationId)}&company_name=eq.${encodeURIComponent(companyName)}&limit=1`,
  );
  return rows[0]?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as { rows?: ParsedRow[] };
    const rows = Array.isArray(body.rows) ? body.rows.slice(0, 500) : [];

    if (!rows.length) {
      return NextResponse.json(
        { error: "Ajoutez au moins une ligne CSV a importer." },
        { status: 400 },
      );
    }

    const summary = {
      customersCreated: 0,
      customersReused: 0,
      installationsCreated: 0,
      contractsCreated: 0,
      interventionsCreated: 0,
      skipped: 0,
      errors: [] as string[],
    };
    const customerCache = new Map<string, string>();
    const organizationId = await getResolvedOrganizationId();

    for (const [index, row] of rows.entries()) {
      const companyName =
        pick(row, ["raison sociale", "nom client", "client", "entreprise", "societe"]) ??
        "";
      const email = pick(row, ["email", "mail", "courriel"]);
      const cacheKey = `${companyName.toLowerCase()}|${email ?? ""}`;

      if (!companyName) {
        summary.skipped += 1;
        summary.errors.push(`Ligne ${index + 2}: client introuvable.`);
        continue;
      }

      let customerId = customerCache.get(cacheKey);
      if (!customerId) {
        const existingCustomerId = await findExistingCustomer(
          email,
          companyName,
          organizationId,
        );
        if (existingCustomerId) {
          customerId = existingCustomerId;
          summary.customersReused += 1;
        } else {
          const customer = await insertSupabaseRow<{ id: string }>("customers", {
            organization_id: organizationId,
            company_name: companyName,
            first_name: pick(row, ["prenom", "contact prenom"]),
            last_name: pick(row, ["nom", "contact nom"]),
            email,
            phone: pick(row, ["telephone", "tel", "mobile", "portable"]),
            address: pick(row, ["adresse", "adresse client"]),
            city: pick(row, ["ville", "commune"]),
            zip_code: pick(row, ["code postal", "cp"]),
            notes: "Import Praxedo",
          });
          customerId = customer.id;
          summary.customersCreated += 1;
        }
        customerCache.set(cacheKey, customerId);
      }

      const equipment = pick(row, ["equipement", "type equipement", "materiel", "appareil"]);
      const brand = pick(row, ["marque"]);
      const model = pick(row, ["modele", "model"]);
      const serialNumber = pick(row, ["numero serie", "n serie", "serial"]);
      const hasEquipment = Boolean(equipment || brand || model || serialNumber);
      const interventionDate = isoDate(
        pick(row, [
          "date intervention",
          "date d intervention",
          "date debut",
          "date de visite",
          "realise le",
        ]),
      );
      const startDate =
        isoDate(pick(row, ["debut contrat", "date contrat", "date debut contrat"])) ??
        interventionDate ??
        new Date().toISOString();
      const endDate =
        isoDate(pick(row, ["fin contrat", "echeance", "date echeance"])) ??
        addOneYear(startDate);
      const priceTtc = numberValue(
        pick(row, ["prix ttc", "montant ttc", "tarif", "contrat ttc"]),
      );
      const vatRate = numberValue(pick(row, ["tva", "taux tva"])) ?? 10;
      let contractId: string | null = null;

      if (hasEquipment || interventionDate || priceTtc !== null) {
        const installation = await insertSupabaseRow<{ id: string }>("installations", {
          customer_id: customerId,
          type: equipmentType(equipment),
          brand,
          model,
          serial_number: serialNumber,
          power_kw: numberValue(pick(row, ["puissance", "puissance kw", "kw"])),
          location: pick(row, ["emplacement", "localisation", "piece"]),
          notes: "Import Praxedo",
        });
        summary.installationsCreated += 1;

        const contractAmount = priceTtc ?? 0;
        const contract = await insertSupabaseRow<{ id: string }>("contracts", {
          installation_id: installation.id,
          status: "ACTIVE",
          start_date: startDate,
          end_date: endDate,
          price_ht: roundCurrency(contractAmount / (1 + vatRate / 100)),
          vat_rate: vatRate,
          price_ttc: roundCurrency(contractAmount),
          billing_cycle: "ANNUAL",
          payment_method: "BANK_TRANSFER",
          auto_renew: true,
          notes: priceTtc === null ? "Import Praxedo - tarif a completer" : "Import Praxedo",
        });
        contractId = contract.id;
        summary.contractsCreated += 1;
      }

      if (interventionDate && contractId) {
        await insertSupabaseRow<{ id: string }>("interventions", {
          contract_id: contractId,
          performed_at: interventionDate,
          technician: pick(row, ["technicien", "intervenant"]),
          status: interventionStatus(pick(row, ["statut", "etat intervention"])),
          report: pick(row, ["compte rendu", "rapport", "commentaire", "notes"]),
          next_visit_date: isoDate(pick(row, ["prochaine visite", "date prochaine visite"])),
        });
        summary.interventionsCreated += 1;
      }
    }

    return NextResponse.json(summary, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de migrer cet export Praxedo." },
      { status: 500 },
    );
  }
}
