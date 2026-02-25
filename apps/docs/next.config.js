const { createMDX } = require('fumadocs-mdx/next');

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

module.exports = withMDX(nextConfig);
