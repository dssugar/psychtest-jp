"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTestResult, type SccsTestResult } from "@/lib/storage";
import { scaleInfo } from "@/data/sccs-questions";
import { ScoreCircle } from "@/components/viz/ScoreCircle";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import type { SccsResult } from "@/lib/scoring/sccs";

export default function SccsResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SccsTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testResult = getTestResult<SccsResult>("sccs");
    if (!testResult) {
      router.push("/sccs");
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

  const { result: sccsResult } = result;
  const levelText = {
    very_low: "かなり低い",
    low: "やや低い",
    medium: "平均的",
    high: "高い",
    very_high: "非常に高い",
  }[sccsResult.level];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <DataBadge color="blue" size="lg">SCCS RESULT</DataBadge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display text-brutal-black mt-6 mb-4 animate-slide-in-up">
            診断結果
          </h1>
          <p className="text-lg md:text-xl text-brutal-gray-800 font-mono animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
            {scaleInfo.nameJa}
          </p>
        </div>

        {/* Main Score Display */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="card-brutal p-8 md:p-12 bg-brutal-white animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
              {/* Score Circle */}
              <div className="flex-shrink-0 w-[180px] md:w-[220px] lg:w-[240px]">
                <ScoreCircle
                  score={sccsResult.percentageScore}
                  size="lg"
                  color="blue"
                  label="自己概念の明確さ"
                />
              </div>

              {/* Level & Interpretation */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="inline-block mb-3">
                    <DataBadge color="blue" size="lg">{levelText}</DataBadge>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-display text-brutal-black mb-4">
                    評価レベル
                  </h2>
                </div>

                <div className="card-brutal p-6 bg-brutal-gray-50 border-brutal-black border-l-brutal-thick border-l-viz-blue">
                  <h3 className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-3">
                    結果の解釈
                  </h3>
                  <p className="text-brutal-gray-900 leading-relaxed">
                    {sccsResult.interpretation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-8 animate-slide-in-up">
            スコアの詳細
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card-brutal p-8 bg-viz-blue text-brutal-white border-brutal-black">
              <div className="text-sm font-bold uppercase tracking-wide mb-2">Raw Score</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold data-number mb-2">
                {sccsResult.rawScore}
              </div>
              <div className="text-lg font-semibold">/ 60点</div>
            </div>

            <div className="card-brutal p-8 bg-brutal-black text-brutal-white border-brutal-black">
              <div className="text-sm font-bold uppercase tracking-wide mb-2">Percentile</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold data-number mb-2">
                {Math.round(sccsResult.percentageScore)}
              </div>
              <div className="text-lg font-semibold">%</div>
            </div>
          </div>

          {/* Progress Bar Breakdown */}
          <div className="card-brutal p-8 bg-brutal-white">
            <BrutalProgressBar
              value={sccsResult.percentageScore}
              color="blue"
              label="全体スコア"
              height="lg"
            />
            <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-3 uppercase tracking-wide">
              <span>Low (0-40%)</span>
              <span>Medium (40-70%)</span>
              <span>High (70-100%)</span>
            </div>
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
              <DataBadge color="black">12 Questions</DataBadge>
              <DataBadge color="blue">SCCS</DataBadge>
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
                  この診断は医療診断ではありません。スクリーニング目的の心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sccs/test"
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
