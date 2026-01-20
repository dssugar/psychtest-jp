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
  interpretation: string;
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
  let interpretation: string;

  if (rawScore >= 32) {
    level = "very_high";
    levelLabel = "非常に高い";
    interpretation =
      "自己認識が非常に明確で安定しています。自分の性格、価値観、信念について確信を持ち、一貫した自己イメージを維持しています。";
  } else if (rawScore >= 28) {
    level = "high";
    levelLabel = "高い";
    interpretation =
      "自己認識が明確です。自分自身をよく理解しており、状況によって自己イメージが大きく揺らぐことは少ないです。";
  } else if (rawScore >= 20) {
    level = "moderate";
    levelLabel = "中程度";
    interpretation =
      "自己認識は平均的です。ある程度自分を理解していますが、状況によっては自己イメージが揺らぐこともあります。";
  } else if (rawScore >= 14) {
    level = "low";
    levelLabel = "やや低い";
    interpretation =
      "自己認識がやや曖昧です。自分がどんな人間かについて確信を持ちにくく、状況によって自己イメージが変化しやすい傾向があります。";
  } else {
    level = "very_low";
    levelLabel = "低い";
    interpretation =
      "自己認識が曖昧な状態です。自分自身について混乱しやすく、一貫した自己イメージを持ちにくい傾向があります。自己探求を通じて自己理解を深めることが有益かもしれません。";
  }

  return {
    rawScore,
    percentageScore,
    level,
    levelLabel,
    interpretation,
  };
}

/**
 * 回答パターンの妥当性を検証
 * @param answers 回答配列
 * @returns 検証結果
 */
export function validateAnswerPattern(answers: number[]): {
  valid: boolean;
  message?: string;
} {
  if (answers.length !== 8) {
    return {
      valid: false,
      message: "回答数が不正です（8問必要）",
    };
  }

  if (answers.some((answer) => answer < 1 || answer > 5)) {
    return {
      valid: false,
      message: "回答は1-5の範囲で入力してください",
    };
  }

  // すべて同じ回答の場合は警告（中心化傾向）
  const uniqueAnswers = new Set(answers);
  if (uniqueAnswers.size === 1) {
    return {
      valid: false,
      message:
        "すべての質問に同じ回答をしています。もう一度、各質問について考えてみてください。",
    };
  }

  return { valid: true };
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
};
