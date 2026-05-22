import type { Metadata, Viewport } from "next";

import { CookieConsent } from "@/components/cookie-consent";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://contratpro-dun.vercel.app"),
  title: {
    default: "ContratPro - Logiciel contrats entretien CVC",
    template: "%s | ContratPro",
  },
  description:
    "Logiciel pour chauffagistes et entreprises CVC : contrats d'entretien, relances, attestations, factures et paiements recurrents.",
  applicationName: "ContratPro",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    description:
      "ContratPro aide les chauffagistes a retrouver, relancer et encaisser leurs contrats d'entretien CVC.",
    locale: "fr_FR",
    siteName: "ContratPro",
    title: "ContratPro - Ne laissez plus vos contrats d'entretien dormir dans Excel",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    description:
      "Contrats d'entretien CVC, relances, attestations, factures et paiements recurrents.",
    title: "ContratPro - Logiciel contrats entretien CVC",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ContratPro",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A5F",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
