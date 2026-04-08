import type { Metadata } from "next";

import HomePageClient from "@/components/marketing/HomePageClient";
import { absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Consultant Performance Qualité & Amélioration Continue — PME Industrielles",
  description:
    "Consultant amélioration continue & performance qualité pour PME et ETI industrielles. Aéronautique, BTP, Transport & Logistique.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Consultant Performance Qualité & Amélioration Continue — PME Industrielles",
    description:
      "Consultant amélioration continue & performance qualité pour PME et ETI industrielles. Aéronautique, BTP, Transport & Logistique.",
    url: absoluteUrl("/"),
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
