import type { Config } from 'tailwindcss';
import baseConfig from '../../packages/config/tailwind.config';

const config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
} satisfies Config;

export default config;
