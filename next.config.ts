import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  serverExternalPackages: ['puppeteer', 'puppeteer-core'],
};

export default nextConfig;
