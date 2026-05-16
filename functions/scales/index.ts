/**
 * GET /scales — instrument 一覧 + 全 scale 一覧 (Phase 2.x.F.1).
 *
 * Query params:
 *   instrument — 指定 instrument 配下の scale 詳細のみ返す (= instrument 詳細 view 用)
 *
 * Returns:
 *   { instruments: ScaleHierarchyRow[] }     — instrument= 指定なし
 *   { instrument: ScaleHierarchyRow, scales: ScaleHierarchyRow[] }  — instrument= 指定あり
 */

import { jsonResponse } from "../_lib/vllm";
import { listInstruments, listInstrumentScales, getScale } from "../_lib/scales";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (!context.env.DB) return jsonResponse({ error: "Missing D1 binding: DB" }, 500);
  if (context.request.method !== "GET") return jsonResponse({ error: "GET only" }, 405);

  const url = new URL(context.request.url);
  const instrument = url.searchParams.get("instrument");

  if (instrument) {
    // instrument scale_id = instrument の slug の場合があるため両方試行
    const baseHier = await getScale(context.env.DB, instrument.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""));
    const scales = await listInstrumentScales(context.env.DB, instrument);
    return jsonResponse({ instrument: baseHier, scales }, 200);
  }

  const instruments = await listInstruments(context.env.DB);
  return jsonResponse({ instruments }, 200);
};
