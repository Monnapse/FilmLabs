import type { NextConfig } from "next";

/** @type {import('next').Config} */
const nextConfig = {
  output: "standalone", // <-- Add this line
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
};

export default nextConfig;