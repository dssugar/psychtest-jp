import type { UserProfile, TestType } from "@/lib/storage";
import type { BigFiveResult } from "@/lib/scoring/bigfive";
import { dimensionNames } from "@/lib/scoring/bigfive";

/**
 * 象限タイプ
 */
type QuadrantType = "low-low" | "low-high" | "high-low" | "high-high";

/**
 * 2次元スコアから象限を判定
 * @param x 横軸スコア（0-100）
 * @param y 縦軸スコア（0-100）
 */
export function getQuadrant(x: number, y: number): QuadrantType {
  const xHigh = x >= 50;
  const yHigh = y >= 50;

  if (!xHigh && !yHigh) return "low-low";
  if (!xHigh && yHigh) return "low-high";
  if (xHigh && !yHigh) return "high-low";
  return "high-high";
}

/**
 * 自己認識（SCCS × Rosenberg）のインサイト生成
 * @param sccs 自己概念明確さスコア（0-100）
 * @param rosenberg 自尊心スコア（0-100）
 */
export function generateSelfAwarenessInsight(
  sccs?: number,
  rosenberg?: number
): string | null {
  if (sccs === undefined || rosenberg === undefined) return null;

  const quadrant = getQuadrant(sccs, rosenberg);

  const insights: Record<QuadrantType, string> = {
    "high-high":
      "自己認識が明確で、自己評価も高い状態です。自分自身をよく理解し、肯定的に受け入れています。この状態は心理的健康の基盤となります。",
    "high-low":
      "自己認識は明確ですが、自己評価が低い傾向があります。自分をよく理解しているものの、その評価が厳しい可能性があります。自己受容を高めることで、より健康的なバランスが得られるかもしれません。",
    "low-high":
      "自己評価は高いものの、自己認識が曖昧な状態です。自分に自信はあるものの、自己理解が深まることで、さらに安定した自己像を築けるでしょう。",
    "low-low":
      "自己認識が曖昧で、自己評価も低い傾向があります。自己探求を通じて自己理解を深めることが、自己肯定感の向上につながる可能性があります。",
  };

  return insights[quadrant];
}

/**
 * プロファイル完了率を計算
 * @param profile ユーザープロファイル
 * @returns 完了率（0-100）
 */
export function calculateProfileCompleteness(profile: UserProfile): number {
  // Phase 1で実装されているテスト一覧
  const availableTests: TestType[] = ["sccs", "rosenberg", "bigfive"];

  const completedCount = availableTests.filter(
    (testType) => profile.tests[testType] !== undefined
  ).length;

  return (completedCount / availableTests.length) * 100;
}

/**
 * Big Fiveのトップ3特性を抽出（スコアの高い順）
 * @param bigFive Big Five結果
 * @returns トップ3特性
 */
export function extractTopTraits(bigFive: BigFiveResult): Array<{
  trait: string;
  traitJa: string;
  score: number;
}> {
  const traits = [
    { trait: "extraversion" as const, score: bigFive.extraversion },
    { trait: "agreeableness" as const, score: bigFive.agreeableness },
    { trait: "conscientiousness" as const, score: bigFive.conscientiousness },
    { trait: "neuroticism" as const, score: bigFive.neuroticism },
    { trait: "openness" as const, score: bigFive.openness },
  ];

  // スコアの高い順にソート
  const sorted = traits.sort((a, b) => b.score - a.score);

  // トップ3を返す
  return sorted.slice(0, 3).map((t) => ({
    trait: t.trait,
    traitJa: dimensionNames[t.trait],
    score: t.score,
  }));
}

/**
 * 複数テスト結果から統合インサイトを生成
 * @param profile ユーザープロファイル
 * @param completedTests 完了テスト一覧
 * @returns 統合インサイト文
 */
export function generateMultiTestSynthesis(
  profile: UserProfile,
  completedTests: TestType[]
): string {
  const parts: string[] = [];

  // 自己認識次元（SCCS + Rosenberg）
  if (profile.tests.sccs && profile.tests.rosenberg) {
    const sccsLevel = profile.tests.sccs.result.level;
    const rosenbergLevel = profile.tests.rosenberg.result.level;

    const sccsHigh = sccsLevel === "high" || sccsLevel === "very_high";
    const rosenbergHigh = rosenbergLevel === "high" || rosenbergLevel === "very_high";

    if (sccsHigh && rosenbergHigh) {
      parts.push("自己認識が明確で、自己評価も高い状態");
    } else if (sccsHigh && !rosenbergHigh) {
      parts.push("自己認識は明確だが、自己評価を高める余地がある状態");
    } else if (!sccsHigh && rosenbergHigh) {
      parts.push("自己評価は高いが、自己理解を深める余地がある状態");
    } else {
      parts.push("自己認識と自己評価の両面で成長の余地がある状態");
    }
  } else if (profile.tests.sccs) {
    const level = profile.tests.sccs.result.level;
    const clarity = level === "high" || level === "very_high" ? "明確" : "発展途上";
    parts.push(`自己認識: ${clarity}`);
  } else if (profile.tests.rosenberg) {
    const level = profile.tests.rosenberg.result.level;
    const esteem = level === "high" || level === "very_high" ? "高い" : "向上の余地あり";
    parts.push(`自己評価: ${esteem}`);
  }

  // 性格特性（Big Five）
  if (profile.tests.bigfive) {
    const topTraits = extractTopTraits(profile.tests.bigfive.result);
    const traitNames = topTraits.map((t) => t.traitJa).join("、");
    parts.push(`性格特性: ${traitNames}が特に顕著`);
  }

  // 統合メッセージ
  if (parts.length === 0) {
    return "診断を完了すると、ここに統合インサイトが表示されます。";
  }

  return `あなたのプロファイルは次のような特徴を示しています：${parts.join("。")}。`;
}

/**
 * Big Fiveスコアを0-100のパーセンテージに変換
 * @param rawScore 生スコア（4-20の範囲）
 * @returns パーセンテージ（0-100）
 */
export function bigFiveToPercentage(rawScore: number): number {
  // Mini-IPIP-20の場合、各次元は4問（4-20の範囲）
  const min = 4;
  const max = 20;
  return ((rawScore - min) / (max - min)) * 100;
}
