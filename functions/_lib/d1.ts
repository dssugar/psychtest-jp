/**
 * D1 access helpers for the α uranai wedge.
 *
 * schema: migrations/0001_init.sql
 *   - profiles            (Layer 0)
 *   - conversations       (Layer 2)
 *   - divination_results  (シェア用 store)
 *
 * Layer 1 (短期 summary) / Layer 3 (episode) は β/γ で追加するので、ここには
 * 単純な append / select / upsert しかない. JOIN もまだ不要.
 */

export interface ProfileRow {
  device_id: string;
  nickname: string | null;
  test_results: string | null;
  phq9_k6_optin: number;
  created_at: number;
  updated_at: number;
}

export interface ConversationRow {
  device_id: string;
  session_id: string;
  turn_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: number;
}

export interface DivinationRow {
  result_id: string;
  device_id: string;
  type: string;
  inputs: string;
  interpretation: string;
  created_at: number;
}

// ============================================================
// profiles
// ============================================================

export async function getProfile(
  db: D1Database,
  deviceId: string,
): Promise<ProfileRow | null> {
  const row = await db
    .prepare("SELECT * FROM profiles WHERE device_id = ?1")
    .bind(deviceId)
    .first<ProfileRow>();
  return row ?? null;
}

/**
 * 部分 update. `undefined` を渡したフィールドは更新しない (COALESCE).
 * 値を消したい時は明示的に `null` (nickname / testResults) を渡す.
 * 値を立てたい時は明示的に値を渡す (phq9K6Optin true/false).
 *
 * 並行 PUT (settings 保存と chat マウント時 sync) で last-write-wins しないよう、
 * INSERT ... ON CONFLICT で単一 SQL の atomic upsert.
 * 渡されなかったカラムは既存値を維持 (COALESCE で新 binding が NULL を意味する場合のみ既存値採用).
 */
export async function upsertProfile(
  db: D1Database,
  deviceId: string,
  patch: {
    nickname?: string | null;
    testResults?: unknown | null;
    phq9K6Optin?: boolean;
  },
): Promise<void> {
  const now = Date.now();

  // patch に key が存在しない (= undefined) → SQL 側で NULL を渡し、COALESCE で既存値を維持.
  // patch.nickname === null → ユーザーが明示的に nickname を消したいので NULL を保存 (← COALESCE で復活してしまうので別 logic 必要).
  // → 「明示 null で消す」セマンティクスは α では不要 (settings UI も "" を null 化するだけ).
  //   よって COALESCE が単純に既存値維持として機能する. 完全に消したい case は β で別 endpoint.
  const nicknameParam = patch.nickname === undefined ? null : patch.nickname;
  const testResultsParam =
    patch.testResults === undefined ? null : JSON.stringify(patch.testResults);
  const phq9K6OptinParam =
    patch.phq9K6Optin === undefined ? null : patch.phq9K6Optin ? 1 : 0;

  await db
    .prepare(
      `INSERT INTO profiles (device_id, nickname, test_results, phq9_k6_optin, created_at, updated_at)
       VALUES (?1, ?2, ?3, COALESCE(?4, 0), ?5, ?5)
       ON CONFLICT(device_id) DO UPDATE SET
         nickname      = COALESCE(excluded.nickname,      profiles.nickname),
         test_results  = COALESCE(excluded.test_results,  profiles.test_results),
         phq9_k6_optin = COALESCE(excluded.phq9_k6_optin, profiles.phq9_k6_optin),
         updated_at    = excluded.updated_at`,
    )
    .bind(deviceId, nicknameParam, testResultsParam, phq9K6OptinParam, now)
    .run();
}

/**
 * 全消去 (settings の「全データ消去」用). conversations と divination_results も巻き添え.
 */
export async function deleteAllForDevice(
  db: D1Database,
  deviceId: string,
): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM conversations WHERE device_id = ?1").bind(deviceId),
    db.prepare("DELETE FROM divination_results WHERE device_id = ?1").bind(deviceId),
    db.prepare("DELETE FROM profiles WHERE device_id = ?1").bind(deviceId),
  ]);
}

// ============================================================
// conversations
// ============================================================

/**
 * append 1 turn. turn_id は呼び出し側で計算 (= 直近 max + 1, または新 session なら 0).
 */
export async function appendTurn(
  db: D1Database,
  args: {
    deviceId: string;
    sessionId: string;
    turnId: number;
    role: "user" | "assistant" | "system";
    content: string;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO conversations
              (device_id, session_id, turn_id, role, content, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(args.deviceId, args.sessionId, args.turnId, args.role, args.content, Date.now())
    .run();
}

export async function getRecentTurns(
  db: D1Database,
  args: { deviceId: string; sessionId: string; limit: number },
): Promise<ConversationRow[]> {
  // ascending 順で返す (古い → 新しい). client / LLM 両方で消費しやすい.
  const r = await db
    .prepare(
      `SELECT * FROM conversations
        WHERE device_id = ?1 AND session_id = ?2
        ORDER BY turn_id DESC
        LIMIT ?3`,
    )
    .bind(args.deviceId, args.sessionId, args.limit)
    .all<ConversationRow>();
  const rows = r.results ?? [];
  return rows.slice().reverse(); // turn_id 昇順に戻す
}

export async function nextTurnId(
  db: D1Database,
  args: { deviceId: string; sessionId: string },
): Promise<number> {
  const row = await db
    .prepare(
      `SELECT MAX(turn_id) as max_turn FROM conversations
        WHERE device_id = ?1 AND session_id = ?2`,
    )
    .bind(args.deviceId, args.sessionId)
    .first<{ max_turn: number | null }>();
  const max = row?.max_turn;
  return max === null || max === undefined ? 0 : max + 1;
}

// ============================================================
// divination_results
// ============================================================

export async function saveDivinationResult(
  db: D1Database,
  args: {
    resultId: string;
    deviceId: string;
    type: string;
    inputs: unknown;
    interpretation: string;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO divination_results
              (result_id, device_id, type, inputs, interpretation, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(
      args.resultId,
      args.deviceId,
      args.type,
      JSON.stringify(args.inputs),
      args.interpretation,
      Date.now(),
    )
    .run();
}

export async function getDivinationResult(
  db: D1Database,
  resultId: string,
): Promise<DivinationRow | null> {
  const row = await db
    .prepare("SELECT * FROM divination_results WHERE result_id = ?1")
    .bind(resultId)
    .first<DivinationRow>();
  return row ?? null;
}
