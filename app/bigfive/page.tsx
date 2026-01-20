import { scaleInfo } from "@/data/bigfive-questions";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function BigFivePage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color="green" size="lg">{scaleInfo.abbreviation}</DataBadge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 leading-tight" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              {scaleInfo.nameJa}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-brutal-gray-800 font-mono">
              {scaleInfo.name}
            </p>
          </div>

          {/* Overview Card */}
          <Card variant="white" padding="lg" className="mb-12 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              診断について
            </h2>
            <p className="text-lg text-brutal-gray-900 leading-relaxed mb-8">
              {scaleInfo.description}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card variant="green" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">所要時間</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  ~{scaleInfo.stats.minutes}<span className="text-lg font-semibold ml-1">分</span>
                </div>
              </Card>
              <Card variant="black" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">質問数</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  {scaleInfo.stats.questions}<span className="text-lg font-semibold ml-1">問</span>
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
                  icon="📊"
                  label="信頼性係数"
                  value={`α = ${scaleInfo.reliability.cronbachAlpha}`}
                  description="各ファセットで高い内的一貫性"
                  color="green"
                />
                <StatCard
                  icon="🔄"
                  label="再テスト信頼性"
                  value={scaleInfo.reliability.testRetest}
                  description="安定した測定結果"
                  color="pink"
                />
                <StatCard
                  icon="👥"
                  label="開発者"
                  value={scaleInfo.developer}
                  description="J Research in Personality"
                  color="blue"
                />
                <StatCard
                  icon="📚"
                  label="引用論文数"
                  value={scaleInfo.citations}
                  description="広く使用されている尺度"
                  color="orange"
                />
              </div>

              {/* Citation Details */}
              <details className="card-brutal p-4 bg-brutal-gray-50 border-brutal-black cursor-pointer mb-6">
                <summary className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 select-none">
                  📖 原著論文を見る
                </summary>
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-brutal-gray-900 leading-relaxed font-mono">
                    {scaleInfo.academicReference.original}
                  </p>
                  {scaleInfo.academicReference.japanese && (
                    <p className="text-sm text-brutal-gray-900 leading-relaxed font-mono">
                      {scaleInfo.academicReference.japanese}
                    </p>
                  )}
                </div>
              </details>

              {/* Dimensions */}
              <div className="card-brutal p-6 bg-brutal-gray-50 border-brutal-black mb-4">
                <h4 className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-4">
                  📏 測定する5つの性格次元（OCEAN）
                </h4>
                <ul className="space-y-2 text-sm text-brutal-gray-900">
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[100px]">外向性:</span>
                    <span>社交性、活動性、刺激を求める傾向</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[100px]">協調性:</span>
                    <span>協力性、思いやり、対人関係における調和</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[100px]">誠実性:</span>
                    <span>計画性、責任感、目標達成への意欲</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[100px]">神経症傾向:</span>
                    <span>感情の安定性、ストレスへの反応</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[100px]">開放性:</span>
                    <span>創造性、好奇心、新しい経験への開放性</span>
                  </li>
                </ul>
              </div>

              {/* 30 Facets & Estimations */}
              <div className="card-brutal p-6 bg-viz-green border-brutal-black">
                <h4 className="font-bold uppercase tracking-wide text-sm text-brutal-black mb-3">
                  ✨ 診断結果で得られるもの
                </h4>
                <ul className="space-y-2 text-sm text-brutal-black">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">📊</span>
                    <span><strong>30ファセット詳細分析</strong> - 各次元を6つの下位尺度で詳細に測定</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🎯</span>
                    <span><strong>MBTI形式の16タイプ推定</strong> - 学術的相関に基づく性格タイプ分類</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">⭐</span>
                    <span><strong>エニアグラム9タイプ推定</strong> - 参考情報としてのタイプ分析</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <Card variant="yellow" padding="md" className="mb-12">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide">
                  ご注意
                </div>
                <p className="text-sm text-brutal-black leading-relaxed">
                  この診断は医療診断ではありません。性格特性を測定する心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。
                </p>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center mb-8">
            <Link
              href="/test/bigfive"
              className="btn-brutal inline-block bg-brutal-black text-brutal-white px-12 py-5 text-lg mb-4 min-h-[44px]"
            >
              診断を始める
            </Link>
            <p className="text-sm text-brutal-gray-800 font-mono">
              すべての質問に正直に答えることで、より正確な結果が得られます
            </p>
          </div>

          {/* Back Link */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-brutal-gray-800 hover:text-brutal-black font-semibold uppercase tracking-wide text-sm min-h-[44px]"
            >
              <span>←</span>
              <span>トップページに戻る</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
