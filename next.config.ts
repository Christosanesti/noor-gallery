import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@neondatabase/serverless",
    "@prisma/adapter-neon",
    "@prisma/client",
    "generated/prisma",
    "bcryptjs",
    "ws",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
    proxyClientMaxBodySize: "15mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/sign-up", destination: "/sign-in", permanent: false },
      { source: "/sign-up/:path*", destination: "/sign-in", permanent: false },
    ];
  },
};

export default nextConfig;
