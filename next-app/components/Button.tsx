import * as React from "react";

import { Button as BaseButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BaseButtonProps = React.ComponentProps<typeof BaseButton>;
type BaseVariant = NonNullable<BaseButtonProps["variant"]>;
type AscalisVariant = BaseVariant | "copper" | "ghost-copper";

export type ButtonProps = Omit<BaseButtonProps, "variant"> & {
  variant?: AscalisVariant;
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const mappedVariant: BaseVariant =
    variant === "copper" ? "default" : variant === "ghost-copper" ? "ghost" : variant;

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
