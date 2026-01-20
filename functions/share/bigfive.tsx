/**
 * Big Five診断結果のシェアページ（Cloudflare Pages Function）
 * 動的にHTMLを生成し、OGメタデータを含める
 */
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // スコアをURLパラメータから取得
  const e = url.searchParams.get('e') || '72'; // 外向性
  const a = url.searchParams.get('a') || '72'; // 協調性
  const c = url.searchParams.get('c') || '72'; // 誠実性
  const n = url.searchParams.get('n') || '72'; // 神経症傾向
  const o = url.searchParams.get('o') || '72'; // 開放性

  // OG画像URLを生成
  const origin = url.origin;
  const ogImageUrl = `${origin}/og/bigfive?e=${e}&a=${a}&c=${c}&n=${n}&o=${o}`;
  const shareUrl = url.toString();

  // スコアをパーセンテージに変換 (24-120 → 0-100)
  const toPercentage = (score: string) => Math.round(((parseInt(score) - 24) / 96) * 100);

  const dimensions = [
    { label: '外向性', score: e, percentage: toPercentage(e) },
    { label: '協調性', score: a, percentage: toPercentage(a) },
    { label: '誠実性', score: c, percentage: toPercentage(c) },
    { label: '神経症傾向', score: n, percentage: toPercentage(n) },
    { label: '開放性', score: o, percentage: toPercentage(o) },
  ];

  // HTMLページを生成
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Big Five性格診断結果 | 心理測定ラボ</title>

  <!-- Open Graph -->
  <meta property="og:title" content="Big Five性格診断結果">
  <meta property="og:description" content="科学的に裏付けられたBig Five性格診断の結果です">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Big Five性格診断結果">
  <meta name="twitter:description" content="科学的に裏付けられたBig Five性格診断の結果です">
  <meta name="twitter:image" content="${ogImageUrl}">

  <style>
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
      background: #3b82f6;
      border: 2px solid #1a1a1a;
      box-shadow: 4px 4px 0px #1a1a1a;
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
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Big Five性格診断結果</h1>

      ${dimensions.map(dim => `
        <div class="dimension">
          <div class="dimension-header">
            <span class="dimension-label">${dim.label}</span>
            <span class="dimension-score">${dim.score}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${dim.percentage}%"></div>
          </div>
        </div>
      `).join('')}

      <div class="info-box">
        <p>この結果をシェアして、友達と比較してみましょう！</p>
      </div>

      <div class="buttons">
        <a href="${origin}/bigfive" class="button button-primary">診断を受ける</a>
        <a href="${origin}/results/bigfive" class="button button-secondary">結果ページへ</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
    },
  });
};
