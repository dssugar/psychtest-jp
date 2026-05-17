"use client";

/**
 * Phase 2.x.F.2 + F.3: 動的 scale 受験 + 結果 UI.
 *
 * URL: /shindan/scale/?id=<scaleId>
 *
 * state machine:
 *   intro → take → result
 *
 *   intro: scale 説明 + items 数 + α + 「受験開始」
 *   take:  1 問ずつ提示 → 全問回答で → 結果計算 + POST /ipip/responses → result
 *   result: 生スコア + 正規化 + 項目別 breakdown + 「やり直す」/「他の尺度へ」
 */

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import { MarkdownContent } from "@/components/results/MarkdownContent";
import {
  getScaleApi,
  pickBand,
  scoreLikert5,
  submitScaleResponses,
  type ScaleDescription,
  type ScaleHierarchyEntry,
  type ScaleInterpretation,
  type ScaleItem,
} from "@/lib/shindan/api";

type Phase = "loading" | "intro" | "take" | "submitting" | "result" | "error";

const LIKERT_OPTIONS = [
  { value: 1, label: "全くあてはまらない" },
  { value: 2, label: "ややあてはまらない" },
  { value: 3, label: "どちらでもない" },
  { value: 4, label: "ややあてはまる" },
  { value: 5, label: "とてもあてはまる" },
];

