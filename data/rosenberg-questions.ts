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

import type { BaseQuestion, ScaleInfo, ScaleOption } from "@/lib/tests/types";

export type RosenbergQuestion = BaseQuestion;

/**
 * 4点リッカート尺度（1-4点）
 * 1: まったくそう思わない
 * 2: そう思わない
 * 3: そう思う
 * 4: 非常にそう思う
 */
export const scaleOptions: ScaleOption[] = [
  { label: "まったくそう思わない", value: 1 },
  { label: "そう思わない", value: 2 },
  { label: "そう思う", value: 3 },
  { label: "非常にそう思う", value: 4 },
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
 * 尺度情報（Phase 6で強化）
 */
export const scaleInfo: ScaleInfo = {
  name: "Rosenberg Self-Esteem Scale",
  nameJa: "ローゼンバーグ自尊心尺度",
  abbreviation: "RSES",
  category: "自尊心",
  psychologicalLayer: "outcome",
  description: `自己に対する肯定的・否定的態度を測定する、世界で最も広く使用されている自尊心尺度です。

自尊心（Self-Esteem）とは、自分自身の価値についての総合的な評価を指します。Morris Rosenberg博士により1965年に開発され、以降60年近くにわたって世界中の研究で使用されてきました。

自尊心は、精神的健康とウェルビーイングの基盤です。縦断研究により、低い自尊心が将来のうつ病（r = -0.64）や不安症（r = -0.33）を予測することが確立されています。高い自尊心は、ストレスに対するバッファー（緩衝材）として機能し、対人関係、仕事・学業、意思決定といった日常生活の様々な場面でポジティブな影響をもたらします。

重要なのは、自尊心は固定的な特性ではなく、適切な介入（認知行動療法、自己コンパッション療法、マインドフルネス実践など）により改善可能であることです。このテストは、わずか10項目の質問で、信頼性高くあなたの現在の自尊心レベルを測定できます。`,
  developer: "Morris Rosenberg (1965)",
  reliability: {
    cronbachAlpha: "0.77-0.88",
    testRetest: "0.82-0.85 (2週間)",
  },
  citations: "40,000+",
  tier: "Tier S (Gold Standard)",
  academicReference: {
    original:
      "Rosenberg, M. (1965). Society and the adolescent self-image. Princeton, NJ: Princeton University Press.",
    japanese:
      "山本真理子・松井豊・山成由紀子 (1982). 認知された自己の諸側面の構造. 教育心理学研究, 30, 64-68.",
  },
  scoring: {
    min: 10,
    max: 40,
    neutral: 25,
    description: "10-40点の範囲。高得点ほど自尊心が高い。",
  },
  stats: {
    questions: 10,
    minutes: 3,
  },
};
