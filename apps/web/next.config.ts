import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Variants are pre-generated at upload time (WebP/AVIF), so Next does not resize anything.
    loader: "custom",
    loaderFile: "./src/lib/api/image-loader.ts",
  },
};

export default config;