export default function ShindanScalePage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Suspense fallback={<LoadingBox />}>
            <ScaleRunner />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function ScaleRunner() {
  const params = useSearchParams();
  const scaleId = params.get("id") ?? "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [scale, setScale] = useState<ScaleHierarchyEntry | null>(null);
  const [items, setItems] = useState<ScaleItem[]>([]);
  const [description, setDescription] = useState<ScaleDescription | null>(null);
  const [interpretations, setInterpretations] = useState<ScaleInterpretation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState<ReturnType<typeof scoreLikert5> | null>(null);

  const load = useCallback(async () => {
    if (!scaleId) {
      setError("URL に id パラメータがありません (例: /shindan/scale/?id=neo_anxiety)");
      setPhase("error");
      return;
    }
    try {
      const data = await getScaleApi(scaleId, true);
      setScale(data.scale);
      setItems(data.items);
      setDescription(data.description ?? null);
      setInterpretations(data.interpretations ?? []);
      const existing = data.responses ?? [];
      const byItem = new Map(existing.map((r) => [r.item_id, r.value] as const));
      const prefill = data.items.map((it) => byItem.get(it.item_id) ?? 0);
      setAnswers(prefill);
      setPhase("intro");
    } catch (err) {
      setError(String(err));
      setPhase("error");
    }
  }, [scaleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const startTake = () => {
    setCurrentIdx(0);
    setPhase("take");
  };

  const onAnswer = (v: number) => {
    const next = [...answers];
    next[currentIdx] = v;
    setAnswers(next);
    if (currentIdx < items.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      void finalize(next);
    }
  };

  const finalize = async (finalAnswers: number[]) => {
    setPhase("submitting");
    try {
      // raw answers が IPIP 5 段階前提なので、未回答 (0) をフィルタ
      const valid = finalAnswers.every((v) => v >= 1 && v <= 5);
      if (!valid) {
        // 未回答 item に skip 戻す
        const skipIdx = finalAnswers.findIndex((v) => !(v >= 1 && v <= 5));
        if (skipIdx >= 0) {
          setCurrentIdx(skipIdx);
          setPhase("take");
          return;
        }
      }
      await submitScaleResponses(scaleId, items, finalAnswers);
      setScore(scoreLikert5(items, finalAnswers));
      setPhase("result");
    } catch (err) {
      console.warn(err);
      // 書き込み失敗してもローカル score 表示は出す
      setScore(scoreLikert5(items, finalAnswers));
      setPhase("result");
    }
  };

  const restart = () => {
    setAnswers(new Array(items.length).fill(0));
    setCurrentIdx(0);
    setScore(null);
    setPhase("intro");
  };

  if (phase === "loading") return <LoadingBox />;
  if (phase === "error") return <ErrorBox message={error ?? "不明なエラー"} />;
  if (!scale) return <ErrorBox message="scale data がありません" />;

  if (phase === "intro") {
    return (
      <IntroView
        scale={scale}
        items={items}
        description={description}
        onStart={startTake}
        hasPrefill={answers.some((a) => a > 0)}
      />
    );
  }

  if (phase === "submitting") {
    return (
      <Card variant="white" padding="lg">
        <p className="font-mono text-sm text-brutal-gray-700">回答を集計しています...</p>
      </Card>
    );
  }

  if (phase === "result" && score) {
    return (
      <ResultView
        scale={scale}
        items={items}
        answers={answers}
        score={score}
        description={description}
        interpretations={interpretations}
        onRestart={restart}
      />
    );
  }

  // phase === "take"
  return (
    <TakeView
      scale={scale}
      items={items}
      currentIdx={currentIdx}
      currentAnswer={answers[currentIdx]}
      onAnswer={onAnswer}
      onBack={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
      onPrefillJump={(idx) => setCurrentIdx(idx)}
      answers={answers}
    />
  );
}

// ============================================================
// Intro
// ============================================================

function IntroView({
  scale,
  items,
  description,
  onStart,
  hasPrefill,
}: {
  scale: ScaleHierarchyEntry;
  items: ScaleItem[];
  description: ScaleDescription | null;
  onStart: () => void;
  hasPrefill: boolean;
}) {
  // タイトル分割: facet (= 末端) があれば main = facet、sub = "instrument / scale_name"
  //                facet なし → main = scale_name、sub = instrument
  const facet = scale.facet_name ?? scale.subfacet_name;
  const mainTitle = facet ?? scale.scale_name ?? scale.instrument;
  const subPath = (() => {
    const parts: string[] = [scale.instrument];
    if (scale.scale_name && (facet || scale.scale_name !== mainTitle)) parts.push(scale.scale_name);
    return parts.join(" / ");
  })();
  const mainTitleJa =
    scale.display_label_ja?.split(" / ").pop()?.trim() ?? mainTitle;
  const subPathJa = (() => {
    const ja = scale.display_label_ja;
    if (!ja) return subPath;
    const parts = ja.split(" / ");
    if (parts.length <= 1) return subPath;
    return parts.slice(0, -1).join(" / ");
  })();

  return (
    <>
      <Link
        href="/shindan/explore/"
        className="group inline-flex items-center gap-1 mb-4 text-sm font-mono text-brutal-gray-700 hover:text-brutal-black transition-all"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        <span>探索に戻る</span>
      </Link>
      <Card variant="white" padding="lg">
        <DataBadge color="cyan">IPIP SCALE</DataBadge>

        {/* タイトル階層: メイン (= facet名) + サブ (= path + scale_id) */}
        <h1
          className="text-3xl md:text-5xl text-brutal-black mt-3 mb-1 tracking-wide"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
        >
          {mainTitleJa}
          {mainTitleJa !== mainTitle && (
            <span className="block text-base md:text-xl text-brutal-gray-500 mt-1" style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}>
              {mainTitle}
            </span>
          )}
        </h1>
        <p className="text-xs md:text-sm font-mono text-brutal-gray-500 mb-6">
          {subPathJa} <span className="text-brutal-gray-400">·</span> <code className="text-brutal-gray-500">{scale.scale_id}</code>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat
            label="項目数"
            value={`${items.length}${scale.items_source === "aggregated" ? " (集約)" : ""}`}
          />
          <Stat label="Inventory" value={scale.instrument} />
          {scale.alpha != null && <Stat label="Cronbach's α" value={scale.alpha.toFixed(2)} />}
          <Stat label="回答形式" value="5 段階" />
        </div>
        {scale.items_source === "aggregated" && (
          <p className="mb-4 text-xs font-mono text-viz-orange p-2 border-brutal-thin border-viz-orange bg-brutal-yellow">
            ⚠ IPIP 公式に単独の短縮 scale なし。配下 facet items を集約して提示します ({items.length} 問)。
          </p>
        )}

        {/* この尺度について: 段落 + 余白 + 専門情報 fold */}
        {description?.description_long && (
          <div className="mb-6 p-5 bg-brutal-gray-50 border-l-brutal-thick border-l-viz-cyan rounded-sm">
            <h2 className="text-lg text-brutal-black mb-3" style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}>
              この尺度について
            </h2>
            <div className="text-brutal-gray-800" style={{ fontFamily: "var(--font-display-ja)" }}>
              <MarkdownContent content={description.description_long} className="prose-sm" />
            </div>
            <details className="mt-4 group">
              <summary className="cursor-pointer text-xs font-mono text-brutal-gray-600 hover:text-brutal-black transition-colors list-none [&::-webkit-details-marker]:hidden">
                <span className="inline-block transition-transform group-open:rotate-90 mr-1">▶</span>学術的な詳細と出典を見る
              </summary>
              <div className="mt-3 pl-4 text-xs font-mono text-brutal-gray-700 space-y-2 leading-relaxed">
                {description.reference && (
                  <p>
                    <strong className="text-brutal-gray-900">Reference:</strong> {description.reference}
                  </p>
                )}
                {scale.source_url && (
                  <p className="break-all">
                    <strong className="text-brutal-gray-900">IPIP source:</strong>{" "}
                    <a href={scale.source_url} target="_blank" rel="noopener noreferrer" className="underline">
                      {scale.source_url}
                    </a>
                  </p>
                )}
                {description.threshold_kind && (
                  <p>
                    <strong className="text-brutal-gray-900">Threshold:</strong>{" "}
                    {description.threshold_low ?? "?"}-{description.threshold_high ?? "?"}{" "}
                    ({description.threshold_kind})
                  </p>
                )}
              </div>
            </details>
          </div>
        )}

        {/* description 不在時の source_url fallback */}
        {!description && scale.source_url && (
          <p className="text-xs font-mono text-brutal-gray-600 mb-4 break-all">
            出典:{" "}
            <a href={scale.source_url} target="_blank" rel="noopener noreferrer" className="underline">
              {scale.source_url}
            </a>
          </p>
        )}

        <p className="text-sm text-brutal-gray-700 leading-relaxed mb-6" style={{ fontFamily: "var(--font-display-ja)" }}>
          これから <strong>{items.length} 個</strong>の項目を 1 つずつ提示します。各項目について、最近の自分にどれくらい当てはまるかを 5 段階で答えてください。
          {hasPrefill && (
            <span className="block mt-2 text-xs font-mono text-viz-orange">
              ※ 過去回答がプリフィルされています (再回答で上書き)。
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 bg-viz-cyan text-brutal-white border-brutal-thick border-brutal-black font-mono text-lg tracking-wider hover:bg-viz-blue transition-all"
        >
          受験を開始する →
        </button>

        <Disclaimer />
      </Card>
    </>
  );
}


// ============================================================
// Take (1 question at a time)
// ============================================================

function TakeView({
  scale,
  items,
  currentIdx,
  currentAnswer,
  onAnswer,
  onBack,
  onPrefillJump,
  answers,
}: {
  scale: ScaleHierarchyEntry;
  items: ScaleItem[];
  currentIdx: number;
  currentAnswer: number;
  onAnswer: (v: number) => void;
  onBack: () => void;
  onPrefillJump: (idx: number) => void;
  answers: number[];
}) {
  const item = items[currentIdx];
  if (!item) return <ErrorBox message="項目が見つかりません" />;

  const progress = ((currentIdx + 1) / items.length) * 100;
  const answeredCount = answers.filter((a) => a > 0).length;

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-brutal-gray-700">
          {scale.display_label_ja ?? scale.scale_id}
        </span>
        <span className="text-xs font-mono text-brutal-gray-700">
          {currentIdx + 1} / {items.length}{answeredCount > 0 && ` (回答済 ${answeredCount})`}
        </span>
      </div>
      <div className="h-2 bg-brutal-gray-200 border-brutal-thin border-brutal-black mb-6 overflow-hidden">
        <div className="h-full bg-viz-cyan transition-all" style={{ width: `${progress}%` }} />
      </div>

      <Card variant="white" padding="lg">
        <p className="text-xs font-mono text-brutal-gray-600 mb-2">
          {item.item_id}{item.key < 0 && " (逆転項目)"}
        </p>
        <h2
          className="text-2xl md:text-3xl text-brutal-black mb-6 leading-relaxed"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 500 }}
        >
          {item.ja_text || item.en_text}
        </h2>
        {item.ja_text && (
          <p className="text-xs font-mono text-brutal-gray-500 mb-6 italic">
            {item.en_text}
          </p>
        )}

        <div className="space-y-2">
          {LIKERT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer(opt.value)}
              className={`w-full text-left px-4 py-3 border-brutal-thin border-brutal-black font-mono text-sm transition-all ${
                currentAnswer === opt.value
                  ? "bg-brutal-black text-brutal-white"
                  : "bg-brutal-white hover:bg-brutal-gray-100"
              }`}
            >
              <span className="inline-block w-6 text-xs opacity-70">{opt.value}.</span>
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t-brutal-thin border-brutal-black">
          <button
            type="button"
            onClick={onBack}
            disabled={currentIdx === 0}
            className="px-3 py-1 text-sm font-mono text-brutal-gray-700 hover:text-brutal-black disabled:opacity-30"
          >
            ← 前へ
          </button>
          {currentAnswer > 0 && currentIdx < items.length - 1 && (
            <button
              type="button"
              onClick={() => onPrefillJump(currentIdx + 1)}
              className="px-3 py-1 text-sm font-mono text-brutal-gray-700 hover:text-brutal-black"
            >
              次へ →
            </button>
          )}
        </div>
      </Card>
    </>
  );
}

