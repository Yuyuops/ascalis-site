"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { AscalisLogo } from "@/components/AscalisLogo";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "#outils-gratuits", label: "Outils gratuits" },
  { href: "#offres", label: "Offres" },
  { href: "#contact", label: "Contact" },
] as const;

const interactiveClass =
  "rounded-md focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false);
  const panelId = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-8 lg:px-10">
        <Link href="/" aria-label="ASCALIS — accueil" className={interactiveClass}>
          <AscalisLogo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                interactiveClass,
                "font-heading text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild variant="copper">
            <Link href="dashboard.html">Espace Pro</Link>
          </Button>
        </nav>

        <button
          type="button"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
          className={cn(
            interactiveClass,
            "inline-flex size-11 items-center justify-center border border-border bg-background text-primary md:hidden",
          )}
        >
          {isOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Fermer le panneau de navigation"
              className="fixed inset-0 z-40 bg-primary/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Menu principal mobile"
              className="fixed inset-y-0 right-0 z-50 flex w-[min(88vw,22rem)] flex-col border-l border-border bg-background px-6 py-6 shadow-[0_16px_40px_rgba(15,26,46,0.16)] md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="flex items-center justify-between gap-4">
                <AscalisLogo />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    interactiveClass,
                    "inline-flex size-11 items-center justify-center border border-border bg-background text-primary",
                  )}
                  aria-label="Fermer le menu"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Navigation mobile" className="mt-10 flex flex-1 flex-col gap-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      interactiveClass,
                      "rounded-xl border border-border bg-surface-warm px-4 py-3 font-heading text-base text-primary transition-colors hover:bg-secondary",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Button asChild variant="copper" className="w-full">
                <Link href="dashboard.html" onClick={() => setIsOpen(false)}>
                  Espace Pro
                </Link>
              </Button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
