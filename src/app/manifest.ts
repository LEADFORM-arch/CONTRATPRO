import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#FFFFFF",
    categories: ["business", "productivity"],
    description:
      "ContratPro aide les entreprises CVC a piloter contrats, interventions terrain, attestations et paiements recurrents.",
    display: "standalone",
    icons: [
      {
        sizes: "any",
        src: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    id: "/",
    lang: "fr",
    name: "ContratPro",
    orientation: "portrait",
    scope: "/",
    short_name: "ContratPro",
    start_url: "/terrain",
    theme_color: "#1E3A5F",
  };
}
