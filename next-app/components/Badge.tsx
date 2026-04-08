import * as React from "react";

import { Badge as BaseBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BaseBadgeProps = React.ComponentProps<typeof BaseBadge>;
type BaseVariant = NonNullable<BaseBadgeProps["variant"]>;
type AscalisBadgeVariant = BaseVariant | "built" | "priority" | "planned";

export type BadgeProps = Omit<BaseBadgeProps, "variant"> & {
  variant?: AscalisBadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const mappedVariant: BaseVariant =
    variant === "built" || variant === "priority" || variant === "planned" ? "default" : variant;

  const ascalisClasses =
    variant === "built"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : variant === "priority"
        ? "border-orange-200 bg-orange-50 text-orange-800"
        : variant === "planned"
          ? "border-slate-200 bg-slate-100 text-slate-700"
          : "";

  return <BaseBadge variant={mappedVariant} className={cn(ascalisClasses, className)} {...props} />;
}
