if (process.env.NODE_ENV === 'development') {
  const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
  initOpenNextCloudflareForDev();
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_VERSION: require('./package.json').version,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  serverExternalPackages: [
    'stripe',
    'resend',
    'octokit',
    '@google/generative-ai',
    '@react-email/components',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion', '@supabase/supabase-js'],
  },
  turbopack: {},
};

module.exports = withBundleAnalyzer(nextConfig);
