/**
 * Self-Concept Clarity Scale (SCCS) - Scoring & Configuration
 *
 * Self-Concept Clarity の採点とレベル判定
 *
 * スコア範囲: 8-40点（短縮版）
 * - 8-13点: 低い（自己認識が曖昧）
 * - 14-19点: やや低い
 * - 20-27点: 中程度
 * - 28-31点: 高い
 * - 32-40点: 非常に高い
 *
 * @reference Campbell, J. D., Trapnell, P. D., Heine, S. J., Katz, I. M.,
 *            Lavallee, L. F., & Lehman, D. R. (1996). Self-concept clarity:
 *            Measurement, personality correlates, and cultural boundaries.
 *            Journal of Personality and Social Psychology, 70(1), 141-156.
 */

import {
  selfConceptQuestions,
  scaleOptions,
  scaleInfo,
  scoreRanges,
} from "@/data/selfconcept-questions";
import type { TestConfig } from "./types";
import { validateAnswerPattern as validateCommon } from "./validation";
import type { DimensionData } from "@/lib/og-design/types";
import { TEST_COLOR_MAP } from "@/lib/og-design/constants";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Self-Concept Clarity (SCC) の結果型
 */
export interface SelfConceptResult {
  rawScore: number;
  percentageScore: number;
  level: "low" | "medium" | "high";
  levelLabel: string;
  // NOTE: interpretation は保存せず、表示時に getInterpretation() で動的生成
}

// ============================================================================
// Scoring Logic
// ============================================================================

/**
 * Self-Concept Clarity スコアを計算
 * @param answers 回答配列（1-5の値）
 * @returns 計算結果
 */
export function calculateSelfConceptScore(
  answers: number[]
): SelfConceptResult {
  if (answers.length !== 8) {
    throw new Error("Self-Concept Clarity requires exactly 8 answers");
  }

  // 逆転項目を反転（Q5-Q8）
  const scoredAnswers = answers.map((answer, index) => {
    const question = selfConceptQuestions[index];
    if (!question) {
      throw new Error(`Question not found for index: ${index}`);
    }
    return question.reverse ? 6 - answer : answer;
  });

  // 合計スコア計算
  const rawScore = scoredAnswers.reduce((sum, score) => sum + score, 0);

  // パーセンテージ計算（8-40 → 0-100%）
  const min = 8;
  const max = 40;
  const percentageScore = ((rawScore - min) / (max - min)) * 100;

  // レベル判定（3段階）
  let level: SelfConceptResult["level"];
  let levelLabel: string;

  if (rawScore >= 33) {
    level = "high";
    levelLabel = "高め";
  } else if (rawScore >= 21) {
    level = "medium";
    levelLabel = "平均的";
  } else {
    level = "low";
    levelLabel = "低め";
  }

  return {
    rawScore,
    percentageScore,
    level,
    levelLabel,
  };
}

/**
 * レベルラベルを取得（OG画像用）
 */
export function getLevelLabel(level: SelfConceptResult["level"]): string {
  const labels = {
    low: "低めの自己理解",
    medium: "平均的な自己理解",
    high: "明確な自己理解",
  };
  return labels[level];
}

/**
 * 短い解釈文を取得（OG画像用）
 * 2行程度の要約
 */
export function getShortInterpretation(level: SelfConceptResult["level"]): string {
  const interpretations = {
    low: "自己認識がやや曖昧で、\n状況によって自己イメージが変化しやすい傾向があります。",
    medium: "自己認識は平均的です。\nある程度自分を理解していますが、時には揺らぐこともあります。",
    high: "自己認識が明確で安定しています。\n自分の性格や価値観について確信を持っています。",
  };
  return interpretations[level];
}

/**
 * 解釈文を取得（簡易版）
 * 表示時に動的生成するため、localStorage に保存しない
 */
