import type { BaseQuestion, ScaleInfo, ScaleOption } from "@/lib/tests/types";

/**
 * K6 (Kessler Psychological Distress Scale) Questions
 *
 * 過去30日間の心理的苦痛を測定する6項目の尺度
 *
 * @reference Kessler, R. C., et al. (2002). Short screening scales to monitor population
 *            prevalences and trends in non-specific psychological distress.
 *            Psychological Medicine, 32(6), 959-976.
 *
 * @reference 古川壽亮, 川上憲人, 斎藤正彰, 他 (2008). 国際的精神保健調査における
 *            日本版K6およびK10のパフォーマンス. International Journal of Methods
 *            in Psychiatric Research, 17(3), 152-158.
 *
 * @copyright Copyright © Ronald C. Kessler, PhD. All rights reserved.
 * @license Copyright-free for non-commercial use. Attribution required.
 */

export interface K6Question extends BaseQuestion {
  domain?: string;
}

export const questions: K6Question[] = [
  {
    id: 1,
    text: "神経過敏に感じましたか",
    reverse: false,
    domain: "anxiety"
  },
  {
    id: 2,
    text: "絶望的だと感じましたか",
    reverse: false,
    domain: "depression"
  },
  {
    id: 3,
    text: "そわそわ、落ち着かなく感じましたか",
    reverse: false,
    domain: "anxiety"
  },
  {
    id: 4,
    text: "気分が沈み込んで、何が起こっても気が晴れないように感じましたか",
    reverse: false,
    domain: "depression"
  },
  {
    id: 5,
    text: "何をするのも骨折りだと感じましたか",
    reverse: false,
    domain: "fatigue"
  },
  {
    id: 6,
    text: "自分は価値のない人間だと感じましたか",
    reverse: false,
    domain: "self-worth"
  }
];

/**
 * 5点リッカート尺度（0-4点、疫学調査標準）
 */
export const scaleOptions: ScaleOption[] = [
  { label: "まったくない", value: 0 },
  { label: "少しだけ", value: 1 },
  { label: "ときどき", value: 2 },
  { label: "たいてい", value: 3 },
  { label: "いつも", value: 4 },
];

export const instructionText = "過去30日の間に、どれくらいの頻度で次のことがありましたか。";

export const scaleInfo: ScaleInfo = {
  name: "Kessler Psychological Distress Scale",
  nameJa: "心理的苦痛スクリーニング",
  abbreviation: "K6",
  category: "メンタルヘルス",
  psychologicalLayer: "state",
  description:
    "過去30日間の心理的苦痛の程度を測定する6項目の国際標準スクリーニングツールです。うつ病や不安障害などの精神疾患を早期に発見するためのスクリーニングを行います。",
  developer: "Kessler, R. C., et al. (2002)",
  reliability: {
    cronbachAlpha: "0.89",
    testRetest: "0.83",
  },
  citations: "数百+",
  tier: "A",
  academicReference: {
    original:
      "Kessler, R. C., et al. (2002). Short screening scales to monitor population prevalences and trends in non-specific psychological distress. Psychological Medicine, 32(6), 959-976.",
    japanese:
      "古川壽亮, 川上憲人, 他 (2008). 国際的精神保健調査における日本版K6およびK10のパフォーマンス. International Journal of Methods in Psychiatric Research, 17(3), 152-158.",
  },
  scoring: {
    min: 0,
    max: 24,
    neutral: 13,
    description:
      "6項目、5点尺度（0-4点）。逆転項目なし。高得点ほど心理的苦痛が大きい。13点以上で精神疾患の可能性が高い（特異度96%）。",
  },
  stats: {
    questions: 6,
    minutes: 2,
  },
};
