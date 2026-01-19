import { scaleInfo } from "@/data/swls-questions";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function SwlsPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color="blue" size="lg">{scaleInfo.abbreviation}</DataBadge>
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
              <Card variant="blue" padding="md">
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
                  icon="⭐"
                  label="学術的ティア"
                  value={scaleInfo.tier}
                  description="世界標準の幸福度尺度"
                  color="blue"
                />
                <StatCard
                  icon="📊"
                  label="信頼性係数"
                  value={`α = ${scaleInfo.reliability.cronbachAlpha.split(',')[0]}`}
                  description="高い内的一貫性"
                  color="green"
                />
                <StatCard
                  icon="🔄"
                  label="再テスト信頼性"
                  value={scaleInfo.reliability.testRetest.split('(')[0].trim()}
                  description="安定した測定結果"
                  color="pink"
                />
                <StatCard
                  icon="📚"
                  label="引用論文数"
                  value={scaleInfo.citations}
                  description="最も引用される幸福度尺度"
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

              {/* Satisfaction Levels */}
              <div className="card-brutal p-6 bg-brutal-gray-50 border-brutal-black mb-4">
                <h4 className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-4">
                  📏 7段階の満足度レベル
                </h4>
                <ul className="space-y-2 text-sm text-brutal-gray-900">
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">5-9点:</span>
                    <span>極めて不満足</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">10-14点:</span>
                    <span>不満足</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">15-19点:</span>
                    <span>やや不満足（日本人平均: 18.9点）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">20-24点:</span>
                    <span className="text-viz-blue font-semibold">中程度（安定した幸福）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">25-29点:</span>
                    <span className="text-viz-green font-semibold">やや満足（高いウェルビーイング）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">30-34点:</span>
                    <span className="text-viz-green font-semibold">満足（フラリッシング状態）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">35点:</span>
                    <span className="font-bold">極めて満足（最高点）</span>
                  </li>
                </ul>
              </div>

              {/* Cultural Note */}
              <div className="card-brutal p-6 bg-viz-blue border-brutal-black">
                <h4 className="font-bold uppercase tracking-wide text-sm text-brutal-black mb-3">
                  🌏 文化差について
                </h4>
                <ul className="space-y-2 text-sm text-brutal-black">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🇯🇵</span>
                    <span><strong>日本人平均: 18.9点</strong> （n=1,500, 前野研究室調査）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🇺🇸</span>
                    <span><strong>米国平均: 23.5点</strong> （大学生サンプル）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>日本人は謙遜の文化的規範により、スコアがやや低い傾向があります。低スコア = 不幸ではありません。</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <Card variant="yellow" padding="md" className="mb-12">
            <div className="flex items-start gap-4">
              <div className="text-3xl">ℹ️</div>
              <div>
                <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide">
                  ご注意
                </div>
                <p className="text-sm text-brutal-black leading-relaxed">
                  この診断は医療診断ではなく、ウェルビーイング（幸福）を測定する心理尺度です。低スコアは「病気」を意味しません。深刻な不満や抑うつ症状がある場合は、専門家にご相談ください。
                </p>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center mb-8">
            <Link
              href="/swls/test"
              className="btn-brutal inline-block bg-brutal-black text-brutal-white px-12 py-5 text-lg mb-4 min-h-[44px]"
            >
              診断を始める
            </Link>
            <p className="text-sm text-brutal-gray-800 font-mono">
              現在の人生全体を振り返り、正直に答えてください
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
