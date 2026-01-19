import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-brutal border-brutal-black bg-brutal-white mt-16">
      {/* Disclaimer Section */}
      <div className="bg-viz-yellow border-b-brutal border-brutal-black">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <h3 className="font-display text-lg mb-2">免責事項</h3>
              <p className="text-sm leading-relaxed">
                この診断は医療診断ではありません。スクリーニング目的の心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="font-display text-sm uppercase mb-3">サイトについて</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline">
                  心理測定ラボとは
                </Link>
              </li>
              <li>
                <Link href="/references" className="hover:underline">
                  参考文献・学術的根拠
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-sm uppercase mb-3">法的情報</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:underline">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm uppercase mb-3">お問い合わせ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:underline">
                  連絡先
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-brutal-black pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-center md:text-left">
            © {currentYear} 心理測定ラボ. All rights reserved.
          </p>
          <p className="text-center md:text-right font-mono text-xs">
            Powered by academic research • Built for transparency
          </p>
        </div>
      </div>
    </footer>
  );
}
