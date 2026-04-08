import * as React from "react";

import { cn } from "@/lib/utils";

type SectionVariant = "light" | "dark" | "warm" | "accent";

type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  label: string;
  variant?: SectionVariant;
};

const variantClasses: Record<SectionVariant, string> = {
  light: "bg-background text-foreground",
  dark: "bg-primary text-primary-foreground",
  warm: "bg-surface-warm text-foreground",
  accent: "bg-accent/10 text-foreground",
};

export function Section({
  id,
  label,
  variant = "light",
  className,
  children,
  ...props
}: SectionProps) {
  const generatedId = React.useId();
  const sectionId = id ?? `section-${generatedId}`;
  const headingId = `${sectionId}-heading`;

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={cn("px-6 py-12 md:px-8 lg:px-10", variantClasses[variant], className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl">
        <h2 id={headingId} className="sr-only">
          {label}
        </h2>
        {children}
      </div>
    </section>
  );
}
