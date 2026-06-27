const navItems = [
  { href: "/", label: "Pilotage" },
  { href: "/contracts", label: "Contrats" },
  { href: "/customers", label: "Clients" },
  { href: "/certificates", label: "Attestations" },
  { href: "/payments", label: "Paiements SEPA" },
  { href: "/import", label: "Import Excel/CSV" },
];

export function Sidebar() {
  return (
    <aside className="cp-sidebar">
      <div className="cp-brand">
        <span className="cp-brand-mark">CP</span>
        <div>
          <p className="cp-brand-name">ContratPro</p>
          <p className="cp-brand-tag">Maintenance CVC</p>
        </div>
      </div>
      <div>
        <p className="cp-nav-section-label">Navigation</p>
        <nav className="cp-nav">
          {navItems.map((item) => (
            <a className="cp-nav-item" href={item.href} key={item.href}>
              <span className="cp-nav-dot" />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
