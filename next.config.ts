import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a production build/test run alongside `next dev` without sharing `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
