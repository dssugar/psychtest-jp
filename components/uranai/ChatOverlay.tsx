/**
 * Chat overlay — 透明 / 半透明 bubble + 入力欄.
 *
 * theme.chat の設定で bubble 装飾を切り替える:
 *   - frosted: backdrop-filter blur + 半透明 surface (月読)
 *   - lined:   無背景 + 1 本罫線 (賢者)
 *   - minimal: 透明 + 細い outline (椿)
 *   - ink-wash: 不規則 border (白虎)
 *
 * bubbleAlign:
 *   - left-right: chat 標準 (user 右、persona 左)
 *   - center-bottom: ADV 字幕風 (= 全幅 bottom)
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { PersonaTheme } from "@/lib/uranai/theme/types";

export interface ChatBubbleData {
  role: "user" | "assistant";
  content: string;
  turnId: number;
}

interface Props {
  theme: PersonaTheme;
  bubbles: ChatBubbleData[];
  loading?: boolean;
  error?: string | null;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onNewSession?: () => void;
  canSend: boolean;
  /** chat header に置くもの (= persona name badge / settings link / etc). 任意. */
  header?: React.ReactNode;
}

// chat scroll area の高さモード:
//   expanded = viewport の 60%  (= 通常 chat、過去 turn まで scroll 可)
//   compact  = viewport の 24%  (= 直近 1-2 turn のみ、立ち絵が大きく見える)
// 切替えは右上の toggle button.
const SCROLL_HEIGHT_EXPANDED = 60; // vh
const SCROLL_HEIGHT_COMPACT = 24; // vh

// scroll area 上端の gradient fade height (= bg 色から透明に滲む幅).
// 立ち絵の腰〜顔と重なって「霧の向こう」感を出す.
const FADE_HEIGHT_PX = 100;

