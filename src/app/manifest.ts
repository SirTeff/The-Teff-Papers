import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Teff Papers",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f0e7",
    theme_color: "#f4f0e7",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
