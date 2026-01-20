import { scaleInfo } from "@/data/phq9-questions";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function Phq9Page() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color="orange" size="lg">{scaleInfo.abbreviation}</DataBadge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 leading-tight" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              {scaleInfo.nameJa}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-brutal-gray-800 font-mono">
              {scaleInfo.name}
            </p>
          </div>

          {/* Critical Disclaimer - PHQ-9 Specific */}
          <Card variant="orange" padding="md" className="mb-8 border-4 border-brutal-black">
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
                    <li>• 自殺念慮がある場合は直ちに119番または最寄りの救急医療機関へ</li>
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
              {scaleInfo.description}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card variant="orange" padding="md">
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
                  description="国際標準のスクリーニングツール"
                  color="orange"
                />
                <StatCard
                  icon="📊"
                  label="信頼性係数"
                  value={`α = ${scaleInfo.reliability.cronbachAlpha}`}
                  description="高い内的一貫性"
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
                  icon="📚"
                  label="引用論文数"
                  value={scaleInfo.citations}
                  description="広く使用されている尺度"
                  color="blue"
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

              {/* Severity Levels */}
              <div className="card-brutal p-6 bg-brutal-gray-50 border-brutal-black mb-4">
                <h4 className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-4">
                  📏 5段階の重症度レベル
                </h4>
                <ul className="space-y-2 text-sm text-brutal-gray-900">
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">0-4点 (正常):</span>
                    <span>抑うつ症状は最小限</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">5-9点 (軽度):</span>
                    <span>軽度の抑うつ症状あり</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">10-14点 (中等度):</span>
                    <span className="text-viz-orange font-semibold">専門家への相談を推奨</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">15-19点 (やや重度):</span>
                    <span className="text-viz-orange font-semibold">速やかに専門医への受診が必要</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold min-w-[120px]">20-27点 (重度):</span>
                    <span className="text-brutal-black font-bold">直ちに医療機関を受診してください</span>
                  </li>
                </ul>
              </div>

              {/* What you get */}
              <div className="card-brutal p-6 bg-viz-orange border-brutal-black">
                <h4 className="font-bold uppercase tracking-wide text-sm text-brutal-black mb-3">
                  ✨ 診断結果で得られるもの
                </h4>
                <ul className="space-y-2 text-sm text-brutal-black">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">📊</span>
                    <span><strong>0-27点のスコア</strong> - 抑うつ症状の重症度を数値で評価</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">📋</span>
                    <span><strong>5段階の重症度判定</strong> - 正常、軽度、中等度、やや重度、重度</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span><strong>詳細な解釈と助言</strong> - 各レベルに応じた実用的アドバイス</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🚨</span>
                    <span><strong>緊急度の判定</strong> - 専門家への相談が必要かどうか明示</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center mb-8">
            <Link
              href="/test/phq9"
              className="btn-brutal inline-block bg-brutal-black text-brutal-white px-12 py-5 text-lg mb-4 min-h-[44px]"
            >
              診断を始める
            </Link>
            <p className="text-sm text-brutal-gray-800 font-mono">
              過去2週間を振り返り、すべての質問に正直に答えてください
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
