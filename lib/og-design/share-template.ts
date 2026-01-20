/**
 * OG画像シェアページの共通テンプレート
 * ResultSummaryCardと完全に同じ構造のHTMLを生成
 */

/**
 * スコア表示データ
 */
export interface DisplayScore {
  key: string;
  label: string;
  score: number;
  percentage?: number;
  color: string;
  displayValue: string;
  interpretation?: string;
}

/**
 * OG画像URLを生成
 */
export function buildOGImageUrl(
  origin: string,
  testKey: string,
  params: Record<string, string>
): string {
  const queryParams = new URLSearchParams(params);
  return `${origin}/og/${testKey}?${queryParams.toString()}`;
}

/**
 * スコアをパーセンテージに変換
 */
export function scoreToPercentage(
  score: number,
  min: number,
  max: number
): number {
  return Math.round(((score - min) / (max - min)) * 100);
}

