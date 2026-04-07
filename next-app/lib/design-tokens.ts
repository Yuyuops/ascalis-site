export const designTokens = {
  colors: {
    primary: "#0F1A2E",
    accent: "#B07642",
    accentLight: "#D4956A",
    surfaceWarm: "#FAF9F6",
    border: "#E2E8F0",
    onSurfaceSecondary: "#475569",
    white: "#FFFFFF",
    surfaceAlt: "#F8FAFC",
  },
  fonts: {
    heading: "Lexend",
    body: "Source Sans 3",
    display: "Instrument Serif",
  },
  radii: {
    lg: "1rem",
    xl: "1.25rem",
    pill: "999px",
  },
  shadows: {
    soft: "0 12px 32px rgba(15, 26, 46, 0.08)",
  },
} as const;

export type DesignTokens = typeof designTokens;
