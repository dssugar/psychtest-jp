/**
 * OG画像シェアページの共通テンプレート
 * 全テストで使用可能な汎用HTML生成関数
 */

import type { TestConfig } from '@/lib/tests/types';
import type { DimensionData } from './types';
import { OG_COLORS } from './constants';

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

/**
 * barレイアウト用のスコア表示HTML生成
 */
function renderBarScores(scores: DisplayScore[]): string {
  return scores
    .map(
      (s) => `
    <div class="dimension">
      <div class="dimension-header">
        <span class="dimension-label">${s.label}</span>
        <span class="dimension-score">${s.displayValue}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${s.percentage || 0}%; background: ${s.color}"></div>
      </div>
    </div>
  `
    )
    .join('');
}

/**
 * singleレイアウト用のスコア表示HTML生成
 */
function renderSingleScore(score: DisplayScore): string {
  return `
    <div class="single-score">
      <div class="score-main">
        <div class="score-value">${score.displayValue}</div>
        <div class="score-label">${score.label}</div>
      </div>
      ${
        score.interpretation
          ? `<div class="score-interpretation">${score.interpretation}</div>`
          : ''
      }
    </div>
  `;
}

/**
 * レイアウトタイプに応じたスコア表示HTML生成
 */
function renderScores(
  scores: DisplayScore[],
  layoutType: string
): string {
  switch (layoutType) {
    case 'bar':
      return renderBarScores(scores);
    case 'single':
      return renderSingleScore(scores[0]);
    case 'radar':
      // TODO: レーダーチャート実装
      return renderBarScores(scores);
    case 'category':
      // TODO: カテゴリマトリクス実装
      return renderBarScores(scores);
    default:
      return renderBarScores(scores);
  }
}

/**
 * 共通CSSスタイル
 */
function getSharedStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
      background: #faf8f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container {
      max-width: 42rem;
      width: 100%;
    }
    .card {
      background: white;
      border: 4px solid #1a1a1a;
      padding: 2rem;
      box-shadow: 8px 8px 0px #1a1a1a;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 900;
      margin-bottom: 1.5rem;
    }

    /* Bar layout */
    .dimension {
      margin-bottom: 1rem;
    }
    .dimension-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .dimension-label {
      font-weight: 700;
      font-size: 1.125rem;
    }
    .dimension-score {
      font-family: monospace;
      font-weight: 700;
    }
    .progress-bar {
      height: 2rem;
      background: #e5e5e5;
      border: 2px solid #1a1a1a;
      position: relative;
    }
    .progress-fill {
      height: 100%;
      border-right: 2px solid #1a1a1a;
      box-shadow: 4px 4px 0px #1a1a1a;
    }

    /* Single score layout */
    .single-score {
      text-align: center;
      padding: 2rem 0;
    }
    .score-main {
      margin-bottom: 1.5rem;
    }
    .score-value {
      font-size: 4rem;
      font-weight: 900;
      font-family: monospace;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .score-label {
      font-size: 1.5rem;
      font-weight: 700;
      color: #666;
    }
    .score-interpretation {
      font-size: 1.25rem;
      font-weight: 700;
      padding: 1rem;
      background: #f5f5f5;
      border: 2px solid #1a1a1a;
    }

    /* Disclaimer */
    .disclaimer {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #fff3cd;
      border: 2px solid #ffc107;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .info-box {
      margin-top: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border: 2px solid #1a1a1a;
    }
    .info-box p {
      font-size: 0.875rem;
      color: #4a4a4a;
    }
    .buttons {
      margin-top: 1.5rem;
      display: flex;
      gap: 1rem;
    }
    .button {
      flex: 1;
      text-align: center;
      padding: 0.75rem 1.5rem;
      font-weight: 700;
      text-decoration: none;
      border: 4px solid #1a1a1a;
      transition: background 0.2s;
    }
    .button-primary {
      background: #1a1a1a;
      color: white;
    }
    .button-primary:hover {
      background: #333;
    }
    .button-secondary {
      background: white;
      color: #1a1a1a;
    }
    .button-secondary:hover {
      background: #f5f5f5;
    }
  `;
}

/**
 * シェアページHTML生成（汎用テンプレート）
 */
export function renderSharePage(
  url: URL,
  testConfig: TestConfig<any>,
  scores: DisplayScore[]
): Response {
  const origin = url.origin;
  const shareUrl = url.toString();

  // OG画像設定がない場合はエラー
  if (!testConfig.ogImage) {
    return new Response('OG image config not found', { status: 500 });
  }

  // OG画像URL生成
  const ogParams = testConfig.ogImage.scoreToParams
    ? testConfig.ogImage.scoreToParams(
        Object.fromEntries(scores.map((s) => [s.key, s.score]))
      )
    : {};
  const ogImageUrl = buildOGImageUrl(origin, testConfig.id, ogParams);

  // HTML生成
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${testConfig.scaleInfo.nameJa}結果 | 心理測定ラボ</title>

  <!-- Open Graph -->
  <meta property="og:title" content="${testConfig.scaleInfo.nameJa}結果">
  <meta property="og:description" content="${testConfig.scaleInfo.description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${testConfig.scaleInfo.nameJa}結果">
  <meta name="twitter:description" content="${testConfig.scaleInfo.description}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <style>${getSharedStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>${testConfig.scaleInfo.nameJa}結果</h1>

      ${renderScores(scores, testConfig.ogImage.layoutType)}

      ${
        testConfig.ogImage.disclaimer
          ? `<div class="disclaimer">${testConfig.ogImage.disclaimer}</div>`
          : ''
      }

      <div class="info-box">
        <p>この結果をシェアして、友達と比較してみましょう！</p>
      </div>

      <div class="buttons">
        <a href="${origin}${testConfig.basePath}" class="button button-primary">診断を受ける</a>
        <a href="${origin}/results${testConfig.basePath}" class="button button-secondary">結果ページへ</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
