import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { AgentPanel, StatCard } from "@/components/ui";
import { formatEuro } from "@/lib/mock-data";
import { getContracts } from "@/server/contratpro-data";

type ContractTone = "amber" | "cyan" | "emerald" | "rose";

function ContractWorkTile({
  count,
  detail,
  href,
  label,
  step,
  tone,
}: {
  count: string;
  detail: string;
  href: string;
  label: string;
  step: string;
  tone: ContractTone;
}) {
  return (
    <a className="cp-work-tile" data-tone={tone} href={href}>
      <span className="cp-work-tile-step">{step}</span>
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
      <em>{count}</em>
    </a>
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
          label: "Revenu à protéger",
          proof: `${contractsToRenew.length} contrat(s), ${formatEuro(revenueToSecure)} à sécuriser.`,
          tone: "rose" as const,
        }
      : nonSepaContracts.length > 0
        ? {
            action: "Activer SEPA",
            href: "/payments/new",
            label: "Cash-flow à fiabiliser",
            proof: `${nonSepaContracts.length} contrat(s) encore hors prélèvement automatique.`,
            tone: "amber" as const,
          }
        : {
            action: "Contrôler",
            href: "/contracts/quick",
            label: "Portefeuille stable",
            proof: "Aucun contrat prioritaire détecté dans la liste actuelle.",
            tone: "emerald" as const,
          };
  const priorityContracts = (
    contractsToRenew.length ? contractsToRenew : nonSepaContracts.length ? nonSepaContracts : contracts
  ).slice(0, 3);

  return (
    <AppShell activePath="/contracts">
      <PageHeader
        action={
          <>
            <a className="cp-btn cp-btn-primary cp-btn-sm" href="/contracts/quick">
              Contrat guidé
            </a>
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/contracts/new">
              Formulaire complet
            </a>
          </>
        }
        description="Repérez le contrat à facturer, relancer ou passer en SEPA."
        eyebrow="Gestion contrats"
        title="Contrats de maintenance CVC"
      />

      <div data-od-id="contracts-portfolio-architect">
      <AgentPanel
        eyebrow="Architecte IA portefeuille"
        thesis={architectDecision.label}
        proof={
          <>
            {architectDecision.proof}
            {nextContract ? (
              <span className="mt-2 block">
                <strong style={{ color: "var(--text-primary)" }}>{nextContract.customer}</strong> — {formatEuro(nextContract.value)}
              </span>
            ) : (
              <span className="mt-2 block">Importer ou créer un premier contrat.</span>
            )}
          </>
        }
        action={
          <div className="flex flex-col items-end gap-2">
            <span className="cp-pill cp-pill-dot" data-tone={architectDecision.tone}>
              {architectDecision.action}
            </span>
            <a className="cp-btn cp-btn-primary cp-btn-sm" href={architectDecision.href}>
              {architectDecision.action}
            </a>
          </div>
        }
      />
      </div>

      {priorityContracts.length ? (
        <section className="cp-priority-queue">
          {priorityContracts.map((contract, index) => (
            <a
              className="cp-priority-card"
              data-tone={
                contractsToRenew.includes(contract)
                  ? "rose"
                  : nonSepaContracts.includes(contract)
                    ? "amber"
                    : "emerald"
              }
              href={`/contracts/${contract.id}`}
              key={contract.id}
            >
              <span className="cp-priority-num">{String(index + 1).padStart(2, "0")}</span>
              <div className="cp-priority-body">
                <strong>{contract.customer}</strong>
                <p>{contract.equipment}</p>
              </div>
              <em className="cp-priority-amount">{formatEuro(contract.value)}</em>
            </a>
          ))}
        </section>
      ) : null}

      <section className="cp-work-lanes">
        <ContractWorkTile
          count={String(contractsToRenew.length)}
          detail="Échéances proches, visites ou relances à déclencher."
          href="/relances"
          label="Traiter les relances"
          step="1"
          tone={contractsToRenew.length ? "rose" : "emerald"}
        />
        <ContractWorkTile
          count={String(nonSepaContracts.length)}
          detail="Passer les contrats hors prélèvement en encaissement suivi."
          href="/payments/new"
          label="Activer SEPA"
          step="2"
          tone={nonSepaContracts.length ? "amber" : "emerald"}
        />
        <ContractWorkTile
          count="+"
          detail="Ajouter un dossier propre sans passer par le formulaire long."
          href="/contracts/quick"
          label="Nouveau contrat guidé"
          step="3"
          tone="cyan"
        />
      </section>

      <div className="cp-stat-grid">
        <StatCard label="Contrats actifs" value={String(contracts.length)} detail="contrats actifs dans le portefeuille" tone="cyan" />
        <StatCard label="Revenu annuel" value={formatEuro(total)} detail="revenu annuel suivi dans ContratPro" tone="emerald" />
        <StatCard label="SEPA" value={`${sepaRate}%`} detail={`${sepaContracts.length} contrat(s) avec paiement automatisé`} tone="amber" />
        <StatCard label="À sécuriser" value={formatEuro(revenueToSecure)} detail={`${contractsToRenew.length} contrat(s) à traiter en priorité`} tone="rose" />
      </div>

      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">Portefeuille contrats</h3>
            <p className="cp-section-desc">Vue de pilotage des échéances, paiements et dossiers clients.</p>
          </div>
          <span className="cp-pill">{contracts.length} dossiers</span>
        </header>

        {contracts.length ? (
          <div className="overflow-x-auto">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Équipement</th>
                  <th>Échéance</th>
                  <th>Dernière visite</th>
                  <th>Paiement</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Dossier</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td>
                      <p className="cp-cell-strong">{contract.customer}</p>
                      <p className="cp-cell-sub">{contract.city}</p>
                    </td>
                    <td>{contract.equipment}</td>
                    <td className="cp-cell-strong">{contract.renewal}</td>
                    <td>{contract.lastVisit}</td>
                    <td><span className="cp-pill">{contract.payment}</span></td>
                    <td className="cp-cell-amount">{formatEuro(contract.value)}</td>
                    <td><StatusPill>{contract.status}</StatusPill></td>
                    <td>
                      <a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/contracts/${contract.id}`}>
                        Ouvrir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cp-section-body">
            <ActivationEmptyState
              actionHref="/contracts/quick"
              actionLabel="Créer mon premier contrat"
              eyebrow="Revenu récurrent"
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
