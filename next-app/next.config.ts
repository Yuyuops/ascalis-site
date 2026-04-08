import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ascalis-site",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
