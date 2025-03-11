/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['netvvmmkvqmzzmsgzjgx.supabase.co']
  },
  webpack(config) {
    // SVG 설정 추가
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  }
};

module.exports = nextConfig;
