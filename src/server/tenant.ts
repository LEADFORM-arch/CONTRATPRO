export const DEMO_ORGANIZATION_ID = "org_demo";

export function getCurrentOrganizationId() {
  return (
    process.env.CONTRATPRO_ORG_ID ||
    process.env.NEXT_PUBLIC_CONTRATPRO_ORG_ID ||
    DEMO_ORGANIZATION_ID
  );
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
