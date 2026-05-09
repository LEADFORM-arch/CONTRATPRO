import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { insertSupabaseRow, SupabaseWriteError } from "@/server/supabase-write";

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

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function isoDate(value: unknown) {
  const raw = text(value);
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
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
    const customerId = text(body.customerId);
    const startDate = isoDate(body.startDate);
    const endDate = isoDate(body.endDate);
    const priceTtc = numberValue(body.priceTtc);
    const vatRate = numberValue(body.vatRate) ?? 20;

    if (!customerId || !startDate || !endDate || !priceTtc) {
      return NextResponse.json(
        {
          error:
            "Client, dates de contrat et prix TTC sont obligatoires pour creer le contrat.",
        },
        { status: 400 },
      );
    }

    const installation = await insertSupabaseRow<{ id: string }>("installations", {
      customer_id: customerId,
      type: enumValue(body.equipmentType, equipmentTypes, "OTHER"),
      brand: text(body.brand),
      model: text(body.model),
      serial_number: text(body.serialNumber),
      power_kw: numberValue(body.powerKw),
      location: text(body.location),
      notes: text(body.installationNotes),
    });

    const contract = await insertSupabaseRow<{ id: string }>("contracts", {
      installation_id: installation.id,
      status: "ACTIVE",
      start_date: startDate,
      end_date: endDate,
      price_ht: roundCurrency(priceTtc / (1 + vatRate / 100)),
      vat_rate: vatRate,
      price_ttc: roundCurrency(priceTtc),
      billing_cycle: "ANNUAL",
      payment_method: enumValue(body.paymentMethod, paymentMethods, "SEPA"),
      auto_renew: true,
      notes: text(body.notes),
    });

    return NextResponse.json({ id: contract.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de creer ce contrat." },
      { status: 500 },
    );
  }
}
