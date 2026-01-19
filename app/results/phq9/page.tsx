"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTestResult, type Phq9TestResult } from "@/lib/storage";
import { scaleInfo } from "@/data/phq9-questions";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import type { Phq9Result } from "@/lib/scoring/phq9";

export default function Phq9ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Phq9TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testResult = getTestResult<Phq9Result>("phq9");
    if (!testResult) {
      router.push("/phq9");
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

  const phq9Result = result.result;

  // 色の決定（重症度に応じて）
  const getLevelColor = (): "orange" | "blue" | "green" | "pink" | "black" => {
    if (phq9Result.level === "severe") return "orange";
    if (phq9Result.level === "moderately_severe") return "orange";
    if (phq9Result.level === "moderate") return "pink"; // yellow → pink
    if (phq9Result.level === "mild") return "blue";
    return "green";
  };

  const levelColor = getLevelColor();

  return (
    <main className="min-h-screen bg-brutal-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <DataBadge color="orange" size="lg">PHQ-9</DataBadge>
            <h1 className="text-4xl md:text-5xl text-brutal-black mt-6 mb-4" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              診断結果
            </h1>
            <p className="text-brutal-gray-800 font-mono">
              {scaleInfo.nameJa}
            </p>
          </div>

          {/* Emergency Warning for Suicide Risk */}
          {phq9Result.suicideRisk && (
            <Card variant="orange" padding="md" className="mb-8 border-4 border-brutal-black">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🚨</div>
                <div>
                  <div className="font-bold text-brutal-black mb-2 uppercase tracking-wide text-lg">
                    緊急: 自殺念慮が検出されました
                  </div>
                  <p className="text-sm text-brutal-black leading-relaxed mb-3">
                    自殺や自傷行為について考えたことがあると回答されています。
                    <strong>今すぐ専門家に相談してください。</strong>
                  </p>
                  <div className="bg-brutal-black text-brutal-white p-4 font-mono text-sm">
                    <div className="font-bold mb-2">今すぐ連絡してください:</div>
                    <ul className="space-y-1">
                      <li>• いのちの電話: 0570-783-556（24時間対応）</li>
                      <li>• 自殺予防いのちの電話: 0120-783-556</li>
                      <li>• 119番（救急）</li>
                      <li>• 最寄りの精神科・心療内科</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Urgent Care Warning */}
          {phq9Result.requiresUrgentCare && !phq9Result.suicideRisk && (
            <Card variant="orange" padding="md" className="mb-8 border-4 border-brutal-black">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div>
                  <div className="font-bold text-brutal-black mb-2 uppercase tracking-wide">
                    重要: 速やかに専門医への受診が必要です
                  </div>
                  <p className="text-sm text-brutal-black leading-relaxed">
                    あなたのスコアは15点以上です。やや重度から重度の抑うつ症状が見られます。
                    可能な限り早く、精神科医または心療内科医の診察を受けてください。
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Score Card */}
          <Card variant={levelColor} padding="lg" className="mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl md:text-8xl font-mono font-bold data-number mb-4">
                {phq9Result.rawScore}
                <span className="text-3xl md:text-4xl font-semibold">/27</span>
              </div>
              <div className="text-2xl md:text-3xl text-brutal-black" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                {phq9Result.levelLabel}
              </div>
            </div>

            <BrutalProgressBar
              value={phq9Result.percentageScore}
              color={levelColor}
              showValue={false}
            />

            <div className="mt-6 text-center text-sm font-mono text-brutal-gray-800">
              {phq9Result.level === "minimal" && "抑うつ症状は最小限です"}
              {phq9Result.level === "mild" && "軽度の抑うつ症状が見られます"}
              {phq9Result.level === "moderate" && "中等度の抑うつ症状 - 専門家への相談を推奨"}
              {phq9Result.level === "moderately_severe" && "やや重度の抑うつ症状 - 速やかに受診してください"}
              {phq9Result.level === "severe" && "重度の抑うつ症状 - 直ちに医療機関を受診してください"}
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon="📊"
              label="重症度レベル"
              value={phq9Result.levelLabel}
              description="5段階評価"
              color={levelColor}
            />
            <StatCard
              icon="📅"
              label="受験日時"
              value={new Date(result.completedAt).toLocaleDateString("ja-JP")}
              description={`${result.retakeCount === 0 ? "初回" : `${result.retakeCount + 1}回目`}`}
              color="blue"
            />
            <StatCard
              icon="🔬"
              label="学術的信頼性"
              value={scaleInfo.tier}
              description="国際標準ツール"
              color="pink"
            />
          </div>

          {/* Interpretation */}
          <Card variant="white" padding="lg" className="mb-8">
            <h2 className="text-3xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              詳細な解釈
            </h2>
            <div className="prose prose-lg max-w-none">
              <div
                className="text-brutal-gray-900 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: phq9Result.interpretation }}
              />
            </div>
          </Card>

          {/* Disclaimer */}
          <Card variant="yellow" padding="md" className="mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide">
                  この診断は医療診断ではありません
                </div>
                <p className="text-sm text-brutal-black leading-relaxed mb-3">
                  このテストはスクリーニング目的の心理尺度です。
                  深刻な症状がある場合は、必ず医療専門家にご相談ください。
                </p>
                <div className="text-xs text-brutal-gray-900">
                  <div className="font-bold mb-1">相談窓口:</div>
                  <ul className="space-y-1">
                    <li>• いのちの電話: 0570-783-556（24時間対応）</li>
                    <li>• こころの健康相談統一ダイヤル: 0570-064-556</li>
                    <li>• 最寄りの精神科・心療内科への受診をご検討ください</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            <Link
              href="/phq9/test"
              className="btn-brutal bg-viz-orange text-brutal-black px-8 py-4 text-center"
            >
              もう一度診断する
            </Link>
            <Link
              href="/dashboard"
              className="btn-brutal bg-brutal-black text-brutal-white px-8 py-4 text-center"
            >
              ダッシュボードを見る
            </Link>
          </div>

          {/* Back Link */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-brutal-gray-800 hover:text-brutal-black font-semibold uppercase tracking-wide text-sm"
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
