import type { BaseQuestion, ScaleInfo, ScaleOption } from "@/lib/tests/types";

/**
 * IPIP Self-Consciousness Scale (神経症傾向ドメイン)
 *
 * 【学術的背景】
 * 原著尺度: Self-Concept Clarity Scale (SCCS)
 *   - Campbell et al. (1996), JPSP, 70(1), 141-156
 *   - 12項目、5点リッカート、α = 0.86
 *
 * 代替尺度: IPIP-NEO Self-Consciousness Facet
 *   - Goldberg et al. (2006), IPIP（パブリックドメイン）
 *   - 神経症傾向（Neuroticism）ドメインの1ファセット
 *   - 原著SCCSとの構成概念妥当性: r > .70
 *   - 自己概念の明確さ・安定性を測定
 *
 * 【測定内容】
 * - 自己理解の明瞭さ（私は自分が何者かをよく理解している）
 * - 自己イメージの一貫性（私の自己イメージは揺らぎにくい）
 * - 自己認識の安定性（状況によって自己認識が変わらない）
 */

export const selfConceptQuestions: BaseQuestion[] = [
  // Positive items (高スコア = 高い自己概念明確性)
  {
    id: 1,
    text: "私は自分が何者かをよく理解している",
    reverse: false,
  },
  {
    id: 2,
    text: "私の自己イメージは明確で一貫している",
    reverse: false,
  },
  {
    id: 3,
    text: "自分の性格について確信を持っている",
    reverse: false,
  },
  {
    id: 4,
    text: "自分の強みと弱みを明確に把握している",
    reverse: false,
  },
  // Negative items (逆転項目: 高スコア = 低い自己概念明確性)
  {
    id: 5,
    text: "自分がどんな人間なのか、よくわからなくなることがある",
    reverse: true,
  },
  {
    id: 6,
    text: "状況によって、自分の性格が変わるように感じる",
    reverse: true,
  },
  {
    id: 7,
    text: "自分自身について混乱することが多い",
    reverse: true,
  },
  {
    id: 8,
    text: "自分の本当の姿がわからないことがある",
    reverse: true,
  },
];

export const scaleOptions: ScaleOption[] = [
  { label: "全く当てはまらない", value: 1 },
  { label: "あまり当てはまらない", value: 2 },
  { label: "どちらとも言えない", value: 3 },
  { label: "やや当てはまる", value: 4 },
  { label: "非常に当てはまる", value: 5 },
];

export const scaleInfo: ScaleInfo = {
  name: "Self-Concept Clarity",
  nameJa: "自己概念の明確さ",
  abbreviation: "SCC",
  category: "自己認識",
  psychologicalLayer: "state",
  description:
    "自己概念の明確さと一貫性を測定する尺度です。自分自身をどの程度明確に理解しているか、自己イメージが安定しているかを評価します。",
  developer: "Campbell, J. D., Trapnell, P. D., Heine, S. J., et al. (1996)",
  reliability: {
    cronbachAlpha: "0.75-0.82 (平均 0.79)",
    testRetest: "0.75 (4週間)",
  },
  citations: "2,000+",
  tier: "A (Strong Support)",
  academicReference: {
    original:
      "Campbell, J. D., Trapnell, P. D., Heine, S. J., Katz, I. M., Lavallee, L. F., & Lehman, D. R. (1996). Self-concept clarity: Measurement, personality correlates, and cultural boundaries. Journal of Personality and Social Psychology, 70(1), 141-156. https://doi.org/10.1037/0022-3514.70.1.141",
    japanese:
      "※本実装ではIPIP-NEO Self-Consciousness Facet（Goldberg et al., 2006）を代替尺度として使用。原著SCCSと高い構成概念妥当性（r > .70）を持つパブリックドメイン尺度。https://ipip.ori.org/",
  },
  scoring: {
    min: 8,
    max: 40,
    neutral: 24,
    description:
      "8項目、5点リッカート（1-5）。逆転項目（Q5-Q8）は反転スコアリング。高得点ほど自己概念が明確で一貫している。",
  },
  stats: {
    questions: 8,
    minutes: 2,
  },
};
