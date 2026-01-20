/**
 * Big Five (IPIP-120) - Scoring & Configuration
 *
 * Big Five personality traits測定 (IPIP-NEO 120-item version)
 *
 * 5次元 (Domains): 各24-120点
 * - Extraversion (外向性)
 * - Agreeableness (協調性)
 * - Conscientiousness (誠実性)
 * - Neuroticism (神経症傾向)
 * - Openness (開放性)
 *
 * 30ファセット (Facets): 各4-20点
 * - 各次元に6つのファセット
 * - 各ファセットに4項目
 *
 * @reference Goldberg, L. R. (1992). The development of markers for the Big-Five
 *            factor structure. Psychological Assessment, 4(1), 26-42.
 * @reference International Personality Item Pool: https://ipip.ori.org/
 */

import {
  bigFiveQuestions,
  scaleOptions,
  scaleInfo,
} from "@/data/bigfive-questions";
import { estimateMBTI } from "@/lib/tests/mbti-estimation";
import { estimateEnneagram } from "@/lib/tests/enneagram-estimation";
import type { TestConfig } from "./types";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * MBTI推定結果
 */
export interface MBTIEstimation {
  type: string; // e.g., "ENFP"
  axes: {
    EI: { score: number; preference: 'E' | 'I'; confidence: number };
    SN: { score: number; preference: 'S' | 'N'; confidence: number };
    TF: { score: number; preference: 'T' | 'F'; confidence: number };
    JP: { score: number; preference: 'J' | 'P'; confidence: number };
  };
  overallConfidence: 'high' | 'medium' | 'low';
  academicReference: string;
  disclaimer: string;
}

/**
 * エニアグラム推定結果
 */
export interface EnneagramEstimation {
  primaryType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  typeScores: Record<1|2|3|4|5|6|7|8|9, number>;
  confidence: 'low' | 'medium'; // Never 'high'
  academicReference: string;
  disclaimer: string;
}

/**
 * 30ファセットのスコア
 */
export interface BigFiveFacets {
  // Neuroticism (N1-N6)
  n1_anxiety: number;
  n2_anger: number;
  n3_depression: number;
  n4_selfConsciousness: number;
  n5_immoderation: number;
  n6_vulnerability: number;

  // Extraversion (E1-E6)
  e1_friendliness: number;
  e2_gregariousness: number;
  e3_assertiveness: number;
  e4_activityLevel: number;
  e5_excitementSeeking: number;
  e6_cheerfulness: number;

  // Openness (O1-O6)
  o1_imagination: number;
  o2_artisticInterests: number;
  o3_emotionality: number;
  o4_adventurousness: number;
  o5_intellect: number;
  o6_liberalism: number;

  // Agreeableness (A1-A6)
  a1_trust: number;
  a2_morality: number;
  a3_altruism: number;
  a4_cooperation: number;
  a5_modesty: number;
  a6_sympathy: number;

  // Conscientiousness (C1-C6)
  c1_selfEfficacy: number;
  c2_orderliness: number;
  c3_dutifulness: number;
  c4_achievementStriving: number;
  c5_selfDiscipline: number;
  c6_cautiousness: number;
}

export interface BigFiveResult {
  // 5次元スコア (Mini-IPIP: 4-20, IPIP-120: 24-120)
  extraversion: number; // 外向性
  agreeableness: number; // 協調性
  conscientiousness: number; // 誠実性
  neuroticism: number; // 神経症傾向
  openness: number; // 開放性

  // 30ファセットスコア (IPIP-120のみ: 4-20 each) - optional
  facets?: BigFiveFacets;

  interpretation: string;

  // 変換推定 (IPIP-120のみ) - optional
  mbtiEstimation?: MBTIEstimation;
  enneagramEstimation?: EnneagramEstimation;
}

// ============================================================================
// Scoring Logic
// ============================================================================

/**
 * Big Five スコア計算 (IPIP-120)
 * @param answers 各質問への回答（1-5）
 * @returns 計算結果
 */
