import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { formatEuro } from "@/lib/mock-data";
import { getContracts } from "@/server/contratpro-data";

type ContractTone = "amber" | "cyan" | "emerald" | "rose";

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
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <strong className="mt-3 block text-3xl font-semibold text-zinc-50">
        {value}
      </strong>
      <p className="mt-2 text-sm leading-5 text-zinc-400">{detail}</p>
    </article>
  );
}

export default async function ContractsPage() {
  const contracts = await getContracts();
  const total = contracts.reduce((sum, contract) => sum + contract.value, 0);
  const sepaContracts = contracts.filter((contract) =>
    contract.payment.toUpperCase().includes("SEPA"),
  );
  const contractsToRenew = contracts.filter((contract) =>
    ["renouveler", "relance", "visite", "expire"].some((signal) =>
      contract.status.toLowerCase().includes(signal),
    ),
  );
  const nonSepaContracts = contracts.filter(
    (contract) => !contract.payment.toUpperCase().includes("SEPA"),
  );
  const revenueToSecure = contractsToRenew.reduce(
    (sum, contract) => sum + contract.value,
    0,
  );
  const sepaRate = contracts.length
    ? Math.round((sepaContracts.length / contracts.length) * 100)
    : 0;
  const nextContract = contractsToRenew[0] ?? nonSepaContracts[0] ?? contracts[0];
  const architectDecision =
    contractsToRenew.length > 0
      ? {
          action: "Relancer",
          href: "/relances",
          label: "Revenu a proteger",
          proof: `${contractsToRenew.length} contrat(s), ${formatEuro(revenueToSecure)} a securiser.`,
          tone: "rose" as const,
        }
      : nonSepaContracts.length > 0
        ? {
            action: "Activer SEPA",
            href: "/payments/new",
            label: "Cash-flow a fiabiliser",
            proof: `${nonSepaContracts.length} contrat(s) encore hors prelevement automatique.`,
            tone: "amber" as const,
          }
        : {
            action: "Controler",
            href: "/contracts/quick",
            label: "Portefeuille stable",
            proof: "Aucun contrat prioritaire detecte dans la liste actuelle.",
            tone: "emerald" as const,
          };

  return (
    <AppShell activePath="/contracts">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <a className="premium-action rounded-md text-sm font-semibold" href="/contracts/quick">
              Contrat rapide
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/contracts/new"
            >
              Formulaire complet
            </a>
          </div>
        }
        description="Suivez les contrats annuels, les dates anniversaires, les modes de paiement et les relances a declencher."
        eyebrow="Gestion contrats"
        title="Contrats de maintenance CVC"
      />

      <section className="contract-portfolio-command mt-6" data-od-id="contracts-portfolio-architect">
        <div className="contract-portfolio-brief">
          <p>Architecte IA portefeuille</p>
          <h2>{architectDecision.label}</h2>
          <span>{architectDecision.proof}</span>
        </div>
        <div className="contract-portfolio-decision" data-tone={architectDecision.tone}>
          <small>Prochaine action</small>
          <strong>{architectDecision.action}</strong>
          {nextContract ? (
            <span>
              {nextContract.customer} - {formatEuro(nextContract.value)}
            </span>
          ) : (
            <span>Importer ou creer un premier contrat.</span>
          )}
          <a className="premium-action rounded-md text-sm font-semibold" href={architectDecision.href}>
            {architectDecision.action}
          </a>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          value={`${sepaRate}%`}
        />
        <PortfolioMetric
          detail={`${contractsToRenew.length} contrat(s) a traiter en priorite`}
          label="A securiser"
          tone="rose"
          value={formatEuro(revenueToSecure)}
        />
      </div>

      <section className="contract-section mt-6 overflow-hidden">
        <div className="contract-section-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-50">
              Portefeuille contrats
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Vue de pilotage des echeances, paiements et dossiers clients.
            </p>
          </div>
          <span className="contract-count-pill">{contracts.length} dossiers</span>
        </div>

        {contracts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="dashboard-table-head text-xs uppercase tracking-wide text-zinc-400">
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
            <tbody className="divide-y divide-zinc-800/80">
              {contracts.map((contract) => (
                <tr className="contract-table-row" key={contract.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-50">
                      {contract.customer}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">{contract.city}</p>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{contract.equipment}</td>
                  <td className="px-4 py-4 font-medium text-zinc-50">
                    {contract.renewal}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{contract.lastVisit}</td>
                  <td className="px-4 py-4">
                    <span className="contract-payment-pill">
                      {contract.payment}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-50">
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
              actionHref="/contracts/quick"
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
