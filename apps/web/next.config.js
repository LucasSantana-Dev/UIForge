if (process.env.NODE_ENV === 'development') {
  const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
  initOpenNextCloudflareForDev();
}

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
  turbopack: {},
};

let finalConfig = nextConfig;

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const { withSentryConfig } = require('@sentry/nextjs');
    finalConfig = withSentryConfig(nextConfig, {
      silent: !process.env.CI,
      widenClientFileUpload: true,
      disableServerWebpackPlugin: true,
      disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
    });
  } catch {
    // @sentry/nextjs not available
  }
}

module.exports = finalConfig;
