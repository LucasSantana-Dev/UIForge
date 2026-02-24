const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}

module.exports = nextConfig;
