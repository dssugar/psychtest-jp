/**
 * Phase 2.x.F: /shindan/ hub (= 動的 scale 入口).
 *
 * 既存 /[testType]/ (= 静的 7 scale) と区別: /shindan/ は IPIP 統一 DB の 3,699 scale を自在に探索・受験.
 */

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";

export default function ShindanHubPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <DataBadge color="cyan" size="lg">IPIP UNIFIED LIBRARY</DataBadge>
            <h1
              className="text-4xl md:text-7xl text-brutal-black mt-4 mb-4 tracking-wider"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              心理尺度ライブラリ
            </h1>
            <p className="text-base md:text-lg text-brutal-gray-700">
              IPIP 公式 <strong>3,616 項目 / 37 inventory / 276 構成概念</strong> から自由に受験。
            </p>
          </div>

          <Card variant="white" padding="lg" className="mb-6">
            <h2 className="text-2xl text-brutal-black mb-3" style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}>
              探索の 2 ルート
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-brutal-thin border-brutal-black p-4">
                <DataBadge color="green" size="sm">A. Inventory 別</DataBadge>
                <h3 className="text-lg text-brutal-black mt-2 mb-2" style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}>
                  尺度の出自から辿る
                </h3>
                <p className="text-sm text-brutal-gray-700 mb-2">
                  NEO / HEXACO-PI / VIA / 16PF など、研究で確立された 37 inventory から選ぶ。
                </p>
              </div>
              <div className="border-brutal-thin border-brutal-black p-4">
                <DataBadge color="pink" size="sm">B. 構成概念から</DataBadge>
                <h3 className="text-lg text-brutal-black mt-2 mb-2" style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}>
                  測りたい概念を直接
                </h3>
                <p className="text-sm text-brutal-gray-700 mb-2">
                  「神経症傾向」「達成追求」「共感性」など 276 の心理学的構成概念から検索 → 複数 inventory の実装を横断して受験。
                </p>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Link
              href="/shindan/explore/"
              className="inline-block px-8 py-4 bg-brutal-black text-brutal-white border-brutal-thick border-brutal-black font-mono text-lg tracking-wider hover:bg-viz-cyan transition-all"
            >
              探索を開始 →
            </Link>
          </div>

          <Card variant="white" padding="md" className="mt-8">
            <h3 className="text-sm text-brutal-black mb-2 font-mono">⚠ 注意</h3>
            <p className="text-xs text-brutal-gray-700 leading-relaxed">
              ここで提示する全 scale は IPIP (International Personality Item Pool) の public domain 項目を使用しています。
              測定はスクリーニング目的で医療診断ではありません。
              翻訳は α phase で機械生成を含み一部仮訳の可能性があります。
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
