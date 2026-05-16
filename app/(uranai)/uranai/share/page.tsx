"use client";

/**
 * /uranai/share?id=<result_id>
 *
 * Cloudflare Pages の static export では dynamic route ([resultId]/page.tsx) は
 * build できないので、query string で result_id を受ける形に. client-side fetch.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import type { DrawFetchResponse } from "@/lib/uranai/types";

const POSITION_LABELS = ["過去", "現在", "未来"];
const POSITION_COLORS = ["blue", "green", "pink"] as const;

export default function UranaiSharePage() {
  const [data, setData] = useState<DrawFetchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) {
      setError("URL に id パラメータがありません");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/uranai/draw?id=${encodeURIComponent(id)}`);
        if (res.status === 404) {
          setError("この占い結果は見つかりません (削除済みか、URL が違う可能性があります)");
          return;
        }
        if (!res.ok) {
          throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
        }
        setData((await res.json()) as DrawFetchResponse);
      } catch (e) {
        setError(e instanceof Error ? e.message : "未知のエラー");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10">
            <DataBadge color="yellow" size="lg">SHARED READING</DataBadge>
            <h1
              className="text-3xl md:text-5xl text-brutal-black mt-6 mb-2"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              シェアされた占い結果
            </h1>
          </div>

          <Card variant="yellow" padding="md" className="mb-8">
            <p className="text-sm font-bold text-brutal-black text-center leading-relaxed">
              ⚠️ この占いは娯楽目的です。
            </p>
          </Card>

          {loading && (
            <Card variant="white" padding="lg">
              <p className="text-center font-mono text-brutal-gray-800">読み込み中…</p>
            </Card>
          )}

          {error && (
            <Card variant="pink" padding="md">
              <p className="text-sm font-mono text-brutal-black text-center">{error}</p>
            </Card>
          )}

          {data && (
            <div className="space-y-8">
              <div>
                <DataBadge color="black" size="md">TAROT</DataBadge>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {data.inputs.tarot.map((c, i) => (
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

              <Card variant="orange" padding="lg">
                <DataBadge color="black" size="md">NUMEROLOGY</DataBadge>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wide text-brutal-gray-800">
                      ライフパス
                    </p>
                    <p
                      className="text-5xl md:text-6xl mt-2"
                      style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
                    >
                      {data.inputs.numerology.lifePath}
                    </p>
                    <p className="mt-2 text-sm">{data.inputs.numerology.lifePathMeaning}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wide text-brutal-gray-800">
                      パーソナルデイ
                    </p>
                    <p
                      className="text-5xl md:text-6xl mt-2"
                      style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
                    >
                      {data.inputs.numerology.personalDay}
                    </p>
                    <p className="mt-2 text-sm">{data.inputs.numerology.personalDayMeaning}</p>
                  </div>
                </div>
              </Card>

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
                      {data.inputs.kyusei.honmeisho.name}
                    </p>
                    <p className="mt-2 text-sm">
                      五行: {data.inputs.kyusei.honmeisho.element} — {data.inputs.kyusei.honmeisho.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wide text-brutal-gray-800">
                      日盤 ({data.inputs.kyusei.fortune})
                    </p>
                    <p
                      className="text-2xl md:text-3xl mt-2 leading-snug"
                      style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
                    >
                      {data.inputs.kyusei.fortuneKeyword}
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="white" padding="lg">
                <DataBadge color="black" size="md">READING</DataBadge>
                <p className="mt-6 text-brutal-gray-900 leading-loose whitespace-pre-wrap">
                  {data.interpretation}
                </p>
              </Card>

              <div className="flex justify-center">
                <Link
                  href="/uranai/draw"
                  className="btn-brutal bg-brutal-black text-brutal-white px-6 py-3 text-sm"
                >
                  自分でも占う
                </Link>
              </div>
            </div>
          )}

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
