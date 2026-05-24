const journeySteps = [
  {
    href: "/customers/new",
    label: "Client",
    tone: "client",
  },
  {
    href: "/contracts/quick",
    label: "Contrat",
    tone: "contract",
  },
  {
    href: "/invoices/new",
    label: "Facture",
    tone: "invoice",
  },
  {
    href: "/payments/new",
    label: "SEPA",
    tone: "payment",
  },
] as const;

type ManualJourneyRailProps = {
  current: 1 | 2 | 3 | 4;
};

export function ManualJourneyRail({ current }: ManualJourneyRailProps) {
  return (
    <nav
      aria-label="Parcours manuel rapide"
      className="manual-journey-rail mt-6"
    >
      <div>
        <p>Parcours express</p>
        <h2>{"Client -> contrat -> facture -> SEPA"}</h2>
      </div>
      <ol>
        {journeySteps.map((step, index) => {
          const number = index + 1;
          const state =
            number === current ? "current" : number < current ? "done" : "next";

          return (
            <li data-state={state} data-tone={step.tone} key={step.label}>
              <a href={step.href}>
                <span>{number}</span>
                <strong>{step.label}</strong>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
