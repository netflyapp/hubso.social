/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@hubso/shared', '@hubso/ui'],
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: 'api.hubso.local' },
      { hostname: '*.amazonaws.com' },
      { hostname: '*.digitaloceanspaces.com' },
    ],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
};

export default config;
