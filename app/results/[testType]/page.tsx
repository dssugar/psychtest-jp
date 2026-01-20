"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getTestResult, type TestType } from "@/lib/storage";
import { getTestConfig } from "@/lib/tests/test-registry";
import { ScoreCircle } from "@/components/viz/ScoreCircle";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import { SocialShareButtons } from "@/components/share/SocialShareButtons";
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";

// BigFive specific imports (for BigFive score display only)
import { addAllEstimations } from "@/lib/tests/bigfive";
import { OG_COLORS, DIMENSION_NAMES, DIMENSION_ORDER } from "@/lib/og-design/constants";
import type { DimensionData } from "@/lib/og-design/types";
import type { BigFiveResult } from "@/lib/tests/bigfive";

/**
 * 動的結果ページ（全テスト統合）
 *
 * このページは7つのテスト（BigFive, Industriousness, PHQ-9, K6, SWLS, Rosenberg, SelfConcept）
 * すべての結果表示に対応する汎用的な結果インターフェースです。
 *
 * ルート: /results/[testType] (例: /results/phq9, /results/bigfive)
 */
export default function DynamicResultPage() {
  const router = useRouter();
  const params = useParams();
  const testType = params.testType as string;

  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Registry から設定取得
  const config = getTestConfig(testType as any);
  const {
    color,
    scaleInfo,
    scoreDisplay,
    resultAlerts,
    resultExtensions,
  } = config;

  useEffect(() => {
    const testResult = getTestResult(testType as TestType);
    if (!testResult) {
      router.push(`/${testType}`);
      return;
    }
    setResult(testResult);
    setLoading(false);
  }, [router, testType]);

  if (loading || !result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brutal-gray-800 font-mono">Loading...</div>
      </main>
    );
  }

  const testResult = result.result;

  // アラート条件チェック
  const activeAlerts =
    resultAlerts?.filter((alert: any) => alert.condition(testResult)) || [];

  // 心理学的層のラベル取得
  const getLayerLabel = () => {
    const layerMap: Record<string, string> = {
      trait: "特性 (TRAIT)",
      state: "状態 (STATE)",
      outcome: "成果 (OUTCOME)",
      skill: "スキル (SKILL)",
    };
    return layerMap[scaleInfo.psychologicalLayer];
  };

  // 心理学的層の色取得
  const getLayerColor = (): "green" | "blue" | "pink" | "orange" => {
    const colorMap: Record<string, "green" | "blue" | "pink" | "orange"> = {
      trait: "green",
      state: "blue",
      outcome: "pink",
      skill: "orange",
    };
    return colorMap[scaleInfo.psychologicalLayer] || "blue";
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <DataBadge color={color} size="lg">
                {scaleInfo.abbreviation} RESULT
              </DataBadge>
              <DataBadge color={getLayerColor()} size="md">
                {getLayerLabel()}
              </DataBadge>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              診断結果
            </h1>
            <p className="text-lg md:text-xl text-brutal-gray-800 font-mono">
              {scaleInfo.nameJa}
            </p>
          </div>

          {/* Alerts (条件付き) */}
          {activeAlerts.map((alert: any, index: number) => (
            <Card
              key={index}
              variant={alert.type === "crisis" || alert.type === "urgent" ? "orange" : "yellow"}
              padding="md"
              className={`mb-8 ${alert.type === "crisis" ? "border-4 border-brutal-black" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl md:text-4xl">
                  {alert.type === "crisis" ? "🚨" : "⚠️"}
                </div>
                <div>
                  <div className="font-bold text-brutal-black mb-2 uppercase tracking-wide text-lg">
                    {alert.title}
                  </div>
                  <p className="text-sm text-brutal-black leading-relaxed mb-3">
                    {alert.message}
                  </p>
                  {alert.contacts && (
                    <div className="bg-brutal-black text-brutal-white p-4 font-mono text-sm">
                      <div className="font-bold mb-2">今すぐ連絡してください:</div>
                      <ul className="space-y-1">
                        {alert.contacts.map((contact: any, i: number) => (
                          <li key={i}>
                            • {contact.name}: {contact.number}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Score Display - テスト固有の表示 */}
          {renderScoreDisplay(testType, testResult, scoreDisplay, color, scaleInfo, result)}

          {/* Result Extensions (条件付き) */}
          {resultExtensions?.shareButtons && renderShareButtons(testType, testResult)}
          {/* TODO: BigFive専用拡張機能（Facets, MBTI, Enneagram）は
              複雑な構造のため、既存のbigfive result pageで対応 */}

          {/* Academic Credibility */}
          <div className="mb-16">
            <h2
              className="text-2xl md:text-3xl lg:text-5xl text-brutal-black mb-8"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
            >
              学術的根拠
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <StatCard
                icon="📊"
                label="信頼性係数"
                value={`α = ${scaleInfo.reliability.cronbachAlpha.split(",")[0]}`}
                description="高い内的一貫性"
                color={color}
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value={scaleInfo.reliability.testRetest.split("(")[0].trim()}
                description="安定した測定結果"
                color="green"
              />
              <StatCard
                icon="👥"
                label="開発者"
                value={scaleInfo.developer.split("(")[0].trim()}
                description={scaleInfo.tier}
                color="orange"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value={scaleInfo.citations}
                description="高い学術的信頼性"
                color="pink"
              />
            </div>
          </div>

          {/* Test Info */}
          <div className="mb-16">
            <Card variant="white" padding="md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                  <DataBadge color="black">{scaleInfo.stats.questions} Questions</DataBadge>
                  <DataBadge color={color}>{scaleInfo.abbreviation}</DataBadge>
                </div>
              </div>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="mb-12">
            <Card variant="yellow" padding="md">
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
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/test/${testType}`}
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
      </div>
    </main>
  );
}

/**
 * スコア表示のレンダリング（テスト固有）
 */
function renderScoreDisplay(
  testType: string,
  testResult: any,
  scoreDisplay: any,
  color: string,
  scaleInfo: any,
  result: any
) {
  // BigFive: 特殊な多次元表示
  if (testType === "bigfive") {
    return renderBigFiveScoreDisplay(testResult, result);
  }

  // Industriousness: 2x2マトリックス表示
  if (testType === "industriousness") {
    return renderIndustriousnessScoreDisplay(testResult);
  }

  // PHQ-9/K6: プログレスバー + レベル色
  if (testType === "phq9" || testType === "k6") {
    return renderClinicalScoreDisplay(testType, testResult, scoreDisplay, color);
  }

  // その他: Circle または Progress
  if (scoreDisplay?.type === "circle") {
    return renderCircleScoreDisplay(testResult, color, scaleInfo);
  }

  if (scoreDisplay?.type === "progress") {
    return renderProgressScoreDisplay(testResult, color, scoreDisplay);
  }

  // フォールバック: シンプルなスコア表示
  return (
    <div className="mb-16">
      <Card variant={color as any} padding="lg">
        <div className="text-center">
          <div className="text-6xl md:text-8xl font-mono font-bold data-number mb-4">
            {testResult.rawScore || "N/A"}
          </div>
          <p className="text-lg">{testResult.interpretation}</p>
        </div>
      </Card>
    </div>
  );
}

/**
 * Circle型スコア表示
 */
function renderCircleScoreDisplay(testResult: any, color: string, scaleInfo: any) {
  return (
    <div className="mb-16">
      <Card variant="white" padding="lg" className="animate-scale-in">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <div className="flex-shrink-0 w-[180px] md:w-[220px] lg:w-[240px]">
            <ScoreCircle
              score={testResult.percentageScore}
              size="lg"
              color={color as any}
              label={scaleInfo.nameJa}
            />
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <DataBadge color={color as any} size="lg">
                {testResult.levelLabel || "スコア"}
              </DataBadge>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl text-brutal-black mt-4 mb-4"
                style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
              >
                評価レベル
              </h2>
            </div>
            <Card
              variant="white"
              padding="md"
              className="bg-brutal-gray-50 border-l-brutal-thick border-l-viz-blue"
            >
              <h3 className="font-bold uppercase tracking-wide text-sm text-brutal-gray-900 mb-3">
                結果の解釈
              </h3>
              <p className="text-brutal-gray-900 leading-relaxed">{testResult.interpretation}</p>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Progress型スコア表示
 */
function renderProgressScoreDisplay(testResult: any, color: string, scoreDisplay: any) {
  return (
    <div className="mb-16">
      <Card variant={color as any} padding="lg">
        <div className="text-center mb-6">
          <div className="text-6xl md:text-8xl font-mono font-bold data-number mb-4">
            {testResult.rawScore}
            <span className="text-3xl md:text-4xl font-semibold">
              /{scoreDisplay.maxScore}
            </span>
          </div>
        </div>
        <BrutalProgressBar
          value={(testResult.rawScore / scoreDisplay.maxScore) * 100}
          color={color as any}
          showValue={false}
        />
      </Card>
    </div>
  );
}

/**
 * 臨床系（PHQ-9, K6）のスコア表示
 */
function renderClinicalScoreDisplay(
  testType: string,
  testResult: any,
  scoreDisplay: any,
  baseColor: string
) {
  // スコア取得（すべてrawScoreで統一）
  const score = testResult.rawScore;
  const percentageScore =
    testResult.percentageScore || (score / scoreDisplay.maxScore) * 100;

  // レベルに応じた色の決定
  const getLevelColor = (): "orange" | "blue" | "green" | "pink" | "black" => {
    if (testType === "phq9") {
      if (testResult.level === "severe") return "orange";
      if (testResult.level === "moderately_severe") return "orange";
      if (testResult.level === "moderate") return "pink";
      if (testResult.level === "mild") return "blue";
      return "green";
    }
    // K6
    if (score >= 13) return "orange";
    if (score >= 10) return "pink";
    if (score >= 5) return "blue";
    return "green";
  };

  const levelColor = getLevelColor();

  return (
    <div className="mb-16">
      <Card variant={levelColor} padding="lg">
        <div className="text-center mb-6">
          <div className="text-6xl md:text-8xl font-mono font-bold data-number mb-4">
            {score}
            <span className="text-3xl md:text-4xl font-semibold">
              /{scoreDisplay.maxScore}
            </span>
          </div>
          <div
            className="text-2xl md:text-3xl text-brutal-black"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            {testResult.levelLabel}
          </div>
        </div>
        <BrutalProgressBar value={percentageScore} color={levelColor} showValue={false} />
        <div className="mt-6 text-center text-sm font-mono text-brutal-gray-800">
          {testResult.interpretation}
        </div>
      </Card>
    </div>
  );
}

/**
 * BigFive特殊表示
 */
function renderBigFiveScoreDisplay(bigFiveResult: BigFiveResult, result: any) {
  const bigFiveWithEstimations = addAllEstimations(bigFiveResult);
  const toPercentage = (score: number) => ((score - 24) / 96) * 100;

  const dimensionsForSummary: DimensionData[] = DIMENSION_ORDER.map((key) => ({
    key,
    label: DIMENSION_NAMES[key],
    score: bigFiveResult[key],
    percentage: toPercentage(bigFiveResult[key]),
    color: OG_COLORS.dimensions[key],
  }));

  return (
    <div className="mb-12">
      <ResultSummaryCard
        dimensions={dimensionsForSummary}
        testName="Big Five 性格診断結果"
        siteName="心理測定ラボ"
      />
    </div>
  );
}

/**
 * Industriousness特殊表示
 */
function renderIndustriousnessScoreDisplay(testResult: any) {
  return (
    <div className="mb-16">
      <Card variant="green" padding="lg">
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl text-brutal-black mb-4"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            あなたのタイプ: {testResult.quadrantLabel}
          </h2>
          <div className="text-5xl font-mono font-bold data-number">
            {testResult.rawScore}点
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-bold uppercase tracking-wide mb-2">目標達成意欲 (C4)</div>
            <BrutalProgressBar
              value={(testResult.c4_achievement / 50) * 100}
              color="blue"
              label={`${testResult.c4_achievement}/50`}
            />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wide mb-2">自己統制力 (C5)</div>
            <BrutalProgressBar
              value={(testResult.c5_discipline / 50) * 100}
              color="green"
              label={`${testResult.c5_discipline}/50`}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * シェアボタンのレンダリング
 */
function renderShareButtons(testType: string, testResult: any) {
  let shareUrl = "";

  if (testType === "bigfive") {
    shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/bigfive?e=${testResult.extraversion}&a=${testResult.agreeableness}&c=${testResult.conscientiousness}&n=${testResult.neuroticism}&o=${testResult.openness}`;
  } else {
    shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${testType}`;
  }

  return (
    <div className="mb-16">
      <Card variant="white" padding="lg">
        <h2
          className="text-2xl md:text-3xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          結果をシェア
        </h2>
        <p className="text-sm text-brutal-gray-700 mb-4">
          診断結果をSNSでシェアできます。
        </p>
        <SocialShareButtons
          shareUrl={shareUrl}
          text={`${testType}の診断結果をシェア！`}
        />
      </Card>
    </div>
  );
}
