import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  getResolvedOrganizationId,
  insertSupabaseRow,
  SupabaseWriteError,
} from "@/server/supabase-write";

const equipmentTypes = new Set([
  "BOILER_GAS",
  "BOILER_OIL",
  "HEAT_PUMP_AIR_AIR",
  "HEAT_PUMP_AIR_WATER",
  "AC_REVERSIBLE",
  "VMC",
  "OTHER",
]);

const paymentMethods = new Set(["BANK_TRANSFER", "CHECK", "SEPA"]);

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function enumValue(value: unknown, allowed: Set<string>, fallback: string) {
  return typeof value === "string" && allowed.has(value) ? value : fallback;
}

function numberValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function isoDate(value: unknown, fallback: Date) {
  const raw = text(value);
  const date = raw ? new Date(raw) : fallback;
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const customerName = text(body.customerName);
    const customerEmail = text(body.customerEmail);
    const priceTtc = numberValue(body.priceTtc);
    const vatRate = numberValue(body.vatRate) ?? 20;
    const paymentMethod = enumValue(body.paymentMethod, paymentMethods, "SEPA");
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    if (!customerName || !customerEmail || !priceTtc) {
      return NextResponse.json(
        {
          error:
            "Nom client, email client et prix TTC annuel sont obligatoires pour creer un contrat rapide.",
        },
        { status: 400 },
      );
    }

    const customer = await insertSupabaseRow<{ id: string }>("customers", {
      organization_id: await getResolvedOrganizationId(),
      company_name: customerName,
      first_name: text(body.contactFirstName),
      last_name: text(body.contactLastName),
      email: customerEmail,
      phone: text(body.customerPhone),
      address: text(body.customerAddress),
      city: text(body.customerCity),
      zip_code: text(body.customerZipCode),
      notes: "Cree depuis le contrat rapide.",
    });

    const equipmentLabel = [text(body.brand), text(body.model)]
      .filter(Boolean)
      .join(" ");
    const installation = await insertSupabaseRow<{ id: string }>("installations", {
      customer_id: customer.id,
      type: enumValue(body.equipmentType, equipmentTypes, "BOILER_GAS"),
      brand: text(body.brand),
      serial_number: text(body.serialNumber),
      model: text(body.model),
      power_kw: numberValue(body.powerKw),
      location: text(body.location),
      notes: equipmentLabel ? `Contrat rapide: ${equipmentLabel}` : "Contrat rapide.",
    });

    const startDate = isoDate(body.visibleStartDate || body.startDate, today);
    const start = new Date(startDate);
    const durationMonths = numberValue(body.durationMonths) ?? 12;
    const endDate = addMonths(start, durationMonths).toISOString();
    const notes = text(body.contractNotes);
    const contract = await insertSupabaseRow<{ id: string }>("contracts", {
      installation_id: installation.id,
      status: "ACTIVE",
      start_date: startDate,
      end_date: endDate,
      price_ht: roundCurrency(priceTtc / (1 + vatRate / 100)),
      vat_rate: vatRate,
      price_ttc: roundCurrency(priceTtc),
      billing_cycle: "ANNUAL",
      payment_method: paymentMethod,
      auto_renew: true,
      notes:
        notes ||
        (paymentMethod === "SEPA"
          ? "Contrat cree en mode guide. Prelevement SEPA a faire signer."
          : "Contrat cree en mode guide. Paiement manuel a suivre."),
    });

    return NextResponse.json(
      { customerId: customer.id, id: contract.id },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de creer ce contrat rapide." },
      { status: 500 },
    );
  }
}
