import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Add experimental settings to increase timeouts
  experimental: {
    // Increase server action timeout
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;