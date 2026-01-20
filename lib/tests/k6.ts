/**
 * K6 (Kessler Psychological Distress Scale) - Scoring & Configuration
 *
 * Kessler Psychological Distress Scale (K6) の採点とレベル判定
 *
 * スコア範囲: 0-24点
 * - 0-4点: 問題なし (No distress)
 * - 5-9点: 軽度の心理的苦痛 (Mild distress)
 * - 10-12点: 中等度の心理的苦痛 (Moderate distress)
 * - 13-24点: 重度の心理的苦痛 (Severe distress)
 *
 * @reference Kessler, R. C., et al. (2002). Short screening scales to monitor population
 *            prevalences and trends in non-specific psychological distress.
 *            Psychological Medicine, 32(6), 959-976.
 */

import { questions, scaleOptions, scaleInfo, instructionText } from "@/data/k6-questions";
import type { TestConfig } from "./types";
import type { DimensionData } from "@/lib/og-design/types";
import { TEST_COLOR_MAP } from "@/lib/og-design/constants";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type K6Level = "none" | "mild" | "moderate" | "severe";

export interface K6Result {
  answers: number[];
  rawScore: number;
  level: K6Level;
  levelLabel: string;
  // NOTE: interpretation は保存せず、表示時に getInterpretation() で動的生成
  requiresUrgentCare: boolean;
  timestamp: string;
}

// ============================================================================
// Scoring Logic
// ============================================================================

/**
 * K6のスコアを計算
 * 全項目を単純加算（逆転項目なし）
 */
export function calculateK6Score(answers: number[]): number {
  if (answers.length !== 6) {
    throw new Error("K6 requires exactly 6 answers");
  }

  if (answers.some((a) => a < 0 || a > 4)) {
    throw new Error("K6 answers must be between 0 and 4");
  }

  // 全項目を単純加算（逆転項目なし）
  return answers.reduce((sum, answer) => sum + answer, 0);
}

/**
 * スコアからレベルを判定
 */
export function getK6Level(score: number): K6Level {
  if (score >= 0 && score <= 4) return "none";
  if (score >= 5 && score <= 9) return "mild";
  if (score >= 10 && score <= 12) return "moderate";
  if (score >= 13 && score <= 24) return "severe";

  throw new Error(`Invalid K6 score: ${score}`);
}

/**
 * レベルに対応する日本語ラベルを取得
 */
export function getK6LevelLabel(level: K6Level): string {
  const labels: Record<K6Level, string> = {
    none: "問題なし",
    mild: "軽度の心理的苦痛",
    moderate: "中等度の心理的苦痛",
    severe: "重度の心理的苦痛"
  };

  return labels[level];
}

/**
 * レベルに対応する解釈を取得
 * 表示時に動的生成するため、localStorage に保存しない
 */
export function getInterpretation(level: K6Level): string {
  return getK6Interpretation(level);
}

/**
 * レベルに対応する解釈を取得（内部用）
 * @deprecated 外部からは getInterpretation() を使用してください
 */
