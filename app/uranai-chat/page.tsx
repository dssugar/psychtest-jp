"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import { drawThreeCards, type DrawnCard } from "@/data/tarot-cards";
import { calcNumerology, type NumerologyResult } from "@/data/numerology";
import { calcKyusei, type KyuseiResult } from "@/data/kyusei";

type Role = "user" | "assistant";
interface ChatMessage {
  role: Role;
  content: string;
}

interface DivinationSnapshot {
  cards: DrawnCard[];
  numerology: NumerologyResult;
  kyusei: KyuseiResult;
}

function parseBirthDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function buildContextPayload(snapshot: DivinationSnapshot) {
  return {
    tarot: snapshot.cards.map((c) => ({
      name_ja: c.name_ja,
      orientation: c.orientation,
      upright_meaning: c.upright_meaning,
      reversed_meaning: c.reversed_meaning,
    })),
    numerology: snapshot.numerology,
    kyusei: snapshot.kyusei,
  };
}

export default function UranaiChatPage() {
  const [birth, setBirth] = useState("");
  const [snapshot, setSnapshot] = useState<DivinationSnapshot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  /**
   * POST /uranai/chat. snapshot は既にできてる前提.
   * 指定された messages 配列 (新しいやつ含む) で叩く → assistant reply を append.
   */
  async function postChat(snap: DivinationSnapshot, history: ChatMessage[]): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/uranai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history,
          divinationContext: buildContextPayload(snap),
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`${res.status} ${detail.slice(0, 200)}`);
      }
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!data.reply) throw new Error(data.error ?? "応答が空でした");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知のエラー");
    } finally {
      setLoading(false);
    }
  }

  async function handleSummon() {
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
    };
    setSnapshot(snap);
    setMessages([]);
    await postChat(snap, []);
  }

  async function handleSend() {
    if (!snapshot) return;
    const content = draft.trim();
    if (!content || loading) return;
    const nextHistory: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextHistory);
    setDraft("");
    await postChat(snapshot, nextHistory);
  }

  function handleReset() {
    setSnapshot(null);
    setMessages([]);
    setDraft("");
    setError(null);
  }

  const canSummon = !loading && parseBirthDate(birth) !== null;
  const canSend = !loading && !!snapshot && draft.trim().length > 0;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-in-up">
            <DataBadge color="yellow" size="lg">URANAI PROTO / CHAT</DataBadge>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl text-brutal-black mt-6 mb-4"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              専属占い師チャット
            </h1>
            <p className="text-lg md:text-xl text-brutal-gray-800 font-mono">
              タロット × 数秘術 × 九星気学 を context に対話する
            </p>
          </div>

          {/* Disclaimer */}
          <Card variant="yellow" padding="md" className="mb-8">
            <p className="text-sm font-bold text-brutal-black text-center leading-relaxed">
              ⚠️ この占いは娯楽目的です。科学的根拠はなく、医療・法律・金融などの重要な判断には使用しないでください。
              深刻な悩み・抑うつ・自傷念慮がある場合は、必ず医療・心理の専門家にご相談ください。
            </p>
          </Card>

          {/* Stage 1: birth input */}
          {!snapshot && (
            <Card variant="white" padding="lg">
              <label className="block">
                <span className="text-sm font-bold uppercase tracking-wide text-brutal-gray-800 font-mono">
                  生年月日
                </span>
                <input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  min="1900-01-01"
                  className="mt-2 w-full border-4 border-brutal-black bg-brutal-white px-4 py-3 text-lg font-mono focus:outline-none focus:ring-4 focus:ring-viz-yellow"
                />
              </label>
              <p className="mt-4 text-sm text-brutal-gray-800 leading-relaxed">
                生年月日から 3 流派を裏で計算し、占い師としての LLM を呼び出します。
                呼び出し後は自由に会話できます。会話は保存されません。
              </p>
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleSummon}
                  disabled={!canSummon}
                  className="btn-brutal bg-brutal-black text-brutal-white px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "占い師を呼んでいます…" : "占い師を呼ぶ"}
                </button>
              </div>
              {error && (
                <p className="mt-6 text-sm font-mono text-viz-pink break-all text-center">
                  {error}
                </p>
              )}
            </Card>
          )}

          {/* Stage 2: chat */}
          {snapshot && (
            <div className="space-y-6">
              {/* divination snapshot summary */}
              <Card variant="cyan" padding="md">
                <DataBadge color="black" size="sm">SESSION CONTEXT</DataBadge>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm font-mono">
                  <div>
                    <span className="font-bold uppercase tracking-wide text-xs">TAROT</span>
                    <p className="mt-1">
                      {snapshot.cards
                        .map((c) => `${c.name_ja}(${c.orientation === "upright" ? "正" : "逆"})`)
                        .join(" / ")}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wide text-xs">NUMEROLOGY</span>
                    <p className="mt-1">
                      Life {snapshot.numerology.lifePath} / Day {snapshot.numerology.personalDay}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wide text-xs">KYUSEI</span>
                    <p className="mt-1">
                      {snapshot.kyusei.honmeisho.name} / {snapshot.kyusei.fortune}
                    </p>
                  </div>
                </div>
              </Card>

              {/* messages */}
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                  >
                    <div className="max-w-[85%]">
                      <Card
                        variant={m.role === "user" ? "white" : "orange"}
                        padding="md"
                      >
                        <DataBadge color="black" size="sm">
                          {m.role === "user" ? "YOU" : "READER"}
                        </DataBadge>
                        <p className="mt-3 text-brutal-gray-900 leading-loose whitespace-pre-wrap">
                          {m.content}
                        </p>
                      </Card>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <Card variant="orange" padding="md">
                        <p className="text-brutal-gray-800 font-mono text-sm">
                          占い師が考えています…
                        </p>
                      </Card>
                    </div>
                  </div>
                )}
                <div ref={scrollAnchorRef} />
              </div>

              {error && (
                <Card variant="pink" padding="md">
                  <p className="text-sm font-mono text-brutal-black break-all">
                    エラー: {error}
                  </p>
                </Card>
              )}

              {/* input */}
              <Card variant="white" padding="md">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-brutal-gray-800 font-mono">
                    占い師に聞く
                  </span>
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="気になっていることを書いてください (Cmd/Ctrl+Enter で送信)"
                    rows={3}
                    disabled={loading}
                    className="mt-2 w-full border-4 border-brutal-black bg-brutal-white px-4 py-3 text-base font-mono focus:outline-none focus:ring-4 focus:ring-viz-yellow disabled:opacity-50"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="btn-brutal bg-brutal-white text-brutal-black px-6 py-3 text-sm disabled:opacity-50"
                  >
                    新しい占い師を呼ぶ
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className="btn-brutal bg-brutal-black text-brutal-white px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "送信中…" : "送信"}
                  </button>
                </div>
              </Card>
            </div>
          )}

          <div className="text-center mt-16 space-y-3">
            <div>
              <Link
                href="/uranai-proto"
                className="inline-flex items-center gap-2 text-brutal-gray-800 hover:text-brutal-black font-semibold uppercase tracking-wide text-sm"
              >
                <span>→</span>
                <span>3 流派 one-shot モードを試す</span>
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-brutal-gray-800 hover:text-brutal-black font-semibold uppercase tracking-wide text-sm"
              >
                <span>←</span>
                <span>トップページに戻る</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
