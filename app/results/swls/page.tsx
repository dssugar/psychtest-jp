"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTestResult, type SwlsTestResult } from "@/lib/storage";
import { scaleInfo } from "@/data/swls-questions";
import { type SwlsResult } from "@/lib/scoring/swls";
import { ScoreCircle } from "@/components/viz/ScoreCircle";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";

export default function SwlsResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SwlsTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testResult = getTestResult<SwlsResult>("swls");
    if (!testResult) {
      router.push("/swls");
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

  const { result: swlsResult } = result;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <DataBadge color="blue" size="lg">SWLS RESULT</DataBadge>
            <DataBadge color="pink" size="md">
              成果 (OUTCOME)
            </DataBadge>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 animate-slide-in-up" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
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
                  score={swlsResult.percentageScore}
                  size="lg"
                  color="blue"
                  label="満足度"
                />
              </div>

              {/* Level & Interpretation */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="inline-block mb-3">
                    <DataBadge color="blue" size="lg">{swlsResult.levelLabel}</DataBadge>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl text-brutal-black mb-4" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                    あなたの人生満足度
                  </h2>
                </div>

                <div className="card-brutal p-6 bg-brutal-gray-50 border-brutal-black border-l-brutal-thick border-l-viz-blue">
                  <h3 className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-3">
                    結果の概要
                  </h3>
                  <p className="text-brutal-gray-900 leading-relaxed">
                    あなたのスコアは <strong>{swlsResult.rawScore}点 / 35点</strong> です。
                    これは{swlsResult.levelLabel}のレベルに該当します。
                    {swlsResult.rawScore >= 18 && swlsResult.rawScore <= 20 && (
                      <span className="text-viz-blue font-semibold"> （日本人平均: 18.9点に近い範囲です）</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl text-brutal-black mb-8 animate-slide-in-up" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
            スコアの詳細
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card-brutal p-8 bg-viz-blue text-brutal-white border-brutal-black">
              <div className="text-sm font-bold uppercase tracking-wide mb-2">Raw Score</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold data-number mb-2">
                {swlsResult.rawScore}
              </div>
              <div className="text-lg font-semibold">/ 35点</div>
            </div>

            <div className="card-brutal p-8 bg-brutal-black text-brutal-white border-brutal-black">
              <div className="text-sm font-bold uppercase tracking-wide mb-2">Percentile</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold data-number mb-2">
                {Math.round(swlsResult.percentageScore)}
              </div>
              <div className="text-lg font-semibold">%</div>
            </div>
          </div>

          {/* Progress Bar Breakdown */}
          <div className="card-brutal p-8 bg-brutal-white mb-6">
            <BrutalProgressBar
              value={swlsResult.percentageScore}
              color="blue"
              label="人生満足度"
              height="lg"
            />
            <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-3 uppercase tracking-wide">
              <span>不満足 (5-14)</span>
              <span>中程度 (15-24)</span>
              <span>満足 (25-35)</span>
            </div>
          </div>

          {/* Cultural Context */}
          <div className="card-brutal p-6 bg-viz-blue border-brutal-black">
            <h3 className="font-bold uppercase tracking-wide text-sm text-brutal-black mb-3">
              🌏 文化的コンテキスト
            </h3>
            <div className="space-y-2 text-sm text-brutal-black">
              <p>
                <strong>日本人平均: 18.9点</strong> （n=1,500, 前野研究室調査）<br />
                <strong>米国平均: 23.5点</strong> （大学生サンプル）
              </p>
              <p className="leading-relaxed">
                日本人は謙遜の文化的規範により、米国よりスコアが低い傾向があります。
                あなたのスコアを他者と比較するのではなく、自分自身の人生の満足度として捉えてください。
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Interpretation */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl text-brutal-black mb-8" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
            詳細な解釈
          </h2>

          <div className="card-brutal p-8 md:p-10 bg-brutal-white whitespace-pre-line">
            <div className="prose prose-lg max-w-none">
              {swlsResult.interpretation}
            </div>
          </div>
        </div>

        {/* Academic Credibility */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl text-brutal-black mb-8" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
            学術的根拠
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StatCard
              icon="⭐"
              label="学術的ティア"
              value={scaleInfo.tier}
              description="世界標準の幸福度尺度"
              color="blue"
            />
            <StatCard
              icon="📊"
              label="信頼性係数"
              value={`α = ${scaleInfo.reliability.cronbachAlpha.split(',')[0]}`}
              description="高い内的一貫性"
              color="green"
            />
            <StatCard
              icon="🔄"
              label="再テスト信頼性"
              value={scaleInfo.reliability.testRetest.split('(')[0].trim()}
              description="安定した測定"
              color="pink"
            />
            <StatCard
              icon="📚"
              label="引用論文数"
              value={scaleInfo.citations}
              description="最も引用される幸福度尺度"
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
              <div className="font-mono text-sm text-brutal-black">
                {new Date(result.completedAt).toLocaleString("ja-JP")}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-brutal-gray-800 mb-1">
                受検回数
              </div>
              <div className="font-mono text-sm text-brutal-black">
                {result.retakeCount + 1}回目
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="card-brutal p-6 bg-brutal-yellow border-brutal-black">
            <div className="flex items-start gap-4">
              <div className="text-3xl">ℹ️</div>
              <div>
                <div className="font-bold text-brutal-black mb-2 uppercase tracking-wide">
                  ご注意
                </div>
                <p className="text-sm text-brutal-black leading-relaxed mb-3">
                  この診断は医療診断ではなく、ウェルビーイング（幸福）を測定する心理尺度です。
                  低スコアは「病気」を意味しません。深刻な不満や抑うつ症状がある場合は、専門家にご相談ください。
                </p>
                <div className="text-xs text-brutal-black">
                  <strong>相談窓口:</strong> こころの健康相談統一ダイヤル 0570-064-556
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/swls/test"
            className="btn-brutal inline-block bg-brutal-black text-brutal-white px-8 py-4 text-center min-h-[44px]"
          >
            もう一度診断する
          </Link>
          <Link
            href="/dashboard"
            className="btn-brutal inline-block bg-brutal-white text-brutal-black px-8 py-4 text-center min-h-[44px]"
          >
            ダッシュボードへ
          </Link>
          <Link
            href="/"
            className="btn-brutal inline-block bg-brutal-white text-brutal-black px-8 py-4 text-center min-h-[44px]"
          >
            トップページへ
          </Link>
        </div>
      </div>
    </main>
  );
}
