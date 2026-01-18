import { scaleInfo } from "@/data/selfconcept-questions";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function SelfConceptPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color="blue" size="lg">SCC</DataBadge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 leading-tight" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              {scaleInfo.nameJa}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-brutal-gray-800 font-mono">
              Self-Concept Clarity
            </p>
            <p className="text-sm md:text-base text-brutal-gray-600 font-mono mt-2">
              IPIP Self-Consciousness Scale
            </p>
          </div>

          {/* Overview Card */}
          <Card variant="white" padding="lg" className="mb-12 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              診断について
            </h2>
            <p className="text-lg text-brutal-gray-900 leading-relaxed mb-8">
              {scaleInfo.scoring.description}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card variant="blue" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">所要時間</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  ~2<span className="text-lg font-semibold ml-1">分</span>
                </div>
              </Card>
              <Card variant="black" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">質問数</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  8<span className="text-lg font-semibold ml-1">問</span>
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
                  value="α = 0.79"
                  description="高い内的一貫性"
                  color="blue"
                />
                <StatCard
                  icon="🔄"
                  label="再テスト信頼性"
                  value="r = 0.75"
                  description="4週間後も安定"
                  color="green"
                />
                <StatCard
                  icon="👥"
                  label="開発元"
                  value="IPIP (2006)"
                  description="パブリックドメイン"
                  color="orange"
                />
                <StatCard
                  icon="📚"
                  label="引用論文数"
                  value="2,000+"
                  description="高い学術的信頼性"
                  color="pink"
                />
              </div>

              <Card variant="white" padding="sm" className="bg-brutal-gray-50 mb-4">
                <div className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-2">
                  ⭐️ 学術的信頼性
                </div>
                <p className="text-sm text-brutal-gray-900 leading-relaxed">
                  IPIP Self-Consciousness Facetを使用。Campbell et al. (1996)の原著Self-Concept Clarity Scale (SCCS)と高い構成概念妥当性（r &gt; .70）を持つ、パブリックドメインの信頼性の高い測定ツールです。
                </p>
              </Card>

              {/* Citation Details */}
              <details className="card-brutal p-4 bg-brutal-gray-50 cursor-pointer">
                <summary className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 select-none">
                  📖 原著論文を見る
                </summary>
                <div className="mt-3 space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-brutal-gray-800 mb-1">
                      原著尺度 (Original Scale)
                    </div>
                    <p className="text-sm text-brutal-gray-900 leading-relaxed font-mono">
                      Campbell, J. D., Trapnell, P. D., Heine, S. J., et al. (1996).{" "}
                      Self-Concept Clarity: Measurement, Personality Correlates, and Cultural Boundaries.{" "}
                      <em>Journal of Personality and Social Psychology</em>,{" "}
                      70(1),{" "}
                      141-156.{" "}
                      doi:10.1037/0022-3514.70.1.141
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-brutal-gray-800 mb-1">
                      代替尺度 (Alternative Scale)
                    </div>
                    <p className="text-sm text-brutal-gray-900 leading-relaxed font-mono">
                      Goldberg, L. R., et al. (2006).{" "}
                      IPIP-NEO Self-Consciousness Facet.{" "}
                      神経症傾向ドメインの1ファセット。原著SCCSと高い相関（r &gt; .70）を持つ代替尺度
                    </p>
                    <p className="text-xs text-brutal-gray-800 mt-2">
                      ライセンス: パブリックドメイン
                    </p>
                  </div>
                </div>
              </details>
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
                  この診断は医療診断ではありません。スクリーニング目的の心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。
                </p>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center mb-8">
            <Link
              href="/selfconcept/test"
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
