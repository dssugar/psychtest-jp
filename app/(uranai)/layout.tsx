import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP, JetBrains_Mono } from "next/font/google";
import "./globals-uranai.css";

// 占い世界 (月読) 用 root layout. immersive — サイト Header / Footer なし、
// 詩的 serif font (Noto Serif JP) を主軸に、夜と月光の palette.
//
// app/(uranai)/ 配下の全 page (= /uranai/draw, /uranai/chat/tsukuyomi,
// /uranai/share, /uranai/settings) に適用される.
//
// 将来別ドメイン切り出し時はこの group をまるごと新 repo の app/ 直下に move し、
// `(uranai)/layout.tsx` を `layout.tsx` に rename、`globals-uranai.css` を
// `globals.css` に rename するだけで持ち運べる. dependencies は lib/uranai/ +
// functions/_lib/ + functions/uranai/ のみ.

const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-tsuki-serif",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-tsuki-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-tsuki-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "月読 (Tsukuyomi) — 個人秘書としての占い師",
  description:
    "あなたの心の輪郭を月光に映し、詩的な言葉で読み解く専属占い師。タロット・西洋占星術・数秘術・九星気学を統合。",
};

export default function UranaiRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${notoSerifJP.variable} ${notoSansJP.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased uranai-realm">{children}</body>
    </html>
  );
}
