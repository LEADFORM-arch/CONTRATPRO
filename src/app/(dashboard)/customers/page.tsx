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

  return (
    <AppShell activePath="/customers">
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/customers/new">
            Ajouter client
          </a>
        }
        description="Centralisez les particuliers, SCI et pros avec leurs contacts, contrats et revenus recurrents."
        eyebrow="Base clients"
        title="Clients finaux"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <CustomerMetric
          detail="fiches clients actives"
          label="Portefeuille"
          tone="cyan"
          value={String(customers.length)}
        />
        <CustomerMetric
          detail="contrats rattaches aux clients"
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

      <section className="customer-section mt-6">
        <div className="customer-section-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">
              Portefeuille clients
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Contacts, villes, revenus recurrents et dossiers rattaches.
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
                  <dt>Telephone</dt>
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
                "Preparer contrats et equipements",
                "Debloquer relances et factures",
              ]}
              secondaryHref="/customers/new"
              secondaryLabel="Ajouter un client"
              title="Commencez par importer ou creer vos premiers clients CVC."
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
