import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // 静的エクスポート（Cloudflare Pages対応）
  images: {
    unoptimized: true,  // 静的エクスポート時は必須
  },
  trailingSlash: true,  // Cloudflare Pages推奨
};

export default nextConfig;
