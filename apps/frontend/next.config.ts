import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  allowedDevOrigins: ['192.168.18.29', '172.29.224.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-c208d96089444f449721c066c886b0eb.r2.dev',
      },
    ],
  },
};

export default nextConfig;
