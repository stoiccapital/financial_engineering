/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Ensure static files are copied to the output directory
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|svg)$/,
      type: 'asset/resource',
    })
    return config
  },
}

module.exports = nextConfig 