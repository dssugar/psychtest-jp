import type { UserProfile, TestType } from "@/lib/storage";
import type { BigFiveResult, BigFiveFacets } from "@/lib/scoring/bigfive";
import { dimensionNames } from "@/lib/scoring/bigfive";
import { facetNames } from "@/data/facet-names";

/**
 * 象限タイプ
 */
type QuadrantType = "low-low" | "low-high" | "high-low" | "high-high";

/**
 * 値を指定範囲内にクランプする
 * @param value 値
 * @param min 最小値
 * @param max 最大値
 * @returns クランプされた値
 */
function clamp(value: number, min: number, max: number): number {
  if (value < min || value > max) {
    console.warn(
      `[synthesis] Value ${value} is out of range [${min}, ${max}]. Clamping to valid range.`
    );
  }
  return Math.max(min, Math.min(max, value));
}

/**
 * 2次元スコアから象限を判定
 * @param x 横軸スコア（0-100）
 * @param y 縦軸スコア（0-100）
 */
export function getQuadrant(x: number, y: number): QuadrantType {
  // 入力値を0-100の範囲にクランプ
  const clampedX = clamp(x, 0, 100);
  const clampedY = clamp(y, 0, 100);

  const xHigh = clampedX >= 50;
  const yHigh = clampedY >= 50;

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

  // スコアを0-100の範囲にクランプ
  const clampedSccs = clamp(sccs, 0, 100);
  const clampedRosenberg = clamp(rosenberg, 0, 100);

  const quadrant = getQuadrant(clampedSccs, clampedRosenberg);

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
  const availableTests: TestType[] = ["rosenberg", "bigfive", "selfconcept"];

  // エッジケース: テストが1つもない場合は0%を返す
  if (availableTests.length === 0) {
    console.warn("[synthesis] No available tests defined. Returning 0% completeness.");
    return 0;
  }

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
  // 各スコアを24-120からパーセンテージに変換
  const traits = [
    { trait: "extraversion" as const, score: bigFiveToPercentage(bigFive.extraversion) },
    { trait: "agreeableness" as const, score: bigFiveToPercentage(bigFive.agreeableness) },
    { trait: "conscientiousness" as const, score: bigFiveToPercentage(bigFive.conscientiousness) },
    { trait: "neuroticism" as const, score: bigFiveToPercentage(bigFive.neuroticism) },
    { trait: "openness" as const, score: bigFiveToPercentage(bigFive.openness) },
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
 * Big Fiveファセットのトップ5を抽出（スコアの高い順）
 * @param facets Big Fiveファセットスコア
 * @returns トップ5ファセット
 */
export function extractTopFacets(facets: BigFiveFacets): Array<{
  facet: keyof BigFiveFacets;
  facetJa: string;
  score: number;
  percentageScore: number;
}> {
  // 全ファセットを配列化（4-20の範囲）
  const allFacets = (Object.keys(facets) as Array<keyof BigFiveFacets>).map((key) => ({
    facet: key,
    facetJa: facetNames[key],
    score: clamp(facets[key], 4, 20),
  }));

  // スコアの高い順にソート
  const sorted = allFacets.sort((a, b) => b.score - a.score);

  // トップ5を返す（パーセンテージも計算）
  return sorted.slice(0, 5).map((f) => ({
    facet: f.facet,
    facetJa: f.facetJa,
    score: f.score,
    percentageScore: ((f.score - 4) / (20 - 4)) * 100,
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

  // 自己認識次元（Self-Concept + Rosenberg）
  if (profile.tests.selfconcept && profile.tests.rosenberg) {
    const selfconceptLevel = profile.tests.selfconcept.result.level;
    const rosenbergLevel = profile.tests.rosenberg.result.level;

    const selfconceptHigh = selfconceptLevel === "high" || selfconceptLevel === "very_high";
    const rosenbergHigh = rosenbergLevel === "high" || rosenbergLevel === "very_high";

    if (selfconceptHigh && rosenbergHigh) {
      parts.push("自己認識が明確で、自己評価も高い状態");
    } else if (selfconceptHigh && !rosenbergHigh) {
      parts.push("自己認識は明確だが、自己評価を高める余地がある状態");
    } else if (!selfconceptHigh && rosenbergHigh) {
      parts.push("自己評価は高いが、自己理解を深める余地がある状態");
    } else {
      parts.push("自己認識と自己評価の両面で成長の余地がある状態");
    }
  } else if (profile.tests.selfconcept) {
    const level = profile.tests.selfconcept.result.level;
    const clarity = level === "high" || level === "very_high" ? "明確" : "発展途上";
    parts.push(`自己認識: ${clarity}`);
  } else if (profile.tests.rosenberg) {
    const level = profile.tests.rosenberg.result.level;
    const esteem = level === "high" || level === "very_high" ? "高い" : "向上の余地あり";
    parts.push(`自己評価: ${esteem}`);
  }

  // 性格特性（Big Five）- ファセット優先
  if (profile.tests.bigfive) {
    if (profile.tests.bigfive.result.facets) {
      // ファセットがある場合はトップ3ファセットを使用
      const topFacets = extractTopFacets(profile.tests.bigfive.result.facets).slice(0, 3);
      const facetNames = topFacets.map((f) => f.facetJa).join("、");
      parts.push(`性格特性: ${facetNames}が特に顕著`);
    } else {
      // ファセットがない場合はドメインを使用
      const topTraits = extractTopTraits(profile.tests.bigfive.result);
      const traitNames = topTraits.map((t) => t.traitJa).join("、");
      parts.push(`性格特性: ${traitNames}が特に顕著`);
    }
  }

  // 統合メッセージ
  if (parts.length === 0) {
    return "診断を完了すると、ここに統合インサイトが表示されます。";
  }

  return `あなたのプロファイルは次のような特徴を示しています：${parts.join("。")}。`;
}

/**
 * Big Fiveスコアを0-100のパーセンテージに変換
 * @param rawScore 生スコア（24-120の範囲、IPIP-120）
 * @returns パーセンテージ（0-100）
 */
export function bigFiveToPercentage(rawScore: number): number {
  // IPIP-120の場合、各次元は24問（24-120の範囲）
  const min = 24;
  const max = 120;

  // スコアを24-120の範囲にクランプ
  const clampedScore = clamp(rawScore, min, max);

  return ((clampedScore - min) / (max - min)) * 100;
}