// ============================================================
// Result
// ============================================================

function ResultView({
  scale,
  items,
  answers,
  score,
  description,
  interpretations,
  onRestart,
}: {
  scale: ScaleHierarchyEntry;
  items: ScaleItem[];
  answers: number[];
  score: ReturnType<typeof scoreLikert5>;
  description: ScaleDescription | null;
  interpretations: ScaleInterpretation[];
  onRestart: () => void;
}) {
  const pct = Math.round(score.normalized * 100);
  // band 判定: threshold があれば raw score で、なければ normalized % で
  const band = pickBand(
    score.total,
    score.min,
    score.max,
    description?.threshold_low ?? null,
    description?.threshold_high ?? null,
  );
  const level = band === "high" ? "高" : band === "mid" ? "中" : "低";
  const levelColor = band === "high" ? "green" : band === "mid" ? "yellow" : "blue";
  const interp = interpretations.find((i) => i.band === band);

  // タイトル階層: facet があれば末端だけ大、path はサブ
  const ja = scale.display_label_ja ?? scale.display_label_en ?? scale.scale_id;
  const jaParts = ja.split(" / ");
  const mainTitleJa = jaParts[jaParts.length - 1];
  const subPathJa = jaParts.slice(0, -1).join(" / ");

  return (
    <>
      <Link
        href="/shindan/explore/"
        className="group inline-flex items-center gap-1 mb-4 text-sm font-mono text-brutal-gray-700 hover:text-brutal-black transition-all"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        <span>探索に戻る</span>
      </Link>
      <Card variant="white" padding="lg">
        <DataBadge color="green">RESULT</DataBadge>
        <h1
          className="text-3xl md:text-5xl text-brutal-black mt-3 mb-1 tracking-wide"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
        >
          {mainTitleJa}
        </h1>
        <p className="text-xs md:text-sm font-mono text-brutal-gray-500 mb-6">
          {subPathJa && <>{subPathJa} <span className="text-brutal-gray-400">·</span> </>}
          <code className="text-brutal-gray-500">{scale.scale_id}</code>
          <span className="text-brutal-gray-400"> · </span>回答 {score.count} 項目
        </p>

        {/* メインスコア表示 */}
        <div className="border-brutal-thick border-brutal-black bg-brutal-gray-50 p-6 mb-6">
          <div className="flex items-baseline gap-4 mb-4">
            <div className="text-6xl md:text-8xl text-brutal-black font-mono">
              {pct}
              <span className="text-2xl text-brutal-gray-600">%</span>
            </div>
            <DataBadge color={levelColor as "green" | "yellow" | "blue"} size="lg">{level}</DataBadge>
          </div>
          <div className="h-4 bg-brutal-white border-brutal-thin border-brutal-black overflow-hidden">
            <div className="h-full bg-viz-cyan" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-4 text-sm font-mono text-brutal-gray-700">
            生スコア {score.total} / 範囲 {score.min}–{score.max} ({pct}% 正規化)
          </p>
        </div>

        {/* 解釈 (= curated があれば優先、なければ generic fallback) */}
        {interp?.interpretation_long ? (
          <div className="p-5 bg-brutal-gray-50 border-l-brutal-thick border-l-viz-cyan rounded-sm">
            <p className="text-xs font-mono text-brutal-gray-600 mb-2">解釈 · {band}</p>
            <div className="text-brutal-gray-800" style={{ fontFamily: "var(--font-display-ja)" }}>
              <MarkdownContent content={interp.interpretation_long} className="prose-sm" />
            </div>
            {interp.caveat && (
              <p className="mt-3 text-xs font-mono text-viz-orange p-2 border-brutal-thin border-viz-orange bg-brutal-yellow">
                ⚠ {interp.caveat}
              </p>
            )}
          </div>
        ) : (
          <ScoreInterpretation pct={pct} scale={scale} />
        )}

        {/* 項目別 breakdown */}
        <details className="mt-6 group">
          <summary className="cursor-pointer text-sm font-mono text-brutal-gray-700 hover:text-brutal-black list-none [&::-webkit-details-marker]:hidden">
            <span className="inline-block transition-transform group-open:rotate-90 mr-1">▶</span>項目別の回答を表示
          </summary>
          <div className="mt-3 space-y-1">
            {items.map((item, i) => {
              const v = answers[i];
              const reverse = item.key < 0;
              const effective = reverse ? 6 - v : v;
              return (
                <div
                  key={item.item_id}
                  className="flex items-start gap-3 px-3 py-2 border-brutal-thin border-brutal-gray-300 text-sm"
                >
                  <span className="font-mono text-xs text-brutal-gray-600 shrink-0 w-12">{item.item_id}</span>
                  <span className="flex-1 text-brutal-gray-800">
                    {item.ja_text || item.en_text}
                    {reverse && <span className="text-xs text-viz-orange ml-1">(逆転)</span>}
                  </span>
                  <span className="font-mono text-xs text-brutal-black shrink-0">
                    {v}{reverse && ` → ${effective}`}
                  </span>
                </div>
              );
            })}
          </div>
        </details>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 py-3 bg-brutal-white text-brutal-black border-brutal-thick border-brutal-black font-mono text-sm hover:bg-brutal-gray-100 transition-all"
          >
            やり直す
          </button>
          <Link
            href="/shindan/explore/"
            className="flex-1 py-3 bg-brutal-black text-brutal-white border-brutal-thick border-brutal-black font-mono text-sm hover:bg-viz-cyan transition-all text-center"
          >
            他の尺度へ
          </Link>
        </div>

        <Disclaimer />
      </Card>
    </>
  );
}

