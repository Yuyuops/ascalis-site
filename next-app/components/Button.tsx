import * as React from "react";

import {
  Button as BaseButton,
  type buttonVariants as baseButtonVariants,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BaseVariant = Parameters<typeof baseButtonVariants>[0]["variant"];
type AscalisVariant = BaseVariant | "copper" | "ghost-copper";

type ButtonProps = React.ComponentProps<typeof BaseButton> & {
  variant?: AscalisVariant;
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const mappedVariant: BaseVariant = variant === "copper" ? "default" : variant === "ghost-copper" ? "ghost" : variant;

  const copperClasses =
    variant === "copper"
      ? "bg-accent text-primary hover:bg-accent-light"
      : variant === "ghost-copper"
        ? "border border-accent/30 bg-transparent text-accent hover:bg-accent/10 hover:text-primary"
        : "";

  return (
    <BaseButton
      variant={mappedVariant}
      className={cn(
        "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent",
        copperClasses,
        className,
      )}
      {...props}
    />
  );
}
