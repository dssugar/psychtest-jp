import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8 animate-slide-in-up">
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-display text-brutal-black mb-4 leading-none">
              スペクトル診断
            </h1>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <DataBadge color="blue">学術的</DataBadge>
              <DataBadge color="pink">データ駆動</DataBadge>
              <DataBadge color="green">科学的根拠</DataBadge>
            </div>
          </div>

          <p className="text-center text-lg md:text-xl lg:text-2xl text-brutal-gray-800 max-w-2xl mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
            全ての波長で、心を解析する。<br />
            学術論文で検証された心理尺度で、あなたの全体像を可視化。
          </p>

          <div className="text-center mb-12">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 text-brutal-gray-800 hover:text-brutal-black font-semibold uppercase tracking-wide text-sm min-h-[44px]"
            >
              <span>📊</span>
              <span>マイダッシュボード</span>
            </a>
          </div>
        </div>

        {/* Available Tests Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display text-brutal-black mb-8 text-center">
            利用可能な診断
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SCCS Card */}
            <div className="card-brutal p-8 md:p-12 bg-brutal-white animate-scale-in" style={{ animationDelay: "0.2s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="blue" size="lg">SCCS</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  Self-Concept<br />Clarity Scale
                </h2>
                <p className="text-lg text-brutal-gray-800">
                  自己概念の明確さを測定する12問の心理尺度
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <div className="card-brutal p-4 bg-viz-blue text-brutal-white border-brutal-black text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">12</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </div>
                <div className="card-brutal p-4 bg-brutal-black text-brutal-white border-brutal-black text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~5</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </div>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <StatCard
                icon="📊"
                label="信頼性係数"
                value="α = 0.86"
                description="内的一貫性が高い"
                color="blue"
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value="r = 0.79"
                description="4ヶ月後も安定"
                color="pink"
              />
              <StatCard
                icon="👥"
                label="開発者"
                value="Campbell et al."
                description="JPSP (1996)"
                color="green"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value="2,000+"
                description="広く使用されている"
                color="orange"
              />
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <a
                href="/sccs"
                className="btn-brutal inline-block bg-brutal-black text-brutal-white px-12 py-5 text-lg min-h-[44px]"
              >
                診断を始める
              </a>
            </div>
          </div>

          {/* Rosenberg Card */}
          <div className="card-brutal p-8 md:p-12 bg-brutal-white animate-scale-in" style={{ animationDelay: "0.3s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="pink" size="lg">RSES</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  Rosenberg<br />Self-Esteem Scale
                </h2>
                <p className="text-lg text-brutal-gray-800">
                  自尊心を測定する10問の心理尺度
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <div className="card-brutal p-4 bg-viz-pink text-brutal-white border-brutal-black text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">10</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </div>
                <div className="card-brutal p-4 bg-brutal-black text-brutal-white border-brutal-black text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~3</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </div>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <StatCard
                icon="📊"
                label="信頼性係数"
                value="α = 0.77-0.88"
                description="高い内的一貫性"
                color="pink"
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value="r = 0.82-0.85"
                description="2週間後も安定"
                color="green"
              />
              <StatCard
                icon="👥"
                label="開発者"
                value="M. Rosenberg"
                description="1965年"
                color="orange"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value="50,000+"
                description="最も使用される尺度"
                color="blue"
              />
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <a
                href="/rosenberg"
                className="btn-brutal inline-block bg-brutal-black text-brutal-white px-12 py-5 text-lg min-h-[44px]"
              >
                診断を始める
              </a>
            </div>
          </div>

          {/* Big Five Card */}
          <div className="card-brutal p-8 md:p-12 bg-brutal-white animate-scale-in" style={{ animationDelay: "0.4s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="green" size="lg">Mini-IPIP</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  Big Five<br />Personality Test
                </h2>
                <p className="text-lg text-brutal-gray-800">
                  5つの性格特性を測定する20問の心理尺度
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <div className="card-brutal p-4 bg-viz-green text-brutal-white border-brutal-black text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">20</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </div>
                <div className="card-brutal p-4 bg-brutal-black text-brutal-white border-brutal-black text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~3</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </div>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <StatCard
                icon="📊"
                label="信頼性係数"
                value="α = 0.68-0.76"
                description="許容範囲の一貫性"
                color="green"
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value="r = 0.72-0.82"
                description="安定した測定結果"
                color="pink"
              />
              <StatCard
                icon="👥"
                label="開発者"
                value="Donnellan et al."
                description="Psych Assess (2006)"
                color="blue"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value="10,000+"
                description="最も広く使用"
                color="orange"
              />
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <a
                href="/bigfive"
                className="btn-brutal inline-block bg-brutal-black text-brutal-white px-12 py-5 text-lg min-h-[44px]"
              >
                診断を始める
              </a>
            </div>
          </div>
        </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-5xl mx-auto">
          <div className="card-brutal p-6 bg-viz-yellow border-brutal-black">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide">
                  免責事項
                </div>
                <p className="text-sm text-brutal-black">
                  この診断は医療診断ではありません。スクリーニング目的の心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-brutal-gray-800">
          <p className="text-sm font-mono">
            Powered by academic research • Built for transparency
          </p>
        </div>
      </div>
    </main>
  );
}
