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
import { MarkdownContent } from "@/components/results/MarkdownContent";
import { QuadrantMatrix } from "@/components/industriousness/QuadrantMatrix";

// BigFive specific imports (for BigFive score display only)
import { addAllEstimations, getInterpretation as getBigFiveInterpretation, type BigFiveResult } from "@/lib/tests/bigfive";
import type { DimensionData } from "@/lib/og-design/types";
import type { InterpretationData } from "@/lib/tests/types";

// Dynamic interpretation imports for all tests
import { getDetailedInterpretation as getRosenbergDetailedInterpretation, type RosenbergResult } from "@/lib/tests/rosenberg";
import { getDetailedInterpretation as getSelfConceptDetailedInterpretation, type SelfConceptResult } from "@/lib/tests/selfconcept";
import { getDetailedInterpretation as getSwlsDetailedInterpretation, type SwlsResult } from "@/lib/tests/swls";
import { getDetailedInterpretation as getPhq9DetailedInterpretation, type Phq9Result } from "@/lib/tests/phq9";
import { getDetailedInterpretation as getK6DetailedInterpretation, type K6Result } from "@/lib/tests/k6";
import { getDetailedInterpretation as getIndustriousnessDetailedInterpretation, type IndustriousnessResult } from "@/lib/tests/industriousness";

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
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <h1
              className="text-4xl md:text-5xl lg:text-7xl text-brutal-black"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              診断結果
            </h1>
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

          {/* Result Summary Card (1200x630) */}
          {renderResultSummaryCard(testType, testResult, scoreDisplay, color, scaleInfo, result, config)}

          {/* Share Section - Result Summary Card の直下 */}
          {resultExtensions?.shareButtons && renderShareButtons(testType, testResult, config)}

          {/* Detailed Score Display - テスト固有の詳細表示 */}
          {renderDetailedScoreDisplay(testType, testResult, scoreDisplay, color, scaleInfo, result, config)}

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
 * Result Summary Card のレンダリング（1200x630セクション）
 */
function renderResultSummaryCard(
  testType: string,
  testResult: any,
  scoreDisplay: any,
  color: string,
  scaleInfo: any,
  result: any,
  config: any
) {
  // すべてのテスト: 次元データのバー表示（getDimensions使用、1次元～5次元対応）
  return renderDimensionSummaryCard(testResult, config);
}

/**
 * Detailed Score Display のレンダリング
 *
 * 設計ノート:
 * - 各テストに特有の詳細表示が必要な場合は、if/switch で分岐して専用関数を呼ぶ
 * - 全テストが特殊実装を持つわけではないため、Config駆動にすると過剰設計になる
 * - 現状7-8テストでは if 分岐で十分シンプル。15個以上になったら再検討を推奨
 * - Locality of Behavior: すべての分岐が1箇所に集約されているため理解しやすい
 */