export function ChatOverlay(props: Props) {
  const {
    theme, bubbles, loading, error, draft,
    onDraftChange, onSend, onNewSession, canSend, header,
  } = props;

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [bubbles, loading, expanded]);

  // bubble の base style を theme から組み立て
  const bubbleBaseStyle: React.CSSProperties =
    theme.chat.bubbleStyle === "frosted"
      ? {
          backgroundColor: theme.palette.surface,
          backdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
          WebkitBackdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
          border: theme.chat.bubbleBorder,
          color: theme.palette.text,
        }
      : theme.chat.bubbleStyle === "lined"
      ? {
          backgroundColor: "transparent",
          borderLeft: theme.chat.bubbleBorder,
          color: theme.palette.text,
        }
      : theme.chat.bubbleStyle === "minimal"
      ? {
          backgroundColor: "transparent",
          border: theme.chat.bubbleBorder,
          color: theme.palette.text,
        }
      : {
          // ink-wash placeholder (= γ で SVG mask 等で表現予定)
          backgroundColor: theme.palette.surface,
          border: theme.chat.bubbleBorder,
          color: theme.palette.text,
        };

  const isCenterBottom = theme.chat.bubbleAlign === "center-bottom";

  const scrollHeightVh = expanded ? SCROLL_HEIGHT_EXPANDED : SCROLL_HEIGHT_COMPACT;

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {/* Header (= persona label + settings link) */}
      {header && (
        <div className="shrink-0 px-3 pt-3 pointer-events-auto">
          <div className="max-w-[760px] mx-auto">{header}</div>
        </div>
      )}

      {/* spacer: 立ち絵 zone (= header 下〜chat 上の余白、画面 40vh 確保) */}
      <div className="flex-1" />

      {/* Scrollable bubble area (= 画面下半分に高さ固定で配置).
          上端 FADE_HEIGHT_PX を mask-image で透明に → bubble 自体が薄くなり
          立ち絵がそのまま透けて見える (= 背景色で塗りつぶしではない). */}
      <div className="shrink-0 relative pointer-events-auto" style={{ height: `${scrollHeightVh}vh` }}>
        {/* 開閉 toggle (= 右上 corner, 半透明 chip). mask の外側 (兄弟要素) なので fade されない */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="absolute top-1 right-3 z-20 px-2 py-1 text-[10px] uppercase tracking-widest rounded-sm transition-opacity hover:opacity-100"
          style={{
            color: theme.palette.textDim,
            backgroundColor: `${theme.palette.bg}cc`,
            border: `1px solid ${theme.palette.textDim}66`,
            fontFamily: theme.font.mono,
            opacity: 0.85,
          }}
        >
          {expanded ? "▼ たたむ" : "▲ 履歴"}
        </button>

        <div
          className="absolute inset-0 overflow-y-auto px-3 pt-6 uranai-no-scrollbar"
          style={{
            maskImage: `linear-gradient(to bottom, transparent 0px, black ${FADE_HEIGHT_PX}px, black 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom, transparent 0px, black ${FADE_HEIGHT_PX}px, black 100%)`,
          }}
        >
          <div className="max-w-[760px] mx-auto py-3 space-y-3">
          {bubbles.map((m, i) =>
            isCenterBottom ? (
              // ADV 字幕風: 全幅 bubble, role label を上に
              <div key={`${m.turnId}-${i}`}>
                <div
                  className="text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
                >
                  {m.role === "user" ? "あなた" : theme.name}
                </div>
                <div
                  className="rounded-sm px-4 py-3 text-base leading-loose whitespace-pre-wrap"
                  style={{ ...bubbleBaseStyle, fontFamily: theme.font.serif }}
                >
                  {m.content}
                </div>
              </div>
            ) : (
              // chat 風: 左右配置
              <div
                key={`${m.turnId}-${i}`}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div className="max-w-[85%]">
                  <div
                    className="text-[10px] uppercase tracking-widest mb-1"
                    style={{
                      color: theme.palette.textDim,
                      fontFamily: theme.font.mono,
                      textAlign: m.role === "user" ? "right" : "left",
                    }}
                  >
                    {m.role === "user" ? "あなた" : theme.name}
                  </div>
                  <div
                    className="rounded-sm px-4 py-3 text-[15px] leading-loose whitespace-pre-wrap"
                    style={{ ...bubbleBaseStyle, fontFamily: theme.font.serif }}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ),
          )}

          {loading && (
            <div className={isCenterBottom ? "" : "flex justify-start"}>
              <div
                className="rounded-sm px-4 py-2 text-sm italic"
                style={{ ...bubbleBaseStyle, fontFamily: theme.font.serif, opacity: 0.7 }}
              >
                {theme.name}が言葉を選んでいます…
              </div>
            </div>
          )}

          {error && (
            <div
              className="rounded-sm px-3 py-2 text-xs"
              style={{
                color: theme.palette.error,
                fontFamily: theme.font.mono,
                border: `1px solid ${theme.palette.error}`,
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              {error}
            </div>
          )}

          <div ref={scrollAnchorRef} />
          </div>
        </div>
      </div>

      {/* Input (= 画面下端 sticky) */}
      <div
        className="shrink-0 px-3 py-3 pointer-events-auto"
        style={{
          background: `linear-gradient(to top, ${theme.palette.bg}cc 0%, ${theme.palette.bg}00 100%)`,
        }}
      >
        <div className="max-w-[760px] mx-auto">
          <div
            className="rounded-sm p-2"
            style={{
              backgroundColor: theme.palette.surface,
              backdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
              WebkitBackdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
              border: theme.chat.bubbleBorder,
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder={`${theme.name}に問うてみる…  (Cmd/Ctrl+Enter で送信)`}
              rows={2}
              disabled={loading}
              className="w-full bg-transparent outline-none resize-none px-2 py-1.5 text-sm"
              style={{
                color: theme.palette.text,
                fontFamily: theme.font.serif,
              }}
            />
            <div className="flex flex-wrap gap-2 justify-end items-center mt-1">
              {onNewSession && (
                <button
                  type="button"
                  onClick={onNewSession}
                  disabled={loading}
                  className="px-3 py-1 text-[11px] uppercase tracking-wide rounded-sm transition-opacity disabled:opacity-40"
                  style={{
                    color: theme.palette.textDim,
                    fontFamily: theme.font.mono,
                    border: `1px solid ${theme.palette.textDim}`,
                  }}
                >
                  新しい月夜
                </button>
              )}
              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                className="px-5 py-1.5 text-sm rounded-sm transition-opacity disabled:opacity-30"
                style={{
                  color: theme.palette.bg,
                  backgroundColor: theme.palette.accent,
                  fontFamily: theme.font.serif,
                  fontWeight: 700,
                }}
              >
                {loading ? "…" : "送る"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