export function calculateBigFiveScore(answers: number[]): BigFiveResult {
  if (answers.length !== 120) {
    throw new Error("回答数が正しくありません。120問の回答が必要です。");
  }

  // 各次元のスコアを初期化 (24-120 range)
  const domainScores = {
    extraversion: 0,
    agreeableness: 0,
    conscientiousness: 0,
    neuroticism: 0,
    openness: 0,
  };

  // 30ファセットのスコアを初期化 (4-20 range each)
  const facetScores: Record<string, number> = {};
  const facetKeys = [
    'n1_anxiety', 'n2_anger', 'n3_depression', 'n4_selfConsciousness', 'n5_immoderation', 'n6_vulnerability',
    'e1_friendliness', 'e2_gregariousness', 'e3_assertiveness', 'e4_activityLevel', 'e5_excitementSeeking', 'e6_cheerfulness',
    'o1_imagination', 'o2_artisticInterests', 'o3_emotionality', 'o4_adventurousness', 'o5_intellect', 'o6_liberalism',
    'a1_trust', 'a2_morality', 'a3_altruism', 'a4_cooperation', 'a5_modesty', 'a6_sympathy',
    'c1_selfEfficacy', 'c2_orderliness', 'c3_dutifulness', 'c4_achievementStriving', 'c5_selfDiscipline', 'c6_cautiousness'
  ];
  facetKeys.forEach(key => facetScores[key] = 0);

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

    // 次元スコアに加算
    domainScores[question.dimension] += score;

    // ファセットスコアに加算
    if (question.facetName) {
      facetScores[question.facetName] += score;
    }
  }

  // 30ファセットを型付きオブジェクトに変換
  const facets: BigFiveFacets = {
    n1_anxiety: facetScores.n1_anxiety,
    n2_anger: facetScores.n2_anger,
    n3_depression: facetScores.n3_depression,
    n4_selfConsciousness: facetScores.n4_selfConsciousness,
    n5_immoderation: facetScores.n5_immoderation,
    n6_vulnerability: facetScores.n6_vulnerability,
    e1_friendliness: facetScores.e1_friendliness,
    e2_gregariousness: facetScores.e2_gregariousness,
    e3_assertiveness: facetScores.e3_assertiveness,
    e4_activityLevel: facetScores.e4_activityLevel,
    e5_excitementSeeking: facetScores.e5_excitementSeeking,
    e6_cheerfulness: facetScores.e6_cheerfulness,
    o1_imagination: facetScores.o1_imagination,
    o2_artisticInterests: facetScores.o2_artisticInterests,
    o3_emotionality: facetScores.o3_emotionality,
    o4_adventurousness: facetScores.o4_adventurousness,
    o5_intellect: facetScores.o5_intellect,
    o6_liberalism: facetScores.o6_liberalism,
    a1_trust: facetScores.a1_trust,
    a2_morality: facetScores.a2_morality,
    a3_altruism: facetScores.a3_altruism,
    a4_cooperation: facetScores.a4_cooperation,
    a5_modesty: facetScores.a5_modesty,
    a6_sympathy: facetScores.a6_sympathy,
    c1_selfEfficacy: facetScores.c1_selfEfficacy,
    c2_orderliness: facetScores.c2_orderliness,
    c3_dutifulness: facetScores.c3_dutifulness,
    c4_achievementStriving: facetScores.c4_achievementStriving,
    c5_selfDiscipline: facetScores.c5_selfDiscipline,
    c6_cautiousness: facetScores.c6_cautiousness,
  };

  // 解釈文の生成
  const interpretation = getInterpretation(domainScores);

  return {
    ...domainScores,
    facets,
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

  // 外向性 (24-120, 中央値72)
  if (scores.extraversion >= 84) {
    traits.push("社交的で活発");
  } else if (scores.extraversion <= 60) {
    traits.push("内省的で落ち着いている");
  } else {
    traits.push("適度に社交的");
  }

  // 協調性 (24-120, 中央値72)
  if (scores.agreeableness >= 84) {
    traits.push("協力的で思いやりがある");
  } else if (scores.agreeableness <= 60) {
    traits.push("競争的で独立心が強い");
  } else {
    traits.push("バランスの取れた対人関係");
  }

  // 誠実性 (24-120, 中央値72)
  if (scores.conscientiousness >= 84) {
    traits.push("計画的で責任感が強い");
  } else if (scores.conscientiousness <= 60) {
    traits.push("柔軟で自発的");
  } else {
    traits.push("適度に計画的");
  }

  // 神経症傾向 (24-120, 中央値72)
  if (scores.neuroticism >= 84) {
    traits.push("感受性が高く繊細");
  } else if (scores.neuroticism <= 60) {
    traits.push("感情的に安定している");
  } else {
    traits.push("適度に感情的");
  }

  // 開放性 (24-120, 中央値72)
  if (scores.openness >= 84) {
    traits.push("創造的で好奇心旺盛");
  } else if (scores.openness <= 60) {
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

  if (uniqueAnswers.size === 2 && answers.length === 120) {
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

/**
 * Big Five結果にMBTI推定を追加
 */
export function addMBTIEstimation(result: BigFiveResult): BigFiveResult {
  const mbti = estimateMBTI({
    extraversion: result.extraversion,
    agreeableness: result.agreeableness,
    conscientiousness: result.conscientiousness,
    neuroticism: result.neuroticism,
    openness: result.openness,
  });

  return {
    ...result,
    mbtiEstimation: mbti,
  };
}

/**
 * Big Five結果にEnneagram推定を追加
 */
export function addEnneagramEstimation(result: BigFiveResult): BigFiveResult {
  const enneagram = estimateEnneagram({
    extraversion: result.extraversion,
    agreeableness: result.agreeableness,
    conscientiousness: result.conscientiousness,
    neuroticism: result.neuroticism,
    openness: result.openness,
  });

  return {
    ...result,
    enneagramEstimation: enneagram,
  };
}

/**
 * Big Five結果にMBTIとEnneagram推定を両方追加
 */
export function addAllEstimations(result: BigFiveResult): BigFiveResult {
  return addEnneagramEstimation(addMBTIEstimation(result));
}

// ============================================================================
// Test Configuration
// ============================================================================

/**
 * Big Five (IPIP-120) テスト設定
 */
export const bigFiveConfig: TestConfig<BigFiveResult> = {
  id: "bigfive",
  color: "green",
  basePath: "/bigfive",
  questions: bigFiveQuestions,
  scaleOptions,
  calculateScore: calculateBigFiveScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
  testVersion: "ipip-120",

  // 結果ページ設定
  scoreDisplay: {
    type: "multibar",
    maxScore: 5,
  },
  resultExtensions: {
    shareButtons: true,
    facetsDisplay: true,
    estimations: true,
  },
};
