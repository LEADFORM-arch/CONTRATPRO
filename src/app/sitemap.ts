import type { MetadataRoute } from "next";

const baseUrl = "https://contratpro-dun.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/architecte-ia",
    "/simulateur",
    "/attestation-entretien-chaudiere",
    "/pricing",
    "/demo",
    "/legal",
    "/privacy",
    "/terms",
  ].map((path) => ({
    changeFrequency: path === "/attestation-entretien-chaudiere" ? "monthly" : "weekly",
    lastModified: new Date(),
    priority: path === "/attestation-entretien-chaudiere" ? 0.9 : path === "" ? 1 : 0.7,
    url: `${baseUrl}${path}`,
  }));
}
