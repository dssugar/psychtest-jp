import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // 静的エクスポート（Cloudflare Pages対応）
  images: {
    unoptimized: true,  // 静的エクスポート時は必須
  },
  trailingSlash: true,  // Cloudflare Pages推奨

  // WSL 環境で親ディレクトリ ~/package-lock.json を Next.js が workspace root と
  // 誤推定するのを抑止する. これを設定しないと Turbopack の persistent cache が
  // 想定外のパスを掴み、SST write エラー + HMR file watch 不全になる.
  // import.meta.dirname は Node 20.11+ (= Daisuke env は v24) で利用可.
  // ESM mode の next.config.ts では __dirname が未定義なため代替.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
