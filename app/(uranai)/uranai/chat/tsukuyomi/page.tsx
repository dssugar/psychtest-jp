"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { drawThreeCards, type DrawnCard } from "@/data/tarot-cards";
import { calcNumerology, type NumerologyResult } from "@/data/numerology";
import { calcKyusei, type KyuseiResult } from "@/data/kyusei";
import { getOrCreateDeviceId } from "@/lib/uranai/device-id";
import { getProfile as getLocalProfile } from "@/lib/storage";
import { getTheme } from "@/lib/uranai/theme/registry";
import { BackgroundLayers } from "@/components/uranai/BackgroundLayers";
import { CharacterLayer } from "@/components/uranai/CharacterLayer";
import { ChatOverlay, type ChatBubbleData } from "@/components/uranai/ChatOverlay";
import type {
  ChatRequest,
  ChatResponse,
  DivinationContext,
  HistoryTurn,
  ProfilePayload,
} from "@/lib/uranai/types";

interface DivinationSnapshot {
  cards: DrawnCard[];
  numerology: NumerologyResult;
  kyusei: KyuseiResult;
  birthIso: string;
}

const ACTIVE_SESSION_KEY = "tsukuyomi_active_session";
const snapshotKey = (sid: string) => `tsukuyomi_snapshot:${sid}`;

const theme = getTheme("tsukuyomi");

function parseBirthDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function snapshotToContext(snap: DivinationSnapshot): DivinationContext {
  return {
    tarot: snap.cards.map((c) => ({
      name_ja: c.name_ja,
      orientation: c.orientation,
      upright_meaning: c.upright_meaning,
      reversed_meaning: c.reversed_meaning,
    })),
    numerology: snap.numerology,
    kyusei: snap.kyusei,
  };
}

