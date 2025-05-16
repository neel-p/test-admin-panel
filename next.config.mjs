// @type {import('next').NextConfig}
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const isAnalyze = process.env.ANALYZE === "true";

let withBundleAnalyzer = (config) => config;

if (isAnalyze) {
  try {
    withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: true,
      analyzerMode: "static",
      reportFilename: "./analyze/bundle-report.html",
      openAnalyzer: false,
    });
  } catch (err) {
    console.warn("Bundle analyzer not installed. Skipping analysis.");
  }
}

const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  staticPageGenerationTimeout: 180,
  images: {
    domains: [],
    unoptimized: false,
  },
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: true,
};

export default withBundleAnalyzer(nextConfig);
