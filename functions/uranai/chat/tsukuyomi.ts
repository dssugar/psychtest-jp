/**
 * GET  /uranai/chat/tsukuyomi/   → static HTML (= UI page, fall through to next.js export)
 * POST /uranai/chat/tsukuyomi    → 月読 (Tsukuyomi) chat endpoint (α wedge).
 *
 * spec: docs/specs/uranai-alpha-wedge-2026-05.md
 *
 * UI page と API endpoint を同一 path で扱う (= method 違いで分離).
 * GET は context.next() で static asset (= app/(uranai)/uranai/chat/tsukuyomi/page.tsx
 * の build 結果) にフォールバック.
 *
 * persona: 月読 (詩的・静謐・夜の塔・タロット + 西洋占星術派)
 * context: device-id 紐付きの IPIP profile を D1 から hydrate → 詩的サマリーを system prompt に注入
 * 永続化: 全 turn を D1 conversations に append、直近 20 turn を LLM context に hydrate
 * 防御: L0 + L1 を踏襲、PHQ-9 / K6 opt-in 時のみメンタル context を含める
 *
 * Body (lib/uranai/types.ts ChatRequest):
 *   {
 *     deviceId: string,
 *     sessionId: string,
 *     newMessage: string | null,            // null = session 開始 (初回挨拶 trigger)
 *     divinationContext: DivinationContext,
 *   }
 * Returns: { reply: string, turnId: number } | { error: string }
 */

import { wrapUserMessage, sanitizeUserContent } from "../../_lib/sanitize";
import { checkEnv, callVLLM, jsonResponse, type VLLMEnv, type ChatMsg } from "../../_lib/vllm";
import {
  appendTurn,
  getProfile,
  getRecentTurns,
  nextTurnId,
} from "../../_lib/d1";
import { summarizeProfile } from "../../../lib/uranai/profile-summarizer";
import { buildTsukuyomiSystemPrompt } from "../../../lib/uranai/tsukuyomi-prompt";
import type { ChatRequest, DivinationContext } from "../../../lib/uranai/types";

interface Env extends VLLMEnv {
  DB: D1Database;
}

const HYDRATE_LIMIT = 20; // 直近 N turn を D1 から hydrate → LLM context へ.
const MAX_HISTORY = 80; // 既存 chat.ts 踏襲. token 爆発の安全弁.

