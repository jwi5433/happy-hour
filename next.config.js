/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js';

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
};

export default config;
