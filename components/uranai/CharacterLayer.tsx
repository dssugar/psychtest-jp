/**
 * Character layer — 立ち絵を画面に重ねる. theme.character.{position, scale, breath}
 * から CSS を組み立てる. β で表情差分 (mood) 切替えを追加予定.
 *
 * 現在は <img>. 将来 VRM 化する時はこの component の中身を
 * three.js + @pixiv/three-vrm に差し替えれば、呼び出し側は無変更で済む.
 */

import type { PersonaTheme } from "@/lib/uranai/theme/types";

interface Props {
  theme: PersonaTheme;
  /** β で利用. 表情 id (= theme.character.moods のキー). 未指定なら default src. */
  mood?: string;
}

export function CharacterLayer({ theme, mood }: Props) {
  const { character } = theme;
  const src = (mood && character.moods?.[mood]) || character.src;

  const heightVh = character.scale * 100;
  const positionCss =
    character.position === "left"
      ? { left: `${(character.offsetX ?? 0.05) * 100}%`, transform: "translateY(0)" }
      : character.position === "right"
      ? { right: `${(character.offsetX ?? 0.05) * 100}%`, transform: "translateY(0)" }
      : { left: "50%", transform: "translateX(-50%)" };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        bottom: `${(character.offsetY ?? 0) * 100}%`,
        height: `${heightVh}vh`,
        ...positionCss,
      }}
      aria-hidden
    >
      <img
        src={src}
        alt={theme.name}
        className={character.breath ? "uranai-breath" : ""}
        style={{
          height: "100%",
          width: "auto",
          objectFit: "contain",
          // 立ち絵の下端が viewport 下端に揃うように
          display: "block",
        }}
      />
    </div>
  );
}
