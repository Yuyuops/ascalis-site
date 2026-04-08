import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-config";
import { toolRegistry } from "@/lib/tool-registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/outils/"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const toolRoutes: MetadataRoute.Sitemap = toolRegistry.map((tool) => ({
    url: absoluteUrl(tool.route),
    changeFrequency: "monthly",
    priority: tool.visibility === "free" ? 0.85 : 0.7,
  }));

  return [...staticRoutes, ...toolRoutes];
}
