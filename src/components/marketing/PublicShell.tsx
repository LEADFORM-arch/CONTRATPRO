import type { ReactNode } from "react";

const navItems = [
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Tarif" },
  { href: "/privacy", label: "Confidentialite" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <main className="public-shell min-h-screen text-white">
      <header className="public-nav mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <a className="public-brand" href="/login">
          <span>CP</span>
          <div>
            <strong>ContratPro</strong>
            <small>Maintenance CVC</small>
          </div>
        </a>
        <nav className="hidden items-center gap-2 text-sm md:flex">
          {navItems.map((item) => (
            <a className="public-nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="premium-action rounded-md text-sm font-semibold" href="/login">
          Connexion
        </a>
      </header>

      {children}

      <footer className="public-footer mx-auto grid max-w-6xl gap-4 px-5 py-8 text-sm sm:px-8 md:grid-cols-[1fr_auto]">
        <p>
          ContratPro aide les entreprises CVC a piloter contrats, attestations,
          relances et encaissements recurrents.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/legal">Mentions legales</a>
          <a href="/terms">CGV</a>
          <a href="/privacy">Confidentialite</a>
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
}: {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="public-hero mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[1fr_420px] lg:items-center">
      <div>
        <p className="text-sm font-semibold text-emerald-300">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-normal text-zinc-50 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
          {description}
        </p>
        {action ? <div className="mt-7 flex flex-wrap gap-3">{action}</div> : null}
      </div>

      <div className="public-product-visual">
        <div className="public-visual-top">
          <span>Contrats actifs</span>
          <strong>48 900 EUR</strong>
        </div>
        <div className="public-visual-bars">
          <span data-size="92" />
          <span data-size="68" />
          <span data-size="82" />
          <span data-size="54" />
        </div>
        <div className="public-visual-list">
          <div>
            <span>Relances a 30 jours</span>
            <strong>12</strong>
          </div>
          <div>
            <span>Attestations envoyees</span>
            <strong>34</strong>
          </div>
          <div>
            <span>SEPA sous controle</span>
            <strong>96%</strong>
          </div>
        </div>
      </div>
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
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-zinc-50">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
