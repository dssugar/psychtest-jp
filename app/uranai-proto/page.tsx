"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import { drawThreeCards, type DrawnCard } from "@/data/tarot-cards";
import { calcNumerology, type NumerologyResult } from "@/data/numerology";
import { calcKyusei, type KyuseiResult } from "@/data/kyusei";

interface DrawResult {
  cards: DrawnCard[];
  numerology: NumerologyResult;
  kyusei: KyuseiResult;
  interpretation: string;
}

const POSITION_LABELS = ["過去", "現在", "未来"];
const POSITION_COLORS = ["blue", "green", "pink"] as const;

/**
 * "YYYY-MM-DD" → Date (local time, midnight).
 * <input type="date"> はゼロパディングされた ISO 短形式を返す前提.
 */
function parseBirthDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export default function UranaiProtoPage() {
  const [birth, setBirth] = useState("");
  const [result, setResult] = useState<DrawResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDraw() {
    const birthDate = parseBirthDate(birth);
    if (!birthDate) {
      setError("生年月日を入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const today = new Date();
      const cards = drawThreeCards();
      const numerology = calcNumerology(birthDate, today);
      const kyusei = calcKyusei(birthDate, today);

      const res = await fetch("/uranai/interpret", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tarot: cards.map((c) => ({
            name_ja: c.name_ja,
            orientation: c.orientation,
            upright_meaning: c.upright_meaning,
            reversed_meaning: c.reversed_meaning,
          })),
          numerology,
          kyusei,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`${res.status} ${detail.slice(0, 200)}`);
      }
      const data = (await res.json()) as { interpretation?: string; error?: string };
      if (!data.interpretation) {
        throw new Error(data.error ?? "解釈が空でした");
      }
      setResult({ cards, numerology, kyusei, interpretation: data.interpretation });
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知のエラー");
    } finally {
      setLoading(false);
    }
  }

  const canDraw = !loading && parseBirthDate(birth) !== null;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-up">
            <DataBadge color="yellow" size="lg">URANAI PROTO</DataBadge>
            <h1
              className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              3 流派統合占術
            </h1>
            <p className="text-lg md:text-xl text-brutal-gray-800 font-mono">
              タロット × 数秘術 × 九星気学
            </p>
          </div>

          {/* Disclaimer */}
          <Card variant="yellow" padding="md" className="mb-10 max-w-[800px] mx-auto">
            <p className="text-sm font-bold text-brutal-black text-center leading-relaxed">
              ⚠️ この占いは娯楽目的です。科学的根拠はなく、医療・法律・金融などの重要な判断には使用しないでください。
            </p>
          </Card>

          <div className="max-w-[800px] mx-auto">
            {/* Input + draw */}
            <Card variant="white" padding="lg" className="mb-8">
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
                生年月日から数秘術・九星気学を計算し、タロット 3 枚引きと並べて
                AI 占い師が共通テーマをひとつの物語として読み解きます。
              </p>
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleDraw}
                  disabled={!canDraw}
                  className="btn-brutal bg-brutal-black text-brutal-white px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "占っています…" : result ? "もう一度占う" : "占う"}
                </button>
              </div>
              {error && (
                <p className="mt-6 text-sm font-mono text-viz-pink break-all text-center">
                  {error}
                </p>
              )}
            </Card>

            {result && (
              <div className="space-y-8">
                {/* Tarot 3 cards */}
                <div>
                  <DataBadge color="black" size="md">TAROT</DataBadge>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {result.cards.map((c, i) => (
                      <Card key={i} variant={POSITION_COLORS[i]} padding="md">
                        <DataBadge color="black" size="sm">
                          {POSITION_LABELS[i]}
                        </DataBadge>
                        <h3
                          className="text-2xl md:text-3xl mt-4 mb-2"
                          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
                        >
                          {c.name_ja}
                        </h3>
                        <p className="text-sm font-mono uppercase tracking-wide">
                          {c.orientation === "upright" ? "正位置" : "逆位置"}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Numerology */}
                <Card variant="orange" padding="lg">
                  <DataBadge color="black" size="md">NUMEROLOGY</DataBadge>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wide text-brutal-gray-800">
                        ライフパスナンバー
                      </p>
                      <p
                        className="text-5xl md:text-6xl mt-2"
                        style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
                      >
                        {result.numerology.lifePath}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed">
                        {result.numerology.lifePathMeaning}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wide text-brutal-gray-800">
                        今日のパーソナルデイ
                      </p>
                      <p
                        className="text-5xl md:text-6xl mt-2"
                        style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
                      >
                        {result.numerology.personalDay}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed">
                        {result.numerology.personalDayMeaning}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Kyusei */}
                <Card variant="cyan" padding="lg">
                  <DataBadge color="black" size="md">KYUSEI</DataBadge>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wide text-brutal-gray-800">
                        本命星
                      </p>
                      <p
                        className="text-3xl md:text-4xl mt-2"
                        style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
                      >
                        {result.kyusei.honmeisho.name}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed">
                        五行: {result.kyusei.honmeisho.element} — {result.kyusei.honmeisho.symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wide text-brutal-gray-800">
                        今日の運勢 ({result.kyusei.fortune})
                      </p>
                      <p
                        className="text-2xl md:text-3xl mt-2 leading-snug"
                        style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
                      >
                        {result.kyusei.fortuneKeyword}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed">
                        日盤: {result.kyusei.todayStar.name} ({result.kyusei.todayStar.element})
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Interpretation */}
                <Card variant="white" padding="lg">
                  <DataBadge color="black" size="md">READING</DataBadge>
                  <p className="mt-6 text-brutal-gray-900 leading-loose whitespace-pre-wrap">
                    {result.interpretation}
                  </p>
                </Card>
              </div>
            )}
          </div>

          <div className="text-center mt-16 space-y-3">
            <div>
              <Link
                href="/uranai-chat"
                className="inline-flex items-center gap-2 text-brutal-gray-800 hover:text-brutal-black font-semibold uppercase tracking-wide text-sm"
              >
                <span>→</span>
                <span>専属占い師チャットモードを試す</span>
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
