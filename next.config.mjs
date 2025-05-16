// @type {import('next').NextConfig}
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const isAnalyze = process.env.ANALYZE === "true";

const withBundleAnalyzer = isAnalyze
  ? require("@next/bundle-analyzer")({
      enabled: true,
      analyzerMode: "static",
      reportFilename: "./analyze/bundle-report.html",
      openAnalyzer: false,
    })
  : (config) => config;

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
