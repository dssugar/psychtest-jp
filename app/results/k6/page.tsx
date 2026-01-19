"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTestResult, type K6TestResult } from "@/lib/storage";
import { scaleInfo } from "@/data/k6-questions";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import type { K6Result } from "@/lib/scoring/k6";

export default function K6ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<K6TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testResult = getTestResult<K6Result>("k6");
    if (!testResult) {
      router.push("/k6");
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

  const k6Result = result.result;
  const percentageScore = (k6Result.totalScore / 24) * 100;

  return (
    <main className="min-h-screen bg-brutal-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <DataBadge color="cyan" size="lg">K6</DataBadge>
            <h1 className="text-4xl md:text-5xl text-brutal-black mt-6 mb-4" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              診断結果
            </h1>
            <p className="text-brutal-gray-800 font-mono">
              {scaleInfo.nameJa}
            </p>
          </div>

          {/* Urgent Care Warning */}
          {k6Result.requiresUrgentCare && (
            <Card variant="cyan" padding="md" className="mb-8 border-4 border-brutal-black">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div>
                  <div className="font-bold text-brutal-black mb-2 uppercase tracking-wide">
                    重要: 速やかに専門家への受診が必要です
                  </div>
                  <p className="text-sm text-brutal-black leading-relaxed mb-3">
                    あなたのスコアは13点以上です。精神疾患の可能性が高い状態です（特異度96%）。
                    可能な限り早く、精神科医、心療内科医、または心理士などの専門家の診察を受けてください。
                  </p>
                  <div className="bg-brutal-black text-brutal-white p-4 font-mono text-sm">
                    <div className="font-bold mb-2">緊急時の連絡先:</div>
                    <ul className="space-y-1">
                      <li>• いのちの電話: 0570-783-556（24時間対応）</li>
                      <li>• こころの健康相談統一ダイヤル: 0570-064-556</li>
                      <li>• よりそいホットライン: 0120-279-338（24時間対応）</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Score Card */}
          <Card variant="cyan" padding="lg" className="mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl md:text-8xl font-mono font-bold data-number mb-4">
                {k6Result.totalScore}
                <span className="text-3xl md:text-4xl font-semibold">/24</span>
              </div>
              <div className="text-2xl md:text-3xl text-brutal-black" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                {k6Result.levelLabel}
              </div>
            </div>

            <BrutalProgressBar
              value={percentageScore}
              color="cyan"
              showValue={false}
            />

            <div className="mt-6 text-center text-sm font-mono text-brutal-gray-800">
              {k6Result.level === "none" && "心理的苦痛は最小限です（一般人口の70.9%）"}
              {k6Result.level === "mild" && "軽度の心理的苦痛 - セルフケア強化を推奨"}
              {k6Result.level === "moderate" && "中等度の心理的苦痛 - 専門家への相談を検討"}
              {k6Result.level === "severe" && "重度の心理的苦痛 - 速やかに専門家を受診してください"}
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon="📊"
              label="重症度レベル"
              value={k6Result.levelLabel}
              description="4段階評価"
              color="cyan"
            />
            <StatCard
              icon="📅"
              label="受験日時"
              value={new Date(result.completedAt).toLocaleDateString("ja-JP")}
              description={`${result.retakeCount === 0 ? "初回" : `${result.retakeCount + 1}回目`}`}
              color="blue"
            />
            <StatCard
              icon="🎯"
              label="パーセンタイル"
              value={`${Math.round(percentageScore)}%`}
              description="最大スコアに対する割合"
              color="green"
            />
          </div>

          {/* Interpretation */}
          <Card variant="white" padding="lg" className="mb-8">
            <h2 className="text-2xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              結果の解釈
            </h2>
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-brutal-gray-900 leading-relaxed">
                {k6Result.interpretation}
              </div>
            </div>
          </Card>

          {/* Treatment Evidence - for moderate and severe */}
          {(k6Result.level === "moderate" || k6Result.level === "severe") && (
            <Card variant="cyan" padding="lg" className="mb-8">
              <h2 className="text-2xl text-brutal-black mb-4" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                💊 治療効果のエビデンス
              </h2>
              <div className="space-y-3 text-sm text-brutal-black">
                <div className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>認知行動療法(CBT)は40-60%の成功率を示しています</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>治療を受けた場合、2ヶ月時点で41%が反応（通常ケア17%と比較）</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>効果量: うつ病 d=0.96、不安障害 d=0.80（非常に大きな効果）</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>最初の6ヶ月で最も大きな症状の減少が見られます</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>早期治療により悪化率が12-13%から5%に半減</span>
                </div>
              </div>
            </Card>
          )}

          {/* Disclaimer */}
          <Card variant="white" padding="md" className="mb-8 border-2 border-brutal-black">
            <div className="text-sm text-brutal-gray-900 leading-relaxed">
              <div className="font-bold text-brutal-black mb-2">⚠️ 免責事項</div>
              <p className="mb-2">
                このテストはスクリーニング目的の心理尺度であり、医療診断ではありません。
                結果に基づいて自己診断や自己治療を行わず、気になる症状がある場合や高スコアが出た場合は、
                必ず医師や心理士などの専門家にご相談ください。
              </p>
              <p className="text-xs text-brutal-gray-700">
                K6は国際標準のスクリーニングツールですが、最終的な診断は医師による詳細な診察と評価によって行われます。
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/k6/test"
              className="btn-brutal bg-viz-cyan text-brutal-white text-center px-8 py-4 hover-lift"
            >
              再度テストを受ける
            </Link>
            <Link
              href="/dashboard"
              className="btn-brutal bg-brutal-black text-brutal-white text-center px-8 py-4 hover-lift"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
