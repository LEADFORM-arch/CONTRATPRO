import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: [
        "/",
        "/architecte-ia",
        "/simulateur",
        "/attestation-entretien-chaudiere",
        "/pricing",
        "/demo",
        "/cookies",
      ],
      disallow: ["/admin", "/api", "/settings", "/contracts", "/customers", "/invoices"],
      userAgent: "*",
    },
    sitemap: "https://contratpro-dun.vercel.app/sitemap.xml",
  };
}
