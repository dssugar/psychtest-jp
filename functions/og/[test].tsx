import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api';
import {
  OG_COLORS,
  OG_SIZE,
  OG_LAYOUT,
  OG_TYPOGRAPHY,
} from '../../lib/og-design/constants';
import { testRegistry } from '../../lib/tests/test-registry';

// Color mapping for test types
const COLOR_MAP: Record<string, string> = {
  pink: '#ec4899',
  orange: '#f97316',
  cyan: '#06b6d4',
  yellow: '#eab308',
  purple: '#a855f7',
  green: '#10b981',
  blue: '#3b82f6',
};

// Cloudflare Pages Function for dynamic OG image generation
export const onRequest: PagesFunction<{ test: string }> = async (context) => {
  const { test } = context.params;
  const testString = Array.isArray(test) ? test[0] : test;
  const url = new URL(context.request.url);

  // Get config from test registry
  const config = testRegistry[testString as keyof typeof testRegistry];

  // すべてのテストがogImageを持つことを前提とする
  // 存在しないテストの場合は404を返す
  if (!config?.ogImage) {
    return new Response('Test not found', { status: 404 });
  }

  const { ogImage } = config;

  // すべてのテストでバーレイアウトを使用（1次元も複数次元も統一）
  return renderDimensionBarOG(url, config);
};

/**
 * 次元データのバーレイアウトOG画像生成（全テスト共通）
 * 1次元～5次元すべてに対応（getDimensionsから取得）
 */
