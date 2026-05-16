/**
 * POST /ipip/responses — IPIP 統一項目 DB への回答 upsert (Phase 2.1).
 * GET  /ipip/responses?deviceId=...&source=... — 回答件数. source 指定で scale 別集計.
 *
 * spec: docs/specs/ipip-unified-db-wedge-2026-05.md §"Step 4" / §"Step 6"
 *
 * α scope の認証は device-id のみ (Cloudflare Access 裏で運用、psychtest-jp-access-gated memo 参照).
 * Phase 4 公開時に HMAC 等を追加予定.
 *
 * Body (POST):
 *   {
 *     deviceId: string,                              // required
 *     scaleId:  string,                              // 'bigfive' | 'rosenberg' | ...  (現状 metadata 用、server は無視)
 *     source:   string,                              // 'scale:bigfive' | 'daily_ritual' | 'chat:tsukuyomi'
 *     answers:  Array<{ itemId: string, value: number }>,  // itemId = IPIP Hxxx, value = 1-5
 *   }
 * Returns: { ok: true, count: number } — count は (deviceId, source) 件数
 *        | { error: string }
 */

import { jsonResponse } from "../_lib/vllm";
import { upsertUserResponses, countUserResponses } from "../_lib/d1";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (!context.env.DB) return jsonResponse({ error: "Missing D1 binding: DB" }, 500);

  const method = context.request.method;
  if (method === "POST") return handlePost(context);
  if (method === "GET") return handleGet(context);
  return jsonResponse({ error: "POST / GET only" }, 405);
};

interface PostBody {
  deviceId?: string;
  scaleId?: string;
  source?: string;
  answers?: Array<{ itemId?: string; value?: number }>;
}

async function handlePost(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  let body: PostBody;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  if (!deviceId) return jsonResponse({ error: "deviceId required" }, 400);

  const source = typeof body.source === "string" ? body.source.trim() : "";
  if (!source) return jsonResponse({ error: "source required" }, 400);

  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return jsonResponse({ error: "answers (non-empty array) required" }, 400);
  }

  // answers validation. itemId / value (整数 1-5) を要求. DB 側にも CHECK 制約あり (= defense in depth).
  const responses: Array<{ itemId: string; value: number }> = [];
  for (let i = 0; i < body.answers.length; i++) {
    const a = body.answers[i];
    if (!a || typeof a.itemId !== "string" || a.itemId.length === 0) {
      return jsonResponse({ error: `answers[${i}].itemId required` }, 400);
    }
    if (
      typeof a.value !== "number" ||
      !Number.isInteger(a.value) ||
      a.value < 1 ||
      a.value > 5
    ) {
      return jsonResponse({ error: `answers[${i}].value must be integer 1-5` }, 400);
    }
    responses.push({ itemId: a.itemId, value: a.value });
  }

  await upsertUserResponses(context.env.DB, {
    deviceId,
    source,
    responses,
  });

  // source 単位の累計件数を返す (= device 全件合算ではない、Phase 2.5 進捗表示の素材).
  const total = await countUserResponses(context.env.DB, deviceId, source);
  return jsonResponse({ ok: true, count: total }, 200);
}

async function handleGet(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  const url = new URL(context.request.url);
  const deviceId = url.searchParams.get("deviceId");
  if (!deviceId) return jsonResponse({ error: "deviceId required" }, 400);
  // source 省略時は device 全件合算. 指定すると scale 別集計 (例: source=scale:bigfive).
  const source = url.searchParams.get("source") ?? undefined;

  const total = await countUserResponses(context.env.DB, deviceId, source ?? undefined);
  return jsonResponse({ deviceId, source: source ?? null, count: total }, 200);
}
