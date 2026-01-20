import type { TestResult } from "@/lib/storage";
import type { TestConfig } from "@/lib/tests/types";
import type { RosenbergResult } from "@/lib/tests/rosenberg";
import type { SelfConceptResult } from "@/lib/tests/selfconcept";
import type { BigFiveResult } from "@/lib/tests/bigfive";

/**
 * スコア抽出に対応しているテストタイプ
 */
export type SupportedTestType = "rosenberg" | "bigfive" | "selfconcept";

/**
 * テストスコアのデータ構造
 */
export interface TestScoreData {
  /** 生スコア */
  score: number;
  /** 最大スコア */
  maxScore: number;
  /** パーセンテージスコア (0-100) */
  percentage: number;
}

/**
 * テスト結果からスコア情報を抽出する
 *
 * 各テストタイプごとに異なる結果構造からスコア、最大スコア、パーセンテージを統一的に取得します。
 *
 * @param testType テストタイプ ("rosenberg", "bigfive", "selfconcept")
 * @param testData テスト結果データ
 * @param config テスト設定
 * @returns スコアデータ (score, maxScore, percentage)
 * @throws {Error} サポートされていないテストタイプの場合
 *
 * @example
 * ```typescript
 * const scoreData = extractTestScore("rosenberg", testData, config);
 * console.log(`${scoreData.score}/${scoreData.maxScore} (${scoreData.percentage}%)`);
 * ```
 */
export function extractTestScore(
  testType: SupportedTestType,
  testData: TestResult<unknown>,
  config: TestConfig<unknown>
): TestScoreData {
  // rosenberg と selfconcept は同じ構造（rawScore + percentageScore）
  if (testType === "rosenberg" || testType === "selfconcept") {
    const result = testData.result as RosenbergResult | SelfConceptResult;
    return {
      score: result.rawScore,
      maxScore: config.scaleInfo.scoring.max,
      percentage: result.percentageScore,
    };
  }

  // Big Five は5次元の平均を計算
  if (testType === "bigfive") {
    const result = testData.result as BigFiveResult;
    const dimensions = [
      result.extraversion,
      result.agreeableness,
      result.conscientiousness,
      result.neuroticism,
      result.openness,
    ];
    const avg = dimensions.reduce((sum, val) => sum + val, 0) / dimensions.length;
    const score = Math.round(avg * 10) / 10;
    const maxScore = 20; // Big Fiveの各次元は4-20の範囲
    const percentage = ((avg - 4) / 16) * 100; // 4-20を0-100%に変換

    return {
      score,
      maxScore,
      percentage,
    };
  }

  // サポートされていないテストタイプ
  throw new Error(
    `Unsupported test type: ${testType}. Supported types are: rosenberg, bigfive, selfconcept`
  );
}

/**
 * テストタイプがスコア抽出に対応しているかチェック（型ガード）
 *
 * @param testType テストタイプ
 * @returns サポートされている場合true（型をSupportedTestTypeに絞り込む）
 */
export function isScoreSupported(testType: string): testType is SupportedTestType {
  return testType === "rosenberg" || testType === "bigfive" || testType === "selfconcept";
}
