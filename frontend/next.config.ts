import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-1647a59e75094933942bbd9856df1032.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
