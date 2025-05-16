//  @type {import('next').NextConfig}
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  analyzerMode: "static",
  reportFilename: "./analyze/bundle-report.html", // customize if needed
  openAnalyzer: false, // don't open browser on build
});

const nextConfig = {
  reactStrictMode: false,
  // Enable page-level static optimization
  output: "standalone",
  staticPageGenerationTimeout: 180,
  // Enable image optimization
  images: {
    domains: [],
    unoptimized: false,
  },
  experimental: {
    appDir: true,
  },
  // Enable compression
  compress: true,
  // Enable production source maps
  productionBrowserSourceMaps: false,
  // Enable page-level static optimization
  poweredByHeader: false,
  // Enable page-level static optimization
  generateEtags: true,
};

export default withBundleAnalyzer(nextConfig);
