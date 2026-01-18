import { scaleInfo } from "@/data/sccs-questions";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import Link from "next/link";

export default function SccsPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color="blue" size="lg">SCCS</DataBadge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display text-brutal-black mt-6 mb-4 leading-tight">
              {scaleInfo.nameJa}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-brutal-gray-800 font-mono">
              {scaleInfo.name}
            </p>
          </div>

          {/* Overview Card */}
          <div className="card-brutal p-8 md:p-12 bg-brutal-white mb-12 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl font-display text-brutal-black mb-6">
              診断について
            </h2>
            <p className="text-lg text-brutal-gray-900 leading-relaxed mb-8">
              {scaleInfo.description}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="card-brutal p-6 bg-viz-blue text-brutal-white border-brutal-black">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">所要時間</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  ~5<span className="text-lg font-semibold ml-1">分</span>
                </div>
              </div>
              <div className="card-brutal p-6 bg-brutal-black text-brutal-white border-brutal-black">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">質問数</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  12<span className="text-lg font-semibold ml-1">問</span>
                </div>
              </div>
            </div>

            {/* Academic Credentials */}
            <div className="border-t-brutal border-brutal-black pt-8">
              <h3 className="text-2xl font-display text-brutal-black mb-6">
                学術的信頼性
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <StatCard
                  icon="📊"
                  label="信頼性係数"
                  value="α = 0.86"
                  description="高い内的一貫性"
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

              {/* Citation Details */}
              <details className="card-brutal p-4 bg-brutal-gray-50 border-brutal-black cursor-pointer">
                <summary className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 select-none">
                  📖 原著論文を見る
                </summary>
                <p className="mt-3 text-sm text-brutal-gray-900 leading-relaxed font-mono">
                  {scaleInfo.academicReference.original}
                </p>
              </details>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="card-brutal p-6 bg-viz-yellow border-brutal-black mb-12">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide">
                  ご注意
                </div>
                <p className="text-sm text-brutal-black leading-relaxed">
                  この診断は医療診断ではありません。スクリーニング目的の心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-8">
            <Link
              href="/sccs/test"
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
