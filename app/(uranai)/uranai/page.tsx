"use client";

/**
 * /uranai/ — 占い世界の入口 (= persona 選択 hub).
 *
 * α: 月読 1 人のみ. 画面いっぱい canvas + 月読立ち絵 + 「月読に問う」CTA + サブで draw / settings.
 * γ: themeRegistry に登録された persona が増えると、自動で grid 化 (= 各キャラ card).
 *
 * 構造は chat page と同じ layered canvas を使う. α では「最も大きく月読 1 人を見せる」
 * 形にして、複数 persona 化 (γ) した時に layout を grid に切り替える条件分岐が入る.
 */

import Link from "next/link";
import { themeRegistry } from "@/lib/uranai/theme/registry";
import { BackgroundLayers } from "@/components/uranai/BackgroundLayers";
import { CharacterLayer } from "@/components/uranai/CharacterLayer";
import type { PersonaTheme } from "@/lib/uranai/theme/types";

export default function UranaiIndexPage() {
  const personas: PersonaTheme[] = Object.values(themeRegistry);

  // α: 1 persona = full canvas でひと際大きく見せる
  if (personas.length === 1) {
    const theme = personas[0];
    return <SinglePersonaHero theme={theme} />;
  }

  // γ: 複数 persona = grid hub (= 未実装、文言だけ用意)
  return <MultiPersonaHub personas={personas} />;
}

// ============================================================
// α: 1 人だけの hero layout
// ============================================================

function SinglePersonaHero({ theme }: { theme: PersonaTheme }) {
  return (
    <main
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: theme.palette.bg }}
    >
      <BackgroundLayers theme={theme} />
      <CharacterLayer theme={theme} />

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* タイトル area (= 画面上端) */}
        <div className="shrink-0 px-4 pt-6 pointer-events-auto">
          <div className="max-w-[760px] mx-auto text-center">
            <p
              className="text-[10px] tracking-[0.4em] uppercase"
              style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
            >
              URANAI
            </p>
            <h1
              className="mt-2 text-4xl md:text-5xl"
              style={{
                color: theme.palette.text,
                fontFamily: theme.font.serif,
                fontWeight: 700,
                letterSpacing: "0.3em",
              }}
            >
              {theme.name}
            </h1>
            {theme.reading && (
              <p
                className="mt-1 text-xs tracking-widest"
                style={{ color: theme.palette.textDim, fontFamily: theme.font.serif }}
              >
                {theme.reading}
              </p>
            )}
          </div>
        </div>

        {/* CTA area (= 画面下端) */}
        <div className="flex-1 flex items-end px-4 pb-8 pointer-events-auto">
          <div className="max-w-[640px] mx-auto w-full">
            <div
              className="rounded-sm p-5 text-center"
              style={{
                backgroundColor: theme.palette.surface,
                backdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
                WebkitBackdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
                border: theme.chat.bubbleBorder,
                color: theme.palette.text,
              }}
            >
              <p
                className="text-sm leading-loose mb-5"
                style={{ fontFamily: theme.font.serif }}
              >
                月夜の塔の頂きに、{theme.name}が静かに待っています。
                <br />
                あなたの心の輪郭を、星と月光に映してみませんか。
              </p>

              <Link
                href="/uranai/chat/tsukuyomi"
                className="inline-block px-8 py-3 text-base rounded-sm transition-opacity hover:opacity-80"
                style={{
                  color: theme.palette.bg,
                  backgroundColor: theme.palette.accent,
                  fontFamily: theme.font.serif,
                  fontWeight: 700,
                }}
              >
                {theme.name}に問う
              </Link>

              <div className="mt-5 flex flex-wrap justify-center gap-4 text-[11px]">
                <Link
                  href="/uranai/draw"
                  className="underline transition-opacity hover:opacity-70"
                  style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
                >
                  3 流派の占いを試す
                </Link>
                <Link
                  href="/uranai/settings"
                  className="underline transition-opacity hover:opacity-70"
                  style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
                >
                  設定
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// γ: 複数 persona hub (= placeholder, γ wedge で実装)
// ============================================================

function MultiPersonaHub({ personas }: { personas: PersonaTheme[] }) {
  // γ では各 persona の card grid + 各々の背景がチラ見えする構成にしたい.
  // とりあえず最小実装で list link.
  return (
    <main className="fixed inset-0 overflow-auto" style={{ backgroundColor: "#0d0d1f" }}>
      <div className="max-w-[1000px] mx-auto p-6">
        <h1 className="text-3xl text-center text-[#f0e9d6] mb-8">占い世界の住人たち</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((p) => (
            <Link
              key={p.id}
              href={`/uranai/chat/${p.id}`}
              className="block rounded-sm p-4 transition-opacity hover:opacity-80"
              style={{
                backgroundColor: p.palette.surface,
                backdropFilter: `blur(${p.chat.bubbleBlurPx}px)`,
                border: p.chat.bubbleBorder,
                color: p.palette.text,
              }}
            >
              <p style={{ fontFamily: p.font.serif, fontSize: "1.5rem", fontWeight: 700 }}>
                {p.name}
              </p>
              {p.reading && (
                <p style={{ fontFamily: p.font.mono, fontSize: "0.7rem", opacity: 0.6 }}>
                  {p.reading}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
