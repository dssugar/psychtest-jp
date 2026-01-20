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

  // 単一スコアかどうかを判定
  const isSingleScore = dimensions.length === 1;

  // 単一スコア専用データ（存在する場合のみ取得）
  const levelLabel = isSingleScore && config.ogImage.getLevelLabel
    ? config.ogImage.getLevelLabel(testResult)
    : null;
  const shortInterpretation = isSingleScore && config.ogImage.getShortInterpretation
    ? config.ogImage.getShortInterpretation(testResult)
    : null;
  const scaleMarkers = isSingleScore ? config.ogImage.scaleMarkers : null;
  const scoreRanges = isSingleScore ? config.ogImage.scoreRanges : null;

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
            justifyContent: isSingleScore ? 'space-between' : 'center',
            position: 'relative',
          }}
        >
          {/* 単一スコアの場合：3段レイアウト */}
          {isSingleScore && levelLabel ? (
            <>
              {/* 上段：判定ラベル */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '30px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: '72px',
                    fontWeight: 900,
                    color: OG_COLORS.textMain,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {levelLabel}
                </div>
              </div>

              {/* 中段：スコア + バー + 境界線ラベル */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '30px',
                }}
              >
                {/* スコア数値（バーの上、中央配置） */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: `${OG_TYPOGRAPHY.scoreSize}px`,
                      fontWeight: OG_TYPOGRAPHY.scoreWeight,
                      color: OG_COLORS.textMain,
                      lineHeight: 1,
                      fontFamily: '"Noto Sans JP", monospace',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {dimensions[0].score}
                  </div>
                </div>

                {/* バーエリア（境界線を含む） */}
                <div
                  style={{
                    display: 'flex',
                    position: 'relative',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      height: `${OG_LAYOUT.barHeight}px`,
                      backgroundColor: OG_COLORS.trackBg,
                      border: `${OG_LAYOUT.barBorder}px solid ${OG_COLORS.border}`,
                      boxShadow: OG_COLORS.barShadow,
                      position: 'relative',
                    }}
                  >
                    {/* 進捗バー */}
                    <div
                      style={{
                        display: 'flex',
                        width: `${dimensions[0].percentage}%`,
                        height: '100%',
                        backgroundColor: dimensions[0].color,
                        borderRight: `${OG_LAYOUT.barBorder}px solid ${OG_COLORS.border}`,
                      }}
                    />

                    {/* 区分境界線（バーの中） */}
                    {scoreRanges && scoreRanges.length > 0 && (() => {
                      const minScore = Math.min(...scoreRanges.map((r: { min: number }) => r.min));
                      const maxScore = Math.max(...scoreRanges.map((r: { max: number }) => r.max));
                      const totalRange = maxScore - minScore;

                      return scoreRanges.map((range: { min: number; max: number; label: string }, index: number) => {
                        if (index === 0) return null; // 最初の境界線はスキップ
                        const leftPercent = ((range.min - minScore) / totalRange) * 100;
                        return (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              position: 'absolute',
                              left: `${leftPercent}%`,
                              top: 0,
                              bottom: 0,
                              width: '2px',
                              backgroundColor: OG_COLORS.textMain,
                              opacity: 0.4,
                            }}
                          />
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* ラベル（バーの下） */}
                {scoreRanges && scoreRanges.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      position: 'relative',
                      width: '100%',
                      height: '24px',
                      marginTop: '8px',
                    }}
                  >
                    {(() => {
                      const minScore = Math.min(...scoreRanges.map((r: { min: number }) => r.min));
                      const maxScore = Math.max(...scoreRanges.map((r: { max: number }) => r.max));
                      const totalRange = maxScore - minScore;

                      // 境界線の位置を配列化（例: [10, 20, 30, 40]）
                      const boundaries = [minScore, ...scoreRanges.slice(1).map((r: { min: number }) => r.min), maxScore];

                      return scoreRanges.map((range: { min: number; max: number; label: string }, index: number) => {
                        // 区間の開始と終了位置
                        const rangeStart = boundaries[index];
                        const rangeEnd = boundaries[index + 1];
                        // 区間の中央値
                        const centerValue = (rangeStart + rangeEnd) / 2;
                        // 中央値の位置（%）
                        const centerPercent = ((centerValue - minScore) / totalRange) * 100;

                        return (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              position: 'absolute',
                              left: `${centerPercent}%`,
                              transform: 'translateX(-50%)',
                              fontSize: '18px',
                              fontWeight: 700,
                              color: OG_COLORS.textMain,
                            }}
                          >
                            {range.label}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* 下段：解説文 */}
              {shortInterpretation && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#F3F4F6',
                    padding: '24px',
                    border: `3px solid ${OG_COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: OG_COLORS.textMain,
                      lineHeight: 1.6,
                    }}
                  >
                    {shortInterpretation.split('\n').map((line: string, index: number) => (
                      <span key={index} style={{ display: 'flex' }}>
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // 複数スコアの場合：既存のバーレイアウト
            <>
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
            </>
          )}

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
