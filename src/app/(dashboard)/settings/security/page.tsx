import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { getAdminEmails, getCurrentAdminUser } from "@/server/admin";
import { getCurrentUser } from "@/server/auth";
import {
  getCurrentOrganizationId,
  isAuthEnforced,
  isDemoTenant,
  isRlsExpected,
} from "@/server/tenant";

import { LogoutButton } from "./LogoutButton";

const trustPillars = [
  {
    detail:
      "Chaque entreprise travaille dans son propre espace. Les clients, contrats, factures, attestations et paiements restent rattaches a votre organisation.",
    label: "Espace entreprise isole",
    proof: "Organisation dediee",
  },
  {
    detail:
      "Les documents envoyes et les actions sensibles sont historises afin de garder une preuve exploitable en cas de question client.",
    label: "Documents tracables",
    proof: "Historique d'envoi",
  },
  {
    detail:
      "Les paiements SEPA passent par une integration serveur. Les cles provider ne sont jamais affichees dans votre espace client.",
    label: "Cles API masquees",
    proof: "Serveur uniquement",
  },
  {
    detail:
      "Les incidents de paiement, webhooks et notifications internes sont journalises pour eviter qu'un rejet SEPA reste invisible.",
    label: "Surveillance active",
    proof: "Journal paiement",
  },
];

const paymentFlow = [
  ["1", "Contrat", "Le contrat annuel porte le montant, l'echeance et le mode de paiement."],
  ["2", "Mandat", "Le mandat SEPA relie le client final au contrat de maintenance."],
  ["3", "Soumission", "ContratPro soumet le paiement au provider depuis le serveur."],
  ["4", "Suivi", "Chaque retour provider alimente le journal et les alertes."],
];

const clientAssurances = [
  "Vous n'avez pas a creer de compte technique GoCardless, Resend ou Stripe pour utiliser ContratPro.",
  "Les identifiants provider sont configures cote ContratPro et ne sont jamais exposes dans l'interface.",
  "Les fonds et les statuts de paiement doivent rester auditables via les journaux separes.",
  "L'encaissement SEPA live reste soumis a validation juridique et activation controlee.",
];

const adminChecklist = [
  ["Schema initial", "supabase/schema.sql execute", "Fait"],
  ["Documents", "supabase/document_sends.sql execute pour historiser les envois", "A verifier"],
  ["Encaissement SEPA", "supabase/payment_events.sql execute pour tracer GoCardless", "A verifier"],
  ["Billing ContratPro", "supabase/billing.sql execute pour Stripe", "A verifier"],
  ["Notifications", "supabase/notifications.sql execute pour les alertes internes", "A verifier"],
  ["RLS multi-tenant", "supabase/rls.sql execute puis verify_rls.sql", "A faire"],
] as const;

