import { notFound } from "next/navigation";

import { AppShell, PageHeader, StatusPill } from "@/components/layout/AppShell";
import { formatEuro } from "@/lib/mock-data";
import { getCustomerDetail } from "@/server/contratpro-data";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="customer-detail-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function CustomerMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "emerald";
}) {
  return (
    <article className="customer-detail-metric" data-tone={tone}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);

  if (!customer) {
    notFound();
  }

  return (
    <AppShell activePath="/customers">
      <PageHeader
        action={
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/customers"
          >
            Retour clients
          </a>
        }
        description={`${customer.contracts} contrat(s) - ${formatEuro(customer.revenue)} de revenu annuel suivi`}
        eyebrow="Dossier client"
        title={customer.name}
      />

      <div className="customer-detail-hero mt-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">Compte client</p>
          <h3 className="mt-2 text-3xl font-semibold text-zinc-950">
            {customer.contact}
          </h3>
          <p className="mt-2 text-sm text-zinc-500">{customer.address}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <CustomerMetric
            label="Contrats"
            tone="cyan"
            value={String(customer.contracts)}
          />
          <CustomerMetric
            label="Revenu annuel"
            tone="emerald"
            value={formatEuro(customer.revenue)}
          />
        </div>
      </div>

      <section className="customer-detail-section mt-6">
        <div className="customer-detail-section-header">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">Identite</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Coordonnees utiles aux relances, visites et documents.
            </p>
          </div>
        </div>
        <dl className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Contact" value={customer.contact} />
          <DetailItem label="Telephone" value={customer.phone} />
          <DetailItem label="Email" value={customer.email} />
          <DetailItem label="Adresse" value={customer.address} />
        </dl>
      </section>

      <section className="customer-detail-section mt-6">
        <div className="customer-detail-section-header flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-950">
              Parc installe
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Equipements, contrats associes et echeances de maintenance.
            </p>
          </div>
          <a
            className="premium-inline-action rounded-md px-3 py-2 text-sm font-semibold"
            href="/contracts/new"
          >
            Ajouter contrat
          </a>
        </div>

        <div className="grid gap-4 p-4">
          {customer.installations.length ? (
            customer.installations.map((installation) => (
              <article
                className="customer-installation-card"
                key={installation.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-zinc-950">
                      {installation.equipment}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {installation.equipmentType} - {installation.location}
                    </p>
                  </div>
                  <span className="customer-city-pill">
                    {installation.powerKw}
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="dashboard-table-head text-xs uppercase tracking-wide text-zinc-500">
                        <th className="px-3 py-2 font-semibold">Contrat</th>
                        <th className="px-3 py-2 font-semibold">Periode</th>
                        <th className="px-3 py-2 font-semibold">Paiement</th>
                        <th className="px-3 py-2 font-semibold">Montant</th>
                        <th className="px-3 py-2 font-semibold">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {installation.contracts.map((contract) => (
                        <tr className="dashboard-table-row" key={contract.id}>
                          <td className="px-3 py-3">
                            <a
                              className="font-semibold text-emerald-700"
                              href={`/contracts/${contract.id}`}
                            >
                              {contract.id}
                            </a>
                          </td>
                          <td className="px-3 py-3 text-zinc-600">
                            {contract.startDate} - {contract.endDate}
                          </td>
                          <td className="px-3 py-3 text-zinc-600">
                            {contract.paymentMethod}
                          </td>
                          <td className="px-3 py-3 font-semibold">
                            {formatEuro(contract.priceTtc)}
                          </td>
                          <td className="px-3 py-3">
                            <StatusPill>{contract.status}</StatusPill>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-md bg-zinc-50 p-4 text-sm text-zinc-500">
              Aucun equipement rattache a ce client.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
