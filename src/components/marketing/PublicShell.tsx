import type { ReactNode } from "react";

import { CookiePreferencesButton } from "@/components/marketing/CookiePreferencesButton";

const navItems = [
  { href: "/architecte-ia", label: "Architecte IA" },
  { href: "/simulateur", label: "Simulateur" },
  { href: "/attestation-entretien-chaudiere", label: "Attestation" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/demo", label: "Démo" },
];

export function PublicShell({
  children,
  variant = "dark",
}: {
  children: ReactNode;
  variant?: "dark" | "openDesign";
}) {
  return (
    <main
      className={[
        "public-shell min-h-screen",
        variant === "openDesign" ? "public-shell-open-design" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="public-nav">
        <a className="public-brand" href="/">
          <span>CP</span>
          <div>
            <strong>ContratPro</strong>
            <small>Maintenance CVC</small>
          </div>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a className="public-nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a className="cp-btn cp-btn-secondary cp-btn-sm" href="/demo">
            Démo
          </a>
          <a className="cp-btn cp-btn-primary cp-btn-sm" href="/login">
            Connexion
          </a>
        </div>
      </header>

      {children}

      <footer className="public-footer mx-auto grid gap-4 px-5 py-8 text-sm sm:px-8 md:grid-cols-[1fr_auto]">
        <p>
          ContratPro aide les entreprises CVC à piloter contrats, attestations,
          relances et encaissements récurrents.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="/legal">Mentions légales</a>
          <a href="/terms">CGV</a>
          <a href="/privacy">Confidentialité</a>
          <a href="/dpa">DPA</a>
          <a href="/cookies">Cookies</a>
          <CookiePreferencesButton />
        </div>
      </footer>
    </main>
  );
}

export function PublicHero({
  eyebrow,
  title,
  description,
  action,
  visual,
}: {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
  visual?: ReactNode;
}) {
  return (
    <section className="public-hero">
      <div>
        <p className="cp-eyebrow">{eyebrow}</p>
        <h1 className="mt-4">{title}</h1>
        <p className="mt-5 max-w-2xl text-base">{description}</p>
        {action ? <div className="mt-7 flex flex-wrap gap-3">{action}</div> : null}
      </div>

      {visual ?? (
        <div className="public-product-visual">
          <div className="public-visual-top">
            <span>Contrats actifs</span>
            <strong>48 900 €</strong>
          </div>
          <div className="public-visual-bars">
            <span data-size="92" />
            <span data-size="68" />
            <span data-size="82" />
            <span data-size="54" />
          </div>
          <div className="public-visual-list">
            <div>
              <span>Relances à 30 jours</span>
              <strong>12</strong>
            </div>
            <div>
              <span>Attestations envoyées</span>
              <strong>34</strong>
            </div>
            <div>
              <span>SEPA sous contrôle</span>
              <strong>96%</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function PublicSection({
  children,
  title,
  description,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="public-section">
      <div className="mb-5">
        <h2>{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
