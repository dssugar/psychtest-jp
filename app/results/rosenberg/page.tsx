"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTestResult, type RosenbergTestResult } from "@/lib/storage";
import { scaleInfo } from "@/data/rosenberg-questions";
import { ScoreCircle } from "@/components/viz/ScoreCircle";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import type { RosenbergResult } from "@/lib/storage";

export default function RosenbergResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<RosenbergTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testResult = getTestResult<RosenbergResult>("rosenberg");
    if (!testResult) {
      router.push("/rosenberg");
      return;
    }
    setResult(testResult);
    setLoading(false);
  }, [router]);

  if (loading || !result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brutal-gray-800 font-mono">Loading...</div>
      </main>
    );
  }

  const { result: rosenbergResult } = result;
  const levelText = {
    very_low: "かなり低い",
    low: "やや低い",
    medium: "平均的",
    high: "高い",
    very_high: "非常に高い",
  }[rosenbergResult.level];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <DataBadge color="pink" size="lg">RSES RESULT</DataBadge>
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
                  score={rosenbergResult.percentageScore}
                  size="lg"
                  color="pink"
                  label="自尊心"
                />
              </div>

              {/* Level & Interpretation */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="inline-block mb-3">
                    <DataBadge color="pink" size="lg">{levelText}</DataBadge>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-display text-brutal-black mb-4">
                    評価レベル
                  </h2>
                </div>

                <div className="card-brutal p-6 bg-brutal-gray-50 border-brutal-black border-l-brutal-thick border-l-viz-pink">
                  <h3 className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-3">
                    結果の解釈
                  </h3>
                  <p className="text-brutal-gray-900 leading-relaxed">
                    {rosenbergResult.interpretation}
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
            <div className="card-brutal p-8 bg-viz-pink text-brutal-white border-brutal-black">
              <div className="text-sm font-bold uppercase tracking-wide mb-2">Raw Score</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold data-number mb-2">
                {rosenbergResult.rawScore}
              </div>
              <div className="text-lg font-semibold">/ 40点</div>
            </div>

            <div className="card-brutal p-8 bg-brutal-black text-brutal-white border-brutal-black">
              <div className="text-sm font-bold uppercase tracking-wide mb-2">Percentile</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold data-number mb-2">
                {Math.round(rosenbergResult.percentageScore)}
              </div>
              <div className="text-lg font-semibold">%</div>
            </div>
          </div>

          {/* Progress Bar Breakdown */}
          <div className="card-brutal p-8 bg-brutal-white">
            <BrutalProgressBar
              value={rosenbergResult.percentageScore}
              color="pink"
              label="全体スコア"
              height="lg"
            />
            <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-3 uppercase tracking-wide">
              <span>Low (0-30%)</span>
              <span>Medium (30-70%)</span>
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
              <DataBadge color="black">10 Questions</DataBadge>
              <DataBadge color="pink">RSES</DataBadge>
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
            href="/rosenberg/test"
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
