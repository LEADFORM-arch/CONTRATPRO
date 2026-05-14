export const DEMO_ORGANIZATION_ID = "org_demo";

export class ProductionTenantConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductionTenantConfigError";
  }
}

export class DemoOrganizationForbiddenError extends Error {
  constructor(source: string) {
    super(`Le tenant demo est interdit en production (${source}).`);
    this.name = "DemoOrganizationForbiddenError";
  }
}

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function assertProductionSafeOrganizationId(organizationId: string, source: string) {
  if (isProductionRuntime() && organizationId === DEMO_ORGANIZATION_ID) {
    throw new DemoOrganizationForbiddenError(source);
  }

  return organizationId;
}

export function getCurrentOrganizationId() {
  const configured =
    process.env.CONTRATPRO_ORG_ID || process.env.NEXT_PUBLIC_CONTRATPRO_ORG_ID;

  if (configured) {
    return assertProductionSafeOrganizationId(configured, "configuration");
  }

  if (isProductionRuntime() && !isAuthEnforced()) {
    throw new ProductionTenantConfigError(
      "CONTRATPRO_ORG_ID ou CONTRATPRO_REQUIRE_AUTH=true est requis en production.",
    );
  }

  return assertProductionSafeOrganizationId(DEMO_ORGANIZATION_ID, "fallback");
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
