/** @type {import('@cloudflare/pages-next/types').Config} */
module.exports = {
  // Build configuration
  buildCommand: 'npm run build',
  buildDirectory: '.next',

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.siza.workers.dev',
  },

  // Routing configuration
  routes: [
    // API routes
    { src: '/api/(.*)', dest: '/api/$1' },

    // Static assets
    { src: '/_next/static/(.*)', dest: '/_next/static/$1' },
    { src: '/images/(.*)', dest: '/images/$1' },

    // All other routes to Next.js
    { src: '/(.*)', dest: '/$1' },
  ],

  // Headers configuration
  headers: [
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: 'https://siza.workers.dev',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization',
        },
      ],
    },
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
};
