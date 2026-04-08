import * as React from "react";

import { designTokens } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type AscalisLogoProps = {
  className?: string;
  title?: string;
};

export function AscalisLogo({ className, title = "ASCALIS" }: AscalisLogoProps) {
  const titleId = React.useId();

  return (
    <svg
      viewBox="0 0 240 40"
      role="img"
      aria-labelledby={titleId}
      className={cn("h-7 w-auto shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>{title}</title>
      <path
        d="M4 36 L14 6 L24 36"
        fill="none"
        stroke={designTokens.colors.accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="34"
        y="32"
        fontFamily="Lexend, sans-serif"
        fontSize="24px"
        fontWeight="500"
        fill={designTokens.colors.primary}
        letterSpacing="4.5"
      >
        SCALIS
      </text>
    </svg>
  );
}
