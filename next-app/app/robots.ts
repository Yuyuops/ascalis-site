import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

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
