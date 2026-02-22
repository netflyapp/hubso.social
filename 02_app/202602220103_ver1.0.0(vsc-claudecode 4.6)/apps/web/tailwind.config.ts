import type { Config } from 'tailwindcss';

const config = {
  ...require('../../packages/config/tailwind.config.ts'),
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
} satisfies Config;

export default config;
