/**
 * GET /uranai/profile?deviceId=...   — profile + opt-in 状態を返す.
 * PUT /uranai/profile                — { deviceId, nickname?, testResults?, phq9K6Optin? } を upsert.
 * DELETE /uranai/profile?deviceId=...  — 全消去 (profile + conversations + divination_results).
 *
 * α wedge:
 *   - testResults は localStorage の UserProfile.tests を JSON でそのまま受け取って D1 に保存.
 *   - 月読 chat endpoint が D1 から取り出して profile-summarizer に渡す.
 *   - 暗号化なし (β/公開時に Workers Crypto API 導入予定).
 */

import { jsonResponse } from "../_lib/vllm";
import {
  getProfile,
  upsertProfile,
  deleteAllForDevice,
} from "../_lib/d1";
import type { ProfilePayload } from "../../lib/uranai/types";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (!context.env.DB) return jsonResponse({ error: "Missing D1 binding: DB" }, 500);

  const method = context.request.method;
  if (method === "GET") return handleGet(context);
  if (method === "PUT") return handlePut(context);
  if (method === "DELETE") return handleDelete(context);
  return jsonResponse({ error: "GET / PUT / DELETE only" }, 405);
};

async function handleGet(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  const url = new URL(context.request.url);
  const deviceId = url.searchParams.get("deviceId");
  if (!deviceId) return jsonResponse({ error: "deviceId required" }, 400);

  const row = await getProfile(context.env.DB, deviceId);
  if (!row) {
    // 初回 access: empty payload を返す (404 にせず、client が PUT で初期化できるように).
    const payload: ProfilePayload = {
      deviceId,
      nickname: null,
      testResults: null,
      phq9K6Optin: false,
      createdAt: 0,
      updatedAt: 0,
    };
    return jsonResponse(payload, 200);
  }

  let testResults: unknown = null;
  if (row.test_results) {
    try {
      testResults = JSON.parse(row.test_results);
    } catch {
      // corrupt は null 扱い.
    }
  }

  const payload: ProfilePayload = {
    deviceId: row.device_id,
    nickname: row.nickname,
    testResults,
    phq9K6Optin: !!row.phq9_k6_optin,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return jsonResponse(payload, 200);
}

interface PutBody {
  deviceId?: string;
  nickname?: string | null;
  testResults?: unknown;
  phq9K6Optin?: boolean;
}

async function handlePut(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  let body: PutBody;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  if (!deviceId) return jsonResponse({ error: "deviceId required" }, 400);

  await upsertProfile(context.env.DB, deviceId, {
    nickname: body.nickname === undefined ? undefined : body.nickname,
    testResults: body.testResults === undefined ? undefined : body.testResults,
    phq9K6Optin: body.phq9K6Optin === undefined ? undefined : !!body.phq9K6Optin,
  });

  // 更新後の最新 state を返す.
  const after = await getProfile(context.env.DB, deviceId);
  let testResults: unknown = null;
  if (after?.test_results) {
    try {
      testResults = JSON.parse(after.test_results);
    } catch {
      // ignore
    }
  }
  const payload: ProfilePayload = {
    deviceId,
    nickname: after?.nickname ?? null,
    testResults,
    phq9K6Optin: !!after?.phq9_k6_optin,
    createdAt: after?.created_at ?? 0,
    updatedAt: after?.updated_at ?? 0,
  };
  return jsonResponse(payload, 200);
}

async function handleDelete(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  const url = new URL(context.request.url);
  const deviceId = url.searchParams.get("deviceId");
  if (!deviceId) return jsonResponse({ error: "deviceId required" }, 400);

  await deleteAllForDevice(context.env.DB, deviceId);
  return jsonResponse({ ok: true }, 200);
}
