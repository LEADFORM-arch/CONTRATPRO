import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function pathOf(path) {
  return resolve(root, path);
}

function read(path) {
  return readFileSync(pathOf(path), "utf8");
}

function assertIncludes(content, values, label) {
  for (const value of values) {
    assert.ok(content.includes(value), `${label} should include ${value}`);
  }
}

describe("tenant isolation hardening", () => {
  it("keeps Supabase migrations ordered before RLS verification", () => {
    assert.ok(existsSync(pathOf("supabase/migration-order.json")), "migration manifest should exist");
    const manifest = JSON.parse(read("supabase/migration-order.json"));
    const files = manifest.scripts.map((script) => script.file);

    assert.equal(files[0], "schema.sql", "schema.sql should be first");
    assert.equal(files.at(-1), "verify_rls.sql", "verify_rls.sql should be last");
    assert.ok(files.indexOf("rls.sql") < files.indexOf("verify_rls.sql"), "rls.sql should run before verify_rls.sql");

    for (const file of [
      "document_sends.sql",
      "payment_events.sql",
      "billing.sql",
      "notifications.sql",
      "import_logs.sql",
    ]) {
      assert.ok(files.indexOf(file) < files.indexOf("rls.sql"), `${file} should run before rls.sql`);
    }
  });

  it("keeps RLS policies tied to tenant helpers rather than broad table access", () => {
    const rls = read("supabase/rls.sql");

    assertIncludes(rls, [
      "current_organization_ids",
      "can_access_organization",
      "can_access_customer",
      "can_access_installation",
      "can_access_contract",
      "can_access_intervention",
    ], "tenant helper functions");

    for (const table of [
      "organizations",
      "customers",
      "installations",
      "contracts",
      "interventions",
      "certificates",
      "invoices",
      "document_sends",
      "sepa_mandates",
      "sepa_payments",
      "payment_events",
      "renewal_actions",
      "billing_subscriptions",
      "billing_events",
      "internal_notifications",
      "import_logs",
    ]) {
      assert.ok(rls.includes(`public.${table}`), `${table} should be mentioned in rls.sql`);
    }

    assertIncludes(rls, [
      "payment_events_by_org",
      "where p.id = payment_id",
      "and p.organization_id = organization_id",
    ], "payment event tenant join");

    assert.ok(!rls.includes("using (true)"), "RLS policies should not allow broad using true");
  });

  it("keeps service-role APIs resolving organization scope explicitly", () => {
    for (const route of [
      "src/app/api/billing/checkout/route.ts",
      "src/app/api/certificates/route.ts",
      "src/app/api/contracts/route.ts",
      "src/app/api/customers/route.ts",
      "src/app/api/import/clients/route.ts",
      "src/app/api/invoices/route.ts",
      "src/app/api/payments/route.ts",
      "src/app/api/relances/send/route.ts",
      "src/app/api/settings/company/route.ts",
    ]) {
      const content = read(route);
      assert.ok(content.includes("requireApiUser"), `${route} should require an authenticated user`);
      assert.ok(
        content.includes("getResolvedOrganizationId") ||
          content.includes("getRequestOrganizationId") ||
          content.includes("user.organizationId") ||
          content.includes("getContractDetail") ||
          content.includes("getCustomerDetail") ||
          content.includes("getOrganizationProfile") ||
          content.includes("runClientImport") ||
          content.includes("getRecentClientImportLogs"),
        `${route} should resolve organization scope`,
      );
    }
  });
});
