import { notFound } from "next/navigation";
import Link from "next/link";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/viz/StatCard";
import { testRegistry } from "@/lib/tests/test-registry";

// 実装済みテストの型
type ImplementedTestType = keyof typeof testRegistry;

// scaleInfo動的インポート用のヘルパー
async function getScaleInfo(testType: ImplementedTestType) {
  try {
    const module = await import(`@/data/${testType}-questions`);
    return module.scaleInfo;
  } catch (error) {
    console.error(`Failed to load scaleInfo for ${testType}:`, error);
    return null;
  }
}

interface PageProps {
  params: Promise<{
    testType: string;
  }>;
}

// 静的ビルド用のパラメータ生成
export async function generateStaticParams() {
  return Object.keys(testRegistry).map((testType) => ({
    testType,
  }));
}

// generateStaticParams の値以外は 404 (= /favicon.ico /sw.js 等が
// dynamic root [testType] にマッチして 500 になるのを防ぐ).
export const dynamicParams = false;

export default async function TestLandingPage({ params }: PageProps) {
  const { testType } = await params;

  // テストレジストリにテストが存在するか確認
  if (!(testType in testRegistry)) {
    notFound();
  }

  const config = testRegistry[testType as ImplementedTestType];
  const scaleInfo = await getScaleInfo(testType as ImplementedTestType);

  if (!scaleInfo) {
    notFound();
  }

  // 臨床スケールかどうか判定
  const hasClinicalDisclaimer = config.resultAlerts && config.resultAlerts.length > 0;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color={config.color} size="lg">
              {scaleInfo.abbreviation}
            </DataBadge>
            <h1
              className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 leading-tight"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              {scaleInfo.nameJa}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-brutal-gray-800 font-mono">
              {scaleInfo.name}
            </p>
          </div>

          {/* Critical Disclaimer - Clinical Scale Only */}
          {hasClinicalDisclaimer && (
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
                    <div className="font-bold text-xs uppercase tracking-wide text-brutal-black mb-1">
                      緊急時の連絡先
                    </div>
                    <ul className="text-xs text-brutal-black space-y-1">
                      <li>• いのちの電話: 0570-783-556（24時間対応）</li>
                      <li>• こころの健康相談統一ダイヤル: 0570-064-556</li>
                      <li>• よりそいホットライン: 0120-279-338（24時間対応）</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Overview Card */}
          <Card
            variant="white"
            padding="lg"
            className="mb-12 animate-scale-in"
            style={{ animationDelay: "0.1s" }}
          >
            <h2
              className="text-3xl text-brutal-black mb-6"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
            >
              診断について
            </h2>
            <p className="text-lg text-brutal-gray-900 leading-relaxed mb-8">
              {scaleInfo.description}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card variant={config.color} padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">所要時間</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  ~{scaleInfo.stats.minutes}
                  <span className="text-lg font-semibold ml-1">分</span>
                </div>
              </Card>
              <Card variant="black" padding="md">
                <div className="text-sm font-bold uppercase tracking-wide mb-2">質問数</div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold data-number">
                  {scaleInfo.stats.questions}
                  <span className="text-lg font-semibold ml-1">問</span>
                </div>
              </Card>
            </div>

            {/* Academic Credentials */}
            <div className="border-t-brutal border-brutal-black pt-8">
              <h3
                className="text-2xl text-brutal-black mb-6"
                style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
              >
                学術的信頼性
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <StatCard
                  icon="📊"
                  label="信頼性係数"
                  value={`α = ${scaleInfo.reliability.cronbachAlpha}`}
                  description="高い内的一貫性"
                  color={config.color}
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
                  value={scaleInfo.developer}
                  description="学術研究"
                  color="orange"
                />
                <StatCard
                  icon="📚"
                  label="引用論文数"
                  value={scaleInfo.citations}
                  description="広く使用されている尺度"
                  color="blue"
                />
              </div>

              {/* Tier Badge */}
              {scaleInfo.tier && (
                <Card variant="white" padding="sm" className="bg-brutal-gray-50 mb-4">
                  <div className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-2">
                    ⭐️ {scaleInfo.tier}
                  </div>
                  <p className="text-sm text-brutal-gray-900 leading-relaxed">
                    {scaleInfo.category}における学術的に検証された信頼性の高い測定ツールです。
                  </p>
                </Card>
              )}

              {/* Citation Details */}
              <details className="card-brutal p-4 bg-brutal-gray-50 cursor-pointer">
                <summary className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 select-none">
                  📖 原著論文を見る
                </summary>
                <div className="mt-3 space-y-2">
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
            </div>
          </Card>

          {/* Non-Clinical Disclaimer */}
          {!hasClinicalDisclaimer && (
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
          )}

          {/* CTA Section */}
          <div className="text-center mb-8">
            <Link
              href={`/test/${testType}`}
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
