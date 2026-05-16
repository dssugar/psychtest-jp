/**
 * PersonaTheme — 占い世界の キャラ毎 theme.
 *
 * γ wedge で 月読 / 白虎 / 椿 / 千夜 / 賢者 の 5 キャラに展開する想定で、
 * 背景・立ち絵・配色・font・chat 装飾 を全部 theme オブジェクトに収める.
 * chat page は theme を 1 つ受け取って render するだけ.
 *
 * 別ドメイン切り出し時、`lib/uranai/theme/` + `public/uranai/themes/<id>/` を
 * 丸ごと持ち運べるよう asset path も theme 内で完結させる.
 */

export interface BackgroundLayer {
  /** image path. SVG / PNG / WebP どれでも. */
  src: string;
  /** layer opacity 0-1. デフォルト 1.0 */
  opacity?: number;
  /** CSS mix-blend-mode (= "screen" で星を月光と融合 等) */
  blendMode?:
    | "normal"
    | "screen"
    | "multiply"
    | "overlay"
    | "soft-light"
    | "lighten";
  /** parallax 視差量 0-1 (= 0 で固定, 0.2 で軽く動く). α では未使用、β 以降. */
  parallax?: number;
}

export interface CharacterLayer {
  /** 立ち絵 image path */
  src: string;
  /** 画面上の配置 */
  position: "center" | "right" | "left";
  /** viewport 高さに対する立ち絵の比率 (例: 0.7 = 70vh) */
  scale: number;
  /** 横方向の offset (= viewport 幅に対する比率, position が center 以外時に効く) */
  offsetX?: number;
  /** 縦方向の offset (= viewport 高さに対する比率, 0 で下端) */
  offsetY?: number;
  /** CSS keyframe で呼吸感を出すか (= scale が微振動) */
  breath?: boolean;
  /** β で表情差分 (id → image path). α は未使用. */
  moods?: Record<string, string>;
}

export interface ThemePalette {
  /** body 背景色 (= flash 防止用、最下層) */
  bg: string;
  /** chat bubble surface (= 半透明 rgba 推奨) */
  surface: string;
  /** 主テキスト */
  text: string;
  /** 補助テキスト (= timestamp, label) */
  textDim: string;
  /** 主 accent (= 金 / 朱 / 翡翠 等) */
  accent: string;
  /** 補 accent (= 月光 / 紫 / 蒼 等) */
  accent2: string;
  /** error / mental health alert */
  error: string;
}

export interface ThemeFont {
  /** 主テキスト用 (serif 推奨) */
  serif: string;
  /** UI label / 補助 (sans) */
  sans: string;
  /** code / timestamp (mono) */
  mono: string;
}

export interface ChatBubbleStyle {
  /**
   * bubble 装飾スタイル:
   * - frosted: backdrop-blur + 半透明 surface (= 月読: 月光に滲む)
   * - lined:   無背景 + 1 本の罫線 (= 賢者: 紙の上の墨書きのような)
   * - minimal: 透明 + 細い outline (= 椿: 簡素な茶室)
   * - ink-wash: 不規則 border + 水墨タッチ (= 白虎: 朱の社の力強さ)
   */
  bubbleStyle: "frosted" | "lined" | "minimal" | "ink-wash";
  /** bubble opacity (= 0 で完全透明, 1 で不透明). frosted の base alpha. */
  bubbleOpacity: number;
  /** CSS border 値 (= "1px solid rgba(...,0.25)" 等) */
  bubbleBorder: string;
  /** backdrop-filter blur 値 (px). frosted style 時のみ効く. */
  bubbleBlurPx: number;
  /** bubble 配置: center-bottom = ADV 字幕風, left/right = chat 風 */
  bubbleAlign: "center-bottom" | "left-right";
}

export interface PersonaTheme {
  /** 一意 ID. registry key と一致させる. */
  id: string;
  /** 表示名 */
  name: string;
  /** 漢字 / かな ふりがな (= 立ち絵下に表示するならこれを使う) */
  reading?: string;

  background: {
    /** 最下層 fallback (= image load 前 / 失敗時の単色) */
    baseColor: string;
    /** 下から上に重ねる layer 配列 */
    layers: BackgroundLayer[];
  };

  character: CharacterLayer;
  palette: ThemePalette;
  font: ThemeFont;
  chat: ChatBubbleStyle;
}
