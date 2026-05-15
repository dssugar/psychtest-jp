"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import { drawThreeCards, type DrawnCard } from "@/data/tarot-cards";

interface DrawResult {
  cards: DrawnCard[];
  interpretation: string;
}

const POSITION_LABELS = ["過去", "現在", "未来"];
const POSITION_COLORS = ["blue", "green", "pink"] as const;

export default function UranaiProtoPage() {
  const [result, setResult] = useState<DrawResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDraw() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const cards = drawThreeCards();
      const res = await fetch("/uranai/interpret", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cards: cards.map((c) => ({
            name_ja: c.name_ja,
            orientation: c.orientation,
            upright_meaning: c.upright_meaning,
            reversed_meaning: c.reversed_meaning,
          })),
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
      setResult({ cards, interpretation: data.interpretation });
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知のエラー");
    } finally {
      setLoading(false);
    }
  }

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
              タロット 3枚引き
            </h1>
            <p className="text-lg md:text-xl text-brutal-gray-800 font-mono">
              過去・現在・未来を一枚ずつ
            </p>
          </div>

          {/* Disclaimer */}
          <Card variant="yellow" padding="md" className="mb-10 max-w-[800px] mx-auto">
            <p className="text-sm font-bold text-brutal-black text-center leading-relaxed">
              ⚠️ この占いは娯楽目的です。科学的根拠はなく、医療・法律・金融などの重要な判断には使用しないでください。
            </p>
          </Card>

          <div className="max-w-[800px] mx-auto">
            {!result && (
              <Card variant="white" padding="lg" className="text-center">
                <p className="text-brutal-gray-800 mb-8 leading-relaxed">
                  78 枚のタロットから 3 枚を引き、AI 占い師が物語として読み解きます。
                </p>
                <button
                  type="button"
                  onClick={handleDraw}
                  disabled={loading}
                  className="btn-brutal bg-brutal-black text-brutal-white px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "占っています…" : "占う"}
                </button>
                {error && (
                  <p className="mt-6 text-sm font-mono text-viz-pink break-all">
                    {error}
                  </p>
                )}
              </Card>
            )}

            {result && (
              <div className="space-y-8">
                {/* 3 cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {/* Interpretation */}
                <Card variant="white" padding="lg">
                  <DataBadge color="black" size="md">READING</DataBadge>
                  <p className="mt-6 text-brutal-gray-900 leading-loose whitespace-pre-wrap">
                    {result.interpretation}
                  </p>
                </Card>

                {/* Re-draw */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleDraw}
                    disabled={loading}
                    className="btn-brutal bg-brutal-white text-brutal-black px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "占っています…" : "もう一度占う"}
                  </button>
                  {error && (
                    <p className="mt-6 text-sm font-mono text-viz-pink break-all">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-16">
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
    </main>
  );
}
