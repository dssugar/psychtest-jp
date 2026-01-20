import type { BaseQuestion, ScaleInfo, ScaleOption } from "@/lib/tests/types";

/**
 * PHQ-9 (Patient Health Questionnaire-9)
 * 日本語名: こころとからだの質問票
 *
 * 【学術的背景】
 * 原著論文: Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001).
 *   The PHQ-9: validity of a brief depression severity measure.
 *   Journal of General Internal Medicine, 16(9), 606-613.
 *   https://doi.org/10.1046/j.1525-1497.2001.016009606.x
 *
 * 【信頼性・妥当性】
 * - Cronbach's α = 0.86-0.89 (Meta-analysis: α = 0.86, 95% CI [0.85, 0.87])
 * - Test-retest reliability: r = 0.82-0.84
 * - Sensitivity: 88%, Specificity: 88% (cutoff ≥ 10)
 * - 引用数: 20,000+ (Google Scholar)
 * - Tier S (Gold Standard)
 *
 * 【日本語版】
 * Muramatsu, K., Miyaoka, H., Kamijima, K., et al. (2007, 2018)
 * - Sensitivity: 84%, Specificity: 95%
 * - 日本語版でも優れた信頼性・妥当性が確認されている
 *
 * 【測定内容】
 * DSM-IVに基づくうつ病の9症状を評価:
 * 1. 興味・喜びの喪失
 * 2. 抑うつ気分
 * 3. 睡眠障害
 * 4. 疲労感・気力の減退
 * 5. 食欲の変化
 * 6. 罪悪感・無価値感
 * 7. 集中力の低下
 * 8. 精神運動の変化
 * 9. 自殺念慮
 *
 * 【スコアリング】
 * - 各項目 0-3点、合計 0-27点
 * - 0-4: Minimal (正常)
 * - 5-9: Mild (軽度)
 * - 10-14: Moderate (中等度) ※専門家への相談推奨
 * - 15-19: Moderately Severe (やや重度) ※速やかに受診
 * - 20-27: Severe (重度) ※直ちに受診
 *
 * 【ライセンス】
 * Free to use (Pfizer-provided, no permission needed for non-commercial use)
 *
 * 【重要な注意】
 * - 医療診断ではなく、スクリーニングツールです
 * - 項目9 (自殺念慮) が2点以上の場合、緊急リソースを表示
 * - スコア15点以上の場合、専門家への受診を強く推奨
 */

export const phq9Questions: BaseQuestion[] = [
  {
    id: 1,
    text: "物事に対してほとんど興味がない、または楽しめない",
    reverse: false,
  },
  {
    id: 2,
    text: "気分が落ち込む、憂うつになる、または絶望的な気持ちになる",
    reverse: false,
  },
  {
    id: 3,
    text: "寝つきが悪い、途中で目が覚める、または逆に眠りすぎる",
    reverse: false,
  },
  {
    id: 4,
    text: "疲れた感じがする、または気力がない",
    reverse: false,
  },
  {
    id: 5,
    text: "あまり食欲がない、または食べ過ぎる",
    reverse: false,
  },
  {
    id: 6,
    text: "自分を責める、または自分には価値がない、家族を失望させていると感じる",
    reverse: false,
  },
  {
    id: 7,
    text: "新聞を読む、またはテレビを見ることなどに集中することが難しい",
    reverse: false,
  },
  {
    id: 8,
    text: "他人が気づくほど動きや話し方が遅い、またはその反対にそわそわしたり落ち着かず、普段よりも動き回ることがある",
    reverse: false,
  },
  {
    id: 9,
    text: "死んだ方がましだ、または何らかの方法で自分を傷つけようと思ったことがある",
    reverse: false,
  },
];

/**
 * 4点リッカート尺度（0-3点、医学的定義）
 */
export const scaleOptions: ScaleOption[] = [
  { label: "全くない", value: 0 },
  { label: "数日", value: 1 },
  { label: "半分以上", value: 2 },
  { label: "ほとんど毎日", value: 3 },
];

export const scaleInfo: ScaleInfo = {
  name: "Patient Health Questionnaire-9",
  nameJa: "こころとからだの質問票",
  abbreviation: "PHQ-9",
  category: "メンタルヘルス",
  psychologicalLayer: "state",
  description:
    "うつ病の症状の有無と重症度を測定する国際標準のスクリーニングツールです。DSM-IVに基づく9つのうつ病症状を評価し、0-27点のスコアで重症度を示します。",
  developer: "Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001)",
  reliability: {
    cronbachAlpha: "0.86-0.89 (Meta-analysis: 0.86 [95% CI: 0.85-0.87])",
    testRetest: "0.82-0.84 (48時間)",
  },
  citations: "20,000+",
  tier: "S (Gold Standard)",
  academicReference: {
    original:
      "Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001). The PHQ-9: validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606-613. https://doi.org/10.1046/j.1525-1497.2001.016009606.x",
    japanese:
      "Muramatsu, K., Miyaoka, H., Kamijima, K., et al. (2018). Performance of the Japanese version of the Patient Health Questionnaire-9 (J-PHQ-9) for depression in primary care. General Hospital Psychiatry, 52, 64-69. (Sensitivity: 84%, Specificity: 95%)",
  },
  scoring: {
    min: 0,
    max: 27,
    neutral: 10, // カットオフ値
    description:
      "9項目、4点尺度（0-3点）。逆転項目なし。高得点ほど抑うつ症状が重い。10点以上で専門家への相談を推奨。",
  },
  stats: {
    questions: 9,
    minutes: 3,
  },
};
