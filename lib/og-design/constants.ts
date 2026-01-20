/**
 * OG画像とResultSummaryCardで共有するデザイン定数
 *
 * デザインコンセプト: Dense & Bold（高密度・高コントラスト）
 * この定数を変更すると、両方のビジュアルが統一的に更新されます
 */

/**
 * OG画像サイズ（Open Graph標準）
 */
export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

/**
 * カラーパレット（Dense & Bold - 高密度・高コントラスト）
 */
export const OG_COLORS = {
  // 背景
  canvasBg: '#FFFFFF',          // キャンバス背景（白）
  cardBg: '#FFFFFF',            // カード背景（白）
  leftBg: '#111111',            // 左側背景（黒反転）
  rightBg: '#F9FAFB',           // 右側背景（薄いグレー）

  // テキスト（左カラム - 黒背景用）
  leftText: '#FFFFFF',          // 左側テキスト（白）
  leftTextMuted: '#9CA3AF',     // 左側説明文（グレー）
  leftTextSecondary: '#E5E7EB', // 左側セカンダリテキスト

  // テキスト
  textMain: '#111111',          // メインテキスト（真っ黒）
  highlightBg: '#333333',       // ハイライト背景（ダークグレー）
  highlightText: '#FFFFFF',     // ハイライトテキスト（白）

  // 構造
  border: '#111111',            // 枠線色（黒）
  cardBorder: 12,               // カード枠線の太さ（極太）
  cardShadowX: 0,               // カードシャドウX（なし）
  cardShadowY: 0,               // カードシャドウY（なし）
  leftBorder: 8,                // 左カラム右枠線
  innerBorder: 3,               // 内側の枠線

  // プログレスバー
  trackBg: '#FFFFFF',           // バー背景（白）
  barShadow: '4px 4px 0px 0px #111111', // バーの影（ブルータリズム）

  // グリッドパターン（不透明度を下げて質感程度に）
  gridPattern: 'radial-gradient(circle, rgba(206, 206, 206, 0.4) 2px, transparent 2.5px)',
  gridSize: '30px',

  // Big Five 次元カラー
  dimensions: {
    extraversion: '#3b82f6',      // 青 - 外向性
    agreeableness: '#ec4899',     // ピンク - 協調性
    conscientiousness: '#10b981', // 緑 - 誠実性
    neuroticism: '#f97316',       // オレンジ - 神経症傾向
    openness: '#8b5cf6',          // 紫 - 開放性
  },
} as const;

/**
 * レイアウト定数（Dense & Bold - 高密度・高コントラスト）
 */
export const OG_LAYOUT = {
  // カード全体（Full Bleed - 余白なし）
  cardWidth: 1200,              // カード幅（全幅）
  cardHeight: 630,              // カード高さ（全高）
  cardBorder: 12,               // カード枠線（極太）
  cardShadowX: 0,               // シャドウX（なし）
  cardShadowY: 0,               // シャドウY（なし）

  // 左カラム
  leftWidth: 400,               // 1/3強
  leftPadding: 50,              // パディング（広め）
  leftBorder: 8,                // 右枠線

  // 右カラム（グラフ最大化）
  rightPaddingX: 40,            // さらに削減（60→40）
  rightPaddingY: 20,            // 極限まで詰める（30→20）

  // プログレスバー（極太化 + ゆとりある間隔）
  barHeight: 68,                // さらに拡大（60→68）
  barBorder: 3,                 // バー枠線（太く）
  barGap: 32,                   // ゆとりある呼吸感（28→32）
  barRightMargin: 24,           // バーとスコア間

  // ラベルとスコア（同期拡大）
  labelWidth: 170,
  scoreWidth: 90,
} as const;

/**
 * タイポグラフィ（Dense & Bold - 高密度・高コントラスト）
 */
export const OG_TYPOGRAPHY = {
  // ブランド名
  brandSize: 20,
  brandWeight: 700,
  brandLetterSpacing: '0.15em',

  // タイトル（BIG FIVE）
  titleSize: 100,               // 巨大化
  titleWeight: 900,
  titleLineHeight: 0.85,
  titleLetterSpacing: '-0.02em',

  // サブタイトル（性格特性診断）
  subtitleSize: 32,
  subtitleWeight: 700,
  subtitlePaddingX: 20,
  subtitlePaddingY: 12,

  // 説明文
  descSize: 20,
  descLineHeight: 1.5,

  // ID
  idSize: 24,
  idWeight: 700,

  // スコアラベル（同期拡大）
  labelSize: 32,                // 28→32
  labelWeight: 700,

  // スコア数値（さらに巨大化）
  scoreSize: 96,                // 48→56→96
  scoreWeight: 900,
} as const;

/**
 * Big Five 次元名（日本語）
 */
export const DIMENSION_NAMES = {
  extraversion: '外向性',
  agreeableness: '協調性',
  conscientiousness: '誠実性',
  neuroticism: '神経症傾向',
  openness: '開放性',
} as const;

/**
 * Big Five 次元の表示順序
 */
export const DIMENSION_ORDER = [
  'extraversion',
  'agreeableness',
  'conscientiousness',
  'neuroticism',
  'openness',
] as const;

/**
 * テストカラーマッピング（全single-scoreテスト共通）
 * TestConfigのcolorフィールドからカラーコードへの変換
 */
export const TEST_COLOR_MAP: Record<string, string> = {
  pink: '#ec4899',
  orange: '#f97316',
  cyan: '#06b6d4',
  yellow: '#eab308',
  purple: '#a855f7',
  green: '#10b981',
  blue: '#3b82f6',
  black: '#111111',
} as const;
