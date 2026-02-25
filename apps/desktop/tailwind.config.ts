import sizaUIConfig from '@siza/ui/tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...sizaUIConfig,
  content: [
    './src/renderer/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
