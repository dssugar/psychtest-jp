/**
 * Rosenberg Self-Esteem Scale (RSES)
 *
 * Citation:
 * Rosenberg, M. (1965). Society and the adolescent self-image.
 * Princeton, NJ: Princeton University Press.
 *
 * Japanese version based on:
 * 山本真理子・松井豊・山成由紀子 (1982).
 * 認知された自己の諸側面の構造. 教育心理学研究, 30, 64-68.
 *
 * Reliability: Cronbach's α = 0.77-0.88
 * Test-retest: r = 0.82-0.85
 * Citations: 50,000+
 */

export interface RosenbergQuestion {
  id: number;
  text: string;
  reverse: boolean; // 逆転項目
}

/**
 * 4点リッカート尺度
 * 1: まったくそう思わない
 * 2: そう思わない
 * 3: そう思う
 * 4: 非常にそう思う
 */
export const scaleLabels = [
  "まったくそう思わない",
  "そう思わない",
  "そう思う",
  "非常にそう思う",
];

/**
 * Rosenberg自尊心尺度の質問（10項目）
 */
export const rosenbergQuestions: RosenbergQuestion[] = [
  {
    id: 1,
    text: "少なくとも人並みには、価値のある人間である。",
    reverse: false,
  },
  {
    id: 2,
    text: "いろいろな良い素質をもっている。",
    reverse: false,
  },
  {
    id: 3,
    text: "敗北者だと思うことがある。",
    reverse: true, // 逆転項目
  },
  {
    id: 4,
    text: "物事を人並みには、うまくやれる。",
    reverse: false,
  },
  {
    id: 5,
    text: "自分には、自慢できるところがあまりない。",
    reverse: true, // 逆転項目
  },
  {
    id: 6,
    text: "自分に対して肯定的である。",
    reverse: false,
  },
  {
    id: 7,
    text: "だいたいにおいて、自分に満足している。",
    reverse: false,
  },
  {
    id: 8,
    text: "もっと自分自身を尊敬できるようになりたい。",
    reverse: true, // 逆転項目
  },
  {
    id: 9,
    text: "自分は全くだめな人間だと思うことがある。",
    reverse: true, // 逆転項目
  },
  {
    id: 10,
    text: "何かにつけて、自分は役に立たない人間だと思う。",
    reverse: true, // 逆転項目
  },
];

/**
 * 尺度情報
 */
export const scaleInfo = {
  name: "Rosenberg Self-Esteem Scale",
  nameJa: "ローゼンバーグ自尊心尺度",
  abbreviation: "RSES",
  dimension: "自己認識",
  description: "自己に対する肯定的・否定的態度を測定する、最も広く使用されている自尊心尺度です。",
  developer: "Morris Rosenberg (1965)",
  reliability: {
    cronbachAlpha: "0.77-0.88",
    testRetest: "0.82-0.85 (2週間)",
  },
  citations: "50,000+",
  tier: "S (Gold Standard)",
  academicReference: {
    original: "Rosenberg, M. (1965). Society and the adolescent self-image. Princeton, NJ: Princeton University Press.",
    japanese: "山本真理子・松井豊・山成由紀子 (1982). 認知された自己の諸側面の構造. 教育心理学研究, 30, 64-68.",
  },
  scoring: {
    min: 10,
    max: 40,
    neutral: 25,
    description: "10-40点の範囲。高得点ほど自尊心が高い。",
  },
};
