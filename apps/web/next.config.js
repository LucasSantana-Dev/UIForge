if (process.env.NODE_ENV === 'development') {
  const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
  initOpenNextCloudflareForDev();
}

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
  turbopack: {},
};

module.exports = nextConfig;
