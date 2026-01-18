"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTestResult, type BigFiveTestResult } from "@/lib/storage";
import { scaleInfo } from "@/data/bigfive-questions";
import { dimensionNames, dimensionDescriptions } from "@/lib/scoring/bigfive";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import type { BigFiveResult } from "@/lib/scoring/bigfive";

export default function BigFiveResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<BigFiveTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testResult = getTestResult<BigFiveResult>("bigfive");
    if (!testResult) {
      router.push("/bigfive");
      return;
    }
    setResult(testResult);
    setLoading(false);
  }, [router]);

  if (loading || !result) {
    return (
      <main className="min-h-screen bg-brutal-white flex items-center justify-center">
        <div className="text-brutal-gray-800 font-mono">Loading...</div>
      </main>
    );
  }

  const { result: bigFiveResult } = result;

  // 各次元をパーセンテージに変換 (4-20 → 0-100)
  const toPercentage = (score: number) => ((score - 4) / 16) * 100;

  const dimensions = [
    {
      key: "extraversion" as const,
      name: dimensionNames.extraversion,
      score: bigFiveResult.extraversion,
      percentage: toPercentage(bigFiveResult.extraversion),
      color: "blue" as const,
      description: dimensionDescriptions.extraversion,
    },
    {
      key: "agreeableness" as const,
      name: dimensionNames.agreeableness,
      score: bigFiveResult.agreeableness,
      percentage: toPercentage(bigFiveResult.agreeableness),
      color: "pink" as const,
      description: dimensionDescriptions.agreeableness,
    },
    {
      key: "conscientiousness" as const,
      name: dimensionNames.conscientiousness,
      score: bigFiveResult.conscientiousness,
      percentage: toPercentage(bigFiveResult.conscientiousness),
      color: "green" as const,
      description: dimensionDescriptions.conscientiousness,
    },
    {
      key: "neuroticism" as const,
      name: dimensionNames.neuroticism,
      score: bigFiveResult.neuroticism,
      percentage: toPercentage(bigFiveResult.neuroticism),
      color: "orange" as const,
      description: dimensionDescriptions.neuroticism,
    },
    {
      key: "openness" as const,
      name: dimensionNames.openness,
      score: bigFiveResult.openness,
      percentage: toPercentage(bigFiveResult.openness),
      color: "blue" as const,
      description: dimensionDescriptions.openness,
    },
  ];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <DataBadge color="green" size="lg">BIG FIVE RESULT</DataBadge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display text-brutal-black mt-6 mb-4 animate-slide-in-up">
            診断結果
          </h1>
          <p className="text-lg md:text-xl text-brutal-gray-800 font-mono animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
            {scaleInfo.nameJa}
          </p>
        </div>

        {/* Interpretation */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="card-brutal p-8 md:p-12 bg-brutal-white animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl md:text-3xl font-display text-brutal-black mb-6">
              あなたの性格プロファイル
            </h2>
            <p className="text-lg text-brutal-gray-900 leading-relaxed">
              {bigFiveResult.interpretation}
            </p>
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-8 animate-slide-in-up">
            5つの性格次元スコア
          </h2>

          <div className="space-y-6">
            {dimensions.map((dim, index) => (
              <div
                key={dim.key}
                className="card-brutal p-6 md:p-8 bg-brutal-white animate-slide-in-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl md:text-2xl font-display text-brutal-black">
                      {dim.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <DataBadge color={dim.color}>{dim.score} / 20</DataBadge>
                    </div>
                  </div>
                  <p className="text-sm text-brutal-gray-800 mb-4">
                    {dim.description}
                  </p>
                </div>

                <BrutalProgressBar
                  value={dim.percentage}
                  color={dim.color}
                  label={dim.name}
                  height="md"
                />

                <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-3 uppercase tracking-wide">
                  <span>Low (4-8)</span>
                  <span>Medium (9-15)</span>
                  <span>High (16-20)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Credibility */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-8">
            学術的根拠
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StatCard
              icon="📊"
              label="信頼性係数"
              value="α = 0.68-0.76"
              description="許容範囲の内的一貫性"
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
              description="Psych Assessment (2006)"
              color="blue"
            />
            <StatCard
              icon="📚"
              label="引用論文数"
              value="10,000+"
              description="最も広く使用されている"
              color="orange"
            />
          </div>

          <div className="card-brutal p-6 bg-brutal-gray-50">
            <p className="text-sm text-brutal-gray-900 leading-relaxed">
              {scaleInfo.description}
            </p>
          </div>
        </div>

        {/* Test Info */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="card-brutal p-6 bg-brutal-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-brutal-gray-800 mb-1">
                診断日時
              </div>
              <div className="text-lg font-mono font-bold">
                {new Date(result.completedAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div className="flex gap-3">
              <DataBadge color="black">20 Questions</DataBadge>
              <DataBadge color="green">Mini-IPIP</DataBadge>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="card-brutal p-6 bg-viz-yellow border-brutal-black">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide">
                  免責事項
                </div>
                <p className="text-sm text-brutal-black">
                  この診断は医療診断ではありません。性格特性を測定する心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/bigfive/test"
            className="btn-brutal bg-brutal-white text-brutal-black px-10 py-4 text-center min-h-[44px]"
          >
            もう一度診断する
          </Link>
          <Link
            href="/"
            className="btn-brutal bg-brutal-black text-brutal-white px-10 py-4 text-center min-h-[44px]"
          >
            トップページへ
          </Link>
        </div>
      </div>
    </main>
  );
}
