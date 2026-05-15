import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { formatEuro } from "@/lib/mock-data";
import { getContracts } from "@/server/contratpro-data";

type ContractTone = "amber" | "cyan" | "emerald";

function PortfolioMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: ContractTone;
}) {
  return (
    <article className="contract-metric-card" data-tone={tone}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <strong className="mt-3 block text-3xl font-semibold text-zinc-950">
        {value}
      </strong>
      <p className="mt-2 text-sm leading-5 text-zinc-500">{detail}</p>
    </article>
  );
}

export default async function ContractsPage() {
  const contracts = await getContracts();
  const total = contracts.reduce((sum, contract) => sum + contract.value, 0);
  const sepaContracts = contracts.filter((contract) =>
    contract.payment.toUpperCase().includes("SEPA"),
  );

  return (
    <AppShell activePath="/contracts">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/contracts/new">
            Creer contrat
          </a>
        }
        description="Suivez les contrats annuels, les dates anniversaires, les modes de paiement et les relances a declencher."
        eyebrow="Gestion contrats"
        title="Contrats de maintenance CVC"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <PortfolioMetric
          detail="contrats actifs dans le portefeuille"
          label="Contrats actifs"
          tone="cyan"
          value={String(contracts.length)}
        />
        <PortfolioMetric
          detail="revenu annuel suivi dans ContratPro"
          label="Revenu annuel"
          tone="emerald"
          value={formatEuro(total)}
        />
        <PortfolioMetric
          detail={`${sepaContracts.length} contrat(s) avec paiement automatise`}
          label="SEPA"
          tone="amber"
          value={`${contracts.length ? Math.round((sepaContracts.length / contracts.length) * 100) : 0}%`}
        />
      </div>

      <section className="contract-section mt-6 overflow-hidden">
        <div className="contract-section-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">
              Portefeuille contrats
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Vue de pilotage des echeances, paiements et dossiers clients.
            </p>
          </div>
          <span className="contract-count-pill">{contracts.length} dossiers</span>
        </div>

        {contracts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Equipement</th>
                <th className="px-4 py-3 font-semibold">Echeance</th>
                <th className="px-4 py-3 font-semibold">Derniere visite</th>
                <th className="px-4 py-3 font-semibold">Paiement</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contracts.map((contract) => (
                <tr className="contract-table-row" key={contract.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-950">
                      {contract.customer}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{contract.city}</p>
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{contract.equipment}</td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {contract.renewal}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{contract.lastVisit}</td>
                  <td className="px-4 py-4">
                    <span className="contract-payment-pill">
                      {contract.payment}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {formatEuro(contract.value)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill>{contract.status}</StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    <a
                      className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold"
                      href={`/contracts/${contract.id}`}
                    >
                      Ouvrir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <ActivationEmptyState
              actionHref="/contracts/new"
              actionLabel="Creer mon premier contrat"
              eyebrow="Revenu recurrent"
              proofPoints={[
                "Fixer une date anniversaire",
                "Suivre montant et paiement",
                "Activer les relances futures",
              ]}
              secondaryHref="/import"
              secondaryLabel="Importer depuis Excel"
              title="Ajoutez un premier contrat pour transformer la base clients en revenu suivi."
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
