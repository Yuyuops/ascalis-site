import type { Metadata } from "next";

import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Espace Pro",
  description: "Espace professionnel ASCALIS.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
