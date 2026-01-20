/**
 * MBTI推定アルゴリズム
 *
 * ビッグファイブ性格特性からMBTI16タイプを推定する
 *
 * 学術的根拠:
 * McCrae, R. R., & Costa, P. T. (1989). Reinterpreting the Myers-Briggs Type Indicator
 * from the perspective of the five-factor model of personality.
 * Journal of Personality, 57(1), 17-40.
 *
 * 相関係数:
 * - E/I ← Extraversion (r = -0.74) - 高信頼性
 * - S/N ← Openness (r = 0.72) - 高信頼性
 * - T/F ← Agreeableness (r = 0.44) - 中程度
 * - J/P ← Conscientiousness (r = 0.49) - 中程度
 */

import type { MBTIEstimation } from "./bigfive";

/**
 * ビッグファイブスコアからMBTIタイプを推定
 * @param domainScores 5次元スコア (24-120 range)
 * @returns MBTI推定結果
 */
export function estimateMBTI(domainScores: {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}): MBTIEstimation {
  // E/I軸: 外向性から推定 (r = -0.74) - 高信頼性
  // 外向性が高い → E (Extraverted)
  // 外向性が低い → I (Introverted)
  const E_normalized = (domainScores.extraversion - 24) / 96; // 0-1スケール
  const EI_score = E_normalized * 100; // 0-100スケール
  const EI_pref = EI_score > 50 ? 'E' : 'I';
  const EI_confidence = Math.abs(EI_score - 50) / 50; // 0-1 (0.5からの距離を正規化)

  // S/N軸: 開放性から推定 (r = 0.72) - 高信頼性
  // 開放性が高い → N (Intuitive)
  // 開放性が低い → S (Sensing)
  const O_normalized = (domainScores.openness - 24) / 96;
  const SN_score = O_normalized * 100;
  const SN_pref = SN_score > 50 ? 'N' : 'S';
  const SN_confidence = Math.abs(SN_score - 50) / 50;

  // T/F軸: 協調性から推定 (r = 0.44) - 中程度
  // 協調性が高い → F (Feeling)
  // 協調性が低い → T (Thinking)
  const A_normalized = (domainScores.agreeableness - 24) / 96;
  const TF_score = A_normalized * 100;
  const TF_pref = TF_score > 50 ? 'F' : 'T';
  const TF_confidence = Math.abs(TF_score - 50) / 50;

  // J/P軸: 誠実性から推定 (r = 0.49) - 中程度
  // 誠実性が高い → J (Judging)
  // 誠実性が低い → P (Perceiving)
  const C_normalized = (domainScores.conscientiousness - 24) / 96;
  const JP_score = C_normalized * 100;
  const JP_pref = JP_score > 50 ? 'J' : 'P';
  const JP_confidence = Math.abs(JP_score - 50) / 50;

  // 全体的な信頼度 (4軸の平均)
  const avgConfidence = (EI_confidence + SN_confidence + TF_confidence + JP_confidence) / 4;
  const overallConfidence: 'high' | 'medium' | 'low' =
    avgConfidence > 0.6 ? 'high' :
    avgConfidence > 0.3 ? 'medium' : 'low';

  // 4文字タイプを生成
  const type = `${EI_pref}${SN_pref}${TF_pref}${JP_pref}`;

  return {
    type,
    axes: {
      EI: {
        score: EI_score,
        preference: EI_pref,
        confidence: EI_confidence,
      },
      SN: {
        score: SN_score,
        preference: SN_pref,
        confidence: SN_confidence,
      },
      TF: {
        score: TF_score,
        preference: TF_pref,
        confidence: TF_confidence,
      },
      JP: {
        score: JP_score,
        preference: JP_pref,
        confidence: JP_confidence,
      },
    },
    overallConfidence,
    academicReference:
      "McCrae, R. R., & Costa, P. T. (1989). Reinterpreting the Myers-Briggs Type Indicator from the perspective of the five-factor model of personality. Journal of Personality, 57(1), 17-40.",
    disclaimer: `この診断は公式のMBTI®検査ではありません。MBTI®はThe Myers-Briggs Companyの登録商標です。本サイトは同社と一切の関係がなく、本診断結果はビッグファイブ性格特性との学術的相関に基づく推定です。公式のMBTI®検査を受けたい場合は、認定コンサルタントにご相談ください。`,
  };
}

/**
 * MBTI16タイプの日本語説明
 */
export const mbtiTypeDescriptions: Record<string, { name: string; description: string }> = {
  INTJ: {
    name: "建築家",
    description: "戦略的思考と独立心を持つ完璧主義者",
  },
  INTP: {
    name: "論理学者",
    description: "革新的な発明家で、知識への飽くなき探求心を持つ",
  },
  ENTJ: {
    name: "指揮官",
    description: "大胆で想像力豊かで、強い意志を持つリーダー",
  },
  ENTP: {
    name: "討論者",
    description: "賢く好奇心旺盛な思想家で、知的挑戦を求める",
  },
  INFJ: {
    name: "提唱者",
    description: "静かで神秘的だが、人々を鼓舞する理想主義者",
  },
  INFP: {
    name: "仲介者",
    description: "詩的で親切で利他的な、常に大義を助ける準備ができている",
  },
  ENFJ: {
    name: "主人公",
    description: "カリスマ性があり、人々を鼓舞するリーダー",
  },
  ENFP: {
    name: "広報運動家",
    description: "熱心で創造的で社交的な自由奔放な精神",
  },
  ISTJ: {
    name: "管理者",
    description: "実用的で事実重視の個人で、信頼性が何よりも重要",
  },
  ISFJ: {
    name: "擁護者",
    description: "非常に献身的で温かい守護者で、愛する人を守る準備ができている",
  },
  ESTJ: {
    name: "幹部",
    description: "優れた管理者で、物事や人々を管理することに比類のない能力を持つ",
  },
  ESFJ: {
    name: "領事",
    description: "非常に思いやりがあり、社交的で人気があり、常に人助けをしている",
  },
  ISTP: {
    name: "巨匠",
    description: "大胆で実践的な実験者で、あらゆる種類の道具を使いこなす",
  },
  ISFP: {
    name: "冒険家",
    description: "柔軟で魅力的な芸術家で、常に新しいことを探求する準備ができている",
  },
  ESTP: {
    name: "起業家",
    description: "賢く、エネルギッシュで、非常に知覚的な人で、リスクの瀬戸際で生活することを楽しむ",
  },
  ESFP: {
    name: "エンターテイナー",
    description: "自発的でエネルギッシュで熱狂的なエンターテイナーで、周りに退屈な瞬間はない",
  },
};

/**
 * 信頼度レベルの日本語説明
 */
export const confidenceLevelDescriptions = {
  high: {
    label: "高信頼度",
    description: "推定結果は学術的相関に基づき信頼性が高いです",
    color: "green",
  },
  medium: {
    label: "中信頼度",
    description: "推定結果は参考程度にご活用ください",
    color: "yellow",
  },
  low: {
    label: "低信頼度",
    description: "推定結果は参考情報としてご利用ください",
    color: "orange",
  },
};
