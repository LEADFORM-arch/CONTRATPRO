import {
  getResolvedOrganizationId,
  insertSupabaseRow,
  selectSupabaseRows,
} from "@/server/supabase-write";

export type ClientImportRow = Record<string, unknown>;

export type ClientImportMode = "dry-run" | "execute";

type NormalizedImportRow = {
  line: number;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  equipment: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  powerKw: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  priceTtc: number | null;
  vatRate: number;
  paymentMethod: string;
  notes: string | null;
};

type ExistingCustomerRow = {
  id: string;
  email: string | null;
  company_name: string | null;
};

type ExistingCustomerIndex = {
  byEmail: Map<string, string>;
  byCompanyName: Map<string, string>;
};

export type ClientImportReport = {
  mode: ClientImportMode;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  customersToCreate: number;
  customersToReuse: number;
  installationsToCreate: number;
  contractsToCreate: number;
  customersCreated: number;
  customersReused: number;
  installationsCreated: number;
  contractsCreated: number;
  warnings: string[];
  errors: string[];
  preview: Array<{
    line: number;
    customer: string;
    email: string;
    phone: string;
    city: string;
    equipment: string;
    contractAmount: number | null;
    action: "create" | "reuse" | "skip";
  }>;
};

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

const paymentMethods = new Set(["SEPA", "BANK_TRANSFER", "CHECK", "CASH"]);

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

