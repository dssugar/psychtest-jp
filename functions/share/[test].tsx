/**
 * 動的シェアページ（全テスト対応）
 * Cloudflare Pages Function
 *
 * URLパターン: /share/{test}?param1=X&param2=Y&...
 * 動的にHTMLを生成し、OGメタデータを含める
 */

import { testRegistry } from '@/lib/tests/test-registry';
import type { TestType } from '@/lib/storage';
import {
  renderSharePage,
  scoreToPercentage,
  type DisplayScore,
} from '@/lib/og-design/share-template';

export const onRequest: PagesFunction<{ test: string }> = async (context) => {
  const { test } = context.params;
  const url = new URL(context.request.url);

  // テスト設定取得（型ガード）
  if (typeof test !== 'string' || !(test in testRegistry)) {
    return new Response('Test not found', { status: 404 });
  }
  const testConfig = testRegistry[test as keyof typeof testRegistry];

  // OG画像設定がない場合はエラー
  if (!testConfig.ogImage) {
    return new Response('OG image config not available for this test', {
      status: 501,
    });
  }

  // クエリパラメータからスコアを復元
  const rawScores = testConfig.ogImage.paramsToScore
    ? testConfig.ogImage.paramsToScore(url.searchParams)
    : {};

  // DisplayScore配列を生成
  const scores = buildDisplayScores(testConfig, rawScores);

  // 汎用テンプレート関数を使用してHTML生成
  return renderSharePage(url, testConfig, scores);
};

/**
 * テスト設定とスコアからDisplayScore配列を生成
 */
function buildDisplayScores(
  testConfig: any,
  rawScores: Record<string, number>
): DisplayScore[] {
  const ogConfig = testConfig.ogImage;
  if (!ogConfig) return [];

  // layoutTypeに応じて処理
  switch (ogConfig.layoutType) {
    case 'bar':
      // Big Five型（複数次元）
      return Object.entries(rawScores).map(([key, score]) => {
        const label =
          ogConfig.dimensionLabels?.[key] || key;
        const color = ogConfig.colors?.[key] || '#3b82f6';
        const percentage = ogConfig.scoreDisplay
          ? scoreToPercentage(
              score,
              ogConfig.scoreDisplay.min || 0,
              ogConfig.scoreDisplay.max || 100
            )
          : 0;

        return {
          key,
          label,
          score,
          percentage,
          color,
          displayValue: `${score}`,
        };
      });

    case 'single':
      // 単一スコア型（PHQ-9, K6等）
      const totalScore = rawScores.total || 0;
      const interpretation = getInterpretation(testConfig, totalScore);

      return [
        {
          key: 'total',
          label: '総合スコア',
          score: totalScore,
          color: '#3b82f6',
          displayValue: `${totalScore}`,
          interpretation,
        },
      ];

    default:
      return [];
  }
}

/**
 * スコア解釈を取得（簡易版）
 */
function getInterpretation(testConfig: any, score: number): string {
  // TODO: より詳細な解釈ロジックを実装
  const scaleInfo = testConfig.scaleInfo;
  const { min, max } = scaleInfo.scoring;

  if (score <= min + (max - min) * 0.33) {
    return '低い';
  } else if (score <= min + (max - min) * 0.66) {
    return '中程度';
  } else {
    return '高い';
  }
}
