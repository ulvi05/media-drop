import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.ytimg.com" },
      { hostname: "img.youtube.com" },
      { hostname: "*.tiktokcdn.com" },
    ],
  },
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
