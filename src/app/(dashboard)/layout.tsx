import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentAdminUser } from "@/server/admin";
import { getCurrentUser } from "@/server/auth";
import { getCurrentBillingStatus, isBillingRequired } from "@/server/billing";
import { isAuthEnforced } from "@/server/tenant";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (isAuthEnforced()) {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }
  }

  if (!isBillingRequired()) {
    return children;
  }

  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-contratpro-pathname") ?? "";
  const isBillingPage = pathname.startsWith("/settings/billing");
  const isInternalAdmin = pathname.startsWith("/admin") || pathname.startsWith("/prospection");
  const [admin, billing] = await Promise.all([
    getCurrentAdminUser(),
    getCurrentBillingStatus(),
  ]);

  if (!billing.active && !admin && !isBillingPage && !isInternalAdmin) {
    redirect("/settings/billing?billing=required");
  }

  return children;
}