export default function TsukuyomiChatPage() {
  const [deviceId, setDeviceId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<DivinationSnapshot | null>(null);
  const [bubbles, setBubbles] = useState<ChatBubbleData[]>([]);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);

  const [birth, setBirth] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----- mount: device-id + profile sync + active session hydrate -----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = getOrCreateDeviceId();
      if (!id) {
        setHydrating(false);
        return;
      }
      if (!cancelled) setDeviceId(id);

      const local = getLocalProfile();
      try {
        const putRes = await fetch("/uranai/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ deviceId: id, testResults: local?.tests ?? null }),
        });
        if (putRes.ok) {
          const p = (await putRes.json()) as ProfilePayload;
          if (!cancelled) setProfile(p);
        }
      } catch {
        // sync 失敗しても chat 自体は動かす
      }

      const activeSession = window.localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!activeSession) {
        if (!cancelled) setHydrating(false);
        return;
      }
      if (!cancelled) setSessionId(activeSession);

      const snapRaw = window.localStorage.getItem(snapshotKey(activeSession));
      if (snapRaw) {
        try {
          const snap = JSON.parse(snapRaw) as DivinationSnapshot;
          if (!cancelled) setSnapshot(snap);
        } catch {
          // corrupt: 新 session 扱い
        }
      }

      try {
        const hRes = await fetch(
          `/uranai/history?deviceId=${encodeURIComponent(id)}&sessionId=${encodeURIComponent(activeSession)}&limit=20`,
        );
        if (hRes.ok) {
          const { turns } = (await hRes.json()) as { turns: HistoryTurn[] };
          if (!cancelled) {
            setBubbles(
              turns.map((t) => ({ role: t.role, content: t.content, turnId: t.turnId })),
            );
          }
        }
      } catch {
        // ignore
      }

      if (!cancelled) setHydrating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const postChat = useCallback(
    async (sid: string, snap: DivinationSnapshot, newMessage: string | null) => {
      if (!deviceId) return;
      setLoading(true);
      setError(null);
      try {
        const reqBody: ChatRequest = {
          deviceId,
          sessionId: sid,
          newMessage,
          divinationContext: snapshotToContext(snap),
        };
        const res = await fetch("/uranai/chat/tsukuyomi", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(reqBody),
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(`${res.status} ${detail.slice(0, 200)}`);
        }
        const data = (await res.json()) as ChatResponse;
        setBubbles((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, turnId: data.turnId },
        ]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "未知のエラー");
      } finally {
        setLoading(false);
      }
    },
    [deviceId],
  );

  async function handleSummon() {
    if (!deviceId) return;
    const birthDate = parseBirthDate(birth);
    if (!birthDate) {
      setError("生年月日を入力してください");
      return;
    }
    const today = new Date();
    const snap: DivinationSnapshot = {
      cards: drawThreeCards(),
      numerology: calcNumerology(birthDate, today),
      kyusei: calcKyusei(birthDate, today),
      birthIso: birth,
    };
    const newSession = crypto.randomUUID();
    window.localStorage.setItem(ACTIVE_SESSION_KEY, newSession);
    window.localStorage.setItem(snapshotKey(newSession), JSON.stringify(snap));
    setSessionId(newSession);
    setSnapshot(snap);
    setBubbles([]);
    await postChat(newSession, snap, null);
  }

  async function handleSend() {
    if (!sessionId || !snapshot) return;
    const content = draft.trim();
    if (!content || loading) return;
    setBubbles((prev) => [...prev, { role: "user", content, turnId: -1 }]);
    setDraft("");
    await postChat(sessionId, snapshot, content);
  }

  function handleNewSession() {
    if (sessionId) window.localStorage.removeItem(snapshotKey(sessionId));
    window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    setSessionId(null);
    setSnapshot(null);
    setBubbles([]);
    setDraft("");
    setError(null);
  }

  const canSummon = !loading && !hydrating && !!deviceId && parseBirthDate(birth) !== null;
  const canSend = !loading && !!sessionId && !!snapshot && draft.trim().length > 0;

  // viewport canvas 全体. layer stack:
  //   1. BackgroundLayers (= 月夜の塔 image)
  //   2. CharacterLayer (= 立ち絵, breath animation)
  //   3. ChatOverlay (= 透明 frosted bubble + 入力) または summon UI
  const personaHeader = (
    <div className="flex items-center justify-between">
      <div>
        <p
          className="text-2xl"
          style={{
            color: theme.palette.text,
            fontFamily: theme.font.serif,
            fontWeight: 700,
            letterSpacing: "0.25em",
          }}
        >
          {theme.name}
        </p>
        <p
          className="text-[10px] tracking-widest"
          style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
        >
          TSUKUYOMI / α{profile?.phq9K6Optin ? " ・mental共有中" : ""}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-[11px] underline transition-opacity hover:opacity-70"
          style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
        >
          ← トップ
        </Link>
        <Link
          href="/uranai"
          className="text-[11px] underline transition-opacity hover:opacity-70"
          style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
        >
          ← 占い
        </Link>
        <Link
          href="/uranai/settings"
          className="text-[11px] underline transition-opacity hover:opacity-70"
          style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
        >
          設定
        </Link>
      </div>
    </div>
  );

  // chat 中のみ表示: 今宵引かれた占術結果 (タロット 3 枚 + 数秘 + 九星).
  // <details> で折り畳み、default 閉. 月読の物語は紡ぐが、user は引いた札 / 数字を
  // 自分の目でも確認できるようにする (= 実物の deck で引いたら見えるのと同じ).
  const snapshotPanel = snapshot && (
    <details className="mt-2 group">
      <summary
        className="cursor-pointer list-none text-[10px] tracking-widest inline-flex items-center gap-1 hover:opacity-100 transition-opacity"
        style={{ color: theme.palette.textDim, fontFamily: theme.font.mono, opacity: 0.7 }}
      >
        <span className="group-open:hidden">▼ 今宵の占術</span>
        <span className="hidden group-open:inline">▲ 閉じる</span>
      </summary>
      <div
        className="mt-2 rounded-sm px-3 py-2 text-xs leading-relaxed space-y-1"
        style={{
          backgroundColor: theme.palette.surface,
          backdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
          WebkitBackdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
          border: theme.chat.bubbleBorder,
          color: theme.palette.text,
          fontFamily: theme.font.serif,
        }}
      >
        <p>
          <span style={{ color: theme.palette.accent }}>タロット</span>:{" "}
          {snapshot.cards
            .map((c) => `${c.name_ja}(${c.orientation === "upright" ? "正" : "逆"})`)
            .join(" / ")}
        </p>
        <p>
          <span style={{ color: theme.palette.accent }}>数秘術</span>: ライフパス{" "}
          {snapshot.numerology.lifePath} / 今日 {snapshot.numerology.personalDay}
        </p>
        <p>
          <span style={{ color: theme.palette.accent }}>九星気学</span>:{" "}
          {snapshot.kyusei.honmeisho.name} ・ 今宵{" "}
          {snapshot.kyusei.todayStar.name} ({snapshot.kyusei.fortune})
        </p>
      </div>
    </details>
  );

  // chat ヘッダー = persona header + snapshot panel (= 折り畳み)
  const chatHeader = (
    <div>
      {personaHeader}
      {snapshotPanel}
    </div>
  );

  return (
    <main
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: theme.palette.bg }}
    >
      <BackgroundLayers theme={theme} />
      <CharacterLayer theme={theme} />

      {/* Stage 1: summon */}
      {!hydrating && !sessionId && (
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div className="shrink-0 px-3 pt-3 pointer-events-auto">
            <div className="max-w-[760px] mx-auto">{personaHeader}</div>
          </div>
          <div className="flex-1 flex items-end px-3 pb-6 pointer-events-auto">
            <div className="max-w-[640px] mx-auto w-full">
              <div
                className="rounded-sm p-5"
                style={{
                  backgroundColor: theme.palette.surface,
                  backdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
                  WebkitBackdropFilter: `blur(${theme.chat.bubbleBlurPx}px)`,
                  border: theme.chat.bubbleBorder,
                  color: theme.palette.text,
                }}
              >
                <p
                  className="text-sm leading-loose mb-4"
                  style={{ fontFamily: theme.font.serif }}
                >
                  月読を呼び出すために、あなたの生年月日を月光に映してください。
                  その夜のタロット・数秘・九星が、対話の起点となります。
                </p>
                <label className="block">
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
                  >
                    生年月日
                  </span>
                  <input
                    type="date"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    min="1900-01-01"
                    className="mt-1 w-full outline-none px-2 py-2 text-base rounded-sm"
                    style={{
                      color: theme.palette.bg,
                      backgroundColor: theme.palette.text,
                      fontFamily: theme.font.serif,
                    }}
                  />
                </label>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleSummon}
                    disabled={!canSummon}
                    className="px-6 py-2 text-base rounded-sm transition-opacity disabled:opacity-30"
                    style={{
                      color: theme.palette.bg,
                      backgroundColor: theme.palette.accent,
                      fontFamily: theme.font.serif,
                      fontWeight: 700,
                    }}
                  >
                    {loading ? "月読が降りてきています…" : "月読を呼ぶ"}
                  </button>
                </div>
                {error && (
                  <p
                    className="mt-3 text-xs break-all text-center"
                    style={{ color: theme.palette.error, fontFamily: theme.font.mono }}
                  >
                    {error}
                  </p>
                )}
                <p
                  className="mt-4 text-[10px] text-center leading-relaxed"
                  style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
                >
                  ※ 占いは娯楽目的です。医療診断ではありません。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: chat */}
      {!hydrating && sessionId && snapshot && (
        <ChatOverlay
          theme={theme}
          bubbles={bubbles}
          loading={loading}
          error={error}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          onNewSession={handleNewSession}
          canSend={canSend}
          header={chatHeader}
        />
      )}

      {/* Hydrate state */}
      {hydrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <p
            className="text-sm"
            style={{ color: theme.palette.textDim, fontFamily: theme.font.mono }}
          >
            月読の記憶を呼び戻しています…
          </p>
        </div>
      )}
    </main>
  );
}
