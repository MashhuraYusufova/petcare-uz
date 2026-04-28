import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const loaderPath = require.resolve("orchids-visual-edits/loader.js");

const apiUrl = process.env.API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  },
  allowedDevOrigins: ['*.orchids.page'],
  async rewrites() {
    if (!apiUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
} as NextConfig;

export default nextConfig;
