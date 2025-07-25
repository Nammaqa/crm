import type { NextConfig } from "next";
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, encoding: false };
    return config;
  },
  async headers() {
    return [
      // CORS headers for API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' }, // Allow credentials (if using cookies)
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Allow all origins (or replace '*' with a specific domain)
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      // CORS headers for font and static assets
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' } // Allow all origins (for font downloads and static assets)
        ],
      },
    ];
  },
};

export default nextConfig;
