import type { Metadata } from "next";

import SimulatorPage from "./SimulatorClient";

export const metadata: Metadata = {
  title: "Simulateur contrats oublies CVC",
  description:
    "Calculez le revenu annuel perdu a cause des contrats d'entretien CVC oublies ou relances trop tard.",
  alternates: {
    canonical: "/simulateur",
  },
  openGraph: {
    description:
      "Estimez en 30 secondes le revenu recuperable avec des relances structurees de contrats d'entretien.",
    title: "Simulateur ContratPro - Combien coutent vos contrats oublies ?",
    url: "/simulateur",
  },
};

export default function SimulatorRoute() {
  return <SimulatorPage />;
}
