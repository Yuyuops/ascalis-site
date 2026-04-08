import Link from "next/link";

import { AscalisLogo } from "@/components/AscalisLogo";

const footerLinkClass =
  "inline-flex rounded-md text-sm text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-white/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3 md:px-8 lg:px-10">
        <div className="space-y-4">
          <AscalisLogo className="[&_text]:fill-[rgba(248,250,252,0.5)]" title="ASCALIS" />
          <p className="max-w-xs text-sm leading-7 text-white/60">
            ASCALIS transforme une bibliothèque d’outils en parcours d’aide à la décision, au pilotage et à l’amélioration continue.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-sm uppercase tracking-[0.18em] text-white">Liens légaux</h2>
          <nav aria-label="Liens légaux" className="flex flex-col gap-3">
            <Link href="#mentions-legales" className={footerLinkClass}>
              Mentions légales
            </Link>
            <Link href="#politique-confidentialite" className={footerLinkClass}>
              Politique de confidentialité
            </Link>
            <Link href="#conditions-utilisation" className={footerLinkClass}>
              Conditions d’utilisation
            </Link>
          </nav>
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-sm uppercase tracking-[0.18em] text-white">Contact</h2>
          <address className="not-italic text-sm leading-7 text-white/60">
            <p>ASCALIS</p>
            <p>contact@ascalis.fr</p>
            <p>France</p>
          </address>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/30 md:px-8 lg:px-10">
        © 2026 ASCALIS — Consultant Amélioration Continue & Performance Qualité
      </div>
    </footer>
  );
}
