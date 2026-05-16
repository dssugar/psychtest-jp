/**
 * GET /scales/[scaleId] — 1 scale の詳細 + items + (任意で) user 回答.
 *
 * Query params:
 *   deviceId — 指定すると user_responses から既存回答を返す (= 結果表示用)
 *
 * Returns:
 *   { scale, items[], responses? }
 */

import { jsonResponse } from "../../_lib/vllm";
import { getScale, listScaleItems, getUserResponsesForScale } from "../../_lib/scales";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env, "scaleId"> = async (context) => {
  if (!context.env.DB) return jsonResponse({ error: "Missing D1 binding: DB" }, 500);
  if (context.request.method !== "GET") return jsonResponse({ error: "GET only" }, 405);

  const scaleId = context.params.scaleId;
  if (!scaleId || typeof scaleId !== "string") {
    return jsonResponse({ error: "scaleId required" }, 400);
  }

  const url = new URL(context.request.url);
  const deviceId = url.searchParams.get("deviceId");

  const scale = await getScale(context.env.DB, scaleId);
  if (!scale) return jsonResponse({ error: "scale not found" }, 404);

  const items = await listScaleItems(context.env.DB, scaleId);

  let responses: Array<{ item_id: string; value: number; answered_at: number }> | undefined;
  if (deviceId) {
    responses = await getUserResponsesForScale(context.env.DB, deviceId, scaleId);
  }

  return jsonResponse({ scale, items, responses }, 200);
};
