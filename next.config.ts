import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Set workspace root to this project (avoids lockfile detection warnings)
  outputFileTracingRoot: path.join(__dirname),

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.eu-central-2.wasabisys.com',
      },
    ],
  },

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/app/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/prijava',
        permanent: true,
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
