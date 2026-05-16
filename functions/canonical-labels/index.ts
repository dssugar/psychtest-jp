/**
 * GET /canonical-labels — IPIP Alphabetical Index 276 構成概念名.
 *
 * Query params:
 *   label — 指定 canonical_label の implementations を返す (= 横断 navigation 用)
 *
 * Returns:
 *   { labels: CanonicalLabelRow[] }              — label= 指定なし
 *   { label: CanonicalLabelRow, impls: ... }     — label= 指定あり
 */

import { jsonResponse } from "../_lib/vllm";
import { listCanonicalLabels, listCanonicalLabelImpls } from "../_lib/scales";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (!context.env.DB) return jsonResponse({ error: "Missing D1 binding: DB" }, 500);
  if (context.request.method !== "GET") return jsonResponse({ error: "GET only" }, 405);

  const url = new URL(context.request.url);
  const label = url.searchParams.get("label");

  if (label) {
    const impls = await listCanonicalLabelImpls(context.env.DB, label);
    // 同 query で label 本体も返す (UI 側で再フェッチさせない)
    const labels = await listCanonicalLabels(context.env.DB);
    const labelRow = labels.find((l) => l.canonical_label === label) ?? null;
    return jsonResponse({ label: labelRow, impls }, 200);
  }

  const labels = await listCanonicalLabels(context.env.DB);
  return jsonResponse({ labels }, 200);
};
