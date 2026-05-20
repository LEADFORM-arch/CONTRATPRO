import type { ReactNode } from "react";

import { LogoutButton } from "./LogoutButton";

type PageTone =
  | "billing"
  | "certificates"
  | "clients"
  | "company"
  | "contracts"
  | "control"
  | "field"
  | "import"
  | "interventions"
  | "invoices"
  | "payments"
  | "relances"
  | "security"
  | "start";

const productNavItems = [
  { href: "/", label: "Pilotage", tone: "control" },
  { href: "/onboarding", label: "D\u00e9marrer", step: "1", tone: "start" },
  { href: "/import", label: "Import Excel", step: "2", tone: "import" },
  { href: "/customers", label: "Clients", step: "3", tone: "clients" },
  { href: "/contracts", label: "Contrats", step: "4", tone: "contracts" },
  { href: "/payments", label: "SEPA", step: "5", tone: "payments" },
  { href: "/invoices", label: "Factures", step: "6", tone: "invoices" },
  { href: "/certificates", label: "Attestations", step: "7", tone: "certificates" },
  { href: "/relances", label: "Relances", tone: "relances" },
  { href: "/terrain", label: "Terrain mobile", tone: "field" },
  { href: "/interventions", label: "Interventions", tone: "interventions" },
  { href: "/settings/company", label: "Entreprise", tone: "company" },
  { href: "/settings/billing", label: "Abonnement", tone: "billing" },
  { href: "/settings/security", label: "S\u00e9curit\u00e9", tone: "security" },
];

const guidedNavItems = productNavItems.filter((item) => "step" in item);
const secondaryNavItems = productNavItems.filter((item) => !("step" in item));

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

function pageToneForPath(path: string): PageTone {
  const matchingItem = productNavItems.find((item) => item.href === path);
  if (matchingItem) {
    return matchingItem.tone as PageTone;
  }

  if (path.startsWith("/admin") || path === "/prospection") {
    return "control";
  }

  return "control";
}

export function AppShell({
  activePath,
  children,
  showInternalTools = false,
}: {
  activePath: string;
  children: ReactNode;
  showInternalTools?: boolean;
}) {
  const pageTone = pageToneForPath(activePath);

  return (
    <main className="app-shell-bg min-h-screen bg-zinc-100 text-zinc-950" data-page-tone={pageTone}>
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

          <nav className="mt-6 grid grid-cols-2 gap-2 text-sm lg:grid-cols-1" aria-label="Parcours ContratPro">
            <p className="nav-section-label col-span-2 lg:col-span-1">Parcours</p>
            {guidedNavItems.map((item) => {
              const active = activePath === item.href;
              return (
                <a
                  className={`nav-item rounded-md px-3 py-2 font-medium ${
                    active ? "nav-item-active" : "text-zinc-600"
                  }`}
                  data-tone={item.tone}
                  href={item.href}
                  key={item.href}
                >
                  <span className="nav-step">{item.step}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <nav className="mt-5 grid grid-cols-2 gap-2 text-sm lg:grid-cols-1" aria-label="Outils ContratPro">
            <p className="nav-section-label col-span-2 lg:col-span-1">Suivi</p>
            {secondaryNavItems.map((item) => {
              const active = activePath === item.href;
              return (
                <a
                  className={`nav-item rounded-md px-3 py-2 font-medium ${
                    active ? "nav-item-active" : "text-zinc-600"
                  }`}
                  data-tone={item.tone}
                  href={item.href}
                  key={item.href}
                >
                  <span className="nav-dot" />
                  <span>{item.label}</span>
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

        </aside>
        <section className="app-main-panel px-4 py-5 sm:px-6 lg:px-8">
          <div className="app-topbar" aria-label="Session utilisateur">
            <div>
              <p>Session</p>
              <strong>Espace entreprise</strong>
            </div>
            <LogoutButton />
          </div>
          {children}
        </section>
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
    <span className="status-pill">
      {children}
    </span>
  );
}
