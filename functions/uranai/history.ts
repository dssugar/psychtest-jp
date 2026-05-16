/**
 * GET /uranai/history?deviceId=...&sessionId=...&limit=20
 *
 * 月読 chat 画面に入った時の context hydrate 用. 直近 N turn を ascending 順で返す.
 * limit default 20, max 80 (MAX_HISTORY).
 */

import { jsonResponse } from "../_lib/vllm";
import { getRecentTurns } from "../_lib/d1";
import type { HistoryTurn } from "../../lib/uranai/types";

interface Env {
  DB: D1Database;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 80;

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "GET") {
    return jsonResponse({ error: "GET only" }, 405);
  }
  if (!context.env.DB) return jsonResponse({ error: "Missing D1 binding: DB" }, 500);

  const url = new URL(context.request.url);
  const deviceId = url.searchParams.get("deviceId");
  const sessionId = url.searchParams.get("sessionId");
  if (!deviceId || !sessionId) {
    return jsonResponse({ error: "deviceId / sessionId required" }, 400);
  }

  const limitParam = url.searchParams.get("limit");
  let limit = DEFAULT_LIMIT;
  if (limitParam) {
    const n = Number(limitParam);
    if (Number.isFinite(n) && n > 0) limit = Math.min(MAX_LIMIT, Math.floor(n));
  }

  const rows = await getRecentTurns(context.env.DB, { deviceId, sessionId, limit });

  const turns: HistoryTurn[] = rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({
      turnId: r.turn_id,
      role: r.role as "user" | "assistant",
      content: r.content,
      createdAt: r.created_at,
    }));

  return jsonResponse({ turns }, 200);
};
