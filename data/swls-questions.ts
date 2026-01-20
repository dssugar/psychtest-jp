import type { BaseQuestion, ScaleInfo, ScaleOption } from "@/lib/tests/types";

/**
 * SWLS (Satisfaction With Life Scale)
 * 日本語名: 人生満足度尺度
 *
 * 【学術的背景】
 * 原著論文: Diener, E., Emmons, R.A., Larsen, R.J., & Griffin, S. (1985).
 *   The Satisfaction with Life Scale.
 *   Journal of Personality Assessment, 49(1), 71-75.
 *   https://doi.org/10.1207/s15327752jpa4901_13
 *
 * 【信頼性・妥当性】
 * - Cronbach's α = 0.87 (原著), 0.78-0.91 (各国研究)
 * - Test-retest reliability: r = 0.82-0.84 (2ヶ月)
 * - 引用数: 40,000+ (Google Scholar)
 * - Tier S (Gold Standard)
 *
 * 【日本語版】
 * 角野善司（1994）. 人生に対する満足尺度（SWLS）日本版作成の試み.
 *   日本教育心理学会第36回総会発表論文集, 192.
 * 前野研究室版（慶應義塾大学）: 1,500人調査で使用実績あり
 *
 * 【測定内容】
 * 人生全体に対する認知的満足度を評価:
 * 1. 理想との近さ
 * 2. 人生の素晴らしさ
 * 3. 現在の満足度
 * 4. 欲しいものの獲得
 * 5. やり直しの意思
 *
 * 【スコアリング】
 * - 各項目 1-7点、合計 5-35点
 * - 5-9: 極めて不満足
 * - 10-14: 不満足
 * - 15-19: やや不満足
 * - 20-24: 中程度（日本平均: 18.9点）
 * - 25-29: やや満足
 * - 30-34: 満足
 * - 35: 極めて満足
 *
 * 【ライセンス】
 * Public Domain（パブリックドメイン）- 完全無料で使用可能
 *
 * 【重要な注意】
 * - これは臨床尺度ではなく、ウェルビーイング（幸福）を測定する尺度です
 * - 低スコア = 病気ではありません
 * - 文化差があり、日本人の平均（18.9点）は米国（23.5点）より低い傾向
 */

export const swlsQuestions: BaseQuestion[] = [
  {
    id: 1,
    text: "ほとんどの点で、私の人生は私の理想に近い",
    reverse: false,
  },
  {
    id: 2,
    text: "私の人生は、とても素晴らしい時間だ",
    reverse: false,
  },
  {
    id: 3,
    text: "私は現在の人生に満足している",
    reverse: false,
  },
  {
    id: 4,
    text: "私はこれまで、人生で欲しかった大切なものを得ている",
    reverse: false,
  },
  {
    id: 5,
    text: "もし人生をやり直せるなら、ほとんど何も変わらないだろう",
    reverse: false,
  },
];

export const scaleOptions: ScaleOption[] = [
  { label: "全く当てはまらない", value: 1 },
  { label: "ほとんど当てはまらない", value: 2 },
  { label: "やや当てはまらない", value: 3 },
  { label: "どちらとも言えない", value: 4 },
  { label: "当てはまる", value: 5 },
  { label: "かなり当てはまる", value: 6 },
  { label: "とても当てはまる", value: 7 },
];

export const scaleInfo: ScaleInfo = {
  name: "Satisfaction With Life Scale",
  nameJa: "人生満足度尺度",
  abbreviation: "SWLS",
  category: "ウェルビーイング",
  psychologicalLayer: "outcome",
  description:
    "人生全体に対する認知的満足度を測定する世界標準の尺度です。5項目の質問で、あなたが自分の人生にどの程度満足しているかを評価します。40,000以上の研究で使用されている信頼性の高い尺度です。",
  developer: "Diener, E., Emmons, R.A., Larsen, R.J., & Griffin, S. (1985)",
  reliability: {
    cronbachAlpha: "0.87 (原著), 0.78-0.91 (各国研究)",
    testRetest: "0.82-0.84 (2ヶ月)",
  },
  citations: "40,000+",
  tier: "S (Gold Standard)",
  academicReference: {
    original:
      "Diener, E., Emmons, R.A., Larsen, R.J., & Griffin, S. (1985). The Satisfaction with Life Scale. Journal of Personality Assessment, 49(1), 71-75. https://doi.org/10.1207/s15327752jpa4901_13",
    japanese:
      "角野善司（1994）. 人生に対する満足尺度（SWLS）日本版作成の試み. 日本教育心理学会第36回総会発表論文集, 192. | 前野研究室（慶應義塾大学）: n=1,500, 平均=18.9点",
  },
  scoring: {
    min: 5,
    max: 35,
    neutral: 20, // 中立点
    description:
      "5項目、7点尺度（1-7点）。逆転項目なし。高得点ほど人生満足度が高い。日本人平均: 18.9点、米国平均: 23.5点。",
  },
  stats: {
    questions: 5,
    minutes: 1,
  },
};

/**
 * スコア区分（7段階）
 *
 * 学術的根拠:
 * Diener et al. (1985) の原著論文に基づく標準的な区分
 * Pavot & Diener (1993, 2008) による解釈ガイドライン
 *
 * 区分:
 * - 極めて不満足: 5-9点 (Extremely Dissatisfied)
 * - 不満足: 10-14点 (Dissatisfied)
 * - やや不満足: 15-19点 (Slightly Dissatisfied)
 * - 中立: 20点 (Neutral)
 * - やや満足: 21-25点 (Slightly Satisfied)
 * - 満足: 26-30点 (Satisfied)
 * - 極めて満足: 31-35点 (Extremely Satisfied)
 */
export const scoreRanges = [
  {
    min: 5,
    max: 9,
    level: "extremely_dissatisfied" as const,
    label: "極めて不満足",
    labelEn: "Extremely Dissatisfied",
    description: "人生に対して極めて強い不満を感じています。",
  },
  {
    min: 10,
    max: 14,
    level: "dissatisfied" as const,
    label: "不満足",
    labelEn: "Dissatisfied",
    description: "人生に対して不満を感じています。",
  },
  {
    min: 15,
    max: 19,
    level: "slightly_dissatisfied" as const,
    label: "やや不満足",
    labelEn: "Slightly Dissatisfied",
    description: "人生に対してやや不満を感じています。",
  },
  {
    min: 20,
    max: 20,
    level: "neutral" as const,
    label: "中立",
    labelEn: "Neutral",
    description: "人生に対して中立的な評価です。",
  },
  {
    min: 21,
    max: 25,
    level: "slightly_satisfied" as const,
    label: "やや満足",
    labelEn: "Slightly Satisfied",
    description: "人生に対してやや満足しています。",
  },
  {
    min: 26,
    max: 30,
    level: "satisfied" as const,
    label: "満足",
    labelEn: "Satisfied",
    description: "人生に対して満足しています。",
  },
  {
    min: 31,
    max: 35,
    level: "extremely_satisfied" as const,
    label: "極めて満足",
    labelEn: "Extremely Satisfied",
    description: "人生に対して極めて高い満足を感じています。",
  },
] as const;