function pick(row: ClientImportRow, aliases: string[]) {
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

function normalizeEmail(value: string | null) {
  if (!value) {
    return null;
  }

  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function normalizePhone(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("0")) {
    return `+33${digits.slice(1)}`;
  }

  return trimmed;
}

function numberValue(value: string | null) {
  if (!value) {
    return null;
  }

  const cleaned = value
    .replace(/\s/g, "")
    .replace(/[€]/g, "")
    .replace(",", ".")
    .trim();
  const parsed = Number(cleaned);
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
  if (normalized.includes("fioul")) {
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

function paymentMethod(value: string | null) {
  const raw = value?.toUpperCase().replace(/[^A-Z0-9]+/g, "_") ?? "";
  if (paymentMethods.has(raw)) {
    return raw;
  }

  const normalized = normalizeHeader(value ?? "");
  if (normalized.includes("sepa") || normalized.includes("prelev")) {
    return "SEPA";
  }
  if (normalized.includes("cheque")) {
    return "CHECK";
  }
  if (normalized.includes("espece")) {
    return "CASH";
  }
  return "BANK_TRANSFER";
}

function displayName(row: NormalizedImportRow) {
  return (
    row.companyName ||
    [row.firstName, row.lastName].filter(Boolean).join(" ") ||
    "Client sans nom"
  );
}

function normalizeRow(row: ClientImportRow, index: number): NormalizedImportRow {
  const companyName = pick(row, [
    "raison sociale",
    "societe",
    "entreprise",
    "nom client",
    "client",
    "nom",
  ]);
  const firstName = pick(row, ["prenom", "contact prenom"]);
  const lastName = pick(row, ["nom de famille", "contact nom", "nom contact"]);
  const email = normalizeEmail(pick(row, ["email", "mail", "courriel"]));
  const equipment = pick(row, [
    "equipement",
    "type equipement",
    "materiel",
    "appareil",
    "installation",
  ]);
  const startDate =
    isoDate(pick(row, ["debut contrat", "date contrat", "date debut contrat"])) ??
    isoDate(pick(row, ["date intervention", "date visite", "derniere visite"]));
  const priceTtc = numberValue(
    pick(row, ["prix ttc", "montant ttc", "tarif", "contrat ttc", "montant annuel"]),
  );
  const vatRate = numberValue(pick(row, ["tva", "taux tva"])) ?? 10;

  return {
    line: index + 2,
    companyName,
    firstName,
    lastName,
    email,
    phone: normalizePhone(pick(row, ["telephone", "tel", "mobile", "portable"])),
    address: pick(row, ["adresse", "adresse client"]),
    city: pick(row, ["ville", "commune"]),
    zipCode: pick(row, ["code postal", "cp"]),
    equipment,
    brand: pick(row, ["marque"]),
    model: pick(row, ["modele", "model"]),
    serialNumber: pick(row, ["numero serie", "n serie", "serial"]),
    powerKw: numberValue(pick(row, ["puissance", "puissance kw", "kw"])),
    contractStartDate: startDate,
    contractEndDate: isoDate(pick(row, ["fin contrat", "echeance", "date echeance"])),
    priceTtc,
    vatRate,
    paymentMethod: paymentMethod(pick(row, ["mode paiement", "paiement", "payment"])),
    notes: pick(row, ["notes", "commentaire", "commentaires"]),
  };
}

function customerKey(row: NormalizedImportRow) {
  if (row.email) {
    return `email:${row.email}`;
  }

  return `name:${displayName(row).toLowerCase()}|${row.city ?? ""}`;
}

async function getExistingCustomerIndex(organizationId: string): Promise<ExistingCustomerIndex> {
  const rows = await selectSupabaseRows<ExistingCustomerRow>(
    "customers",
    `select=id,email,company_name&organization_id=eq.${encodeURIComponent(organizationId)}&limit=10000`,
  );
  const index: ExistingCustomerIndex = {
    byEmail: new Map(),
    byCompanyName: new Map(),
  };

  for (const row of rows) {
    if (row.email) {
      index.byEmail.set(row.email.toLowerCase(), row.id);
    }
    if (row.company_name) {
      index.byCompanyName.set(row.company_name.toLowerCase(), row.id);
    }
  }

  return index;
}

function findExistingCustomer(row: NormalizedImportRow, index: ExistingCustomerIndex) {
  if (row.email) {
    const customerId = index.byEmail.get(row.email);
    if (customerId) {
      return customerId;
    }
  }

  if (row.companyName) {
    return index.byCompanyName.get(row.companyName.toLowerCase()) ?? null;
  }

  return null;
}

function indexImportedCustomer(
  row: NormalizedImportRow,
  customerId: string,
  index: ExistingCustomerIndex,
) {
  if (row.email) {
    index.byEmail.set(row.email, customerId);
  }
  if (row.companyName) {
    index.byCompanyName.set(row.companyName.toLowerCase(), customerId);
  }
}

function hasEquipmentOrContract(row: NormalizedImportRow) {
  return Boolean(
    row.equipment ||
      row.brand ||
      row.model ||
      row.serialNumber ||
      row.contractStartDate ||
      row.contractEndDate ||
      row.priceTtc !== null,
  );
}

function emptyReport(mode: ClientImportMode, totalRows: number): ClientImportReport {
  return {
    mode,
    totalRows,
    validRows: 0,
    invalidRows: 0,
    customersToCreate: 0,
    customersToReuse: 0,
    installationsToCreate: 0,
    contractsToCreate: 0,
    customersCreated: 0,
    customersReused: 0,
    installationsCreated: 0,
    contractsCreated: 0,
    warnings: [],
    errors: [],
    preview: [],
  };
}

export async function runClientImport(rows: ClientImportRow[], mode: ClientImportMode) {
  const limitedRows = rows.slice(0, 1000);
  const organizationId = await getResolvedOrganizationId();
  const normalizedRows = limitedRows.map(normalizeRow);
  const report = emptyReport(mode, limitedRows.length);
  const existingCustomers = await getExistingCustomerIndex(organizationId);
  const customerCache = new Map<string, string>();
  const plannedCustomers = new Set<string>();

  if (rows.length > limitedRows.length) {
    report.warnings.push("Import limite aux 1000 premieres lignes pour garder une execution fiable.");
  }

  for (const row of normalizedRows) {
    const name = displayName(row);
    if (!row.companyName && (!row.firstName || !row.lastName)) {
      report.invalidRows += 1;
      report.errors.push(`Ligne ${row.line}: renseignez une entreprise ou un prenom + nom.`);
      continue;
    }

    report.validRows += 1;
    const key = customerKey(row);
    let customerId = customerCache.get(key) ?? null;

    if (!customerId) {
      customerId = findExistingCustomer(row, existingCustomers);
    }

    const action = customerId || plannedCustomers.has(key) ? "reuse" : "create";
    if (action === "create") {
      plannedCustomers.add(key);
      report.customersToCreate += 1;
    } else {
      report.customersToReuse += 1;
    }

    if (hasEquipmentOrContract(row)) {
      report.installationsToCreate += 1;
      report.contractsToCreate += 1;
    }

    report.preview.push({
      line: row.line,
      customer: name,
      email: row.email ?? "-",
      phone: row.phone ?? "-",
      city: row.city ?? "-",
      equipment: row.equipment ?? row.brand ?? "-",
      contractAmount: row.priceTtc,
      action,
    });

    if (mode === "dry-run") {
      continue;
    }

    if (!customerId && !customerCache.has(key)) {
      const customer = await insertSupabaseRow<{ id: string }>("customers", {
        organization_id: organizationId,
        company_name: row.companyName,
        first_name: row.firstName,
        last_name: row.lastName,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        zip_code: row.zipCode,
        notes: row.notes,
      });
      customerId = customer.id;
      customerCache.set(key, customer.id);
      indexImportedCustomer(row, customer.id, existingCustomers);
      report.customersCreated += 1;
    } else {
      customerId = customerId ?? customerCache.get(key) ?? null;
      if (customerId) {
        customerCache.set(key, customerId);
      }
      report.customersReused += 1;
    }

    if (!customerId || !hasEquipmentOrContract(row)) {
      continue;
    }

    const installation = await insertSupabaseRow<{ id: string }>("installations", {
      customer_id: customerId,
      type: equipmentType(row.equipment),
      brand: row.brand,
      model: row.model,
      serial_number: row.serialNumber,
      power_kw: row.powerKw,
      notes: "Import client ContratPro",
    });
    report.installationsCreated += 1;

    const startDate = row.contractStartDate ?? new Date().toISOString();
    const endDate = row.contractEndDate ?? addOneYear(startDate);
    const amountTtc = row.priceTtc ?? 0;
    await insertSupabaseRow<{ id: string }>("contracts", {
      installation_id: installation.id,
      status: "ACTIVE",
      start_date: startDate,
      end_date: endDate,
      price_ht: roundCurrency(amountTtc / (1 + row.vatRate / 100)),
      vat_rate: row.vatRate,
      price_ttc: roundCurrency(amountTtc),
      billing_cycle: "ANNUAL",
      payment_method: row.paymentMethod,
      auto_renew: true,
      notes: row.priceTtc === null ? "Import client - tarif a completer" : "Import client ContratPro",
    });
    report.contractsCreated += 1;
  }

  report.preview = report.preview.slice(0, 12);
  return report;
}