export const onRequest: PagesFunction<Env> = async (context) => {
  // GET は UI page (静的 export 済) に fall through. これで同一 path で UI/API 共存.
  if (context.request.method === "GET") {
    return context.next();
  }
  if (context.request.method !== "POST") {
    return jsonResponse({ error: "POST only (GET falls through to static page)" }, 405);
  }

  const missing = checkEnv(context.env);
  if (missing.length > 0) {
    return jsonResponse({ error: `Missing env: ${missing.join(", ")}` }, 500);
  }
  if (!context.env.DB) {
    return jsonResponse({ error: "Missing D1 binding: DB" }, 500);
  }

  let body: Partial<ChatRequest>;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!deviceId || !sessionId) {
    return jsonResponse({ error: "deviceId / sessionId required" }, 400);
  }

  const ctxErr = validateDivinationContext(body.divinationContext);
  if (ctxErr) {
    return jsonResponse({ error: ctxErr }, 400);
  }
  const divinationContext = body.divinationContext as DivinationContext;

  const newMessage =
    typeof body.newMessage === "string" && body.newMessage.length > 0
      ? body.newMessage
      : null;

  const db = context.env.DB;

  // 1. profile を hydrate → 詩的サマリー
  const profileRow = await getProfile(db, deviceId);
  const phq9K6Optin = !!profileRow?.phq9_k6_optin;
  const nickname = profileRow?.nickname ?? null;
  let parsedTestResults: unknown = null;
  if (profileRow?.test_results) {
    try {
      parsedTestResults = JSON.parse(profileRow.test_results);
    } catch {
      // corrupt JSON は無視 (profile が無い場合と同じ扱い).
    }
  }
  const profileSummary = summarizeProfile({
    profile: parsedTestResults
      ? ({ tests: parsedTestResults, metadata: { createdAt: "", updatedAt: "", version: "" } } as any)
      : null,
    phq9K6Optin,
  });

  // 2. system prompt 組立
  const systemPrompt = buildTsukuyomiSystemPrompt({
    divinationContext,
    profileSummary,
    nickname,
  });

  // 3. 過去 turn を D1 から hydrate (oldest → newest 順)
  const past = await getRecentTurns(db, {
    deviceId,
    sessionId,
    limit: HYDRATE_LIMIT,
  });

  // 4. 今回 user turn (もしあれば) を D1 に save (LLM 呼ぶ前に永続化)
  let userTurnId: number | null = null;
  if (newMessage !== null) {
    userTurnId = await nextTurnId(db, { deviceId, sessionId });
    await appendTurn(db, {
      deviceId,
      sessionId,
      turnId: userTurnId,
      role: "user",
      content: newMessage,
    });
  }

  // 5. LLM 呼び出し用の messages 配列を組み立て
  //    過去 turn (D1 から) + 今回 user turn (もしあれば).
  //    user content は L0 sanitize + <user_input> wrap.
  const llmMessages: ChatMsg[] = [{ role: "system", content: systemPrompt }];
  for (const t of past) {
    if (t.role === "user") {
      llmMessages.push({ role: "user", content: wrapUserMessage(t.content) });
    } else if (t.role === "assistant") {
      // 過去の assistant 応答にも L0 sanitize を通す.
      // LLM が誘導されて偽装タグを assistant turn に仕込んだ場合、
      // 次 session の hydrate で無防備に LLM 入力へ流れる経路を塞ぐ.
      llmMessages.push({ role: "assistant", content: sanitizeUserContent(t.content) });
    }
    // system は skip (= system prompt は 1 個に集約)
  }
  if (newMessage !== null) {
    llmMessages.push({ role: "user", content: wrapUserMessage(newMessage) });
  }

  // MAX_HISTORY clamp (system prompt + 直近 N message を残す形)
  if (llmMessages.length > MAX_HISTORY + 1) {
    const system = llmMessages[0];
    const tail = llmMessages.slice(-MAX_HISTORY);
    llmMessages.length = 0;
    llmMessages.push(system, ...tail);
  }

  // 6. vLLM 呼び出し
  const result = await callVLLM(context.env, { messages: llmMessages });
  if (!result.ok) {
    // LLM 失敗時は、save した user turn を rollback したい所だが、α では retry を期待して
    // そのまま残す (= 次回 user が同じ問いを送らずに済むため). β で再実行 UI を作る時に
    // 改めて整理する.
    return jsonResponse({ error: result.error }, result.status);
  }

  // 7. assistant 応答を D1 に save
  const assistantTurnId = await nextTurnId(db, { deviceId, sessionId });
  await appendTurn(db, {
    deviceId,
    sessionId,
    turnId: assistantTurnId,
    role: "assistant",
    content: result.reply,
  });

  return jsonResponse({ reply: result.reply, turnId: assistantTurnId }, 200);
};

function validateDivinationContext(ctx: unknown): string | null {
  if (!ctx || typeof ctx !== "object") return "divinationContext missing";
  const c = ctx as Partial<DivinationContext>;
  if (!Array.isArray(c.tarot) || c.tarot.length !== 3) {
    return "divinationContext.tarot must contain 3 cards";
  }
  if (!c.numerology || typeof c.numerology.lifePath !== "number") {
    return "divinationContext.numerology malformed";
  }
  if (!c.kyusei?.honmeisho?.name || !c.kyusei?.fortune) {
    return "divinationContext.kyusei malformed";
  }
  return null;
}
