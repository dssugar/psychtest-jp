import { testRegistry } from '../../lib/tests/test-registry';

/**
 * Cloudflare Pages Function for dynamic share page with OG metadata
 *
 * クエリパラメータからスコアを読み取り、動的にOG画像URLを生成します。
 * SNSクローラーに正しいOGメタタグを返すため、サーバーサイドでHTMLを生成します。
 */
export const onRequest: PagesFunction<{ test: string }> = async (context) => {
  const { test } = context.params;
  const testString = Array.isArray(test) ? test[0] : test;
  const url = new URL(context.request.url);

  // Get config from test registry
  const config = testRegistry[testString as keyof typeof testRegistry];

  if (!config?.ogImage) {
    return new Response('Test not found', { status: 404 });
  }

  const { ogImage, scaleInfo, basePath } = config;

  // クエリパラメータからスコアを復元
  let ogImageUrl = `/og/${testString}`;
  if (ogImage.scoreToParams && url.searchParams.toString()) {
    // パラメータが存在する場合、OG画像URLにそのまま付与
    ogImageUrl = `/og/${testString}?${url.searchParams.toString()}`;
  }

  // 絶対URLに変換（OGメタタグには絶対URLが必要）
  const origin = url.origin;
  const fullOgImageUrl = `${origin}${ogImageUrl}`;
  const fullShareUrl = url.toString();

  // HTMLテンプレートを生成
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${scaleInfo.nameJa}結果 | スペクトル診断</title>
  <meta name="description" content="${scaleInfo.description}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${fullShareUrl}">
  <meta property="og:title" content="${scaleInfo.nameJa}結果">
  <meta property="og:description" content="${scaleInfo.description}">
  <meta property="og:image" content="${fullOgImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${fullShareUrl}">
  <meta name="twitter:title" content="${scaleInfo.nameJa}結果">
  <meta name="twitter:description" content="${scaleInfo.description}">
  <meta name="twitter:image" content="${fullOgImageUrl}">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 {
      font-size: 28px;
      font-weight: 900;
      margin-bottom: 16px;
      color: #111;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      color: #555;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-block;
      background: #111;
      color: white;
      text-decoration: none;
      font-size: 18px;
      font-weight: 700;
      padding: 16px 32px;
      border-radius: 8px;
      transition: all 0.2s;
      border: 3px solid #111;
    }
    .btn:hover {
      background: white;
      color: #111;
      transform: translateY(-2px);
    }
    .info {
      margin-top: 24px;
      font-size: 14px;
      color: #888;
    }
    .info strong {
      display: block;
      margin-top: 12px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${scaleInfo.nameJa}の結果をシェアされました</h1>
    <p>${scaleInfo.description}</p>
    <a href="${basePath}" class="btn">あなたも診断してみる</a>
    <div class="info">
      <div>✓ 完全無料 ✓ 会員登録不要</div>
      <div>✓ ${scaleInfo.stats.questions}問・所要時間 約${scaleInfo.stats.minutes}分</div>
      <strong>開発者: ${scaleInfo.developer}</strong>
      <strong>学術的信頼性: ${scaleInfo.tier}</strong>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};
