/**
 * Mini-IPIP (Big Five Short Form)
 *
 * Public Domain
 * Donnellan, M. B., Oswald, F. L., Baird, B. M., & Lucas, R. E. (2006).
 * The Mini-IPIP scales: tiny-yet-effective measures of the Big Five factors of personality.
 * Psychological Assessment, 18(2), 192-203.
 *
 * 20項目、5点リッカート尺度
 * 5次元: 外向性、協調性、誠実性、神経症傾向、開放性
 *
 * 日本語版: 小塩真司・阿部晋吾・カトローニ ピノ (2012)
 * 日本語版Ten Item Personality Inventory（TIPI-J）作成の試み
 * パーソナリティ研究, 21(1), 40-52.
 */

import type { ScaleInfo } from "@/lib/tests/types";

export interface BigFiveQuestion {
  id: number;
  text: string;
  dimension: "extraversion" | "agreeableness" | "conscientiousness" | "neuroticism" | "openness";
  reverse: boolean;
}

/**
 * 5点リッカート尺度
 */
export const scaleLabels = [
  "全く当てはまらない",
  "あまり当てはまらない",
  "どちらとも言えない",
  "やや当てはまる",
  "非常に当てはまる",
];

/**
 * Mini-IPIPの質問（20項目）
 */
export const bigFiveQuestions: BigFiveQuestion[] = [
  // Extraversion (外向性)
  {
    id: 1,
    text: "パーティーの中心人物である",
    dimension: "extraversion",
    reverse: false,
  },
  {
    id: 2,
    text: "あまり話さない",
    dimension: "extraversion",
    reverse: true,
  },
  {
    id: 3,
    text: "他の人と一緒にいると元気になる",
    dimension: "extraversion",
    reverse: false,
  },
  {
    id: 4,
    text: "目立たないようにしている",
    dimension: "extraversion",
    reverse: true,
  },

  // Agreeableness (協調性)
  {
    id: 5,
    text: "人に対して思いやりがある",
    dimension: "agreeableness",
    reverse: false,
  },
  {
    id: 6,
    text: "他人に興味がない",
    dimension: "agreeableness",
    reverse: true,
  },
  {
    id: 7,
    text: "人の気持ちを理解しようとする",
    dimension: "agreeableness",
    reverse: false,
  },
  {
    id: 8,
    text: "人を侮辱することがある",
    dimension: "agreeableness",
    reverse: true,
  },

  // Conscientiousness (誠実性)
  {
    id: 9,
    text: "物事をやり遂げる",
    dimension: "conscientiousness",
    reverse: false,
  },
  {
    id: 10,
    text: "物事を中途半端にしがちだ",
    dimension: "conscientiousness",
    reverse: true,
  },
  {
    id: 11,
    text: "仕事を正確にこなす",
    dimension: "conscientiousness",
    reverse: false,
  },
  {
    id: 12,
    text: "自分の義務を怠ることがある",
    dimension: "conscientiousness",
    reverse: true,
  },

  // Neuroticism (神経症傾向)
  {
    id: 13,
    text: "よく落ち込む",
    dimension: "neuroticism",
    reverse: false,
  },
  {
    id: 14,
    text: "あまり動揺しない",
    dimension: "neuroticism",
    reverse: true,
  },
  {
    id: 15,
    text: "気分が変わりやすい",
    dimension: "neuroticism",
    reverse: false,
  },
  {
    id: 16,
    text: "感情的に安定している",
    dimension: "neuroticism",
    reverse: true,
  },

  // Openness (開放性)
  {
    id: 17,
    text: "想像力が豊かである",
    dimension: "openness",
    reverse: false,
  },
  {
    id: 18,
    text: "芸術にあまり興味がない",
    dimension: "openness",
    reverse: true,
  },
  {
    id: 19,
    text: "新しいアイデアを好む",
    dimension: "openness",
    reverse: false,
  },
  {
    id: 20,
    text: "抽象的な考えが苦手だ",
    dimension: "openness",
    reverse: true,
  },
];

/**
 * 尺度情報
 */
export const scaleInfo: ScaleInfo = {
  name: "Mini-IPIP (Big Five)",
  nameJa: "ビッグファイブ性格特性",
  abbreviation: "Mini-IPIP",
  dimension: "性格特性",
  description:
    "外向性、協調性、誠実性、神経症傾向、開放性の5次元から性格を測定する、最も信頼性の高い性格理論に基づく尺度です。",
  developer: "Donnellan et al. (2006)",
  reliability: {
    cronbachAlpha: "0.68-0.76",
    testRetest: "r = 0.72-0.82",
  },
  citations: "10,000+",
  tier: "S (Gold Standard)",
  academicReference: {
    original:
      "Donnellan, M. B., Oswald, F. L., Baird, B. M., & Lucas, R. E. (2006). The Mini-IPIP scales: tiny-yet-effective measures of the Big Five factors of personality. Psychological Assessment, 18(2), 192-203.",
    japanese:
      "小塩真司・阿部晋吾・カトローニ ピノ (2012). 日本語版Ten Item Personality Inventory（TIPI-J）作成の試み. パーソナリティ研究, 21(1), 40-52.",
  },
  scoring: {
    min: 4,
    max: 20,
    neutral: 12,
    description: "各次元4-20点の範囲。次元ごとに高得点の意味が異なる。",
  },
  stats: {
    questions: 20,
    minutes: 3,
  },
};
