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
import {
  getScaleApi,
  scoreLikert5,
  submitScaleResponses,
  type ScaleHierarchyEntry,
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
      // 既存 user_responses があれば prefill (= 再受験時の初期値)
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
    return <IntroView scale={scale} items={items} onStart={startTake} hasPrefill={answers.some((a) => a > 0)} />;
  }

  if (phase === "submitting") {
    return (
      <Card variant="white" padding="lg">
        <p className="font-mono text-sm text-brutal-gray-700">回答を集計しています...</p>
      </Card>
    );
  }

  if (phase === "result" && score) {
    return <ResultView scale={scale} items={items} answers={answers} score={score} onRestart={restart} />;
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
  onStart,
  hasPrefill,
}: {
  scale: ScaleHierarchyEntry;
  items: ScaleItem[];
  onStart: () => void;
  hasPrefill: boolean;
}) {
  return (
    <>
      <Link href="/shindan/explore/" className="inline-block mb-4 text-sm font-mono text-brutal-gray-700 hover:text-brutal-black">
        ← 探索に戻る
      </Link>
      <Card variant="white" padding="lg">
        <DataBadge color="cyan">IPIP SCALE</DataBadge>
        <h1
          className="text-3xl md:text-5xl text-brutal-black mt-3 mb-2 tracking-wide"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
        >
          {scale.display_label_ja ?? scale.display_label_en}
        </h1>
        <p className="text-sm font-mono text-brutal-gray-600 mb-4">
          {scale.scale_id}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="項目数" value={`${items.length}`} />
          <Stat label="Inventory" value={scale.instrument} />
          {scale.alpha != null && <Stat label="Cronbach's α" value={scale.alpha.toFixed(2)} />}
          <Stat label="回答形式" value="5 段階" />
        </div>

        {scale.source_url && (
          <p className="text-xs font-mono text-brutal-gray-600 mb-4 break-all">
            出典: <a href={scale.source_url} target="_blank" rel="noopener noreferrer" className="underline">{scale.source_url}</a>
          </p>
        )}

        <div className="border-t-brutal-thin border-brutal-black pt-4 mb-6">
          <p className="text-sm text-brutal-gray-800 leading-relaxed">
            これから {items.length} 個の項目を 1 つずつ提示します。各項目について、最近の自分にどれくらい当てはまるかを 5 段階で答えてください。
            {hasPrefill && (
              <span className="block mt-2 font-mono text-xs text-viz-orange">
                ※ 過去に同じ scale を受けた回答がプリフィルされています (再回答で上書きされます)。
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 bg-brutal-black text-brutal-white border-brutal-thick border-brutal-black font-mono text-lg tracking-wider hover:bg-viz-cyan transition-all"
        >
          受験を開始 →
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
  onRestart,
}: {
  scale: ScaleHierarchyEntry;
  items: ScaleItem[];
  answers: number[];
  score: ReturnType<typeof scoreLikert5>;
  onRestart: () => void;
}) {
  const pct = Math.round(score.normalized * 100);
  const level = pct >= 70 ? "高" : pct >= 30 ? "中" : "低";
  const levelColor = pct >= 70 ? "green" : pct >= 30 ? "yellow" : "blue";

  return (
    <>
      <Link href="/shindan/explore/" className="inline-block mb-4 text-sm font-mono text-brutal-gray-700 hover:text-brutal-black">
        ← 探索に戻る
      </Link>
      <Card variant="white" padding="lg">
        <DataBadge color="green">RESULT</DataBadge>
        <h1
          className="text-3xl md:text-5xl text-brutal-black mt-3 mb-1 tracking-wide"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
        >
          {scale.display_label_ja ?? scale.display_label_en}
        </h1>
        <p className="text-sm font-mono text-brutal-gray-600 mb-6">
          {scale.scale_id} · 回答 {score.count} 項目
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

        {/* 解釈 */}
        <ScoreInterpretation pct={pct} scale={scale} />

        {/* 項目別 breakdown */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-mono text-brutal-gray-700 hover:text-brutal-black">
            ▼ 項目別の回答を表示
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
