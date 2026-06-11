import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
};

export default nextConfig;