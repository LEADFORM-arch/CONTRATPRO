import { NextResponse } from "next/server";

import { getCurrentAdminUser } from "@/server/admin";
import { AuthRequiredError, getCurrentUser } from "@/server/auth";
import { getCurrentBillingStatus, isBillingRequired } from "@/server/billing";
import { isAuthEnforced } from "@/server/tenant";

export async function requireApiUser(options: { allowInactiveBilling?: boolean } = {}) {
  if (!isAuthEnforced()) {
    return null;
  }

  const user = await getCurrentUser();
  if (user) {
    if (isBillingRequired() && !options.allowInactiveBilling) {
      const admin = await getCurrentAdminUser();
      const billing = await getCurrentBillingStatus();
      if (!billing.active && !admin) {
        return NextResponse.json(
          {
            error:
              "Abonnement ContratPro requis pour utiliser cette API.",
          },
          { status: 402 },
        );
      }
    }

    return null;
  }

  return NextResponse.json(
    { error: "Authentification requise." },
    { status: 401 },
  );
}

export function apiAuthErrorResponse(error: unknown) {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json(
      { error: error.message || "Authentification requise." },
      { status: 401 },
    );
  }

  return null;
}
