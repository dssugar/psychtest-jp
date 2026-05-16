import type { PersonaTheme } from "./types";

/**
 * 月読 (つくよみ) theme.
 *
 * persona: 月夜の塔の頂きに住まう静謐な男性の占い師.
 *          詩的・控えめ・タロット + 西洋占星術派.
 *
 * 視覚方針:
 *   - dark navy 夜空 base + 月光 ivory text
 *   - 金色 accent (= 月光 / 蝋燭の灯り / タロットの金縁)
 *   - 紫 accent2 (= 星 / 西洋占星術)
 *   - chat bubble は frosted (= backdrop-blur で月光に滲む)
 *   - 立ち絵 = 画面中央背面 (= 案 4 ベース), 大きめ scale (= 0.7)
 *
 * α では asset が ComfyUI 生成 placeholder. β/γ で本番 PNG/WebP に差し替え.
 * 差し替え時は src 文字列を更新するだけ.
 */
export const tsukuyomiTheme: PersonaTheme = {
  id: "tsukuyomi",
  name: "月読",
  reading: "つくよみ",

  background: {
    baseColor: "#0d0d1f",
    layers: [
      // 暫定: 1 枚で空 + 星 + 塔をまとめた SVG.
      // ComfyUI で生成し直す時は sky.png / stars.png / tower.png に分離して
      // ここを 3 layer 配列に展開する (parallax + blendMode が活きる).
      { src: "/uranai/themes/tsukuyomi/background.svg", opacity: 1.0, parallax: 0 },
    ],
  },

  character: {
    src: "/uranai/themes/tsukuyomi/character.svg",
    position: "center",
    scale: 0.7,
    offsetY: 0,
    breath: true,
  },

  palette: {
    bg: "#0d0d1f",
    surface: "rgba(240, 233, 214, 0.08)", // 月光色 8% 透明 (= frosted の base)
    text: "#f0e9d6",
    textDim: "#c8c2b1",
    accent: "#f7c45c",
    accent2: "#5a6fd8",
    error: "#d88faf",
  },

  font: {
    serif: "var(--font-tsuki-serif), 'Hiragino Mincho ProN', 'YuMincho', serif",
    sans: "var(--font-tsuki-sans), sans-serif",
    mono: "var(--font-tsuki-mono), monospace",
  },

  chat: {
    bubbleStyle: "frosted",
    bubbleOpacity: 0.28,
    bubbleBorder: "1px solid rgba(240, 233, 214, 0.22)",
    bubbleBlurPx: 14,
    bubbleAlign: "left-right",
  },
};
