export const DEMO_ORGANIZATION_ID = "org_demo";

export class ProductionTenantConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductionTenantConfigError";
  }
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function getCurrentOrganizationId() {
  const configured =
    process.env.CONTRATPRO_ORG_ID || process.env.NEXT_PUBLIC_CONTRATPRO_ORG_ID;

  if (configured) {
    return configured;
  }

  if (isProductionRuntime() && !isAuthEnforced()) {
    throw new ProductionTenantConfigError(
      "CONTRATPRO_ORG_ID ou CONTRATPRO_REQUIRE_AUTH=true est requis en production.",
    );
  }

  return DEMO_ORGANIZATION_ID;
}

export function isDemoTenant() {
  return getCurrentOrganizationId() === DEMO_ORGANIZATION_ID;
}

export function isAuthEnforced() {
  return process.env.CONTRATPRO_REQUIRE_AUTH === "true";
}

export function isRlsExpected() {
  return process.env.CONTRATPRO_RLS_ENABLED === "true";
}

export function canUseDemoData() {
  return !isAuthEnforced() && getCurrentOrganizationId() === DEMO_ORGANIZATION_ID;
}
