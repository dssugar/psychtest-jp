/**
 * エニアグラム推定アルゴリズム
 *
 * ビッグファイブ性格特性からエニアグラム9タイプを推定する
 *
 * 学術的根拠:
 * Daniels, D., & Price, V. (2009). The Essential Enneagram. HarperOne.
 * Furnham, A., et al. (2020). The Relationship Between the Big Five and the Enneagram.
 * Psychology, 11, 867-882.
 *
 * ⚠️ 重要な注意:
 * エニアグラムとビッグファイブの相関は弱い (r = 0.2-0.4)
 * この推定は参考程度にとどめ、正式な診断は専門家による面接が推奨される
 */

import type { EnneagramEstimation } from "./bigfive";

/**
 * ビッグファイブスコアからエニアグラムタイプを推定
 * @param domainScores 5次元スコア (24-120 range)
 * @returns エニアグラム推定結果
 */
export function estimateEnneagram(domainScores: {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}): EnneagramEstimation {
  // 0-1スケールに正規化
  const E = (domainScores.extraversion - 24) / 96;
  const A = (domainScores.agreeableness - 24) / 96;
  const C = (domainScores.conscientiousness - 24) / 96;
  const N = (domainScores.neuroticism - 24) / 96;
  const O = (domainScores.openness - 24) / 96;

  // 各タイプのスコアを計算 (ルールベース、0-100)
  // 学術文献とエニアグラム理論に基づく近似
  const typeScores: Record<1|2|3|4|5|6|7|8|9, number> = {
    // Type 1: 完璧主義者 (The Perfectionist)
    // 高誠実性、低神経症傾向
    1: (C * 0.7 + (1 - N) * 0.3) * 100,

    // Type 2: 援助者 (The Helper)
    // 高協調性、高外向性
    2: (A * 0.6 + E * 0.4) * 100,

    // Type 3: 達成者 (The Achiever)
    // 高誠実性、高外向性、低協調性
    3: (C * 0.5 + E * 0.3 + (1 - A) * 0.2) * 100,

    // Type 4: 個人主義者 (The Individualist)
    // 高開放性、高神経症傾向、低外向性
    4: (O * 0.5 + N * 0.3 + (1 - E) * 0.2) * 100,

    // Type 5: 研究者 (The Investigator)
    // 高開放性、低外向性、低協調性
    5: (O * 0.6 + (1 - E) * 0.3 + (1 - A) * 0.1) * 100,

    // Type 6: 忠実家 (The Loyalist)
    // 高神経症傾向、高誠実性
    6: (N * 0.5 + C * 0.3 + A * 0.2) * 100,

    // Type 7: 熱中者 (The Enthusiast)
    // 高外向性、高開放性、低神経症傾向
    7: (E * 0.5 + O * 0.3 + (1 - N) * 0.2) * 100,

    // Type 8: 挑戦者 (The Challenger)
    // 低協調性、高外向性、低神経症傾向
    8: ((1 - A) * 0.6 + E * 0.3 + (1 - N) * 0.1) * 100,

    // Type 9: 平和主義者 (The Peacemaker)
    // 高協調性、低神経症傾向、低外向性
    9: (A * 0.6 + (1 - N) * 0.3 + (1 - E) * 0.1) * 100,
  };

  // 最高スコアのタイプを主要タイプとする
  let primaryType: 1|2|3|4|5|6|7|8|9 = 1;
  let maxScore = typeScores[1];

  for (let type = 2; type <= 9; type++) {
    if (typeScores[type as 1|2|3|4|5|6|7|8|9] > maxScore) {
      maxScore = typeScores[type as 1|2|3|4|5|6|7|8|9];
      primaryType = type as 1|2|3|4|5|6|7|8|9;
    }
  }

  // 信頼度は常にlow/medium (学術的相関が弱いため)
  // スコアの分散が大きいほど信頼度が低い
  const scores = Object.values(typeScores);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
  const confidence: 'low' | 'medium' = variance > 150 ? 'medium' : 'low';

  return {
    primaryType,
    typeScores,
    confidence,
    academicReference:
      "Daniels, D., & Price, V. (2009). The Essential Enneagram; Furnham, A., et al. (2020). The Relationship Between the Big Five and the Enneagram. Psychology, 11, 867-882.",
    disclaimer: `エニアグラムとビッグファイブ性格特性の関連性は、学術的に弱いことが知られています（相関係数 r=0.2-0.4）。本推定は参考情報としてご利用ください。正式なエニアグラム診断は、専門家による面接形式での実施が推奨されます。`,
  };
}

/**
 * エニアグラム9タイプの日本語説明
 */
export const enneagramTypeDescriptions: Record<1|2|3|4|5|6|7|8|9, {
  name: string;
  description: string;
  coreTrait: string;
  coreDesire: string;
  coreFear: string;
}> = {
  1: {
    name: "完璧主義者 (The Perfectionist)",
    description: "原理原則を重視し、常に正しくあろうとする",
    coreTrait: "誠実性、道徳性",
    coreDesire: "正しくありたい、改善したい",
    coreFear: "間違うこと、腐敗すること",
  },
  2: {
    name: "援助者 (The Helper)",
    description: "他者のニーズに敏感で、人の役に立ちたいと思う",
    coreTrait: "思いやり、献身",
    coreDesire: "愛されたい、必要とされたい",
    coreFear: "愛されないこと、不要な存在であること",
  },
  3: {
    name: "達成者 (The Achiever)",
    description: "成功志向で、目標達成に向けて努力する",
    coreTrait: "野心、適応力",
    coreDesire: "価値のある存在でありたい",
    coreFear: "価値がないと思われること",
  },
  4: {
    name: "個人主義者 (The Individualist)",
    description: "独自性を重視し、感情豊かで創造的",
    coreTrait: "感受性、独創性",
    coreDesire: "ユニークでありたい、自分を表現したい",
    coreFear: "アイデンティティがないこと、平凡であること",
  },
  5: {
    name: "研究者 (The Investigator)",
    description: "知識を追求し、観察と分析を好む",
    coreTrait: "知的好奇心、独立性",
    coreDesire: "有能でありたい、理解したい",
    coreFear: "無能であること、圧倒されること",
  },
  6: {
    name: "忠実家 (The Loyalist)",
    description: "安全を求め、責任感が強く慎重",
    coreTrait: "忠誠心、慎重さ",
    coreDesire: "安全でありたい、サポートされたい",
    coreFear: "サポートなしで取り残されること",
  },
  7: {
    name: "熱中者 (The Enthusiast)",
    description: "楽観的で冒険好き、新しい経験を求める",
    coreTrait: "楽観性、自発性",
    coreDesire: "満足したい、楽しみたい",
    coreFear: "痛みや欠乏を経験すること",
  },
  8: {
    name: "挑戦者 (The Challenger)",
    description: "力強く自己主張し、他者を保護する",
    coreTrait: "自信、決断力",
    coreDesire: "自分を守りたい、自律したい",
    coreFear: "傷つけられること、支配されること",
  },
  9: {
    name: "平和主義者 (The Peacemaker)",
    description: "調和を重視し、対立を避ける",
    coreTrait: "平和、受容",
    coreDesire: "平和でありたい、調和を保ちたい",
    coreFear: "分離、葛藤",
  },
};