function getK6Interpretation(level: K6Level): string {
  const interpretations: Record<K6Level, string> = {
    none: `心理的苦痛は最小限の状態です。日本の国民生活基礎調査によると、70.9%の人がこの範囲に該当し、精神疾患を有する可能性は極めて低い健康的な状態です。過去30日間において、神経過敏さ、絶望感、落ち着かなさ、気分の落ち込み、疲労感、無価値感などの症状はほとんど経験しておらず、日常的なストレスに対して適切な対処能力を維持しています。

現在のセルフケアとライフスタイルを継続してください。社会的サポート（友人、家族、メンターからのサポート）は最も強力な保護因子です。定期的な運動習慣（週3回、30分程度）も心理的健康の維持に重要です。

3-6ヶ月ごとにK6を再測定し、心理状態の変化をモニタリングすることをお勧めします。`,

    mild: `軽度の心理的苦痛が見られます。過去30日間において、時折、神経過敏さや落ち着きのなさ、気分の落ち込みなどの症状を経験しています。日本の国民生活基礎調査では、軽度〜中等度の心理的苦痛を抱える人のうち、実際に治療を受けているのはわずか5.4%であり、多くの人が適切なサポートを受けていない状況です。

早めのセルフケア強化とストレス管理により、悪化を防ぐことができます。研究によると、社会的サポート（友人、家族、メンターからのサポート）は心理的苦痛を軽減する最も強力な保護因子です。定期的な運動、睡眠の質改善、ストレス源の特定と軽減が効果的です。

1-2ヶ月後に再テストし、改善が見られない場合は専門家への相談を検討してください。`,

    moderate: `中等度の心理的苦痛が見られます。過去30日間において、かなりの頻度で神経過敏さ、絶望感、落ち着かなさ、気分の落ち込み、疲労感、無価値感などの症状を経験しています。研究によると、このスコア範囲では仕事、家事、社会生活、家族関係の全領域に機能障害の影響が見られます。

この水準は、国民生活基礎調査において「要注意」とされる範囲です。認知行動療法(CBT)は40-60%の成功率を示しており、治療を受けた場合、2ヶ月時点で41%が反応します（通常ケア17%と比較）。治療により悪化率が12-13%から5%に半減することが実証されています。

専門家（精神科、心療内科、カウンセラー）への相談を強く推奨します。休息と娯楽を優先し、仕事・学業の負担軽減を検討してください。2週間後に再テストし、改善がなければ速やかに専門家を受診してください。`,

    severe: `重度の心理的苦痛が見られます。日本の国民生活基礎調査では、約8.5%の人がこのスコア範囲に該当します。このスコアは、DSM-IV診断基準を満たす精神疾患の可能性が非常に高いことを示しています（特異度96%、総合精度92%）。

日常生活に明確な支障が出ており、専門家による評価と治療が必要な状態です。速やかに精神科医、心療内科医、または心理士などの専門家を受診してください。適切な治療により大幅な改善が期待できます。

治療効果のエビデンス：
- 治療効果量: うつ病 d=0.96、不安障害 d=0.80（非常に大きな効果）
- 薬物療法: 2-4週間で効果が現れ始めます
- 改善タイムライン: 最初の6ヶ月で最も大きな症状の減少

⚠️ 緊急連絡先:
- こころの健康相談統一ダイヤル: 0570-064-556
- いのちの電話: 0570-783-556（24時間）
- よりそいホットライン: 0120-279-338（24時間）
- 救急: 119番（緊急時）`
  };

  return interpretations[level];
}

/**
 * K6の完全な結果を生成
 */
export function getK6Result(answers: number[]): K6Result {
  const rawScore = calculateK6Score(answers);
  const level = getK6Level(rawScore);
  const levelLabel = getK6LevelLabel(level);

  // スコア13点以上は専門家への受診を強く推奨
  const requiresUrgentCare = rawScore >= 13;

  return {
    answers,
    rawScore,
    level,
    levelLabel,
    requiresUrgentCare,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// Test Configuration
// ============================================================================

/**
 * K6 (Kessler Psychological Distress Scale) テスト設定
 */
export const k6Config: TestConfig<K6Result> = {
  id: "k6",
  color: "cyan",
  basePath: "/k6",
  questions,
  scaleOptions,
  calculateScore: getK6Result,
  scaleInfo,
  headerInstruction: instructionText,

  // 結果ページ設定
  scoreDisplay: {
    type: "progress",
    maxScore: 24,
  },
  resultAlerts: [
    {
      type: "urgent",
      condition: (result: K6Result) => result.rawScore >= 13,
      title: "専門家への相談を推奨します",
      message:
        "あなたのスコアは13点以上です。重度の心理的苦痛が示唆されています。精神科医または心療内科医への受診をご検討ください。",
    },
  ],
  resultExtensions: {
    shareButtons: true,
    treatmentEvidence: true,
  },

  // OG画像設定
  ogImage: {
    layoutType: "single",
    titleEn: "K6",
    category: "心理的苦痛評価",
    description: "厚生労働省も採用する\n心理的ストレス測定",
    scoreDisplay: { type: "raw", min: 0, max: 24, unit: "" },
    scoreToParams: (result: K6Result) => ({
      score: (result?.rawScore ?? 7).toString(),
    }),
    paramsToScore: (params: URLSearchParams) => ({
      score: parseInt(params.get("score") || "7"),
    }),
  },

  // 🆕 NEW: 1次元データ生成（レベルベースの色付き）
  getDimensions: (result: K6Result): DimensionData[] => {
    const min = 0;
    const max = 24;
    const rawScore = result?.rawScore ?? 7;
    const percentage = ((rawScore - min) / (max - min)) * 100;

    // スコアに応じた色を決定
    let color: string;
    if (rawScore >= 13) {
      color = '#f97316'; // orange (severe)
    } else if (rawScore >= 10) {
      color = '#ec4899'; // pink (moderate)
    } else if (rawScore >= 5) {
      color = '#3b82f6'; // blue (mild)
    } else {
      color = '#10b981'; // green (no distress)
    }

    return [{
      key: 'score',
      label: 'Total Score',
      score: rawScore,
      percentage: percentage,
      color: color,
    }];
  },
};
