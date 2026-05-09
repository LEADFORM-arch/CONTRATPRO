import { NextResponse } from "next/server";

import { getCurrentAdminUser } from "@/server/admin";
import { getOpsHealth } from "@/server/ops-health";

export async function GET() {
  const admin = await getCurrentAdminUser();

  if (!admin) {
    return NextResponse.json(
      { error: "Acces admin supervision requis." },
      { status: 403 },
    );
  }

  return NextResponse.json(await getOpsHealth());
}
