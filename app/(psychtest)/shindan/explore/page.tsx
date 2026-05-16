"use client";

/**
 * Phase 2.x.F.1: scale 探索 UI.
 *
 * 2 つの入口を併設:
 *   1. instrument 別 (NEO / HEXACO-PI / VIA / ... の 37 inventory 一覧)
 *   2. canonical_label 検索 (IPIP Alphabetical Index 276 構成概念名)
 *
 * 選択 → /shindan/scale/?id=<scaleId> に navigate.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import {
  listInstrumentsApi,
  listInstrumentScalesApi,
  listCanonicalLabelsApi,
  getCanonicalLabelApi,
  type ScaleHierarchyEntry,
  type CanonicalLabel,
  type CanonicalImpl,
} from "@/lib/shindan/api";

type Tab = "instrument" | "label";

export default function ShindanExplorePage() {
  const [tab, setTab] = useState<Tab>("instrument");

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <DataBadge color="cyan" size="lg">SCALE EXPLORER</DataBadge>
            <h1
              className="text-4xl md:text-6xl text-brutal-black mt-4 mb-2 tracking-wider"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              心理尺度ライブラリ
            </h1>
            <p className="text-lg text-brutal-gray-700">
              IPIP 公式 3,616 項目・37 inventory・276 構成概念から自由に組み立てて受験できます。
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-6">
            <TabButton active={tab === "instrument"} onClick={() => setTab("instrument")}>
              Inventory 別 (37)
            </TabButton>
            <TabButton active={tab === "label"} onClick={() => setTab("label")}>
              構成概念から検索 (276)
            </TabButton>
          </div>

          {tab === "instrument" ? <InstrumentBrowser /> : <CanonicalLabelBrowser />}
        </div>
      </div>
    </main>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 border-brutal-thick border-brutal-black font-mono text-sm tracking-wide transition-all ${
        active ? "bg-brutal-black text-brutal-white" : "bg-brutal-white text-brutal-black hover:bg-brutal-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// Instrument 一覧 + 選択時の facet 展開
// ============================================================

function InstrumentBrowser() {
  const [instruments, setInstruments] = useState<ScaleHierarchyEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedInst, setSelectedInst] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listInstrumentsApi()
      .then((list) => {
        if (!cancelled) setInstruments(list);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!instruments) return <LoadingBox />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 左 1/3: instrument 一覧 */}
      <div className="md:col-span-1">
        <h2
          className="text-xl text-brutal-black mb-3 tracking-wide"
          style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
        >
          Inventory ({instruments.length})
        </h2>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {instruments.map((inst) => (
            <button
              key={inst.scale_id}
              type="button"
              onClick={() => setSelectedInst(inst.instrument)}
              className={`w-full text-left px-3 py-2 border-brutal-thin border-brutal-black font-mono text-sm transition-all ${
                selectedInst === inst.instrument
                  ? "bg-brutal-black text-brutal-white"
                  : "bg-brutal-white hover:bg-brutal-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{inst.instrument}</span>
                <span className="text-xs opacity-70">{inst.item_count ?? 0}</span>
              </div>
              {inst.display_label_ja && inst.display_label_ja !== inst.instrument && (
                <div className="text-xs opacity-70 mt-1" style={{ fontFamily: "var(--font-display-ja)" }}>
                  {inst.display_label_ja}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 右 2/3: 選択 instrument の scale tree */}
      <div className="md:col-span-2">
        {selectedInst ? (
          <InstrumentDetail instrument={selectedInst} />
        ) : (
          <Card variant="white" padding="lg">
            <p className="text-brutal-gray-700">
              左から inventory を選択してください。inventory 内の scale / facet 一覧が表示され、各 scale から直接受験できます。
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function InstrumentDetail({ instrument }: { instrument: string }) {
  const [data, setData] = useState<{
    instrument: ScaleHierarchyEntry | null;
    scales: ScaleHierarchyEntry[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    listInstrumentScalesApi(instrument)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [instrument]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <LoadingBox />;

  // tree 構造化: level=2 を親、level=3 を子としてグループ化
  const level2 = data.scales.filter((s) => s.level === 2);
  const level3ByParent = new Map<string, ScaleHierarchyEntry[]>();
  for (const s of data.scales.filter((s) => s.level >= 3)) {
    const p = s.parent_scale_id ?? "_orphan";
    const arr = level3ByParent.get(p) ?? [];
    arr.push(s);
    level3ByParent.set(p, arr);
  }

  return (
    <Card variant="white" padding="lg">
      <h2
        className="text-2xl text-brutal-black mb-1 tracking-wide"
        style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
      >
        {data.instrument?.display_label_ja ?? instrument}
      </h2>
      <p className="text-sm text-brutal-gray-600 font-mono mb-4">
        {instrument} · {data.scales.length} scales
      </p>
      <div className="space-y-3">
        {level2.map((s) => {
          const children = level3ByParent.get(s.scale_id) ?? [];
          return (
            <div key={s.scale_id} className="border-l-brutal-thick border-l-viz-cyan pl-3">
              <ScaleRow s={s} />
              {children.length > 0 && (
                <div className="ml-4 mt-2 space-y-1">
                  {children.map((c) => (
                    <ScaleRow key={c.scale_id} s={c} isChild />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ScaleRow({ s, isChild = false }: { s: ScaleHierarchyEntry; isChild?: boolean }) {
  return (
    <Link
      href={`/shindan/scale/?id=${encodeURIComponent(s.scale_id)}`}
      className={`block px-3 py-2 border-brutal-thin border-brutal-black hover:bg-brutal-gray-100 transition-all ${
        isChild ? "bg-brutal-gray-50" : "bg-brutal-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="text-sm text-brutal-black"
            style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
          >
            {s.display_label_ja ?? s.display_label_en ?? s.scale_id}
          </div>
          <div className="text-xs font-mono text-brutal-gray-600 truncate">
            {s.scale_name ?? ""}
            {s.facet_name ? ` › ${s.facet_name}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-brutal-gray-700 shrink-0">
          {s.alpha != null && <span>α={s.alpha.toFixed(2)}</span>}
          <span>{s.item_count ?? 0} 項目</span>
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// canonical_label browser (= 構成概念から横断検索)
// ============================================================

function CanonicalLabelBrowser() {
  const [labels, setLabels] = useState<CanonicalLabel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCanonicalLabelsApi()
      .then((list) => {
        if (!cancelled) setLabels(list);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!labels) return [];
    if (!query.trim()) return labels;
    const q = query.toLowerCase();
    return labels.filter(
      (l) =>
        l.canonical_label.toLowerCase().includes(q) ||
        (l.display_label_ja ?? "").toLowerCase().includes(q),
    );
  }, [labels, query]);

  if (error) return <ErrorBox message={error} />;
  if (!labels) return <LoadingBox />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: 神経症 / Achievement / 共感..."
          className="w-full px-3 py-2 border-brutal-thick border-brutal-black bg-brutal-white text-sm font-mono mb-3"
        />
        <div className="text-xs font-mono text-brutal-gray-600 mb-2">
          {filtered.length} / {labels.length} 件
        </div>
        <div className="space-y-1 max-h-[65vh] overflow-y-auto pr-2">
          {filtered.map((l) => (
            <button
              key={l.canonical_label}
              type="button"
              onClick={() => setSelected(l.canonical_label)}
              className={`w-full text-left px-3 py-2 border-brutal-thin border-brutal-black text-sm transition-all ${
                selected === l.canonical_label
                  ? "bg-brutal-black text-brutal-white"
                  : "bg-brutal-white hover:bg-brutal-gray-100"
              }`}
            >
              <div style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}>
                {l.display_label_ja ?? l.canonical_label}
              </div>
              <div className="text-xs font-mono opacity-70 truncate">
                {l.canonical_label} · {l.impl_count ?? 0} 実装
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        {selected ? (
          <CanonicalLabelDetail label={selected} />
        ) : (
          <Card variant="white" padding="lg">
            <p className="text-brutal-gray-700">
              左の検索ボックスで構成概念を絞り込み、選択してください。複数 inventory にまたがる実装が一覧表示されます。
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function CanonicalLabelDetail({ label }: { label: string }) {
  const [data, setData] = useState<{ label: CanonicalLabel | null; impls: CanonicalImpl[] } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    getCanonicalLabelApi(label)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [label]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <LoadingBox />;

  return (
    <Card variant="white" padding="lg">
      <h2
        className="text-2xl text-brutal-black mb-1 tracking-wide"
        style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
      >
        {data.label?.display_label_ja ?? label}
      </h2>
      <p className="text-sm text-brutal-gray-600 font-mono mb-4">
        {label} · {data.impls.length} inventory 実装
      </p>
      <div className="space-y-2">
        {data.impls.map((impl, i) => {
          const linkable = !!impl.scale_id;
          const inner = (
            <div className="flex items-center justify-between gap-3 px-3 py-2 border-brutal-thin border-brutal-black">
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm text-brutal-black"
                  style={{ fontFamily: "var(--font-display-ja)", fontWeight: 700 }}
                >
                  {impl.instrument} / {impl.facet_code}
                </div>
                {impl.display_label_ja && (
                  <div className="text-xs font-mono text-brutal-gray-700 truncate">
                    {impl.display_label_ja}
                  </div>
                )}
              </div>
              <div className="text-xs font-mono text-brutal-gray-600 shrink-0">
                {linkable ? "→ 受験" : "未連結"}
              </div>
            </div>
          );
          return linkable ? (
            <Link
              key={`${impl.instrument}-${impl.facet_code}-${i}`}
              href={`/shindan/scale/?id=${encodeURIComponent(impl.scale_id!)}`}
              className="block hover:bg-brutal-gray-100 transition-all"
            >
              {inner}
            </Link>
          ) : (
            <div key={`${impl.instrument}-${impl.facet_code}-${i}`} className="opacity-60">
              {inner}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================
// shared
// ============================================================

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
    </Card>
  );
}