async function renderDimensionBarOG(url: URL, config: any) {
  // フォント読み込み（Google Fontsから）
  const fontDataBold = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap'
  ).then(async (res) => {
    const css = await res.text();
    const fontUrl = css.match(/src: url\((.+?)\)/)?.[1];
    if (!fontUrl) throw new Error('Font URL not found');
    return fetch(fontUrl).then((r) => r.arrayBuffer());
  });

  const fontDataBlack = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&display=swap'
  ).then(async (res) => {
    const css = await res.text();
    const fontUrl = css.match(/src: url\((.+?)\)/)?.[1];
    if (!fontUrl) throw new Error('Font URL not found');
    return fetch(fontUrl).then((r) => r.arrayBuffer());
  });

  // config.ogImage.paramsToScore() でスコアを復元
  const testResult = config.ogImage.paramsToScore(url.searchParams);

  // config.getDimensions() で次元データを構築
  const dimensions = config.getDimensions(testResult);

  // ランダムID（装飾用）
  const reportId = Math.floor(Math.random() * 90000) + 10000;

  // タイトルを改行で分割（\nがある場合）
  const titleLines = config.ogImage.titleEn.split('\n');
  const descriptionLines = config.ogImage.description.split('\n');

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: `${OG_SIZE.width}px`,
          height: `${OG_SIZE.height}px`,
          backgroundColor: OG_COLORS.canvasBg,
          border: `${OG_LAYOUT.cardBorder}px solid ${OG_COLORS.border}`,
          fontFamily: '"Noto Sans JP", sans-serif',
          flexDirection: 'row',
        }}
      >
        {/* 左カラム：タイトルとブランド情報（黒背景・白文字） */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: `${OG_LAYOUT.leftWidth}px`,
            backgroundColor: OG_COLORS.leftBg,
            color: OG_COLORS.leftText,
            padding: `${OG_LAYOUT.leftPadding}px 40px`,
            justifyContent: 'space-between',
            borderRight: `${OG_LAYOUT.leftBorder}px solid ${OG_COLORS.border}`,
          }}
        >
          {/* 上部：タイトルエリア */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: `${OG_TYPOGRAPHY.brandSize}px`,
                fontWeight: OG_TYPOGRAPHY.brandWeight,
                color: '#F9FAFB',
                letterSpacing: OG_TYPOGRAPHY.brandLetterSpacing,
                marginBottom: '20px',
                borderBottom: '2px solid #333',
                paddingBottom: '10px',
                alignSelf: 'flex-start',
              }}
            >
              PSYCHOMETRIC LAB
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: `${OG_TYPOGRAPHY.titleSize}px`,
                fontWeight: OG_TYPOGRAPHY.titleWeight,
                lineHeight: OG_TYPOGRAPHY.titleLineHeight,
                letterSpacing: OG_TYPOGRAPHY.titleLetterSpacing,
              }}
            >
              {titleLines.map((line: string, index: number) => (
                <span
                  key={index}
                  style={{
                    display: 'flex',
                    color: index === 0 ? OG_COLORS.leftText : OG_COLORS.leftTextSecondary,
                  }}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>

          {/* 下部：装飾・メタ情報 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: `${OG_TYPOGRAPHY.subtitleSize}px`,
                fontWeight: OG_TYPOGRAPHY.subtitleWeight,
                marginBottom: '12px',
              }}
            >
              {config.ogImage.category}
            </div>

            {/* 説明文 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: `${OG_TYPOGRAPHY.descSize}px`,
                color: OG_COLORS.leftTextMuted,
                lineHeight: OG_TYPOGRAPHY.descLineHeight,
                marginBottom: '24px',
              }}
            >
              {descriptionLines.map((line: string, index: number) => (
                <span key={index} style={{ display: 'flex' }}>
                  {line}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: OG_COLORS.highlightBg,
                padding: `${OG_TYPOGRAPHY.subtitlePaddingY}px ${OG_TYPOGRAPHY.subtitlePaddingX}px`,
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: `${OG_TYPOGRAPHY.idSize}px`,
                  marginRight: '10px',
                }}
              >
                ID
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: `${OG_TYPOGRAPHY.subtitleSize}px`,
                  fontWeight: OG_TYPOGRAPHY.titleWeight,
                  fontFamily: '"Noto Sans JP", monospace',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {reportId}
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム：データエリア */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            backgroundColor: OG_COLORS.rightBg,
            backgroundImage: OG_COLORS.gridPattern,
            backgroundSize: `${OG_COLORS.gridSize} ${OG_COLORS.gridSize}`,
            padding: `${OG_LAYOUT.rightPaddingY}px ${OG_LAYOUT.rightPaddingX}px`,
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {dimensions.map((item: any, index: number) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: index === dimensions.length - 1 ? '0' : `${OG_LAYOUT.barGap}px`,
              }}
            >
              {/* 項目名（同期拡大） */}
              <div
                style={{
                  display: 'flex',
                  width: `${OG_LAYOUT.labelWidth}px`,
                  fontSize: `${OG_TYPOGRAPHY.labelSize}px`,
                  fontWeight: OG_TYPOGRAPHY.labelWeight,
                  color: OG_COLORS.textMain,
                }}
              >
                {item.label}
              </div>

              {/* バーエリア（極太化） */}
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  height: `${OG_LAYOUT.barHeight}px`,
                  backgroundColor: OG_COLORS.trackBg,
                  border: `${OG_LAYOUT.barBorder}px solid ${OG_COLORS.border}`,
                  marginRight: `${OG_LAYOUT.barRightMargin}px`,
                  boxShadow: OG_COLORS.barShadow,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: `${item.percentage}%`,
                    height: '100%',
                    backgroundColor: item.color,
                    borderRight: `${OG_LAYOUT.barBorder}px solid ${OG_COLORS.border}`,
                  }}
                />
              </div>

              {/* スコア（等幅フォント + さらに巨大化） */}
              <div
                style={{
                  display: 'flex',
                  fontSize: `${OG_TYPOGRAPHY.scoreSize}px`,
                  fontWeight: OG_TYPOGRAPHY.scoreWeight,
                  color: OG_COLORS.textMain,
                  width: `${OG_LAYOUT.scoreWidth}px`,
                  justifyContent: 'flex-end',
                  lineHeight: 1,
                  fontFamily: '"Noto Sans JP", monospace',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {item.score}
              </div>
            </div>
          ))}

          {/* ウォーターマーク */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              fontSize: '16px',
              color: OG_COLORS.textMain,
              opacity: 0.2,
              fontWeight: OG_TYPOGRAPHY.brandWeight,
            }}
          >
            psychtest.jp
          </div>
        </div>
      </div>
    ),
    {
      width: OG_SIZE.width,
      height: OG_SIZE.height,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontDataBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Noto Sans JP',
          data: fontDataBlack,
          style: 'normal',
          weight: 900,
        },
      ],
    }
  );
}

/**
 * Industriousness OG画像生成（2バーレイアウト）
 */
