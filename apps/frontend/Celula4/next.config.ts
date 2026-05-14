import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'pub-c208d96089444f449721c066c886b0eb.r2.dev' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
};

export default nextConfig;