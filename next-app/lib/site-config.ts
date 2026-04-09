export const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteConfig = {
  name: "ASCALIS",
  siteUrl:
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NETLIFY_SITE_URL ??
    `https://yuyuops.github.io${appBasePath}`,
  titleTemplate: "ASCALIS | %s",
  defaultTitle: "Performance qualité & amélioration continue",
  description:
    "Consultant amélioration continue & performance qualité pour PME et ETI industrielles. Aéronautique, BTP, Transport & Logistique.",
  ogImage: "/og-image.svg",
  email: "contact@ascalis.fr",
} as const;

export function withBasePath(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") {
    return `${appBasePath}/`;
  }
  return `${appBasePath}${normalizedPath}`;
}

export function absoluteUrl(path = "/") {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? `${base}/` : `${base}${normalizedPath}`;
}
