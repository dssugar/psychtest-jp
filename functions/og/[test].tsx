import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api';
import {
  OG_COLORS,
  OG_SIZE,
  OG_LAYOUT,
  OG_TYPOGRAPHY,
  DIMENSION_NAMES,
  DIMENSION_ORDER,
} from '../../lib/og-design/constants';
import type { DimensionKey } from '../../lib/og-design/types';
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

  if (!config?.ogImage) {
    return renderFallbackOG(testString);
  }

  const { ogImage } = config;

  // Route by layout type
  switch (ogImage.layoutType) {
    case 'bar':
      // For Big Five and Industriousness
      if (testString === 'bigfive') {
        return renderBigFiveOG(url);
      } else if (testString === 'industriousness') {
        return renderIndustriousnessOG(url, config);
      }
      return renderFallbackOG(testString);

    case 'single':
      // For single-score tests
      return renderSingleScoreOG(url, {
        titleEn: ogImage.titleEn || 'TEST',
        category: ogImage.category || 'Diagnosis',
        description: ogImage.description || '',
        color: COLOR_MAP[config.color] || '#3b82f6',
        maxScore: ogImage.scoreDisplay?.max || 100,
        unit: ogImage.scoreDisplay?.unit || '',
      });

    default:
      return renderFallbackOG(testString);
  }
};

/**
 * Fallback OG image for tests without OG config
 */
function renderFallbackOG(test: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: `${OG_SIZE.width}px`,
          height: `${OG_SIZE.height}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: OG_COLORS.canvasBg,
          color: OG_COLORS.textMain,
        }}
      >
        <h1 style={{ fontSize: '72px', fontWeight: 900, margin: 0 }}>
          心理測定ラボ
        </h1>
        <p style={{ fontSize: '48px', marginTop: '20px' }}>
          {test} 診断結果
        </p>
      </div>
    ),
    {
      width: OG_SIZE.width,
      height: OG_SIZE.height,
    }
  );
}

/**
 * Big Five OG画像生成（Dense & Bold デザイン with Noto Sans JP）
 */
async function renderBigFiveOG(url: URL) {
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


  // クエリパラメータからスコアを取得
  const scores: Record<DimensionKey, number> = {
    extraversion: parseInt(url.searchParams.get('e') || '72'),
    agreeableness: parseInt(url.searchParams.get('a') || '72'),
    conscientiousness: parseInt(url.searchParams.get('c') || '72'),
    neuroticism: parseInt(url.searchParams.get('n') || '72'),
    openness: parseInt(url.searchParams.get('o') || '72'),
  };

  // スコアをパーセンテージに変換 (24-120 → 0-100)
  const toPercentage = (score: number) => Math.round(((score - 24) / 96) * 100);

  // DIMENSION_ORDERに従って次元データを構築
  const dimensions = DIMENSION_ORDER.map((key) => ({
    key,
    label: DIMENSION_NAMES[key],
    score: scores[key],
    percentage: toPercentage(scores[key]),
    color: OG_COLORS.dimensions[key],
  }));

  // ランダムID（装飾用）
  const reportId = Math.floor(Math.random() * 90000) + 10000;

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
              <span style={{ display: 'flex' }}>BIG</span>
              <span style={{ display: 'flex', color: OG_COLORS.leftTextSecondary }}>FIVE</span>
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
              性格特性診断
            </div>

            {/* 説明文の復活 */}
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
              <span style={{ display: 'flex' }}>科学的根拠に基づいた</span>
              <span style={{ display: 'flex' }}>5つの主要特性スコアレポート</span>
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
          {dimensions.map((item, index) => (
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
 * Single Score OG画像生成（1次元スコア用）
 */
interface SingleScoreOGConfig {
  titleEn: string;
  category: string;
  description: string;
  color: string;
  maxScore: number;
  unit: string;
}

async function renderSingleScoreOG(url: URL, config: SingleScoreOGConfig) {
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

  // クエリパラメータからスコアを取得（デフォルト値は最大値の60%）
  const defaultScore = Math.round(config.maxScore * 0.6);
  const score = parseInt(url.searchParams.get('score') || String(defaultScore));
  const percentage = Math.round((score / config.maxScore) * 100);

  // タイトルを行分割（\nで分割）
  const titleLines = config.titleEn.split('\n');

  // ランダムID（装飾用）
  const reportId = Math.floor(Math.random() * 90000) + 10000;

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
              {titleLines.map((line, i) => (
                <span
                  key={i}
                  style={{
                    display: 'flex',
                    color: i === 0 ? OG_COLORS.leftText : OG_COLORS.leftTextSecondary,
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
              {config.category}
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
              {config.description.split('\n').map((line, i) => (
                <span key={i} style={{ display: 'flex' }}>
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

        {/* 右カラム：スコア表示エリア */}
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
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* スコア数値（超大） */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '180px',
                fontWeight: 900,
                color: config.color,
                fontFamily: '"Noto Sans JP", monospace',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '72px',
                fontWeight: 700,
                color: OG_COLORS.textMain,
                marginLeft: '16px',
              }}
            >
              / {config.maxScore}
            </div>
          </div>

          {/* プログレスバー */}
          <div
            style={{
              display: 'flex',
              width: '600px',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* バー */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '60px',
                backgroundColor: OG_COLORS.trackBg,
                border: `${OG_LAYOUT.barBorder}px solid ${OG_COLORS.border}`,
                boxShadow: OG_COLORS.barShadow,
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: config.color,
                  borderRight: `${OG_LAYOUT.barBorder}px solid ${OG_COLORS.border}`,
                }}
              />
            </div>

            {/* パーセンテージ */}
            <div
              style={{
                display: 'flex',
                fontSize: '48px',
                fontWeight: 900,
                color: OG_COLORS.textMain,
                marginTop: '24px',
              }}
            >
              {percentage}%
            </div>
          </div>

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
async function renderIndustriousnessOG(url: URL, config: any) {
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

  // クエリパラメータからスコアを取得（デフォルト値）
  const c4 = parseInt(url.searchParams.get('c4') || '30');
  const c5 = parseInt(url.searchParams.get('c5') || '30');

  // testResult オブジェクトを構築
  const testResult = {
    c4_achievement: c4,
    c5_discipline: c5,
  };

  // config.getDimensions() を使用してデータソースを統一
  const dimensions = config.getDimensions?.(testResult) || [];

  // ランダムID（装飾用）
  const reportId = Math.floor(Math.random() * 90000) + 10000;

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
                fontSize: '80px',
                fontWeight: OG_TYPOGRAPHY.titleWeight,
                lineHeight: OG_TYPOGRAPHY.titleLineHeight,
                letterSpacing: OG_TYPOGRAPHY.titleLetterSpacing,
              }}
            >
              <span style={{ display: 'flex' }}>INDUSTRI-</span>
              <span style={{ display: 'flex', color: OG_COLORS.leftTextSecondary }}>OUSNESS</span>
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
              勤勉性診断
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
              <span style={{ display: 'flex' }}>やり抜く力を測定</span>
              <span style={{ display: 'flex' }}>2つの次元で評価</span>
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
                marginBottom: index === dimensions.length - 1 ? '0' : '60px',
              }}
            >
              {/* 項目名 */}
              <div
                style={{
                  display: 'flex',
                  width: '200px',
                  fontSize: '36px',
                  fontWeight: OG_TYPOGRAPHY.labelWeight,
                  color: OG_COLORS.textMain,
                }}
              >
                {item.label}
              </div>

              {/* バーエリア */}
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  height: '80px',
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

              {/* スコア */}
              <div
                style={{
                  display: 'flex',
                  fontSize: '60px',
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
