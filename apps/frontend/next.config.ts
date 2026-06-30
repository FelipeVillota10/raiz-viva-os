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
      // Backend Django sirviendo /media/ en desarrollo local.
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
