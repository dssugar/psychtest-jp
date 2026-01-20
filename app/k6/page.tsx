import { scaleInfo } from "@/data/k6-questions";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function K6Page() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color="cyan" size="lg">{scaleInfo.abbreviation}</DataBadge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 leading-tight" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              {scaleInfo.nameJa}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-brutal-gray-800 font-mono">
              {scaleInfo.name}
            </p>
          </div>

          {/* Critical Disclaimer - Clinical Scale */}
          <Card variant="cyan" padding="md" className="mb-8 border-4 border-brutal-black">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div>
                <div className="font-bold text-brutal-black mb-2 uppercase tracking-wide text-lg">
                  重要: 医療診断ではありません
                </div>
                <p className="text-sm text-brutal-black leading-relaxed mb-3">
                  このテストはスクリーニング目的の心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。
                </p>
                <div className="bg-brutal-white p-3 border-2 border-brutal-black">
                  <div className="font-bold text-xs uppercase tracking-wide text-brutal-black mb-1">緊急時の連絡先</div>
                  <ul className="text-xs text-brutal-black space-y-1">
                    <li>• いのちの電話: 0570-783-556（24時間対応）</li>
                    <li>• こころの健康相談統一ダイヤル: 0570-064-556</li>
                    <li>• よりそいホットライン: 0120-279-338（24時間対応）</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Overview Card */}
          <Card variant="white" padding="lg" className="mb-12 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              診断について
            </h2>
            <p className="text-lg text-brutal-gray-900 leading-relaxed mb-8">
              K6は、過去30日間の心理的苦痛の程度を測定する6項目の国際標準尺度です。
              米国ハーバード大学のRonald C. Kessler博士らによって開発され、WHO（世界保健機関）の国際精神保健調査や、
              日本の国民生活基礎調査（厚生労働省）に採用されています。わずか6つの質問で、
              うつ病や不安障害などの精神疾患を早期に発見するためのスクリーニングを行います。
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card variant="cyan" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">所要時間</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  ~2<span className="text-lg font-semibold ml-1">分</span>
                </div>
              </Card>
              <Card variant="black" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">質問数</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  6<span className="text-lg font-semibold ml-1">問</span>
                </div>
              </Card>
            </div>

            {/* Academic Credentials */}
            <div className="border-t-brutal border-brutal-black pt-8">
              <h3 className="text-2xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                学術的信頼性
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <StatCard
                  icon="⭐"
                  label="学術的ティア"
                  value={scaleInfo.tier}
                  description="国際標準のスクリーニングツール"
                  color="cyan"
                />
                <StatCard
                  icon="📊"
                  label="信頼性係数"
                  value={`α = ${scaleInfo.reliability.cronbachAlpha}`}
                  description="高い内的一貫性"
                  color="green"
                />
                <StatCard
                  icon="🎯"
                  label="識別精度"
                  value="AUC = 0.94"
                  description="94%の精度で精神疾患を識別"
                  color="pink"
                />
                <StatCard
                  icon="📚"
                  label="引用論文"
                  value="数百+"
                  description="30カ国以上で翻訳・使用"
                  color="blue"
                />
              </div>

              <div className="bg-brutal-gray-100 p-6 border-brutal border-brutal-black">
                <div className="text-xs uppercase tracking-wide font-bold mb-3">📖 原著論文</div>
                <p className="text-xs text-brutal-black leading-relaxed mb-2">
                  Kessler, R. C., et al. (2002). Short screening scales to monitor population prevalences and trends in non-specific psychological distress. <i>Psychological Medicine, 32</i>(6), 959-976.
                </p>
                <p className="text-xs text-brutal-black leading-relaxed">
                  古川壽亮, 川上憲人, 他 (2008). 国際的精神保健調査における日本版K6およびK10のパフォーマンス. <i>International Journal of Methods in Psychiatric Research, 17</i>(3), 152-158.
                </p>
              </div>
            </div>
          </Card>

          {/* What You'll Learn */}
          <Card variant="white" padding="lg" className="mb-12 animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-3xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              この診断でわかること
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-brutal-gray-50 border-brutal border-brutal-black">
                <div className="text-2xl flex-shrink-0">🧠</div>
                <div>
                  <div className="font-bold text-brutal-black mb-1">過去30日間の心理的苦痛</div>
                  <div className="text-sm text-brutal-gray-900">
                    神経過敏さ、絶望感、落ち着きのなさ、気分の落ち込み、疲労感、無価値感を測定
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-brutal-gray-50 border-brutal border-brutal-black">
                <div className="text-2xl flex-shrink-0">📊</div>
                <div>
                  <div className="font-bold text-brutal-black mb-1">4段階のレベル判定</div>
                  <div className="text-sm text-brutal-gray-900">
                    問題なし（0-4点）/ 軽度（5-9点）/ 中等度（10-12点）/ 重度（13-24点）
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-brutal-gray-50 border-brutal border-brutal-black">
                <div className="text-2xl flex-shrink-0">🏥</div>
                <div>
                  <div className="font-bold text-brutal-black mb-1">専門家受診の必要性</div>
                  <div className="text-sm text-brutal-gray-900">
                    13点以上のスコアは精神疾患の可能性が高く（特異度96%）、専門家による評価を推奨
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Button */}
          <div className="text-center mb-12 animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <Link
              href="/test/k6"
              className="inline-block bg-viz-cyan text-brutal-white px-12 py-4 text-xl font-bold uppercase tracking-wide border-brutal border-brutal-black hover-lift shadow-brutal-lg transition-transform duration-200"
            >
              診断を開始
            </Link>
            <p className="text-sm text-brutal-gray-700 mt-4">
              所要時間: 約2分 | 質問数: 6問
            </p>
          </div>

          {/* Additional Info */}
          <Card variant="white" padding="lg" className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-2xl text-brutal-black mb-4" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              日本におけるK6の活用
            </h2>
            <p className="text-sm text-brutal-gray-900 leading-relaxed mb-4">
              K6は、厚生労働省の国民生活基礎調査に採用されており、日本の国民の心理的健康状態を把握するための標準的な尺度となっています。
              調査データによると、一般人口の70.9%がスコア0-4点（問題なし）、27.9%が5-12点（軽度〜中等度の心理的苦痛）、
              8.5%が13点以上（重度の心理的苦痛）に該当します。
            </p>
            <p className="text-sm text-brutal-gray-900 leading-relaxed">
              重要な課題として、心理的苦痛を抱える人（K6≥5）のうち、実際に治療を受けているのはわずか5.4%という
              深刻な治療ギャップが存在します。早期発見・早期介入が極めて重要です。
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
