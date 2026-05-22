import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { formatEuro } from "@/lib/mock-data";
import { getCustomers } from "@/server/contratpro-data";

type CustomerTone = "amber" | "cyan" | "emerald";

function CustomerMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: CustomerTone;
}) {
  return (
    <article className="customer-metric-card" data-tone={tone}>
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

function CustomerWorkTile({
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
  tone: CustomerTone;
}) {
  return (
    <a className="artisan-terrain-tile" data-tone={tone} href={href}>
      <span>{step}</span>
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
      <em>{count}</em>
    </a>
  );
}

export default async function CustomersPage() {
  const customers = await getCustomers();
  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.revenue,
    0,
  );
  const totalContracts = customers.reduce(
    (sum, customer) => sum + customer.contracts,
    0,
  );
  const customersWithoutContract = customers.filter(
    (customer) => customer.contracts === 0,
  );
  const priorityCustomers = (
    customersWithoutContract.length ? customersWithoutContract : customers
  ).slice(0, 3);
  const priorityCustomer =
    customers.find((customer) => customer.contracts === 0) ?? customers[0];

  return (
    <AppShell activePath="/customers">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/customers/new">
            Ajouter client
          </a>
        }
        description="Le carnet sert à une chose : retrouver le client, créer son contrat, puis encaisser proprement."
        eyebrow="Base clients"
        title="Clients finaux"
      />

      <section className="customer-command-panel mt-6">
        <div className="customer-command-copy">
          <p>Départ terrain</p>
          <h2>Ouvrez le bon client, puis créez le contrat.</h2>
          <span>
            Si vous avez déjà un fichier, importez-le. Sinon, ajoutez un client reçu au téléphone et lancez son contrat juste après.
          </span>
        </div>
        <div className="customer-command-proof">
          <small>Base actuelle</small>
          <strong>{customers.length} client(s)</strong>
          <span>
            {customersWithoutContract.length} à contractualiser ·{" "}
            {totalContracts} contrat(s) · {formatEuro(totalRevenue)} suivis
          </span>
        </div>
      </section>

      {priorityCustomers.length ? (
        <section className="customer-priority-panel mt-5" aria-label="Clients à traiter">
          <div className="customer-priority-header">
            <div>
              <p>À traiter maintenant</p>
              <h3>3 fiches maximum pour éviter de chercher dans tout le portefeuille.</h3>
            </div>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/customers/new"
            >
              Ajouter client
            </a>
          </div>
          <div className="customer-priority-grid">
            {priorityCustomers.map((customer, index) => {
              const needsContract = customer.contracts === 0;
              return (
                <article
                  className="customer-priority-card"
                  data-state={needsContract ? "contract" : "active"}
                  key={customer.id}
                >
                  <div className="customer-priority-top">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <em>{needsContract ? "Contrat à créer" : "Dossier actif"}</em>
                  </div>
                  <h4>{customer.name}</h4>
                  <p>{customer.city} · {customer.contact}</p>
                  <dl>
                    <div>
                      <dt>Contrats</dt>
                      <dd>{customer.contracts}</dd>
                    </div>
                    <div>
                      <dt>Revenu</dt>
                      <dd>{formatEuro(customer.revenue)}</dd>
                    </div>
                  </dl>
                  <div className="customer-priority-actions">
                    <a
                      className="premium-action rounded-md px-3 py-2 text-center text-sm font-semibold"
                      href={
                        needsContract
                          ? `/contracts/quick?customerId=${customer.id}`
                          : `/customers/${customer.id}`
                      }
                    >
                      {needsContract ? "Créer contrat" : "Ouvrir dossier"}
                    </a>
                    <a
                      className="premium-inline-action rounded-md px-3 py-2 text-center text-sm font-semibold"
                      href={`/customers/${customer.id}`}
                    >
                      Fiche client
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="artisan-terrain-lanes mt-5" aria-label="Raccourcis clients">
        <CustomerWorkTile
          count="Excel"
          detail="Reprendre une liste clients, équipements et contrats sans ressaisie."
          href="/import"
          label="Importer fichier"
          step="1"
          tone="cyan"
        />
        <CustomerWorkTile
          count="+"
          detail="Saisir un client reçu au téléphone ou après une intervention."
          href="/customers/new"
          label="Ajouter client"
          step="2"
          tone="emerald"
        />
        <CustomerWorkTile
          count={String(customers.length)}
          detail="Ouvrir un dossier, vérifier contact, ville, contrats et revenu."
          href={priorityCustomer ? `/customers/${priorityCustomer.id}` : "/customers/new"}
          label="Ouvrir dossier"
          step="3"
          tone="amber"
        />
      </section>

      <details className="artisan-evidence-details mt-5">
        <summary className="worklist-summary">
          Voir les chiffres clients
        </summary>
        <div className="grid gap-4 md:grid-cols-3">
        <CustomerMetric
          detail="fiches clients actives"
          label="Portefeuille"
          tone="cyan"
          value={String(customers.length)}
        />
        <CustomerMetric
          detail="contrats rattachés aux clients"
          label="Contrats"
          tone="emerald"
          value={String(totalContracts)}
        />
        <CustomerMetric
          detail="revenu annuel client suivi"
          label="Revenu"
          tone="amber"
          value={formatEuro(totalRevenue)}
        />
        </div>
      </details>

      <details className="customer-section mt-6">
        <summary className="worklist-summary">
          Voir tous les clients ({customers.length})
        </summary>
        <div className="customer-section-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">
              Portefeuille clients
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Contacts, villes, revenus récurrents et dossiers rattachés.
            </p>
          </div>
          <span className="customer-count-pill">{customers.length} clients</span>
        </div>

        {customers.length ? (
          <div className="grid gap-4 p-4 lg:grid-cols-3">
            {customers.map((customer) => (
            <article className="customer-card" key={customer.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-950">
                    {customer.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{customer.contact}</p>
                </div>
                <span className="customer-city-pill">{customer.city}</span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm">
                <div className="customer-detail-line">
                  <dt>Téléphone</dt>
                  <dd>{customer.phone}</dd>
                </div>
                <div className="customer-detail-line">
                  <dt>Email</dt>
                  <dd>{customer.email}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="customer-mini-cell">
                    <dt>Contrats</dt>
                    <dd>{customer.contracts}</dd>
                  </div>
                  <div className="customer-mini-cell">
                    <dt>Revenu</dt>
                    <dd>{formatEuro(customer.revenue)}</dd>
                  </div>
                </div>
              </dl>

              <a
                className="premium-secondary-action mt-5 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold"
                href={`/customers/${customer.id}`}
              >
                Ouvrir le dossier
              </a>
            </article>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <ActivationEmptyState
              actionHref="/import"
              actionLabel="Importer mon fichier clients"
              eyebrow="Premier portefeuille"
              proofPoints={[
                "Reprendre Excel sans ressaisie",
                "Préparer contrats et équipements",
                "Débloquer relances et factures",
              ]}
              secondaryHref="/customers/new"
              secondaryLabel="Ajouter un client"
              title="Commencez par importer ou créer vos premiers clients CVC."
            />
          </div>
        )}
      </details>
    </AppShell>
  );
}
