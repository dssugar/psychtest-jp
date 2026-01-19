"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTestResult, type IndustriousnessTestResult } from "@/lib/storage";
import { scaleInfo } from "@/data/industriousness-questions";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { CorrelationGrid } from "@/components/viz/CorrelationGrid";
import type { IndustriousnessResult } from "@/lib/scoring/industriousness";

export default function IndustriousnessResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<IndustriousnessTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testResult = getTestResult<IndustriousnessResult>("industriousness");
    if (!testResult) {
      router.push("/industriousness");
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

  const industriousnessResult = result.result;

  // 象限のアイコンマッピング
  const quadrantIcons: Record<string, string> = {
    achiever: "⭐",
    visionary: "🔥",
    steady: "🎯",
    relaxed: "💤",
  };

  const quadrantIcon = quadrantIcons[industriousnessResult.quadrant] || "📊";

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <DataBadge color="green" size="lg">勤勉性結果</DataBadge>
            <DataBadge color="green" size="md">特性 (TRAIT)</DataBadge>
            <DataBadge color="blue" size="md">IPIP-300</DataBadge>
          </div>
          <div className="text-6xl mb-4 animate-bounce">{quadrantIcon}</div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 animate-slide-in-up" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
            {industriousnessResult.quadrantLabel}
          </h1>
          <p className="text-lg md:text-xl text-brutal-gray-800 font-mono animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
            {scaleInfo.nameJa}
          </p>
        </div>

        {/* Total Score Card */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="card-brutal p-8 md:p-12 bg-brutal-white animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl text-brutal-black" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                総合スコア
              </h2>
              <DataBadge color="green" size="lg">{industriousnessResult.totalScore} / 100</DataBadge>
            </div>
            <BrutalProgressBar
              value={(industriousnessResult.totalScore - 20) / 80 * 100}
              height="lg"
              color="green"
              showValue={false}
            />
          </div>
        </div>

        {/* 2D Matrix Visualization */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="card-brutal p-8 md:p-12 bg-brutal-white animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-2xl md:text-3xl text-brutal-black mb-8" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              2軸マトリクス表示
            </h2>

            {/* Subscale Scores Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-brutal-gray-50 border-brutal border-brutal-black">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wide text-brutal-gray-700 mb-1">
                      X軸: 達成動機 (C4)
                    </div>
                    <div className="text-2xl font-bold">
                      {industriousnessResult.c4_achievement} / 50
                    </div>
                  </div>
                  <DataBadge color="green" size="md">
                    {Math.round(industriousnessResult.c4_percentile)}%
                  </DataBadge>
                </div>
                <BrutalProgressBar
                  value={industriousnessResult.c4_percentile}
                  height="sm"
                  color="green"
                  showValue={false}
                />
              </div>

              <div className="p-6 bg-brutal-gray-50 border-brutal border-brutal-black">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wide text-brutal-gray-700 mb-1">
                      Y軸: 自己鍛錬 (C5)
                    </div>
                    <div className="text-2xl font-bold">
                      {industriousnessResult.c5_discipline} / 50
                    </div>
                  </div>
                  <DataBadge color="blue" size="md">
                    {Math.round(industriousnessResult.c5_percentile)}%
                  </DataBadge>
                </div>
                <BrutalProgressBar
                  value={industriousnessResult.c5_percentile}
                  height="sm"
                  color="blue"
                  showValue={false}
                />
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="flex justify-center">
              <CorrelationGrid
                xValue={industriousnessResult.c4_percentile}
                yValue={industriousnessResult.c5_percentile}
                xLabel="達成動機 (C4)"
                yLabel="自己鍛錬 (C5)"
                color="green"
              />
            </div>

            {/* Quadrant Labels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {/* 左上: 低C4 × 高C5 */}
              <div className={`p-4 border-brutal ${industriousnessResult.quadrant === 'steady' ? 'bg-viz-green text-brutal-white border-brutal-black' : 'bg-brutal-white border-brutal-gray-400'}`}>
                <div className="text-xl font-bold mb-1">🎯 着実型</div>
                <div className="text-sm opacity-80">低い達成動機 × 高い自己鍛錬</div>
              </div>
              {/* 右上: 高C4 × 高C5 */}
              <div className={`p-4 border-brutal ${industriousnessResult.quadrant === 'achiever' ? 'bg-viz-green text-brutal-white border-brutal-black' : 'bg-brutal-white border-brutal-gray-400'}`}>
                <div className="text-xl font-bold mb-1">⭐ 実行者型</div>
                <div className="text-sm opacity-80">高い達成動機 × 高い自己鍛錬</div>
              </div>
              {/* 左下: 低C4 × 低C5 */}
              <div className={`p-4 border-brutal ${industriousnessResult.quadrant === 'relaxed' ? 'bg-viz-green text-brutal-white border-brutal-black' : 'bg-brutal-white border-brutal-gray-400'}`}>
                <div className="text-xl font-bold mb-1">💤 マイペース型</div>
                <div className="text-sm opacity-80">低い達成動機 × 低い自己鍛錬</div>
              </div>
              {/* 右下: 高C4 × 低C5 */}
              <div className={`p-4 border-brutal ${industriousnessResult.quadrant === 'visionary' ? 'bg-viz-green text-brutal-white border-brutal-black' : 'bg-brutal-white border-brutal-gray-400'}`}>
                <div className="text-xl font-bold mb-1">🔥 構想家型</div>
                <div className="text-sm opacity-80">高い達成動機 × 低い自己鍛錬</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Interpretation */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="card-brutal p-8 md:p-12 bg-brutal-white animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-2xl md:text-3xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              詳細な解釈
            </h2>
            <div className="prose prose-lg max-w-none text-brutal-gray-900 leading-relaxed whitespace-pre-line">
              {industriousnessResult.interpretation}
            </div>
          </div>
        </div>

        {/* Academic Reference */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="card-brutal p-8 bg-brutal-gray-50 animate-scale-in" style={{ animationDelay: "0.5s" }}>
            <h3 className="text-xl text-brutal-black mb-4" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              学術的根拠
            </h3>
            <div className="space-y-4">
              <StatCard
                icon="📊"
                label="信頼性係数"
                value={`α = ${scaleInfo.reliability.cronbachAlpha}`}
                description="優れた内的一貫性"
                color="green"
              />
              <div className="p-4 bg-brutal-white border-brutal border-brutal-black">
                <p className="text-sm text-brutal-gray-900 font-mono leading-relaxed">
                  {scaleInfo.academicReference.original}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-center">
          <Link
            href="/industriousness"
            className="btn-brutal bg-viz-green text-brutal-white px-8 py-4 font-bold uppercase tracking-wide hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            もう一度診断
          </Link>
          <Link
            href="/dashboard"
            className="btn-brutal bg-brutal-black text-brutal-white px-8 py-4 font-bold uppercase tracking-wide hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            ダッシュボード
          </Link>
          <Link
            href="/"
            className="btn-brutal bg-brutal-white text-brutal-black px-8 py-4 font-bold uppercase tracking-wide hover:translate-x-1 hover:translate-y-1 transition-transform"
          >
            他の診断を見る
          </Link>
        </div>
      </div>
    </main>
  );
}
