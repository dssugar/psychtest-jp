import { sccsQuestions } from "@/data/sccs-questions";

export interface SccsResult {
  rawScore: number; // 生スコア（12-60）
  percentageScore: number; // パーセンテージ（0-100）
  level: "very_low" | "low" | "medium" | "high" | "very_high";
  interpretation: string;
}

/**
 * SCCS スコア計算
 * @param answers 各質問への回答（1-5）
 * @returns 計算結果
 */
export function calculateSccsScore(answers: number[]): SccsResult {
  if (answers.length !== 12) {
    throw new Error("回答数が正しくありません。12問の回答が必要です。");
  }

  // スコア計算（逆転項目を考慮）
  let rawScore = 0;
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const question = sccsQuestions[i];

    if (answer < 1 || answer > 5) {
      throw new Error(`無効な回答値: ${answer}. 1-5の範囲で回答してください。`);
    }

    // 逆転項目の場合は反転（1→5, 2→4, 3→3, 4→2, 5→1）
    const score = question.reverse ? 6 - answer : answer;
    rawScore += score;
  }

  // パーセンテージスコア（12-60を0-100に変換）
  const percentageScore = ((rawScore - 12) / 48) * 100;

  // レベル分類（大まかな目安）
  let level: SccsResult["level"];
  if (percentageScore < 20) {
    level = "very_low";
  } else if (percentageScore < 40) {
    level = "low";
  } else if (percentageScore < 60) {
    level = "medium";
  } else if (percentageScore < 80) {
    level = "high";
  } else {
    level = "very_high";
  }

  // 解釈文
  const interpretation = getInterpretation(level, percentageScore);

  return {
    rawScore,
    percentageScore: Math.round(percentageScore * 10) / 10, // 小数点1桁
    level,
    interpretation,
  };
}

function getInterpretation(
  level: SccsResult["level"],
  score: number
): string {
  const interpretations = {
    very_low: `自己概念の明確さが低い状態です（スコア: ${score.toFixed(1)}%）。自分自身についての理解が曖昧で、自己認識が日々変化しやすい傾向があります。これは必ずしも問題ではありませんが、自己理解を深めることで生活の質が向上する可能性があります。`,
    low: `自己概念の明確さがやや低い状態です（スコア: ${score.toFixed(1)}%）。自分自身についての考えが時々矛盾したり、自己理解に迷いを感じることがあるかもしれません。自己探求の過程にあると言えます。`,
    medium: `自己概念の明確さが平均的な状態です（スコア: ${score.toFixed(1)}%）。自分自身についてある程度理解していますが、時には迷いや矛盾を感じることもあります。多くの人がこの範囲に当てはまります。`,
    high: `自己概念の明確さが高い状態です（スコア: ${score.toFixed(1)}%）。自分自身についてよく理解しており、自己認識が安定しています。自分の性格や価値観について明確なイメージを持っています。`,
    very_high: `自己概念の明確さが非常に高い状態です（スコア: ${score.toFixed(1)}%）。自分自身について非常に明確で一貫した理解を持っており、自己認識が非常に安定しています。自分が何者であるかについて確信を持っています。`,
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
      warning: "すべて同じ回答が選択されています。正確な結果を得るため、各質問を注意深くお読みください。",
    };
  }

  if (uniqueAnswers.size === 2 && answers.length === 12) {
    return {
      valid: true,
      warning: "回答パターンが単調です。より正確な結果を得るため、各質問に対して率直に答えることをお勧めします。",
    };
  }

  return { valid: true };
}