function ScoreInterpretation({ pct, scale }: { pct: number; scale: ScaleHierarchyEntry }) {
  const facet = scale.display_label_ja ?? scale.scale_name ?? scale.facet_name ?? scale.instrument;
  let body: string;
  if (pct >= 70) {
    body = `この尺度 (${facet}) で高めの傾向。同 inventory の他 facet と比較すると相対的に際立つ可能性が高い。1 回の自己評価のスナップショットなので、別の機会の回答や他 inventory の同概念 (構成概念検索) と照合すると安定性を確認できる。`;
  } else if (pct >= 30) {
    body = `この尺度 (${facet}) で中程度の傾向。スコアは中央付近で、極端な傾向は示していない。日々の状況や気分により変動しうる範囲なので、複数回の回答で安定性を見ると示唆が増す。`;
  } else {
    body = `この尺度 (${facet}) で低めの傾向。当該概念に関する自己評価は控えめで、別の facet (例: 同 inventory の対極概念) ではより高い可能性がある。構成概念検索から類似概念を辿ると全体像を掴みやすい。`;
  }
  return (
    <div className="text-sm text-brutal-gray-800 leading-relaxed">
      {body}
    </div>
  );
}

// ============================================================
// shared
// ============================================================

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-brutal-thin border-brutal-black px-3 py-2">
      <div className="text-xs font-mono text-brutal-gray-600">{label}</div>
      <div
        className="text-lg text-brutal-black"
        style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
      >
        {value}
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="mt-6 pt-4 border-t-brutal-thin border-brutal-gray-300">
      <p className="text-xs font-mono text-brutal-gray-600 leading-relaxed">
        ⚠ この測定は医療診断ではありません。スクリーニング目的の心理尺度であり、深刻な症状がある場合は医療専門家にご相談ください。
        スコアは 1 回の自己評価のスナップショットで、日々変動します。
      </p>
    </div>
  );
}

function LoadingBox() {
  return (
    <Card variant="white" padding="lg">
      <p className="text-brutal-gray-600 font-mono text-sm">読み込み中...</p>
    </Card>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <Card variant="pink" padding="lg">
      <p className="font-mono text-sm">エラー: {message}</p>
      <Link href="/shindan/explore/" className="inline-block mt-3 text-sm font-mono underline">
        ← 探索に戻る
      </Link>
    </Card>
  );
}
