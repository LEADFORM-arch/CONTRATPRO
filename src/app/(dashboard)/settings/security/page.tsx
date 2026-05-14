import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { getCurrentAdminUser, getAdminEmails } from "@/server/admin";
import { getCurrentUser } from "@/server/auth";
import {
  getCurrentOrganizationId,
  isAuthEnforced,
  isDemoTenant,
  isRlsExpected,
} from "@/server/tenant";

import { LogoutButton } from "./LogoutButton";

const checklist = [
  {
    label: "Schema initial",
    detail: "supabase/schema.sql execute",
    status: "Fait",
  },
  {
    label: "Seeds demo",
    detail: "supabase/seed.sql execute pour la validation locale",
    status: "Fait",
  },
  {
    label: "Relances",
    detail: "supabase/renewal_actions.sql execute",
    status: "A verifier",
  },
  {
    label: "Acquisition interne",
    detail: "supabase/prospection.sql execute",
    status: "A verifier",
  },
  {
    label: "Documents",
    detail: "supabase/document_sends.sql execute pour historiser les envois",
    status: "A verifier",
  },
  {
    label: "Encaissement SEPA",
    detail: "supabase/payment_events.sql execute pour tracer GoCardless",
    status: "A verifier",
  },
  {
    label: "Billing ContratPro",
    detail: "supabase/billing.sql execute pour Stripe",
    status: "A verifier",
  },
  {
    label: "Notifications",
    detail: "supabase/notifications.sql execute pour les alertes internes",
    status: "A verifier",
  },
  {
    label: "Imports",
    detail: "supabase/import_logs.sql execute pour tracer les imports Excel/CSV",
    status: "A verifier",
  },
  {
    label: "RLS multi-tenant",
    detail: "supabase/rls.sql execute apres les scripts metier",
    status: "A faire",
  },
];

export default async function SecuritySettingsPage() {
  const userPromise = getCurrentUser();
  const organizationId = getCurrentOrganizationId();
  const authEnforced = isAuthEnforced();
  const rlsExpected = isRlsExpected();
  const demoTenant = isDemoTenant();
  const currentUser = await userPromise;
  const currentAdmin = await getCurrentAdminUser();
  const adminEmails = [...getAdminEmails()].join(", ");

  return (
    <AppShell activePath="/settings/security" showInternalTools={Boolean(currentAdmin)}>
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/settings/company"
          >
            Identite entreprise
          </a>
        }
        description="Controlez le tenant courant, le mode demo, les scripts Supabase a executer et les garde-fous avant production."
        eyebrow="Production"
        title="Securite, documents et multi-tenant"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Organisation", organizationId],
          ["Mode demo", demoTenant ? "Actif" : "Desactive"],
          ["Auth requise", authEnforced ? "Oui" : "Non"],
          ["Admin", currentAdmin ? "Oui" : "Non"],
        ].map(([label, value], index) => (
          <article
            className="security-stat-card"
            data-tone={["cyan", "amber", "emerald", "rose"][index]}
            key={label}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {label}
            </p>
            <strong className="mt-3 block break-all text-xl font-semibold text-zinc-50">
              {value}
            </strong>
          </article>
        ))}
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <article className="settings-panel rounded-lg border p-5 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-50">
            Checklist production
          </h3>
          <div className="facebook-groups mt-4 divide-y rounded-lg border">
            {checklist.map((item) => (
              <div
                className="facebook-group-row flex items-center justify-between gap-4 px-4 py-3"
                key={item.label}
              >
                <div>
                  <p className="font-medium text-zinc-50">{item.label}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.detail}</p>
                </div>
                <StatusPill>{item.status}</StatusPill>
              </div>
            ))}
          </div>
        </article>

        <aside className="settings-side-panel rounded-lg border p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-50">Session</h3>
              <p className="mt-1 text-sm text-zinc-500">
                {currentUser?.email ?? "Aucun utilisateur connecte"}
              </p>
            </div>
            {currentUser ? (
              <LogoutButton />
            ) : (
              <a
                className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
                href="/login"
              >
                Connexion
              </a>
            )}
          </div>

          <h3 className="mt-6 text-base font-semibold text-zinc-50">
            Variables recommandees
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">CONTRATPRO_ORG_ID</dt>
              <dd className="font-semibold text-zinc-50">
                Tenant courant cote serveur
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">CONTRATPRO_REQUIRE_AUTH</dt>
              <dd className="font-semibold text-zinc-50">true en production</dd>
            </div>
            <div>
              <dt className="text-zinc-500">CONTRATPRO_RLS_ENABLED</dt>
              <dd className="font-semibold text-zinc-50">true apres rls.sql</dd>
            </div>
            <div>
              <dt className="text-zinc-500">CONTRATPRO_ADMIN_EMAILS</dt>
              <dd className="font-semibold text-zinc-50">{adminEmails}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">CONTRATPRO_NOTIFICATION_EMAILS</dt>
              <dd className="font-semibold text-zinc-50">
                Destinataires alertes internes
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">SUPABASE_SERVICE_ROLE_KEY</dt>
              <dd className="font-semibold text-zinc-50">Serveur uniquement</dd>
            </div>
            <div>
              <dt className="text-zinc-500">RESEND_API_KEY</dt>
              <dd className="font-semibold text-zinc-50">
                Requis pour envoyer factures et attestations
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">RESEND_FROM_EMAIL</dt>
              <dd className="font-semibold text-zinc-50">
                Expediteur documents client
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">GOCARDLESS_ACCESS_TOKEN</dt>
              <dd className="font-semibold text-zinc-50">
                Requis pour soumettre les prelevements
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">GOCARDLESS_ENVIRONMENT</dt>
              <dd className="font-semibold text-zinc-50">
                sandbox en test, live en production
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">GOCARDLESS_WEBHOOK_ENDPOINT_SECRET</dt>
              <dd className="font-semibold text-zinc-50">
                Requis pour verifier les webhooks
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="settings-panel mt-6 rounded-lg border p-5 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-50">
          Ordre SQL recommande
        </h3>
        <pre className="mt-4 overflow-x-auto rounded-md bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
{`1. supabase/schema.sql
2. supabase/seed.sql
3. supabase/renewal_actions.sql
4. supabase/prospection.sql   -- acquisition interne fondateur
5. supabase/document_sends.sql -- historique documents
6. supabase/payment_events.sql -- journal provider SEPA
7. supabase/billing.sql        -- abonnement Stripe
8. supabase/notifications.sql  -- alertes internes
9. supabase/import_logs.sql    -- historique imports Excel/CSV
10. supabase/invoices_seed.sql -- optionnel
11. supabase/rls.sql           -- dernier, pour verrouiller
12. supabase/verify_rls.sql    -- toutes les lignes doivent etre OK`}
        </pre>
      </section>
    </AppShell>
  );
}
