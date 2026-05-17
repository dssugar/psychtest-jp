/**
 * Phase 2.x.F: 動的 scale 探索・受験・結果表示 UI 用の API client.
 *
 * Pages Functions (functions/scales/*, functions/canonical-labels/*) を fetch するだけの薄い helper.
 */

import { getOrCreateDeviceId } from "@/lib/uranai/device-id";

export interface ScaleHierarchyEntry {
  scale_id: string;
  parent_scale_id: string | null;
  level: number;
  instrument: string;
  scale_name: string | null;
  facet_name: string | null;
  subfacet_name: string | null;
  display_label_en: string | null;
  display_label_ja: string | null;
  alpha: number | null;
  source_url: string | null;
  item_count?: number;
  items_source?: "direct" | "aggregated" | null;
}

export interface CanonicalLabel {
  canonical_label: string;
  display_label_ja: string | null;
  description: string | null;
  impl_count?: number;
}

export interface CanonicalImpl {
  canonical_label: string;
  instrument: string;
  facet_code: string;
  scale_id: string | null;
  display_label_ja?: string | null;
}

export interface ScaleItem {
  scale_id: string;
  item_id: string;
  key: number; // +1 = forward, -1 = reverse
  label: string | null;
  en_text: string;
  ja_text: string | null;
}

export interface UserResponseRow {
  item_id: string;
  value: number;
  answered_at: number;
}

// ---------- API ----------

export async function listInstrumentsApi(): Promise<ScaleHierarchyEntry[]> {
  const res = await fetch("/scales/");
  if (!res.ok) throw new Error(`/scales 失敗: ${res.status}`);
  const data = (await res.json()) as { instruments?: ScaleHierarchyEntry[] };
  return data.instruments ?? [];
}

export async function listInstrumentScalesApi(
  instrument: string,
): Promise<{ instrument: ScaleHierarchyEntry | null; scales: ScaleHierarchyEntry[] }> {
  const res = await fetch(`/scales/?instrument=${encodeURIComponent(instrument)}`);
  if (!res.ok) throw new Error(`/scales?instrument=... 失敗: ${res.status}`);
  return await res.json();
}

export async function getScaleApi(
  scaleId: string,
  includeResponses = false,
): Promise<{
  scale: ScaleHierarchyEntry;
  items: ScaleItem[];
  responses?: UserResponseRow[];
}> {
  const url = new URL(`/scales/${encodeURIComponent(scaleId)}/`, window.location.origin);
  if (includeResponses) {
    const deviceId = getOrCreateDeviceId();
    if (deviceId) url.searchParams.set("deviceId", deviceId);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`/scales/${scaleId} 失敗: ${res.status}`);
  return await res.json();
}

export async function listCanonicalLabelsApi(): Promise<CanonicalLabel[]> {
  const res = await fetch("/canonical-labels/");
  if (!res.ok) throw new Error(`/canonical-labels 失敗: ${res.status}`);
  const data = (await res.json()) as { labels?: CanonicalLabel[] };
  return data.labels ?? [];
}

export async function getCanonicalLabelApi(
  label: string,
): Promise<{ label: CanonicalLabel | null; impls: CanonicalImpl[] }> {
  const res = await fetch(`/canonical-labels/?label=${encodeURIComponent(label)}`);
  if (!res.ok) throw new Error(`/canonical-labels?label=... 失敗: ${res.status}`);
  return await res.json();
}

/**
 * scale 完走時に raw answers を POST. user_responses に upsert される.
 */
export async function submitScaleResponses(
  scaleId: string,
  items: ScaleItem[],
  answers: number[], // 1-5 Likert (UI 表示順 = items 順)
): Promise<void> {
  if (items.length !== answers.length) throw new Error("items / answers 長さ不一致");
  const deviceId = getOrCreateDeviceId();
  if (!deviceId) return;
  const payload = {
    deviceId,
    scaleId,
    source: `scale:${scaleId}`,
    answers: items.map((it, i) => ({ itemId: it.item_id, value: answers[i] })),
  };
  const res = await fetch("/ipip/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /ipip/responses 失敗: ${res.status}`);
}

// ---------- スコアリング (clientside) ----------

/**
 * 1-5 Likert を + key (+1) / 逆転 (-1) を考慮して合算.
 * value range は IPIP 5 段階前提. 非 IPIP scale は raw range で別途実装.
 */
export interface ScaleScore {
  total: number; // 生スコア
  max: number; // 最大可能値
  min: number; // 最小可能値
  count: number; // 回答数
  normalized: number; // 0-1 に正規化 (= (total - min) / (max - min))
}

export function scoreLikert5(items: ScaleItem[], answers: number[]): ScaleScore {
  const n = Math.min(items.length, answers.length);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const v = answers[i];
    const k = items[i].key;
    // + key: そのまま、- key: 6 - v (1↔5, 2↔4, 3→3)
    total += k >= 0 ? v : 6 - v;
  }
  const min = n * 1;
  const max = n * 5;
  return { total, max, min, count: n, normalized: max === min ? 0 : (total - min) / (max - min) };
}
