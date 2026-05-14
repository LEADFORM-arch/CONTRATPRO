import type { Metadata } from "next";

import { StructuredData } from "@/components/marketing/StructuredData";

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

const simulatorStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  applicationCategory: "BusinessApplication",
  description:
    "Simulateur ContratPro pour estimer le revenu perdu avec les contrats d'entretien CVC oublies ou relances trop tard.",
  name: "Simulateur contrats oublies CVC",
  operatingSystem: "Web",
  url: "https://contratpro-dun.vercel.app/simulateur",
};

export default function SimulatorRoute() {
  return (
    <>
      <StructuredData data={simulatorStructuredData} />
      <SimulatorPage />
    </>
  );
}
