/**
 * Rosenberg Self-Esteem Scale (RSES) - Scoring & Configuration
 *
 * Rosenberg自尊心尺度の採点とレベル判定
 *
 * スコア範囲: 10-40点
 * - 10-14点: 非常に低い自尊心
 * - 15-19点: 低い自尊心
 * - 20-29点: 平均的な自尊心
 * - 30-34点: 高い自尊心
 * - 35-40点: 非常に高い自尊心
 *
 * @reference Rosenberg, M. (1965). Society and the adolescent self-image.
 *            Princeton, NJ: Princeton University Press.
 */

import {
  rosenbergQuestions,
  scaleOptions,
  scaleInfo,
} from "@/data/rosenberg-questions";
import type { TestConfig } from "./types";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RosenbergResult {
  rawScore: number;
  percentageScore: number;
  level: "very_low" | "low" | "medium" | "high" | "very_high";
  interpretation: string;
}

// ============================================================================
// Scoring Logic
// ============================================================================

/**
 * Rosenberg自尊心尺度のスコア計算
 * @param answers 各質問への回答（1-4）
 * @returns 計算結果
 */
export function calculateRosenbergScore(answers: number[]): RosenbergResult {
  if (answers.length !== 10) {
    throw new Error("回答数が正しくありません。10問の回答が必要です。");
  }

  // スコア計算（逆転項目を考慮）
  let rawScore = 0;
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const question = rosenbergQuestions[i];

    if (answer < 1 || answer > 4) {
      throw new Error(`無効な回答値: ${answer}. 1-4の範囲で回答してください。`);
    }

    // 逆転項目の場合は反転（1→4, 2→3, 3→2, 4→1）
    const score = question.reverse ? 5 - answer : answer;
    rawScore += score;
  }

  // パーセンテージスコア（10-40を0-100に変換）
  const percentageScore = ((rawScore - 10) / 30) * 100;

  // レベル分類
  let level: RosenbergResult["level"];
  if (rawScore < 15) {
    level = "very_low";
  } else if (rawScore < 20) {
    level = "low";
  } else if (rawScore < 30) {
    level = "medium";
  } else if (rawScore < 35) {
    level = "high";
  } else {
    level = "very_high";
  }

  // 解釈文
  const interpretation = getInterpretation(level, rawScore, percentageScore);

  return {
    rawScore,
    percentageScore: Math.round(percentageScore * 10) / 10,
    level,
    interpretation,
  };
}

function getInterpretation(
  level: RosenbergResult["level"],
  rawScore: number,
  percentageScore: number
): string {
  const interpretations = {
    very_low: `自尊心が低い状態です（スコア: ${rawScore}/40, ${percentageScore.toFixed(1)}%）。自分自身に対して否定的な見方をしやすく、自己価値を感じにくい傾向があります。この状態は精神的な健康に影響を与える可能性があるため、専門家に相談することも検討してください。`,
    low: `自尊心がやや低い状態です（スコア: ${rawScore}/40, ${percentageScore.toFixed(1)}%）。自分自身を肯定的に捉えることが難しく、自己評価が低い傾向があります。自己受容を高める取り組みが役立つかもしれません。`,
    medium: `自尊心が平均的な状態です（スコア: ${rawScore}/40, ${percentageScore.toFixed(1)}%）。自分自身に対して概ね肯定的な態度を持っていますが、時には自己評価が揺らぐこともあるでしょう。多くの人がこの範囲に当てはまります。`,
    high: `自尊心が高い状態です（スコア: ${rawScore}/40, ${percentageScore.toFixed(1)}%）。自分自身を肯定的に捉え、自己価値をしっかりと感じています。この自尊心の高さは精神的な健康の基盤となります。`,
    very_high: `自尊心が非常に高い状態です（スコア: ${rawScore}/40, ${percentageScore.toFixed(1)}%）。自分自身に対して非常に肯定的な態度を持ち、強い自己価値感を持っています。この高い自尊心は多くの場面で心の支えとなるでしょう。`,
  };

  return interpretations[level];
}

/**
 * スコアの信頼性チェック
 * すべて同じ回答（例: 全て3）の場合は警告
 */
export function validateAnswerPattern(answers: number[]): {
  valid: boolean;
  warning?: string;
} {
  const uniqueAnswers = new Set(answers);

  if (uniqueAnswers.size === 1) {
    return {
      valid: false,
      warning:
        "すべて同じ回答が選択されています。正確な結果を得るため、各質問を注意深くお読みください。",
    };
  }

  if (uniqueAnswers.size === 2 && answers.length === 10) {
    return {
      valid: true,
      warning:
        "回答パターンが単調です。より正確な結果を得るため、各質問に対して率直に答えることをお勧めします。",
    };
  }

  return { valid: true };
}

// ============================================================================
// Test Configuration
// ============================================================================

/**
 * RSES (Rosenberg Self-Esteem Scale) テスト設定
 */
export const rosenbergConfig: TestConfig<RosenbergResult> = {
  id: "rosenberg",
  color: "pink",
  basePath: "/rosenberg",
  questions: rosenbergQuestions,
  scaleOptions,
  calculateScore: calculateRosenbergScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,

  // 結果ページ設定
  scoreDisplay: {
    type: "circle",
    maxScore: 40,
  },
  resultExtensions: {
    shareButtons: true,
  },

  // OG画像設定
  ogImage: {
    layoutType: "single",
    titleEn: "SELF\nESTEEM",
    category: "自尊心診断",
    description: "Rosenberg自尊心尺度\n学術的に信頼された自己評価",
    scoreDisplay: { type: "raw", min: 10, max: 40, unit: "" },
    scoreToParams: (result: RosenbergResult) => ({
      score: (result?.rawScore ?? 25).toString(),
    }),
    paramsToScore: (params: URLSearchParams) => ({
      score: parseInt(params.get("score") || "25"),
    }),
  },
};
