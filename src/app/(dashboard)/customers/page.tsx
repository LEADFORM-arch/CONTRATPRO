import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { ActivationEmptyState } from "@/components/layout/ActivationEmptyState";
import { AgentPanel, StatCard } from "@/components/ui";
import { formatEuro } from "@/lib/mock-data";
import { getCustomers } from "@/server/contratpro-data";

type CustomerTone = "amber" | "cyan" | "emerald";

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
          <a className="cp-btn cp-btn-primary cp-btn-sm" href="/customers/new">
            Ajouter client
          </a>
        }
        description="Le carnet sert à une chose : retrouver le client, créer son contrat, puis encaisser proprement."
        eyebrow="Base clients"
        title="Clients finaux"
      />

      <AgentPanel
        eyebrow="Départ terrain"
        thesis="Ouvrez le bon client, puis créez le contrat."
        proof={
          <>
            {customersWithoutContract.length} à contractualiser · {totalContracts} contrat(s) · {formatEuro(totalRevenue)} suivis.
            {customersWithoutContract.length > 0 ? " Si vous avez déjà un fichier, importez-le. Sinon, ajoutez un client reçu au téléphone." : " Le portefeuille est actif, continuez à contractualiser proprement."}
          </>
        }
        action={
          <div className="flex flex-col items-end gap-2">
            <span className="cp-pill cp-pill-dot" data-tone="cyan">{customers.length} client(s)</span>
            <a className="cp-btn cp-btn-primary cp-btn-sm" href="/import">Importer Excel</a>
          </div>
        }
      />

      {priorityCustomers.length ? (
        <section className="cp-relance-today">
          <header className="cp-relance-today-head">
            <div>
              <p className="cp-eyebrow">À traiter maintenant</p>
              <h3 className="cp-relance-today-title">3 fiches maximum pour éviter de chercher dans tout le portefeuille.</h3>
            </div>
            <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/customers/new">Ajouter client</a>
          </header>
          <div className="cp-relance-today-grid">
            {priorityCustomers.map((customer, index) => {
              const needsContract = customer.contracts === 0;
              return (
                <article className="cp-relance-card" data-tone={needsContract ? "amber" : "emerald"} key={customer.id}>
                  <div className="cp-relance-card-head">
                    <span className="cp-relance-card-num">{String(index + 1).padStart(2, "0")}</span>
                    <strong className="cp-relance-card-urgency">{needsContract ? "Contrat à créer" : "Dossier actif"}</strong>
                  </div>
                  <h4 className="cp-relance-card-customer">{customer.name}</h4>
                  <p className="cp-cell-sub">{customer.city} · {customer.contact}</p>
                  <dl className="cp-relance-card-meta">
                    <div>
                      <dt>Contrats</dt>
                      <dd>{customer.contracts}</dd>
                    </div>
                    <div>
                      <dt>Revenu</dt>
                      <dd className="cp-cell-amount">{formatEuro(customer.revenue)}</dd>
                    </div>
                  </dl>
                  <div className="cp-relance-card-actions">
                    <a className="cp-btn cp-btn-primary cp-btn-sm" href={needsContract ? `/contracts/quick?customerId=${customer.id}` : `/customers/${customer.id}`}>
                      {needsContract ? "Créer contrat" : "Ouvrir dossier"}
                    </a>
                    <a className="cp-btn cp-btn-ghost cp-btn-sm" href={`/customers/${customer.id}`}>Fiche</a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="cp-work-lanes">
        <a className="cp-work-tile" data-tone="cyan" href="/import">
          <span className="cp-work-tile-step">1</span>
          <div><strong>Importer fichier</strong><p>Reprendre une liste clients, équipements et contrats sans ressaisie.</p></div>
          <em>Excel</em>
        </a>
        <a className="cp-work-tile" data-tone="emerald" href="/customers/new">
          <span className="cp-work-tile-step">2</span>
          <div><strong>Ajouter client</strong><p>Saisir un client reçu au téléphone ou après une intervention.</p></div>
          <em>+</em>
        </a>
        <a className="cp-work-tile" data-tone="amber" href={priorityCustomer ? `/customers/${priorityCustomer.id}` : "/customers/new"}>
          <span className="cp-work-tile-step">3</span>
          <div><strong>Ouvrir dossier</strong><p>Vérifier contact, ville, contrats et revenu.</p></div>
          <em>{customers.length}</em>
        </a>
      </section>

      <div className="cp-stat-grid">
        <StatCard label="Portefeuille" value={String(customers.length)} detail="fiches clients actives" tone="cyan" />
        <StatCard label="Contrats" value={String(totalContracts)} detail="contrats rattachés aux clients" tone="emerald" />
        <StatCard label="Revenu" value={formatEuro(totalRevenue)} detail="revenu annuel client suivi" tone="amber" />
      </div>

      <section className="cp-section">
        <header className="cp-section-header">
          <div>
            <h3 className="cp-section-title">Portefeuille clients</h3>
            <p className="cp-section-desc">Contacts, villes, revenus récurrents et dossiers rattachés.</p>
          </div>
          <span className="cp-pill">{customers.length} clients</span>
        </header>

        {customers.length ? (
          <div className="cp-section-body cp-customer-grid">
            {customers.map((customer) => (
              <article className="cp-customer-card" key={customer.id}>
                <div className="cp-customer-card-head">
                  <div>
                    <h3 className="cp-customer-name">{customer.name}</h3>
                    <p className="cp-cell-sub">{customer.contact}</p>
                  </div>
                  <span className="cp-pill" data-tone="sky">{customer.city}</span>
                </div>
                <dl className="cp-customer-details">
                  <div className="cp-detail-item"><dt>Téléphone</dt><dd>{customer.phone}</dd></div>
                  <div className="cp-detail-item"><dt>Email</dt><dd>{customer.email}</dd></div>
                  <div className="cp-customer-mini">
                    <div className="cp-detail-item"><dt>Contrats</dt><dd>{customer.contracts}</dd></div>
                    <div className="cp-detail-item"><dt>Revenu</dt><dd className="cp-cell-amount">{formatEuro(customer.revenue)}</dd></div>
                  </div>
                </dl>
                <a className="cp-btn cp-btn-secondary cp-btn-sm" href={`/customers/${customer.id}`}>Ouvrir le dossier</a>
              </article>
            ))}
          </div>
        ) : (
          <div className="cp-section-body">
            <ActivationEmptyState
              actionHref="/import"
              actionLabel="Importer mon fichier clients"
              eyebrow="Premier portefeuille"
              proofPoints={["Reprendre Excel sans ressaisie", "Préparer contrats et équipements", "Débloquer relances et factures"]}
              secondaryHref="/customers/new"
              secondaryLabel="Ajouter un client"
              title="Commencez par importer ou créer vos premiers clients CVC."
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
