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
    ],
  },
};

export default nextConfig;
