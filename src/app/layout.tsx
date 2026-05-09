import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContratPro - Gestion contrats CVC",
  description:
    "Gestion des contrats de maintenance CVC, attestations legales et paiements recurrents pour chauffagistes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
