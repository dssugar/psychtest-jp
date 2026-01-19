import { scaleInfo } from "@/data/industriousness-questions";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function IndustriousnessPage() {
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

            <div className="mb-8 p-6 bg-brutal-gray-50 border-brutal border-brutal-black">
              <h3 className="text-xl font-bold mb-4">勤勉性（Industriousness / Grit）とは？</h3>
              <p className="text-base text-brutal-gray-900 leading-relaxed mb-4">
                勤勉性（Industriousness）は、<strong>目標達成への意欲と実行力</strong>を測る心理特性です。「やり抜く力（Grit）」と概念的に重複し、本サイトではこの尺度で両方の側面を測定します。
              </p>
              <p className="text-base text-brutal-gray-900 leading-relaxed mb-4">
                この尺度は、Big Five性格特性の「誠実性（Conscientiousness）」を構成する2つの下位要素を測定します：
              </p>
              <ul className="list-none space-y-3 ml-4">
                <li className="flex items-start">
                  <span className="text-viz-green font-bold mr-2">🎯</span>
                  <div>
                    <strong>C4: 達成動機</strong> - 高い目標を設定し、成功を追求する意欲
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-viz-green font-bold mr-2">⚡</span>
                  <div>
                    <strong>C5: 自己鍛錬</strong> - 課題をすぐに開始し、最後まで完遂する力
                  </div>
                </li>
              </ul>
            </div>

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
                  description="優れた内的一貫性"
                  color="green"
                />
                <StatCard
                  icon="🔄"
                  label="因子構造"
                  value="2因子モデル"
                  description="C4 × C5 独立構造"
                  color="pink"
                />
                <StatCard
                  icon="👥"
                  label="開発者"
                  value={scaleInfo.developer}
                  description="JPSP (2007)"
                  color="blue"
                />
                <StatCard
                  icon="📚"
                  label="学術評価"
                  value={`Tier ${scaleInfo.tier}`}
                  description="ゴールドスタンダード"
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

              {/* Tier Badge */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <DataBadge color="green" size="lg">Tier {scaleInfo.tier}</DataBadge>
                <span className="text-sm font-bold text-brutal-gray-800 uppercase tracking-wide">
                  ゴールドスタンダード
                </span>
              </div>

              {/* Why It Matters */}
              <div className="mb-8 p-6 bg-brutal-gray-50 border-brutal border-brutal-black">
                <h3 className="text-xl font-bold mb-4">なぜ重要か？</h3>
                <p className="text-base text-brutal-gray-900 leading-relaxed mb-4">
                  研究によると、勤勉性は以下と強く相関します：
                </p>
                <ul className="list-none space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-viz-green mr-2">✓</span>
                    <span><strong>学業成績（GPA）</strong>: Big Fiveの中で最も強い予測因子</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-viz-green mr-2">✓</span>
                    <span><strong>仕事のパフォーマンス</strong>: 職種を問わず予測力が高い</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-viz-green mr-2">✓</span>
                    <span><strong>キャリア満足度</strong>: 目標達成と自己実現感</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-viz-green mr-2">✓</span>
                    <span><strong>メンタルヘルス</strong>: うつ病との負の相関</span>
                  </li>
                </ul>
              </div>

              {/* Matrix Display */}
              <div className="mb-8 p-6 bg-brutal-gray-50 border-brutal border-brutal-black">
                <h3 className="text-xl font-bold mb-4">4つのタイプ</h3>
                <p className="text-base text-brutal-gray-900 leading-relaxed mb-4">
                  結果は2×2マトリクスで表示され、以下の4タイプに分類されます：
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* 左上: 低C4 × 高C5 */}
                  <div className="p-4 bg-brutal-white border-brutal border-brutal-black">
                    <div className="text-2xl mb-2">🎯 着実型</div>
                    <div className="text-sm text-brutal-gray-800">現実的な目標 × 確実な実行</div>
                  </div>
                  {/* 右上: 高C4 × 高C5 */}
                  <div className="p-4 bg-brutal-white border-brutal border-brutal-black">
                    <div className="text-2xl mb-2">⭐ 実行者型</div>
                    <div className="text-sm text-brutal-gray-800">高い目標 × 確実な実行</div>
                  </div>
                  {/* 左下: 低C4 × 低C5 */}
                  <div className="p-4 bg-brutal-white border-brutal border-brutal-black">
                    <div className="text-2xl mb-2">💤 マイペース型</div>
                    <div className="text-sm text-brutal-gray-800">リラックス × 柔軟なアプローチ</div>
                  </div>
                  {/* 右下: 高C4 × 低C5 */}
                  <div className="p-4 bg-brutal-white border-brutal border-brutal-black">
                    <div className="text-2xl mb-2">🔥 構想家型</div>
                    <div className="text-sm text-brutal-gray-800">野心的なビジョン × 実行の課題</div>
                  </div>
                </div>
              </div>

              {/* Scoring Info */}
              <div className="p-4 bg-brutal-white border-brutal border-brutal-black">
                <h4 className="font-bold uppercase tracking-wide text-sm mb-2">スコアリング情報</h4>
                <p className="text-sm text-brutal-gray-900 leading-relaxed">
                  {scaleInfo.scoring.description}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mt-12">
              <Link
                href="/industriousness/test"
                className="btn-brutal bg-viz-green text-brutal-white px-12 py-5 text-xl font-bold uppercase tracking-wider hover:translate-x-1 hover:translate-y-1 transition-transform"
              >
                診断を始める →
              </Link>
            </div>
          </Card>

          {/* Disclaimer */}
          <Card variant="white" padding="md" className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <p className="text-sm text-brutal-gray-800">
              <span className="font-bold">⚠️ 注意</span>: この診断はあなたの勤勉性に関する自己理解のツールです。
              採用選考の唯一の判断基準や医療診断としては使用しないでください。
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