export function getInterpretation(
  level: SelfConceptResult["level"]
): string {
  const interpretations: Record<SelfConceptResult["level"], string> = {
    low: "自己認識がやや曖昧です。自分がどんな人間かについて確信を持ちにくく、状況によって自己イメージが変化しやすい傾向があります。自己探求を通じて自己理解を深めることが有益かもしれません。",
    medium: "自己認識は平均的です。ある程度自分を理解していますが、状況によっては自己イメージが揺らぐこともあります。",
    high: "自己認識が明確で安定しています。自分の性格、価値観、信念について確信を持ち、一貫した自己イメージを維持しています。",
  };
  return interpretations[level];
}

/**
 * 詳細な解釈を取得（4セクション構造）
 * Phase 5 で生成された学術的根拠に基づく詳細解釈
 *
 * @reference docs/scales/selfconcept/phase5-interpretations.md
 */
export function getDetailedInterpretation(
  level: SelfConceptResult["level"] | string
): {
  summary: string;
  dailyLifeImpact: string;
  psychBackground: string;
  practicalAdvice: string;
} {
  // 後方互換性: 古いlevel値を新しい形式にマッピング
  const levelMap: Record<string, SelfConceptResult["level"]> = {
    very_low: "low",
    low: "low",
    moderate: "medium",
    high: "high",
    very_high: "high",
  };

  const normalizedLevel = (levelMap[level as string] || level) as SelfConceptResult["level"];

  const interpretations: Record<
    SelfConceptResult["level"],
    {
      summary: string;
      dailyLifeImpact: string;
      psychBackground: string;
      practicalAdvice: string;
    }
  > = {
    low: {
      summary: `あなたの自己概念の明確さはやや低い状態です（スコア: 14-19点）。自分自身についてある程度の理解はあるものの、状況によっては自己イメージが揺らぎやすく、自分の性格や価値観について確信を持ちにくい傾向があります。日常生活において時折、自己理解の不明瞭さが意思決定や対人関係に影響を与えることがあります。しかし、適切な取り組みによって自己概念の明確さを向上させる余地は十分にあります。`,

      dailyLifeImpact: `**対人関係**

やや低い自己概念の明確さは、対人関係において微妙な困難を引き起こすことがあります。親しい友人や家族との関係では比較的自分らしくいられる一方で、新しい人との出会いや職場などのフォーマルな場面では、「どう振る舞うべきか」「本当の自分はどちらなのか」という葛藤を感じやすくなります。研究によると、自己概念の明確さは relationship satisfaction（関係満足度）を予測することが示されており、自分自身への理解が曖昧だと、他者との深い関係を築くことが難しくなる傾向があります。また、相手の期待に合わせて自分を変えすぎてしまい、後で疲れを感じることもあるでしょう。

**仕事・学業**

仕事や学業の場面では、自分の強み・弱みの把握が不十分なため、適切な目標設定が難しくなることがあります。「自分は本当にこの仕事/専攻に向いているのか」という疑問が頭をよぎり、キャリアパスに対する迷いが生じやすくなります。内発的動機づけ（intrinsic motivation）は自己概念の明確さと関連しており、自分が何に情熱を感じるのかが不明瞭だと、モチベーションの維持が困難になります。ただし、完全に機能不全というわけではなく、日々の業務はこなせるものの、長期的なキャリアビジョンの構築に課題を感じることが多いでしょう。

**意思決定**

重要な決断を迫られた際、自分の価値観や優先順位が不明瞭なため、選択に時間がかかったり、決定後も「本当にこれで良かったのか」と後悔しやすくなります。例えば、転職のオファーを受けた時、「給料」「やりがい」「ワークライフバランス」のどれを最優先すべきか判断がつかず、他者の意見に大きく左右されることがあります。

**ストレス対処**

縦断研究（van Dijk et al., 2014）では、自己概念の明確さが将来のうつ症状や不安症状を予測することが示されています。ストレスフルな出来事が起きた際、自分の対処能力への信頼が揺らぎやすく、「自分には無理かもしれない」という否定的な考えに陥りやすくなります。ストレスの緩衝効果（buffer effect）が十分に機能しないため、些細なストレスにも過剰に反応することがあります。`,

      psychBackground: `自己概念の明確さは、心理的 well-being の重要な予測因子であり、複数の研究で life satisfaction, self-esteem, positive affect との正の相関が確認されています。やや低いレベルの自己概念の明確さは、臨床的な問題とは言えないものの、主観的 well-being の低下リスクを高めます。Campbell et al. (1996) の枠組みでは、自己信念の「内的一貫性」「時間的安定性」「明確な定義」がやや欠如している状態と言えます。重要なのは、自己概念の明確さは固定的な特性ではなく、介入によって改善可能な「state-like trait」であるという点です。実際、マインドフルネス介入や自己コンパッション介入による改善効果が複数の研究で報告されています。`,

      practicalAdvice: `**自己探求の方法**

1. **価値観の明確化エクササイズ**: 自分にとって本当に大切なものは何かを見つけるために、「人生で最も重要な10の価値観」をリストアップし、優先順位をつける練習をしましょう。ACT（Acceptance and Commitment Therapy）の価値観カードを使うのも有効です。

2. **マインドフルネス実践（8週間プログラム）**: 研究では、8週間の MBSR（Mindfulness-Based Stress Reduction）が自己概念の明確さを向上させることが確認されています。アプリや書籍を使った自宅での実践、またはMBSRクラスへの参加を検討してみましょう。

3. **自己コンパッション日記**: 研究（n = 1,603）では、否定的な出来事に対して自己コンパッションを実践すると、自己概念の明確さが向上することが示されています（β = 0.54）。失敗や挫折を経験した時、「自分はダメだ」と批判するのではなく、「誰でも失敗する。この経験から何を学べるか？」と自分に優しく問いかける習慣をつけましょう。

**セルフモニタリング**

- 週に1回、「今週の自分」を振り返る時間を設けましょう。「どんな場面で自分らしさを発揮できたか」「どんな選択に満足したか」を記録します。
- 3ヶ月後に同じテストを再受験し、変化を確認してみましょう。

**カウンセリングの活用**

以下の場合は、専門家のサポートが有益です：
- 自己探求を一人で行うことに限界を感じる
- 自己概念の曖昧さが仕事や人間関係に明確な支障をきたしている
- 併存するメンタルヘルスの問題（軽度のうつ・不安）がある

**注意点**

- アイデンティティ探索は生涯続くプロセスです。「完璧な自己理解」を目指す必要はありません。
- 人生の転換期（転職、結婚、出産など）では、一時的に自己概念の明確さが低下することがあります。これは正常な適応プロセスです。`,
    },

    medium: {
      summary: `あなたの自己概念の明確さは平均的な水準です（スコア: 20-27点）。自分がどんな人間か、何を大切にしているかについて、ある程度の理解と確信を持っています。多くの状況で自分らしく振る舞うことができますが、時折、自己イメージが揺らいだり、重要な決断で迷いが生じることもあります。これは正常範囲内の状態であり、さらに自己理解を深めることで、より明確で安定した自己概念を築く余地があります。`,

      dailyLifeImpact: `**対人関係**

中程度の自己概念の明確さは、対人関係において比較的バランスの取れた状態です。親しい友人や家族との関係では、自分らしさを発揮でき、適切な自己開示ができています。新しい人との出会いでも、過度に緊張することなく、ある程度自然に振る舞えるでしょう。研究では、自己概念の明確さが relationship satisfaction を予測することが示されており、中程度のレベルでも良好な関係を築くことは可能です。ただし、ストレスの多い状況や複雑な対人葛藤の場面では、「本当の自分はどう思っているのか」が不明瞭になり、他者の意見に流されやすくなることがあります。

**仕事・学業**

仕事や学業では、自分の基本的な強み・弱みを把握しており、適性に合った選択ができる場合が多いです。日常的な業務やタスクには問題なく取り組めますが、キャリアの重要な岐路（転職、昇進、専門分野の選択など）では迷いが生じることがあります。内発的動機づけは自己概念の明確さと関連しているため、「本当にやりたいこと」が不明瞭な時期もあるかもしれません。しかし、自己探求を続けることで、より明確なキャリアビジョンを構築できる可能性があります。

**意思決定**

日常的な選択（食事、買い物、予定の調整など）は比較的スムーズに行えますが、人生の大きな決断（結婚、転職、引っ越しなど）では、自分の価値観や優先順位が揺らぐことがあります。複数の選択肢があると迷いやすく、決定後も「もう一方の選択の方が良かったかもしれない」と後悔することがあるでしょう。

**ストレス対処**

研究（Ritchie et al.）では、自己概念の明確さがストレスと主観的 well-being の関係を媒介することが示されています。中程度のレベルでは、通常のストレスには対処できますが、大きなストレス（失業、失恋、喪失体験など）が重なると、自己概念が揺らぎ、well-being が低下しやすくなります。ストレスの緩衝効果（buffer effect）は部分的に機能していますが、十分ではありません。`,

      psychBackground: `中程度の自己概念の明確さは、一般人口の中央値付近に位置しており、「正常範囲」と言えます。研究では、自己概念の明確さと well-being, life satisfaction, self-esteem の間に正の相関が確認されていますが、この関係は線形ではなく、中程度から高いレベルへの改善でも有意な well-being の向上が期待できます。Campbell et al. (1996) の枠組みでは、自己信念の「内的一貫性」「時間的安定性」「明確な定義」がある程度は備わっているものの、さらなる向上の余地がある状態です。重要なのは、自己概念の明確さは「state-like trait」であり、マインドフルネスや自己省察などの実践によって向上可能であるという点です。`,

      practicalAdvice: `**自己理解を深める習慣**

1. **定期的な自己省察**: 月に1回、30分程度の「自分との対話」の時間を設けましょう。「今月、最も充実感を感じた瞬間は？」「どんな価値観に基づいて行動できたか？」「どんな場面で自分らしさを感じたか？」を振り返ります。

2. **マインドフルネス瞑想（10-15分/日）**: 研究では、マインドフルネス実践が自己概念の明確さを向上させることが確認されています。特に、attention training（注意訓練）の要素が重要です。呼吸に意識を向ける瞑想から始め、徐々に日常生活でのマインドフルな気づきを増やしましょう。

3. **ジャーナリング**: 週に2-3回、感情や考えを書き出す習慣をつけましょう。特に、意思決定の場面で「なぜその選択をしたのか」「自分の価値観とどう一致しているか」を記録すると、パターンが見えてきます。

**自己コンパッションの実践**

自己コンパッション介入（n = 1,603）では、自己概念の明確さへの中程度から大きな効果（β = 0.54）が報告されています。失敗や困難に直面した際、自分を責めるのではなく、以下の3要素を意識しましょう：
- **Self-kindness**: 自分に優しく接する
- **Common humanity**: 誰でも失敗することを認識する
- **Mindfulness**: 否定的な感情に飲み込まれず、客観的に観察する

**ストレス管理**

- ストレスフルな出来事が起きた際、「自分の対処能力」と「利用可能なサポート」を具体的にリストアップする習慣をつけましょう。これにより、自己効力感が向上します。
- 信頼できる友人や家族との対話を通じて、外部からの視点を得ることも有益です。

**さらなる向上のために**

- 心理教育プログラム（ワークショップ、オンラインコース）への参加
- キャリアカウンセリングやライフコーチングの活用
- 自己啓発書（特に ACT, マインドフルネス, 自己コンパッション関連）の読書

**注意点**

- 自己概念の明確さは生涯を通じて変動します。中年期にピークを迎え、老年期に低下する傾向があります（逆U字型の発達曲線）。
- 人生の転換期（転職、結婚、離婚、引っ越しなど）では、一時的に明確さが低下することがあります。これは新しい自己理解を構築するプロセスの一部です。`,
    },

    high: {
      summary: `あなたの自己概念の明確さは高い水準です（スコア: 28-31点）。自分がどんな人間で、何を大切にし、何を目指しているかについて、明確で一貫した理解を持っています。多くの状況で自分らしく振る舞うことができ、意思決定の際にも自分の価値観に基づいた選択ができています。この明確な自己理解は、精神的健康の重要な基盤となっており、ストレスへの耐性や対人関係の質の向上に寄与しています。さらなる向上と維持のための習慣を続けることで、この状態を長期的に保つことができます。`,

      dailyLifeImpact: `**対人関係**

高い自己概念の明確さは、対人関係において多くの利点をもたらします。研究では、自己概念の明確さが relationship satisfaction を予測し、この関係は「inclusion of other in self-concept（自己概念への他者の包含）」によって媒介されることが示されています。つまり、自分自身を明確に理解していると、他者との健全な境界線を保ちながらも、親密な関係を築くことができるのです。適切な自己開示ができ、「本当の自分」を見せることへの恐れ（fear of negative evaluation）が少ないため、真正な関係を構築しやすくなります。相手の期待に過度に合わせることなく、自分の意見や感情を適切に表現できるため、信頼関係が深まりやすいでしょう。

**仕事・学業**

明確な自己理解は、キャリアにおいて大きな強みとなります。自分の強み・弱み・価値観を把握しているため、適性に合った仕事を選び、自分の能力を最大限に発揮できます。研究では、自己概念の明確さが psychological empowerment（心理的エンパワーメント）を媒介して intrinsic motivation（内発的動機づけ）を高めることが示されています。つまり、明確な自己理解があると、「やらされている」のではなく「やりたいからやる」という感覚が強まり、仕事への満足度や生産性が向上します。新しい挑戦にも自信を持って取り組むことができ、失敗を恐れずにリスクを取ることができます。

**意思決定**

日常的な選択から人生の重要な決断まで、自分の価値観や優先順位に基づいた一貫性のある決定ができます。複数の選択肢がある場合でも、自分にとって何が最も重要かが明確なため、迷いが少なく、決定後の後悔も少ないです。他者の意見を参考にしつつも、最終的には自分の判断を信頼できるため、決断のストレスが大幅に軽減されます。

**ストレス対処とレジリエンス**

高い自己概念の明確さは、ストレスに対する強力な緩衝材（buffer）として機能します。研究（Ritchie et al.）では、自己概念の明確さがストレスと主観的 well-being の関係を完全に媒介することが示されています。明確な自己理解があると、ストレスフルな出来事が起きても、「自分の対処能力」を正確に評価でき、利用可能な内的・外的リソースを効果的に活用できます。否定的フィードバックへの脆弱性が低く、失敗や挫折を「自己全体の否定」ではなく「学習の機会」として捉えることができます。レジリエンス（回復力）が高く、困難から立ち直るスピードが速いです。`,

      psychBackground: `複数の研究で、高い自己概念の明確さは心理的 well-being の強力な予測因子であることが示されています。具体的には、高い life satisfaction, 高い self-esteem, よりポジティブな感情、低いうつ・不安症状と関連しています。大規模メタ分析（274,370人、39カ国）では、self-esteem/self-concept とうつ病の間に強い負の相関（r = -0.52）が確認されており、明確な自己理解は精神的健康の重要な保護因子です。生涯発達の観点では、自己概念の明確さは中年期（40-60歳）にピークを迎える逆U字型の軌跡を示します。あなたの高いスコアは、社会的役割（仕事、家族）を通じた自己理解の深化、あるいは意図的な自己省察の実践の成果と言えます。`,

      practicalAdvice: `**現状を維持するための習慣**

1. **マインドフルネスの継続**: 研究では、マインドフルネス実践が自己概念の明確さを維持・向上させることが示されています。1日10-15分の瞑想を習慣化し、日常生活でのマインドフルな気づきを保ちましょう。

2. **価値観に基づく行動（Value-based action）**: 自分の核となる価値観（家族、誠実さ、創造性、貢献など）を定期的に見直し、日々の行動がそれらと一致しているか確認しましょう。ACT（Acceptance and Commitment Therapy）の「価値観ワークシート」を活用するのも有効です。

3. **定期的な自己省察**: 月に1回、30分程度の「自分との対話」の時間を設け、「今月、自分らしく生きられたか」「価値観に反する行動はなかったか」を振り返りましょう。

**さらなる向上の可能性**

高いレベルからさらに向上する余地はあります：
- **自己コンパッションの深化**: 研究（n = 1,603）では、自己コンパッション介入が自己概念の明確さを向上させる効果（β = 0.54）が報告されています。特に、困難な状況での self-kindness（自分への優しさ）を強化しましょう。
- **他者へのサポート**: 明確な自己理解を持つあなたは、自己探求に悩む他者のロールモデルとなれます。メンタリングやコーチングを通じて、他者の成長を支援することで、自己理解がさらに深まります。

**人生の転換期への備え**

- 転職、結婚、出産、引っ越しなどの大きな変化の際は、一時的に自己概念の明確さが低下することがあります。これは正常な適応プロセスです。
- 変化の時期こそ、意図的な自己省察とマインドフルネスを強化しましょう。

**柔軟性の維持**

- 高い自己概念の明確さは強みですが、過度に固定的な自己イメージは成長を妨げることがあります。新しい情報や経験に開かれた姿勢を保ちましょう。
- 「自分はこういう人間だ」という信念に固執しすぎず、変化と成長の可能性を受け入れることが重要です。

**注意点**

- 自己概念の明確さが高くても、人生の困難やストレスがなくなるわけではありません。ただし、それらに対処する能力が向上します。
- 他者との比較は避けましょう。自己概念の明確さは相対的な優位性ではなく、自己理解の深さを示すものです。`,
    },
  };

  return interpretations[normalizedLevel];
}

