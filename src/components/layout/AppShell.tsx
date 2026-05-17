import type { ReactNode } from "react";

import { LogoutButton } from "./LogoutButton";

const productNavItems = [
  { href: "/", label: "Pilotage" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/terrain", label: "Terrain mobile" },
  { href: "/relances", label: "Relances" },
  { href: "/contracts", label: "Contrats" },
  { href: "/interventions", label: "Interventions" },
  { href: "/customers", label: "Clients" },
  { href: "/certificates", label: "Attestations" },
  { href: "/payments", label: "Paiements SEPA" },
  { href: "/invoices", label: "Factures" },
  { href: "/import", label: "Import Excel/CSV" },
  { href: "/settings/company", label: "Entreprise" },
  { href: "/settings/billing", label: "Abonnement" },
  { href: "/settings/security", label: "S\u00e9curit\u00e9" },
];

const internalNavItems = [
  { href: "/admin/launch", label: "Go-live" },
  { href: "/admin/pilots", label: "Pilotes" },
  { href: "/admin/ops", label: "Supervision" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/prospection", label: "Dashboard acquisition" },
  { href: "/admin/prospection/guide", label: "Guide skill FB" },
  { href: "/admin/prospection/content", label: "Contenus FB" },
  { href: "/prospection", label: "Pipeline leads" },
  { href: "/settings/facebook", label: "Canal Facebook" },
];

export function AppShell({
  activePath,
  children,
  showInternalTools = false,
}: {
  activePath: string;
  children: ReactNode;
  showInternalTools?: boolean;
}) {
  return (
    <main className="app-shell-bg min-h-screen bg-zinc-100 text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="app-sidebar border-b border-zinc-200 bg-white px-5 py-5 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              ContratPro
            </p>
            <h1 className="mt-1 text-xl font-semibold">Maintenance CVC</h1>
          </div>

          <a
            className="premium-secondary-action mt-6 block rounded-md px-3 py-2 text-center text-sm font-medium"
            href="/contracts/quick"
          >
            + Nouveau contrat
          </a>

          <nav className="mt-6 grid grid-cols-2 gap-2 text-sm lg:grid-cols-1">
            {productNavItems.map((item) => {
              const active = activePath === item.href;
              return (
                <a
                  className={`nav-item rounded-md px-3 py-2 font-medium ${
                    active ? "nav-item-active" : "text-zinc-600"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {showInternalTools ? (
            <div className="internal-nav-section">
              <p className="internal-nav-label">Interne fondateur</p>
              <nav className="mt-2 grid grid-cols-2 gap-2 text-sm lg:grid-cols-1">
                {internalNavItems.map((item) => {
                  const active = activePath === item.href;
                  return (
                    <a
                      className={`nav-item internal-nav-item rounded-md px-3 py-2 font-medium ${
                        active ? "nav-item-active" : "text-zinc-600"
                      }`}
                      href={item.href}
                      key={item.href}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          ) : null}

          <div className="sidebar-account">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Session
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                Espace entreprise
              </p>
            </div>
            <LogoutButton />
          </div>
        </aside>
        <section className="px-4 py-5 sm:px-6 lg:px-8">{children}</section>
      </div>
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-700">{eyebrow}</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-normal text-zinc-950">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
      {children}
    </span>
  );
}
