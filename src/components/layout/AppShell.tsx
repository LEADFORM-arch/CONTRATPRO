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

type ProductNavItem = {
  href: string;
  label: string;
  step?: string;
  tone: PageTone;
};

const productNavItems: ProductNavItem[] = [
  { href: "/", label: "Pilotage", tone: "control" },
  { href: "/onboarding", label: "Démarrer", step: "1", tone: "start" },
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
  { href: "/settings/security", label: "Sécurité", tone: "security" },
];

const guidedNavItems = productNavItems.filter(
  (item): item is ProductNavItem & { step: string } => Boolean(item.step),
);
const secondaryNavItems = productNavItems.filter((item) => !item.step);

const internalNavItems = [
  { href: "/admin/launch", label: "Go-live" },
  { href: "/admin/pilots", label: "Pilotes" },
  { href: "/admin/ops", label: "Supervision" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/prospection", label: "Acquisition" },
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

function productItemForPath(path: string) {
  return productNavItems.find((item) => item.href === path);
}

function nextGuidedItem(step?: string) {
  if (!step) {
    return undefined;
  }
  const index = guidedNavItems.findIndex((item) => item.step === step);
  return guidedNavItems[index + 1];
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
  const activeItem = productItemForPath(activePath);
  const nextItem = nextGuidedItem(activeItem?.step);

  return (
    <main className="cp-shell" data-page-tone={pageTone}>
      <aside className="cp-sidebar" aria-label="Navigation ContratPro">
        <div className="cp-brand">
          <span className="cp-brand-mark">CP</span>
          <div>
            <p className="cp-brand-name">ContratPro</p>
            <p className="cp-brand-tag">Maintenance CVC</p>
          </div>
        </div>

        <a className="cp-btn cp-btn-primary cp-btn-sm" href="/contracts/quick">
          + Nouveau contrat
        </a>

        <div>
          <p className="cp-nav-section-label">Parcours</p>
          <nav className="cp-nav" aria-label="Parcours ContratPro">
            {guidedNavItems.map((item) => {
              const active = activePath === item.href;
              return (
                <a
                  className="cp-nav-item"
                  data-active={active ? "true" : "false"}
                  href={item.href}
                  key={item.href}
                >
                  <span className="cp-nav-step">{item.step}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="cp-nav-section-label">Suivi</p>
          <nav className="cp-nav" aria-label="Suivi ContratPro">
            {secondaryNavItems.map((item) => {
              const active = activePath === item.href;
              return (
                <a
                  className="cp-nav-item"
                  data-active={active ? "true" : "false"}
                  href={item.href}
                  key={item.href}
                >
                  <span className="cp-nav-dot" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {showInternalTools ? (
          <div>
            <p className="cp-nav-section-label">Interne fondateur</p>
            <nav className="cp-nav" aria-label="Outils internes">
              {internalNavItems.map((item) => {
                const active = activePath === item.href;
                return (
                  <a
                    className="cp-nav-item"
                    data-active={active ? "true" : "false"}
                    href={item.href}
                    key={item.href}
                  >
                    <span className="cp-nav-dot" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        ) : null}
      </aside>

      <section className="cp-main">
        <div className="cp-topbar" aria-label="Session utilisateur">
          <div className="cp-topbar-identity">
            <span className="cp-live-dot" aria-hidden />
            <div>
              <p className="cp-topbar-label">Session active</p>
              <p className="cp-topbar-tenant">Espace entreprise</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="cp-content">
          {activeItem ? (
            <div className="cp-route-cue" data-tone={activeItem.tone}>
              {activeItem.step ? (
                <span className="cp-route-cue-step">{activeItem.step}</span>
              ) : (
                <span className="cp-route-cue-step">•</span>
              )}
              <div>
                <p className="cp-kicker">
                  {activeItem.step ? `Étape ${activeItem.step} du parcours` : "Zone de suivi"}
                </p>
                <strong style={{ color: "var(--text-primary)" }}>{activeItem.label}</strong>
              </div>
              {nextItem ? (
                <a
                  className="cp-btn cp-btn-ghost cp-btn-sm"
                  href={nextItem.href}
                  style={{ marginLeft: "auto" }}
                >
                  Suite : {nextItem.label} →
                </a>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </section>
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
    <header className="cp-header">
      <div>
        <p className="cp-header-eyebrow">{eyebrow}</p>
        <h2 className="cp-header-title">{title}</h2>
        <p className="cp-header-desc">{description}</p>
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return <span className="cp-pill">{children}</span>;
}