/**
 * Self-Concept Clarity Scale 回答バリデーション
 */
function validateAnswerPattern(answers: number[]) {
  return validateCommon(answers, {
    expectedLength: 8,
    minValue: 1,
    maxValue: 5,
    messageType: "message",
  });
}

// ============================================================================
// Test Configuration
// ============================================================================

/**
 * Self-Concept Clarity Scale テスト設定
 */
export const selfConceptConfig: TestConfig<SelfConceptResult> = {
  id: "selfconcept",
  color: "blue",
  basePath: "/selfconcept",
  questions: selfConceptQuestions,
  scaleOptions,
  calculateScore: calculateSelfConceptScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,

  // 結果ページ拡張機能
  resultExtensions: {
    shareButtons: true,
  },

  // OG画像設定
  ogImage: {
    layoutType: "single",
    titleEn: "SELF-CONCEPT\nCLARITY",
    category: "自己認識明確性診断",
    description: "自己理解の明瞭さを測定\n自分を知る力を評価",
    scoreDisplay: { type: "raw", min: 8, max: 40, unit: "" },
    scoreToParams: (result: SelfConceptResult) => ({
      score: (result?.rawScore ?? 24).toString(),
      level: result?.level ?? "medium",
    }),
    paramsToScore: (params: URLSearchParams): SelfConceptResult => {
      const rawScore = parseInt(params.get("score") || "24");
      const level = (params.get("level") as SelfConceptResult["level"]) || "medium";
      const min = 8;
      const max = 40;
      const percentageScore = ((rawScore - min) / (max - min)) * 100;
      return {
        rawScore,
        percentageScore: Math.round(percentageScore * 10) / 10,
        level,
        levelLabel: getLevelLabel(level),
      };
    },
    getLevelLabel: (result: SelfConceptResult) => getLevelLabel(result?.level ?? "medium"),
    getShortInterpretation: (result: SelfConceptResult) => getShortInterpretation(result?.level ?? "medium"),
    scoreRanges: scoreRanges.map((range) => ({
      min: range.min,
      max: range.max,
      label: range.label,
    })),
  },

  // 🆕 NEW: 1次元データ生成
  getDimensions: (result: SelfConceptResult): DimensionData[] => {
    const min = 8;
    const max = 40;
    const rawScore = result?.rawScore ?? 24;
    const percentage = result?.percentageScore ?? ((rawScore - min) / (max - min)) * 100;

    return [{
      key: 'score',
      label: 'Total Score',
      score: rawScore,
      percentage: percentage,
      color: TEST_COLOR_MAP['blue'] || '#3b82f6',
    }];
  },
};
