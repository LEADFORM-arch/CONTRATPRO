import { redirect } from "next/navigation";

import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import { getCurrentAdminUser } from "@/server/admin";
import { getCurrentUser } from "@/server/auth";
import {
  getCertificates,
  getContracts,
  getCustomers,
  getPayments,
} from "@/server/contratpro-data";
import { isAuthEnforced } from "@/server/tenant";

export const dynamic = "force-dynamic";

type CardTone = "amber" | "cyan" | "emerald" | "rose";

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: CardTone;
}) {
  return (
    <article className="dashboard-stat-card" data-tone={tone}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <strong className="mt-3 block text-3xl font-semibold text-zinc-950">
        {value}
      </strong>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </article>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="dashboard-mini-metric">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <strong className="mt-2 block text-xl font-semibold text-zinc-950">
        {value}
      </strong>
    </div>
  );
}

export default async function Home() {
  if (isAuthEnforced()) {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }
  }

  const [contracts, customers, certificates, payments] = await Promise.all([
    getContracts(),
    getCustomers(),
    getCertificates(),
    getPayments(),
  ]);
  const isAdmin = Boolean(await getCurrentAdminUser());

  const annualRevenue = contracts.reduce(
    (sum, contract) => sum + contract.value,
    0,
  );
  const sepaPayments = payments.filter((payment) => payment.method === "SEPA");
  const sepaShare = payments.length
    ? Math.round((sepaPayments.length / payments.length) * 100)
    : 0;
  const certificatesToSend = certificates.filter((certificate) =>
    certificate.status.toLowerCase().includes("envoyer"),
  );
  const renewals = contracts.slice(0, 5);
  const paymentQueue = payments.slice(0, 4);

  return (
    <AppShell activePath="/" showInternalTools={isAdmin}>
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <a
                className="premium-secondary-action rounded-md px-4 py-2 text-sm font-medium"
                href="/admin/prospection"
              >
                Admin prospection
              </a>
            ) : null}
            <a className="premium-secondary-action rounded-md px-4 py-2 text-sm font-medium" href="/relances">
              Voir relances
            </a>
            <a className="premium-action rounded-md text-sm font-semibold" href="/contracts/new">
              Nouveau contrat
            </a>
          </div>
        }
        description="Vue executive des renouvellements, visites legales, attestations et paiements recurrents alimentes par Supabase."
        eyebrow="Tableau de bord"
        title="Pilotage commercial et legal des contrats CVC"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail={`${contracts.length} contrats suivis`}
          label="Revenu annuel"
          tone="emerald"
          value={formatEuro(annualRevenue)}
        />
        <StatCard
          detail={`${customers.length} fiches clients actives`}
          label="Portefeuille"
          tone="cyan"
          value={String(customers.length)}
        />
        <StatCard
          detail={`${certificatesToSend.length} attestations a traiter`}
          label="Conformite"
          tone="amber"
          value={String(certificates.length)}
        />
        <StatCard
          detail={`${sepaPayments.length} paiements SEPA suivis`}
          label="SEPA"
          tone="rose"
          value={`${sepaShare}%`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="dashboard-section overflow-hidden">
          <div className="dashboard-section-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-950">
                Renouvellements prioritaires
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Tries par echeance pour declencher les relances au bon moment.
              </p>
            </div>
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/contracts"
            >
              Voir tous
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="dashboard-table-head text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Equipement</th>
                  <th className="px-4 py-3 font-semibold">Echeance</th>
                  <th className="px-4 py-3 font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {renewals.map((contract) => (
                  <tr className="dashboard-table-row" key={contract.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-zinc-950">
                        {contract.customer}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {contract.city}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {contract.equipment}
                    </td>
                    <td className="px-4 py-4 text-zinc-700">
                      {contract.renewal}
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {formatEuro(contract.value)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill>{contract.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-section p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-950">
                Situation dirigeant
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Les signaux qui parlent chiffre d'affaires, cash et risque.
              </p>
            </div>
            <span className="dashboard-live-pill">Live</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MiniMetric
              label="Panier contrat moyen"
              value={formatEuro(
                contracts.length ? Math.round(annualRevenue / contracts.length) : 0,
              )}
            />
            <MiniMetric
              label="Revenu client moyen"
              value={formatEuro(
                customers.length ? Math.round(annualRevenue / customers.length) : 0,
              )}
            />
            <MiniMetric
              label="Attestations en attente"
              value={String(certificatesToSend.length)}
            />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="dashboard-section p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-950">
                Paiements a surveiller
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Prelevements, virements et relances issus du modele Supabase.
              </p>
            </div>
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/payments"
            >
              Paiements
            </a>
          </div>

          <div className="mt-5 divide-y divide-zinc-100">
            {paymentQueue.map((payment) => (
              <div
                className="dashboard-list-row grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                key={payment.id}
              >
                <div>
                  <p className="font-medium text-zinc-950">{payment.customer}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {payment.method} - {payment.dueDate}
                  </p>
                </div>
                <strong className="text-sm text-zinc-950">
                  {formatEuro(payment.amount)}
                </strong>
                <StatusPill>{payment.status}</StatusPill>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-950">
                Conformite entretien
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Attestations legales rattachees aux interventions et contrats.
              </p>
            </div>
            <a
              className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
              href="/certificates"
            >
              Attestations
            </a>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {certificates.slice(0, 3).map((certificate) => (
              <article className="dashboard-certificate-card" key={certificate.id}>
                <p className="text-sm font-semibold text-zinc-950">
                  {certificate.customer}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {certificate.equipment}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {certificate.issuedAt}
                </p>
                <div className="mt-3">
                  <StatusPill>{certificate.status}</StatusPill>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