function renderDetailedScoreDisplay(
  testType: string,
  testResult: any,
  scoreDisplay: any,
  color: string,
  scaleInfo: any,
  result: any,
  config: any
) {
  // BigFive: 簡易版（詳細はbigfive専用ページで表示）
  if (testType === "bigfive") {
    return renderBigFiveDetailedDisplay(testResult);
  }

  // Industriousness: 2x2マトリックス表示
  if (testType === "industriousness") {
    return renderIndustriousnessDetailedDisplay(testResult);
  }

  // PHQ-9/K6: プログレスバー + レベル色
  if (testType === "phq9" || testType === "k6") {
    return renderClinicalDetailedDisplay(testType, testResult, scoreDisplay, color, config);
  }

  // Rosenberg: 詳細解釈
  if (testType === "rosenberg") {
    return renderRosenbergDetailedDisplay(testResult, color, scoreDisplay);
  }

  // Self-Concept: 詳細解釈
  if (testType === "selfconcept") {
    return renderSelfConceptDetailedDisplay(testResult, color, scoreDisplay);
  }

  // SWLS: シンプル解釈
  if (testType === "swls") {
    return renderSwlsDetailedDisplay(testResult, color, scoreDisplay);
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
 * 解釈データを統一フォーマットで表示する共通関数
 *
 * @param interpretation - InterpretationData型のデータ
 * @param color - セクションのテーマカラー
 */
function renderDetailedInterpretation(
  interpretation: InterpretationData,
  color: string
) {
  return (
    <div className="mb-16 space-y-8">
      {/* 結果の解釈（必須） */}
      <Card variant="white" padding="lg" className="animate-scale-in">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          結果の解釈
        </h2>
        <MarkdownContent content={interpretation.summary} />
      </Card>

      {/* 日常生活への影響（存在する場合のみ） */}
      {interpretation.dailyLifeImpact && (
        <Card variant="white" padding="lg">
          <h3
            className="text-2xl md:text-3xl text-brutal-black mb-6"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            日常生活への影響
          </h3>
          <MarkdownContent content={interpretation.dailyLifeImpact} />
        </Card>
      )}

      {/* 心理学的背景（存在する場合のみ） */}
      {interpretation.psychBackground && (
        <Card variant={color as any} padding="lg">
          <h3
            className="text-2xl md:text-3xl text-brutal-black mb-6"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            心理学的背景
          </h3>
          <MarkdownContent content={interpretation.psychBackground} />
        </Card>
      )}

      {/* 実用的アドバイス（存在する場合のみ） */}
      {interpretation.practicalAdvice && (
        <Card variant="white" padding="lg" className="border-brutal-thick border-brutal-black">
          <h3
            className="text-2xl md:text-3xl text-brutal-black mb-6"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            実用的アドバイス
          </h3>
          <MarkdownContent content={interpretation.practicalAdvice} />
        </Card>
      )}
    </div>
  );
}

/**
 * Rosenberg Detailed Display
 */
function renderRosenbergDetailedDisplay(testResult: any, color: string, scoreDisplay: any) {
  const result = testResult as RosenbergResult;
  const interpretation = getRosenbergDetailedInterpretation(
    result.level,
    result.rawScore,
    result.percentageScore
  );
  return renderDetailedInterpretation(interpretation, color);
}

/**
 * Self-Concept Detailed Display
 */
function renderSelfConceptDetailedDisplay(testResult: any, color: string, scoreDisplay: any) {
  const result = testResult as SelfConceptResult;
  const interpretation = getSelfConceptDetailedInterpretation(result.level);
  return renderDetailedInterpretation(interpretation, color);
}

/**
 * SWLS Detailed Display
 */
function renderSwlsDetailedDisplay(testResult: any, color: string, scoreDisplay: any) {
  const result = testResult as SwlsResult;
  const interpretation = getSwlsDetailedInterpretation(result.level);
  return renderDetailedInterpretation(interpretation, color);
}

/**
 * @deprecated 旧Circle型の詳細表示（削除予定）
 */
function renderCircleDetailedDisplay(testType: string, testResult: any, color: string, scaleInfo: any) {
  // 全テストで動的に解釈文を生成（localStorage に保存しない）
  let detailedInterpretation: any;

  switch (testType) {
    case "rosenberg": {
      const result = testResult as RosenbergResult;
      detailedInterpretation = getRosenbergDetailedInterpretation(result.level, result.rawScore, result.percentageScore);
      break;
    }
    case "selfconcept": {
      const result = testResult as SelfConceptResult;
      detailedInterpretation = getSelfConceptDetailedInterpretation(result.level);
      break;
    }
    default:
      // フォールバック（古いlocalStorageデータ用）
      detailedInterpretation = testResult.detailedInterpretation || { summary: testResult.interpretation || "解釈文が利用できません。" };
  }

  const hasDetailedInterpretation = !!(detailedInterpretation?.dailyLifeImpact);

  return (
    <div className="mb-16 space-y-8">
      {/* 結果の解釈セクション */}
      <Card variant="white" padding="lg" className="animate-scale-in">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          結果の解釈
        </h2>
        <MarkdownContent
          content={detailedInterpretation.summary}
        />
      </Card>

      {/* 詳細解釈セクション（Phase 5対応） */}
      {hasDetailedInterpretation && (
        <>
          {/* 日常生活への影響 */}
          <Card variant="white" padding="lg">
            <h3
              className="text-2xl md:text-3xl text-brutal-black mb-6"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
            >
              日常生活への影響
            </h3>
            <MarkdownContent content={detailedInterpretation.dailyLifeImpact} />
          </Card>

          {/* 心理学的背景 */}
          <Card variant={color as any} padding="lg">
            <h3
              className="text-2xl md:text-3xl text-brutal-black mb-6"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
            >
              心理学的背景
            </h3>
            <MarkdownContent content={detailedInterpretation.psychBackground} />
          </Card>

          {/* 実用的アドバイス */}
          <Card variant="white" padding="lg" className="border-brutal-thick border-brutal-black">
            <h3
              className="text-2xl md:text-3xl text-brutal-black mb-6"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
            >
              実用的アドバイス
            </h3>
            <MarkdownContent content={detailedInterpretation.practicalAdvice} />
          </Card>
        </>
      )}
    </div>
  );
}

/**
 * Progress型の詳細表示（SWLS用）
 * @deprecated 使用されていない古い関数
 */
function renderProgressDetailedDisplay(testType: string, testResult: any, color: string, scoreDisplay: any) {
  // 動的に解釈文を生成
  let interpretation: string;
  if (testType === "swls") {
    const result = testResult as SwlsResult;
    const detailed = getSwlsDetailedInterpretation(result.level);
    interpretation = detailed.summary;
  } else {
    // フォールバック
    interpretation = testResult.interpretation || "解釈文が利用できません。";
  }

  return (
    <div className="mb-16 space-y-8">
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

      {/* 解釈セクション */}
      <Card variant="white" padding="lg">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          結果の解釈
        </h2>
        <MarkdownContent content={interpretation} />
      </Card>
    </div>
  );
}

/**
 * 臨床系（PHQ-9, K6）の詳細表示
 */
function renderClinicalDetailedDisplay(
  testType: string,
  testResult: any,
  scoreDisplay: any,
  baseColor: string,
  config: any
) {
  const score = testResult.rawScore;
  const percentageScore =
    testResult.percentageScore || (score / scoreDisplay.maxScore) * 100;

  // getDimensions から色を取得
  const dimensions = config.getDimensions(testResult);
  const colorHex = dimensions[0]?.color || '#3b82f6';

  // Hex色からvariant名にマッピング
  const colorToVariant = (hex: string): "orange" | "blue" | "green" | "pink" | "cyan" => {
    if (hex === '#f97316') return 'orange';
    if (hex === '#ec4899') return 'pink';
    if (hex === '#3b82f6') return 'blue';
    if (hex === '#10b981') return 'green';
    if (hex === '#06b6d4') return 'cyan';
    return 'blue'; // default
  };
  const levelColor = colorToVariant(colorHex);

  // 動的に詳細解釈を生成（4セクション構造）
  let detailedInterpretation: any;
  if (testType === "phq9") {
    const result = testResult as Phq9Result;
    detailedInterpretation = getPhq9DetailedInterpretation(result.level);
  } else if (testType === "k6") {
    const result = testResult as K6Result;
    detailedInterpretation = getK6DetailedInterpretation(result.level);
  } else {
    // フォールバック
    detailedInterpretation = { summary: testResult.interpretation || "解釈文が利用できません。" };
  }

  return (
    <div className="mb-16 space-y-8">
      {/* スコア表示 */}
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
      </Card>

      {/* 結果の解釈 */}
      <Card variant="white" padding="lg" className="animate-scale-in">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          結果の解釈
        </h2>
        <MarkdownContent content={detailedInterpretation.summary} />
      </Card>

      {/* 日常生活への影響 */}
      {detailedInterpretation.dailyLifeImpact && (
        <Card variant="white" padding="lg">
          <h3
            className="text-2xl md:text-3xl text-brutal-black mb-6"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            日常生活への影響
          </h3>
          <MarkdownContent content={detailedInterpretation.dailyLifeImpact} />
        </Card>
      )}

      {/* 心理学的背景 */}
      {detailedInterpretation.psychBackground && (
        <Card variant={levelColor} padding="lg">
          <h3
            className="text-2xl md:text-3xl text-brutal-black mb-6"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            心理学的背景
          </h3>
          <MarkdownContent content={detailedInterpretation.psychBackground} />
        </Card>
      )}

      {/* 実用的アドバイス */}
      {detailedInterpretation.practicalAdvice && (
        <Card variant="white" padding="lg" className="border-brutal-thick border-brutal-black">
          <h3
            className="text-2xl md:text-3xl text-brutal-black mb-6"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            実用的アドバイス
          </h3>
          <MarkdownContent content={detailedInterpretation.practicalAdvice} />
        </Card>
      )}
    </div>
  );
}

/**
 * 次元データのSummary Card（全テスト共通）
 * 1次元～5次元すべてに対応（getDimensionsから取得）
 */
function renderDimensionSummaryCard(testResult: any, config: any) {
  // config.getDimensions() を使用してデータソースを統一
  const dimensionData = config.getDimensions?.(testResult) || [];

  return (
    <div className="mb-12">
      <ResultSummaryCard
        dimensions={dimensionData}
        titleEn={config.ogImage.titleEn}
        category={config.ogImage.category}
        description={config.ogImage.description}
        config={config}
        testResult={testResult}
      />
    </div>
  );
}

/**
 * BigFive Detailed Display（簡易版 - 詳細はbigfive専用ページで表示）
 */
function renderBigFiveDetailedDisplay(bigFiveResult: BigFiveResult) {
  // 動的結果ページではSummary Cardのみ表示し、詳細はbigfive専用ページへ誘導
  return null;
}

/**
 * Industriousness Detailed Display
 */
function renderIndustriousnessDetailedDisplay(testResult: any) {
  const result = testResult as IndustriousnessResult;
  const detailedInterpretation = getIndustriousnessDetailedInterpretation(
    result.quadrant,
    result.c4_percentile,
    result.c5_percentile
  );

  return (
    <div className="mb-16 space-y-8">
      {/* 2×2象限マトリクス */}
      <QuadrantMatrix
        c4_percentile={testResult.c4_percentile}
        c5_percentile={testResult.c5_percentile}
        quadrant={testResult.quadrant}
        quadrantLabel={testResult.quadrantLabel}
      />

      {/* 結果の解釈 */}
      <Card variant="white" padding="lg" className="animate-scale-in">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          結果の解釈
        </h2>
        <MarkdownContent content={detailedInterpretation.summary} />
      </Card>

      {/* 日常生活への影響 */}
      <Card variant="white" padding="lg">
        <h3
          className="text-2xl md:text-3xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          日常生活への影響
        </h3>
        <MarkdownContent content={detailedInterpretation.dailyLifeImpact} />
      </Card>

      {/* 心理学的背景 */}
      <Card variant="green" padding="lg">
        <h3
          className="text-2xl md:text-3xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          心理学的背景
        </h3>
        <MarkdownContent content={detailedInterpretation.psychBackground} />
      </Card>

      {/* 実用的アドバイス */}
      <Card variant="white" padding="lg" className="border-brutal-thick border-brutal-black">
        <h3
          className="text-2xl md:text-3xl text-brutal-black mb-6"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          実用的アドバイス
        </h3>
        <MarkdownContent content={detailedInterpretation.practicalAdvice} />
      </Card>
    </div>
  );
}

/**
 * シェアボタンのレンダリング
 */
function renderShareButtons(testType: string, testResult: any, config: any) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  let shareUrl = `${origin}/${testType}`;

  // Generate share URL using config.ogImage.scoreToParams
  if (config.ogImage?.scoreToParams) {
    const params = config.ogImage.scoreToParams(testResult);
    const queryString = new URLSearchParams(params).toString();
    shareUrl = `${origin}/og/${testType}?${queryString}`;
  } else if (testType === "bigfive") {
    // BigFive special case (uses /share route)
    shareUrl = `${origin}/share/bigfive?e=${testResult.extraversion}&a=${testResult.agreeableness}&c=${testResult.conscientiousness}&n=${testResult.neuroticism}&o=${testResult.openness}`;
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
          診断結果をSNSでシェアできます。リンクをシェアすると、SNS上でサマリーカードが表示されます。
        </p>
        <SocialShareButtons
          shareUrl={shareUrl}
          text={`${testType}の診断結果をシェア！`}
        />
      </Card>
    </div>
  );
}

