import { bigFiveQuestions } from "@/data/bigfive-questions";

export interface BigFiveResult {
  extraversion: number; // 外向性
  agreeableness: number; // 協調性
  conscientiousness: number; // 誠実性
  neuroticism: number; // 神経症傾向
  openness: number; // 開放性
  interpretation: string;
}

/**
 * Big Five スコア計算
 * @param answers 各質問への回答（1-5）
 * @returns 計算結果
 */
export function calculateBigFiveScore(answers: number[]): BigFiveResult {
  if (answers.length !== 20) {
    throw new Error("回答数が正しくありません。20問の回答が必要です。");
  }

  // 各次元のスコアを初期化
  const scores = {
    extraversion: 0,
    agreeableness: 0,
    conscientiousness: 0,
    neuroticism: 0,
    openness: 0,
  };

  // スコア計算（逆転項目を考慮）
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const question = bigFiveQuestions[i];

    if (answer < 1 || answer > 5) {
      throw new Error(
        `無効な回答値: ${answer}. 1-5の範囲で回答してください。`
      );
    }

    // 逆転項目の場合は反転（1→5, 2→4, 3→3, 4→2, 5→1）
    const score = question.reverse ? 6 - answer : answer;
    scores[question.dimension] += score;
  }

  // 解釈文の生成
  const interpretation = getInterpretation(scores);

  return {
    ...scores,
    interpretation,
  };
}

function getInterpretation(scores: {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}): string {
  const traits: string[] = [];

  // 外向性
  if (scores.extraversion >= 16) {
    traits.push("社交的で活発");
  } else if (scores.extraversion <= 8) {
    traits.push("内省的で落ち着いている");
  } else {
    traits.push("適度に社交的");
  }

  // 協調性
  if (scores.agreeableness >= 16) {
    traits.push("協力的で思いやりがある");
  } else if (scores.agreeableness <= 8) {
    traits.push("競争的で独立心が強い");
  } else {
    traits.push("バランスの取れた対人関係");
  }

  // 誠実性
  if (scores.conscientiousness >= 16) {
    traits.push("計画的で責任感が強い");
  } else if (scores.conscientiousness <= 8) {
    traits.push("柔軟で自発的");
  } else {
    traits.push("適度に計画的");
  }

  // 神経症傾向
  if (scores.neuroticism >= 16) {
    traits.push("感受性が高く繊細");
  } else if (scores.neuroticism <= 8) {
    traits.push("感情的に安定している");
  } else {
    traits.push("適度に感情的");
  }

  // 開放性
  if (scores.openness >= 16) {
    traits.push("創造的で好奇心旺盛");
  } else if (scores.openness <= 8) {
    traits.push("実践的で伝統的");
  } else {
    traits.push("バランスの取れた探求心");
  }

  return `あなたの性格は次のような特徴があります: ${traits.join(
    "、"
  )}。これらの特性はあなたの行動パターンや対人関係のスタイルに影響を与えます。`;
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

  if (uniqueAnswers.size === 2 && answers.length === 20) {
    return {
      valid: true,
      warning:
        "回答パターンが単調です。より正確な結果を得るため、各質問に対して率直に答えることをお勧めします。",
    };
  }

  return { valid: true };
}

/**
 * 次元名の日本語化
 */
export const dimensionNames = {
  extraversion: "外向性",
  agreeableness: "協調性",
  conscientiousness: "誠実性",
  neuroticism: "神経症傾向",
  openness: "開放性",
} as const;

/**
 * 次元の説明
 */
export const dimensionDescriptions = {
  extraversion:
    "社交性、活動性、刺激を求める傾向。高いほど外向的で、低いほど内向的。",
  agreeableness:
    "協力性、思いやり、対人関係における調和。高いほど協調的で、低いほど競争的。",
  conscientiousness:
    "計画性、責任感、目標達成への意欲。高いほど誠実で、低いほど柔軟。",
  neuroticism:
    "感情の安定性、ストレスへの反応。高いほど感受性が高く、低いほど安定的。",
  openness:
    "創造性、好奇心、新しい経験への開放性。高いほど革新的で、低いほど伝統的。",
} as const;
