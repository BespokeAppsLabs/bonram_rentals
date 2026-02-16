import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core'],
  outputFileTracingIncludes: {
    '/api/pdf': ['./node_modules/@sparticuz/chromium-min/bin/**/*'],
  },
};

export default nextConfig;
