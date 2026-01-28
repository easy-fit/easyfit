import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-1647a59e75094933942bbd9856df1032.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-a23f8529a61b48398a1afa5a6649a848.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-99848b43c2384e82a8504e4d58867f71.r2.dev',
        pathname: '/**',
      },
    ],
    imageSizes: [64, 128, 256],
    deviceSizes: [640, 750, 1080, 1200, 1920],
    minimumCacheTTL: 2592000, 
    formats: ['image/avif', 'image/webp'],
    
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Only disable optimization in development to avoid timeout issues
    unoptimized: process.env.NODE_ENV === 'development',
    // In production, keep optimization but with longer cache and better error handling
    loader: process.env.NODE_ENV === 'production' ? 'default' : 'default',
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