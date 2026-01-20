import { scaleInfo } from "@/data/rosenberg-questions";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function RosenbergPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color="pink" size="lg">RSES</DataBadge>
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
              <Card variant="pink" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">所要時間</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  ~3<span className="text-lg font-semibold ml-1">分</span>
                </div>
              </Card>
              <Card variant="black" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">質問数</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  10<span className="text-lg font-semibold ml-1">問</span>
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
                  value={scaleInfo.reliability.cronbachAlpha}
                  description="高い内的一貫性"
                  color="pink"
                />
                <StatCard
                  icon="🔄"
                  label="再テスト信頼性"
                  value={scaleInfo.reliability.testRetest}
                  description="安定した測定"
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
                  value={scaleInfo.citations}
                  description="最も使用される尺度"
                  color="blue"
                />
              </div>

              <Card variant="white" padding="sm" className="bg-brutal-gray-50 mb-4">
                <div className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-2">
                  ⭐️ {scaleInfo.tier}
                </div>
                <p className="text-sm text-brutal-gray-900 leading-relaxed">
                  自尊心測定の国際標準。50,000回以上引用され、世界中で最も広く使用されている自尊心尺度です。
                </p>
              </Card>

              {/* Citation Details */}
              <details className="card-brutal p-4 bg-brutal-gray-50 cursor-pointer">
                <summary className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 select-none">
                  📖 原著論文を見る
                </summary>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-brutal-gray-900 leading-relaxed font-mono">
                    {scaleInfo.academicReference.original}
                  </p>
                  <p className="text-sm text-brutal-gray-900 leading-relaxed font-mono">
                    {scaleInfo.academicReference.japanese}
                  </p>
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
              href="/test/rosenberg"
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
