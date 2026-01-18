/**
 * Self-Concept Clarity Scale (SCCS)
 * Campbell, J. D., et al. (1996)
 *
 * 12項目、5点リッカート尺度
 * 信頼性: Cronbach's α = 0.86
 * 再テスト信頼性: r = 0.79 (4ヶ月)
 *
 * 注意: 多くの項目が逆転項目（reverse scored）
 */

export interface Question {
  id: number;
  text: string;
  reverse: boolean; // 逆転項目かどうか
}

export const sccsQuestions: Question[] = [
  {
    id: 1,
    text: "自分自身についての考えは、しばしば互いに矛盾しています",
    reverse: true,
  },
  {
    id: 2,
    text: "ある日は自分について一つの見方を持ち、別の日には異なる見方を持つことがあります",
    reverse: true,
  },
  {
    id: 3,
    text: "自分がどんな人間なのか、私はかなり明確に理解しています",
    reverse: false,
  },
  {
    id: 4,
    text: "自分の性格について、確信を持って説明することができます",
    reverse: false,
  },
  {
    id: 5,
    text: "自分がどんなタイプの人間なのか理解するのに、多くの時間を費やしています",
    reverse: true,
  },
  {
    id: 6,
    text: "自分が本当はどんな人間なのか、よく分からないと感じます",
    reverse: true,
  },
  {
    id: 7,
    text: "自分の性格について、しばしば意見を変えることがあります",
    reverse: true,
  },
  {
    id: 8,
    text: "自分自身についての信念は、時間が経っても変わりません",
    reverse: false,
  },
  {
    id: 9,
    text: "自分が実際にどんな人間なのか、あまり分かっていないことがあります",
    reverse: true,
  },
  {
    id: 10,
    text: "自分の性格について、他の人に明確に説明するのは難しいです",
    reverse: true,
  },
  {
    id: 11,
    text: "自分自身について、よく理解しています",
    reverse: false,
  },
  {
    id: 12,
    text: "自分が本当に何を感じているのか、よく分からないことがあります",
    reverse: true,
  },
];

export const scaleLabels = [
  "全く当てはまらない",
  "あまり当てはまらない",
  "どちらとも言えない",
  "やや当てはまる",
  "非常に当てはまる",
];

export const scaleInfo = {
  name: "Self-Concept Clarity Scale",
  nameJa: "自己概念明確性尺度",
  shortName: "SCCS",
  authors: "Campbell et al. (1996)",
  citation: "Campbell, J. D., Trapnell, P. D., Heine, S. J., Katz, I. M., Lavallee, L. F., & Lehman, D. R. (1996). Self-concept clarity: Measurement, personality correlates, and cultural boundaries. Journal of Personality and Social Psychology, 70(1), 141-156.",
  reliability: "Cronbach's α = 0.86",
  testRetest: "r = 0.79 (4ヶ月)",
  citations: "2,000+",
  description: "自己概念の明確さと一貫性を測定する心理尺度。自分自身に対する理解がどれだけ明確で安定しているかを評価します。",
};
