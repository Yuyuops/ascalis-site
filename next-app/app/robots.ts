import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/outils/"],
      disallow: ["/dashboard/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
