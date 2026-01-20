/**
 * Self-Concept Clarity Scale (SCCS) - Scoring & Configuration
 *
 * Self-Concept Clarity の採点とレベル判定
 *
 * スコア範囲: 8-40点（短縮版）
 * - 8-13点: 低い（自己認識が曖昧）
 * - 14-19点: やや低い
 * - 20-27点: 中程度
 * - 28-31点: 高い
 * - 32-40点: 非常に高い
 *
 * @reference Campbell, J. D., Trapnell, P. D., Heine, S. J., Katz, I. M.,
 *            Lavallee, L. F., & Lehman, D. R. (1996). Self-concept clarity:
 *            Measurement, personality correlates, and cultural boundaries.
 *            Journal of Personality and Social Psychology, 70(1), 141-156.
 */

import {
  selfConceptQuestions,
  scaleOptions,
  scaleInfo,
} from "@/data/selfconcept-questions";
import type { TestConfig } from "./types";
import { validateAnswerPattern as validateCommon } from "./validation";
import type { DimensionData } from "@/lib/og-design/types";
import { TEST_COLOR_MAP } from "@/lib/og-design/constants";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Self-Concept Clarity (SCC) の結果型
 */
export interface SelfConceptResult {
  rawScore: number;
  percentageScore: number;
  level: "very_low" | "low" | "moderate" | "high" | "very_high";
  levelLabel: string;
  // NOTE: interpretation は保存せず、表示時に getInterpretation() で動的生成
}

// ============================================================================
// Scoring Logic
// ============================================================================

/**
 * Self-Concept Clarity スコアを計算
 * @param answers 回答配列（1-5の値）
 * @returns 計算結果
 */
export function calculateSelfConceptScore(
  answers: number[]
): SelfConceptResult {
  if (answers.length !== 8) {
    throw new Error("Self-Concept Clarity requires exactly 8 answers");
  }

  // 逆転項目を反転（Q5-Q8）
  const scoredAnswers = answers.map((answer, index) => {
    const question = selfConceptQuestions[index];
    if (!question) {
      throw new Error(`Question not found for index: ${index}`);
    }
    return question.reverse ? 6 - answer : answer;
  });

  // 合計スコア計算
  const rawScore = scoredAnswers.reduce((sum, score) => sum + score, 0);

  // パーセンテージ計算（8-40 → 0-100%）
  const min = 8;
  const max = 40;
  const percentageScore = ((rawScore - min) / (max - min)) * 100;

  // レベル判定
  let level: SelfConceptResult["level"];
  let levelLabel: string;

  if (rawScore >= 32) {
    level = "very_high";
    levelLabel = "非常に高い";
  } else if (rawScore >= 28) {
    level = "high";
    levelLabel = "高い";
  } else if (rawScore >= 20) {
    level = "moderate";
    levelLabel = "中程度";
  } else if (rawScore >= 14) {
    level = "low";
    levelLabel = "やや低い";
  } else {
    level = "very_low";
    levelLabel = "低い";
  }

  return {
    rawScore,
    percentageScore,
    level,
    levelLabel,
  };
}

/**
 * 解釈文を取得
 * 表示時に動的生成するため、localStorage に保存しない
 */
export function getInterpretation(
  level: SelfConceptResult["level"]
): string {
  const interpretations: Record<SelfConceptResult["level"], string> = {
    very_high: "自己認識が非常に明確で安定しています。自分の性格、価値観、信念について確信を持ち、一貫した自己イメージを維持しています。",
    high: "自己認識が明確です。自分自身をよく理解しており、状況によって自己イメージが大きく揺らぐことは少ないです。",
    moderate: "自己認識は平均的です。ある程度自分を理解していますが、状況によっては自己イメージが揺らぐこともあります。",
    low: "自己認識がやや曖昧です。自分がどんな人間かについて確信を持ちにくく、状況によって自己イメージが変化しやすい傾向があります。",
    very_low: "自己認識が曖昧な状態です。自分自身について混乱しやすく、一貫した自己イメージを持ちにくい傾向があります。自己探求を通じて自己理解を深めることが有益かもしれません。",
  };
  return interpretations[level];
}

/**
 * Self-Concept Clarity Scale 回答バリデーション
 */
function validateAnswerPattern(answers: number[]) {
  return validateCommon(answers, {
    expectedLength: 8,
    minValue: 1,
    maxValue: 5,
    messageType: "message",
  });
}

// ============================================================================
// Test Configuration
// ============================================================================

/**
 * Self-Concept Clarity Scale テスト設定
 */
export const selfConceptConfig: TestConfig<SelfConceptResult> = {
  id: "selfconcept",
  color: "blue",
  basePath: "/selfconcept",
  questions: selfConceptQuestions,
  scaleOptions,
  calculateScore: calculateSelfConceptScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,

  // 結果ページ設定
  scoreDisplay: {
    type: "circle",
    maxScore: 60,
  },

  // 結果ページ拡張機能
  resultExtensions: {
    shareButtons: true,
  },

  // OG画像設定
  ogImage: {
    layoutType: "single",
    titleEn: "SELF-CONCEPT\nCLARITY",
    category: "自己認識明確性診断",
    description: "自己理解の明瞭さを測定\n自分を知る力を評価",
    scoreDisplay: { type: "raw", min: 8, max: 40, unit: "" },
    scoreToParams: (result: SelfConceptResult) => ({
      score: (result?.rawScore ?? 24).toString(),
    }),
    paramsToScore: (params: URLSearchParams) => ({
      score: parseInt(params.get("score") || "24"),
    }),
  },

  // 🆕 NEW: 1次元データ生成
  getDimensions: (result: SelfConceptResult): DimensionData[] => {
    const min = 8;
    const max = 40;
    const rawScore = result?.rawScore ?? 24;
    const percentage = result?.percentageScore ?? ((rawScore - min) / (max - min)) * 100;

    return [{
      key: 'score',
      label: 'Total Score',
      score: rawScore,
      percentage: percentage,
      color: TEST_COLOR_MAP['blue'] || '#3b82f6',
    }];
  },
};
