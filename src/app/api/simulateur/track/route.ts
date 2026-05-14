import { NextResponse } from "next/server";

import { serviceInsert, SupabaseServiceError } from "@/server/supabase-service";

type SimulatorPayload = {
  contractCount?: unknown;
  forgottenRate?: unknown;
  planMonthlyPrice?: unknown;
  renewalRate?: unknown;
  result?: {
    annualCost?: unknown;
    breakEvenMonths?: unknown;
    forgottenContracts?: unknown;
    lostRevenue?: unknown;
    recoveredRevenue?: unknown;
    roiNet?: unknown;
    roiPercent?: unknown;
  };
  yearlyContractPrice?: unknown;
};

function numberInRange(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.min(Math.max(Math.round(value), min), max);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SimulatorPayload;
    const result = payload.result ?? {};
    const row = {
      annual_cost: numberInRange(result.annualCost, 0, 100000),
      break_even_months: numberInRange(result.breakEvenMonths, 1, 120),
      contract_count: numberInRange(payload.contractCount, 0, 10000),
      forgotten_contracts: numberInRange(result.forgottenContracts, 0, 10000),
      forgotten_rate: numberInRange(payload.forgottenRate, 0, 100),
      lost_revenue: numberInRange(result.lostRevenue, 0, 10000000),
      plan_monthly_price: numberInRange(payload.planMonthlyPrice, 0, 1000),
      recovered_revenue: numberInRange(result.recoveredRevenue, 0, 10000000),
      renewal_rate: numberInRange(payload.renewalRate, 0, 100),
      roi_net: numberInRange(result.roiNet, -10000000, 10000000),
      roi_percent: numberInRange(result.roiPercent, -10000, 10000),
      source: "public_simulator",
      yearly_contract_price: numberInRange(payload.yearlyContractPrice, 0, 10000),
    };

    await serviceInsert("simulation_leads", row);
    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    if (error instanceof SupabaseServiceError) {
      return NextResponse.json({ ok: true, stored: false }, { status: 202 });
    }

    return NextResponse.json({ ok: true, stored: false }, { status: 202 });
  }
}
