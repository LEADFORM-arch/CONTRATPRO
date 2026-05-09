import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import {
  getResolvedOrganizationId,
  insertSupabaseRow,
  SupabaseWriteError,
} from "@/server/supabase-write";

const statuses = new Set(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]);

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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

function isoDate(value: unknown) {
  const raw = text(value);
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function statusValue(value: unknown) {
  return typeof value === "string" && statuses.has(value) ? value : "DRAFT";
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function invoiceNumber(value: unknown) {
  const manual = text(value);
  if (manual) {
    return manual;
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}${Math.floor(
    Math.random() * 90 + 10,
  )}`;
  return `FAC-${date}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser();
    if (authError) {
      return authError;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const issueDate = isoDate(body.issueDate);
    const dueDate = isoDate(body.dueDate);
    const amountTtc = numberValue(body.amountTtc);
    const vatRate = numberValue(body.vatRate) ?? 20;
    const status = statusValue(body.status);

    if (!issueDate || !dueDate || amountTtc === null) {
      return NextResponse.json(
        { error: "Date d'emission, date d'echeance et montant TTC sont obligatoires." },
        { status: 400 },
      );
    }

    const amountHt = roundCurrency(amountTtc / (1 + vatRate / 100));
    const invoice = await insertSupabaseRow<{ id: string }>("invoices", {
      organization_id: await getResolvedOrganizationId(),
      contract_id: text(body.contractId),
      number: invoiceNumber(body.number),
      status,
      issue_date: issueDate,
      due_date: dueDate,
      amount_ht: amountHt,
      vat_rate: vatRate,
      vat_amount: roundCurrency(amountTtc - amountHt),
      amount_ttc: roundCurrency(amountTtc),
      paid_at: status === "PAID" ? new Date().toISOString() : null,
    });

    return NextResponse.json({ id: invoice.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de creer cette facture." },
      { status: 500 },
    );
  }
}