export default async function SecuritySettingsPage() {
  const userPromise = getCurrentUser();
  const organizationId = getCurrentOrganizationId();
  const authEnforced = isAuthEnforced();
  const rlsExpected = isRlsExpected();
  const demoTenant = isDemoTenant();
  const localVercelEnv = process.env.VERCEL_ENV ?? "";
  const localNodeEnv = process.env.NODE_ENV ?? "";
  const currentUser = await userPromise;
  const currentAdmin = await getCurrentAdminUser();
  const adminEmails = [...getAdminEmails()].join(", ");
  const envGuardReady = organizationId !== "org_demo" && localVercelEnv !== "production";

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
        description="Comprendre comment ContratPro protege vos contrats, vos documents et vos paiements recurrents sans exposer de cles techniques."
        eyebrow="Confiance"
        title="Securite et paiements"
      />

      <section className="trust-command mt-6 rounded-lg border p-5" data-od-id="client-security-trust">
        <div className="trust-command-copy">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Synthese dirigeant
          </p>
          <h3>Vos contrats restent dans un espace isole. Les providers restent cote ContratPro.</h3>
          <p>
            Le chauffagiste utilise le produit, pas l'infrastructure. Les emails,
            documents et paiements sont operes par le serveur ContratPro, avec
            journaux et alertes pour garder une trace claire.
          </p>
        </div>
        <div className="trust-command-status">
          <span>Mode actuel</span>
          <strong>{demoTenant ? "Demo controlee" : "Espace entreprise"}</strong>
          <em>{authEnforced ? "Connexion requise" : "Mode demonstration local"}</em>
        </div>
      </section>

      <section className="trust-pillar-grid mt-5">
        {trustPillars.map((item) => (
          <article className="trust-pillar-card" key={item.label}>
            <span>{item.proof}</span>
            <h3>{item.label}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="payment-trust-panel rounded-lg border p-5">
          <div className="trust-section-header">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                Paiements recurrents
              </p>
              <h3>Comment circule un paiement SEPA</h3>
            </div>
            <StatusPill>Controle serveur</StatusPill>
          </div>
          <div className="payment-flow mt-4">
            {paymentFlow.map(([step, label, detail]) => (
              <div className="payment-flow-step" key={step}>
                <strong>{step}</strong>
                <div>
                  <span>{label}</span>
                  <p>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="payment-assurance-panel rounded-lg border p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Important
          </p>
          <h3>Ce qui est cache au client, ce qui reste a valider</h3>
          <div className="assurance-list mt-4">
            {clientAssurances.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </aside>
      </section>

      <section className="trust-audit-panel mt-5 rounded-lg border p-5">
        <div className="trust-section-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Auditabilite
            </p>
            <h3>Les preuves disponibles dans ContratPro</h3>
          </div>
          <StatusPill>Journaux separes</StatusPill>
        </div>
        <div className="trust-audit-grid mt-4">
          {[
            ["Documents", "Historique des factures et attestations envoyees."],
            ["Paiements", "Evenements provider, statuts et motifs de rejet."],
            ["Notifications", "Alertes internes sur incidents critiques."],
            ["Imports", "Simulation et execution des fichiers clients."],
          ].map(([label, detail]) => (
            <article key={label}>
              <strong>{label}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </div>
      </section>

      {currentAdmin ? (
        <section className="admin-security-diagnostics mt-6 rounded-lg border p-5">
          <div className="trust-section-header">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-300">
                Diagnostic admin
              </p>
              <h3>Garde-fous techniques avant production</h3>
            </div>
            <StatusPill>{rlsExpected ? "RLS attendue" : "RLS non forcee"}</StatusPill>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["Organisation", organizationId, "cyan"],
              ["Mode demo", demoTenant ? "Actif" : "Desactive", "amber"],
              ["Auth requise", authEnforced ? "Oui" : "Non", "emerald"],
              ["Env local", envGuardReady ? "Sain" : "A verifier", "rose"],
            ].map(([label, value, tone]) => (
              <article className="security-stat-card" data-tone={tone} key={label}>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {label}
                </p>
                <strong className="mt-3 block break-all text-xl font-semibold text-zinc-50">
                  {value}
                </strong>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
            <article className="settings-panel rounded-lg border p-5 shadow-sm">
              <h3 className="text-base font-semibold text-zinc-50">
                Checklist production
              </h3>
              <div className="facebook-groups mt-4 divide-y rounded-lg border">
                {adminChecklist.map(([label, detail, status]) => (
                  <div
                    className="facebook-group-row flex items-center justify-between gap-4 px-4 py-3"
                    key={label}
                  >
                    <div>
                      <p className="font-medium text-zinc-50">{label}</p>
                      <p className="mt-1 text-sm text-zinc-500">{detail}</p>
                    </div>
                    <StatusPill>{status}</StatusPill>
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
                Variables serveur
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["CONTRATPRO_ADMIN_EMAILS", adminEmails],
                  ["CONTRATPRO_REQUIRE_AUTH", "true en production"],
                  ["CONTRATPRO_RLS_ENABLED", "true apres rls.sql"],
                  ["RESEND_API_KEY", "Serveur uniquement"],
                  ["GOCARDLESS_ACCESS_TOKEN", "Serveur uniquement"],
                  ["GOCARDLESS_WEBHOOK_ENDPOINT_SECRET", "Signature webhook"],
                  ["STRIPE_WEBHOOK_SECRET", "Signature Stripe"],
                ].map(([label, detail]) => (
                  <div key={label}>
                    <dt className="text-zinc-500">{label}</dt>
                    <dd className="font-semibold text-zinc-50">{detail}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>

          <section className="settings-panel mt-5 rounded-lg border p-5 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-50">
              Ordre SQL recommande
            </h3>
            <pre className="mt-4 overflow-x-auto rounded-md bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
{`1. supabase/schema.sql
2. supabase/seed.sql
3. supabase/renewal_actions.sql
4. supabase/prospection.sql
5. supabase/document_sends.sql
6. supabase/payment_events.sql
7. supabase/billing.sql
8. supabase/notifications.sql
9. supabase/import_logs.sql
10. supabase/rls.sql
11. supabase/verify_rls.sql`}
            </pre>
          </section>
        </section>
      ) : null}
    </AppShell>
  );
}
