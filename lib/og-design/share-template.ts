/**
 * OG画像シェアページの共通テンプレート
 * ResultSummaryCardと完全に同じ構造のHTMLを生成
 */

import type { TestConfig } from '@/lib/tests/types';
import type { DimensionData } from './types';
import { OG_SIZE } from './constants';

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
 * barレイアウト用のスコア表示HTML生成（ResultSummaryCardと完全に同じ構造）
 */
function renderBarScores(
  scores: DisplayScore[],
  titleEn: string | undefined,
  category: string,
  description: string | undefined,
  siteName: string
): string {
  const reportId = Math.floor(Math.random() * 90000) + 10000;
  const titleLines = titleEn
    ? titleEn.includes('\n')
      ? titleEn.split('\n')
      : titleEn.split(' ')
    : ['TEST'];

  return `
    <div style="
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border: 12px solid #111111;
      display: flex;
      aspect-ratio: ${OG_SIZE.width} / ${OG_SIZE.height};
    ">
      <!-- 左カラム：タイトルとブランド情報 -->
      <div style="
        width: 400px;
        background: #111111;
        color: white;
        padding: 48px 40px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-right: 8px solid #111111;
      ">
        <!-- 上部：タイトルエリア -->
        <div>
          <div style="
            font-size: 20px;
            font-weight: 700;
            color: #F9FAFB;
            letter-spacing: 0.15em;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            width: fit-content;
          ">
            ${siteName}
          </div>

          <div style="
            font-size: 100px;
            font-weight: 900;
            line-height: 0.85;
            letter-spacing: -0.02em;
            display: flex;
            flex-direction: column;
          ">
            ${titleLines
              .map(
                (line, i) => `
              <span style="color: ${i === 0 ? '#FFFFFF' : '#E5E7EB'};">
                ${line}
              </span>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- 下部：装飾・メタ情報 -->
        <div>
          <div style="
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
          ">
            ${category}
          </div>

          ${
            description
              ? `
          <div style="
            font-size: 16px;
            color: #9CA3AF;
            line-height: 1.5;
            margin-bottom: 24px;
          ">
            ${description.split('\n').join('<br />')}
          </div>
          `
              : ''
          }

          <div style="
            display: flex;
            align-items: center;
            background: #333333;
            padding: 12px 20px;
            border-radius: 8px;
          ">
            <div style="font-size: 24px; margin-right: 10px;">ID</div>
            <div style="
              font-size: 32px;
              font-weight: 900;
              font-family: monospace;
              font-variant-numeric: tabular-nums;
            ">
              ${reportId}
            </div>
          </div>
        </div>
      </div>

      <!-- 右カラム：データエリア -->
      <div style="
        flex: 1;
        background: #F9FAFB;
        background-image: radial-gradient(circle, rgba(206, 206, 206, 0.4) 2px, transparent 2.5px);
        background-size: 30px 30px;
        padding: 20px 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
      ">
        ${scores
          .map(
            (item, index) => `
          <div style="
            display: flex;
            align-items: center;
            margin-bottom: ${index === scores.length - 1 ? '0' : '32px'};
          ">
            <!-- 項目名 -->
            <div style="
              width: 170px;
              font-size: 32px;
              font-weight: 700;
              color: #111111;
            ">
              ${item.label}
            </div>

            <!-- バーエリア -->
            <div style="
              flex: 1;
              height: 68px;
              background: white;
              border: 3px solid #111111;
              margin-right: 24px;
              overflow: hidden;
              position: relative;
              box-shadow: 4px 4px 0px 0px #111111;
            ">
              <div style="
                height: 100%;
                width: ${item.percentage || 0}%;
                background: ${item.color};
                border-right: 3px solid #111111;
              "></div>
            </div>

            <!-- スコア数値 -->
            <div style="
              width: 90px;
              text-align: right;
              font-size: 56px;
              font-weight: 900;
              font-family: monospace;
              color: #111111;
              line-height: 1;
              font-variant-numeric: tabular-nums;
            ">
              ${item.score}
            </div>
          </div>
        `
          )
          .join('')}

        <!-- ウォーターマーク -->
        <div style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 16px;
          font-weight: 700;
          color: #111111;
          opacity: 0.2;
        ">
          psychtest.jp
        </div>
      </div>
    </div>
  `;
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
  layoutType: string,
  titleEn: string | undefined,
  category: string,
  description: string | undefined,
  siteName: string
): string {
  switch (layoutType) {
    case 'bar':
      return renderBarScores(scores, titleEn, category, description, siteName);
    case 'single':
      return renderSingleScore(scores[0]);
    case 'radar':
      // TODO: レーダーチャート実装
      return renderBarScores(scores, titleEn, category, description, siteName);
    case 'category':
      // TODO: カテゴリマトリクス実装
      return renderBarScores(scores, titleEn, category, description, siteName);
    default:
      return renderBarScores(scores, titleEn, category, description, siteName);
  }
}

/**
 * 共通CSSスタイル（シェアページ用 - B+C構成）
 */
function getSharedStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
      background: #faf8f5;
      min-height: 100vh;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Single score layout - card-brutal style */
    .single-score {
      text-align: center;
      padding: 2rem;
      background: white;
      border: 3px solid #000000;
      margin-bottom: 2rem;
      box-shadow: 4px 4px 0px #000000;
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
      background: #fafafa;
      border: 2px solid #000000;
    }

    /* CTA Section (Pattern B+C) - card-brutal style */
    .cta-section {
      background: white;
      border: 3px solid #000000;
      padding: 3rem 2rem;
      margin: 3rem 0;
      text-align: center;
      box-shadow: 4px 4px 0px #000000;
    }
    .cta-section h2 {
      font-size: 2rem;
      font-weight: 900;
      color: #1a1a1a;
      margin-bottom: 1rem;
      line-height: 1.3;
    }
    .cta-section p {
      font-size: 1.125rem;
      color: #4a4a4a;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .button-cta-large {
      display: inline-block;
      background: #000000;
      color: white;
      font-size: 1.25rem;
      font-weight: 900;
      padding: 1.25rem 3rem;
      text-decoration: none;
      border: 3px solid #000000;
      transition: all 0.2s;
      box-shadow: 4px 4px 0px #000000;
    }
    .button-cta-large:hover {
      background: #333;
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px #000000;
    }
    .features {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    .features div {
      font-size: 0.875rem;
      color: #666;
      font-weight: 600;
    }

    /* About Test Section (Pattern C) - card-brutal style */
    .about-test {
      background: white;
      border: 3px solid #000000;
      padding: 2rem;
      margin: 2rem 0;
      box-shadow: 4px 4px 0px #000000;
    }
    .about-test h3 {
      font-size: 1.5rem;
      font-weight: 900;
      color: #000000;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 3px solid #000000;
    }
    .about-test p {
      font-size: 1rem;
      color: #4a4a4a;
      line-height: 1.8;
      margin-bottom: 1rem;
    }
    .about-test .meta-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .meta-info-item {
      background: #fafafa;
      padding: 1rem;
      border: 2px solid #000000;
    }
    .meta-info-item strong {
      display: block;
      font-weight: 700;
      color: #000000;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .meta-info-item span {
      color: #666;
      font-size: 0.875rem;
    }

    /* Disclaimer - card-brutal style */
    .disclaimer {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #fff3cd;
      border: 3px solid #000000;
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1.6;
      box-shadow: 4px 4px 0px #000000;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .cta-section {
        padding: 2rem 1.5rem;
      }
      .cta-section h2 {
        font-size: 1.5rem;
      }
      .button-cta-large {
        font-size: 1rem;
        padding: 1rem 2rem;
      }
      .features {
        flex-direction: column;
        gap: 0.5rem;
      }
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

  const { titleEn, category, description } = testConfig.ogImage;
  const siteName = 'PSYCHOMETRIC LAB';

  // OG画像URL生成
  const ogParams = testConfig.ogImage.scoreToParams
    ? testConfig.ogImage.scoreToParams(
        Object.fromEntries(scores.map((s) => [s.key, s.score]))
      )
    : {};
  const ogImageUrl = buildOGImageUrl(origin, testConfig.id, ogParams);

  // HTML生成（B+C構成：ソーシャルプルーフ + 詳細説明）
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
    <!-- スコアカード表示 -->
    ${renderScores(scores, testConfig.ogImage.layoutType, titleEn, category, description, siteName)}

    <!-- CTA Section (Pattern B: ソーシャルプルーフ) -->
    <div class="cta-section">
      <h2>友達の結果を見ましたか？<br>あなたも診断してみませんか？</h2>
      <p>
        ${testConfig.scaleInfo.nameJa}で、あなたの特性を科学的に測定できます。<br>
        友達と結果を比較して、お互いをもっと理解しましょう！
      </p>

      <a href="${origin}${testConfig.basePath}" class="button-cta-large">
        無料で診断する（所要時間: 約${testConfig.scaleInfo.stats.minutes}分）
      </a>

      <div class="features">
        <div>✓ 完全無料</div>
        <div>✓ 会員登録不要</div>
        <div>✓ ${testConfig.scaleInfo.stats.questions}問</div>
      </div>
    </div>

    <!-- About Test Section (Pattern C: 詳細説明) -->
    <div class="about-test">
      <h3>この診断について</h3>
      <p>${testConfig.scaleInfo.description}</p>

      <div class="meta-info">
        <div class="meta-info-item">
          <strong>開発者</strong>
          <span>${testConfig.scaleInfo.developer}</span>
        </div>
        <div class="meta-info-item">
          <strong>信頼性</strong>
          <span>Cronbach's α = ${testConfig.scaleInfo.reliability.cronbachAlpha}</span>
        </div>
        <div class="meta-info-item">
          <strong>再テスト信頼性</strong>
          <span>${testConfig.scaleInfo.reliability.testRetest}</span>
        </div>
        <div class="meta-info-item">
          <strong>学術的信頼性</strong>
          <span>${testConfig.scaleInfo.tier} (引用論文数: ${testConfig.scaleInfo.citations})</span>
        </div>
      </div>
    </div>

    <!-- CTA Again (念押し) -->
    <div class="cta-section">
      <h2>今すぐ診断してみましょう</h2>
      <p>科学的根拠に基づいた信頼性の高い診断です。</p>
      <a href="${origin}${testConfig.basePath}" class="button-cta-large">
        診断スタート
      </a>
    </div>

    <!-- 免責事項 -->
    ${
      testConfig.ogImage?.disclaimer
        ? `<div class="disclaimer">${testConfig.ogImage.disclaimer}</div>`
        : ''
    }
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
