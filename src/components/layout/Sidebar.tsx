const navItems = [
  { href: "/", label: "Pilotage" },
  { href: "/contracts", label: "Contrats" },
  { href: "/customers", label: "Clients" },
  { href: "/certificates", label: "Attestations" },
  { href: "/payments", label: "Paiements SEPA" },
  { href: "/import", label: "Import Praxedo" },
];

export function Sidebar() {
  return (
    <aside className="border-r border-zinc-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        ContratPro
      </p>
      <nav className="mt-6 grid gap-1 text-sm">
        {navItems.map((item) => (
          <a
            className="rounded-md px-3 py-2 font-medium text-zinc-600 hover:bg-zinc-100"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
