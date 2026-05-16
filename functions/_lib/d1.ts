/**
 * D1 access helpers.
 *
 * schema:
 *   - profiles / conversations / divination_results  (migrations/0001_init.sql)
 *   - profiles.birth_date                            (migrations/0002_birth_date.sql)
 *   - ipip_items / user_responses / scales           (migrations/0003_ipip_unified.sql)
 *
 * Layer 1 (短期 summary) / Layer 3 (episode) は β/γ で追加するので、ここには
 * 単純な append / select / upsert しかない. JOIN もまだ不要.
 */

export interface ProfileRow {
  device_id: string;
  nickname: string | null;
  test_results: string | null;
  phq9_k6_optin: number;
  birth_date: string | null;
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

export interface UserResponseRow {
  device_id: string;
  item_id: string;
  value: number;
  answered_at: number;
  source: string;
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
    birthDate?: string | null;
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
  const birthDateParam = patch.birthDate === undefined ? null : patch.birthDate;

  await db
    .prepare(
      `INSERT INTO profiles (device_id, nickname, test_results, phq9_k6_optin, birth_date, created_at, updated_at)
       VALUES (?1, ?2, ?3, COALESCE(?4, 0), ?5, ?6, ?6)
       ON CONFLICT(device_id) DO UPDATE SET
         nickname      = COALESCE(excluded.nickname,      profiles.nickname),
         test_results  = COALESCE(excluded.test_results,  profiles.test_results),
         phq9_k6_optin = COALESCE(excluded.phq9_k6_optin, profiles.phq9_k6_optin),
         birth_date    = COALESCE(excluded.birth_date,    profiles.birth_date),
         updated_at    = excluded.updated_at`,
    )
    .bind(deviceId, nicknameParam, testResultsParam, phq9K6OptinParam, birthDateParam, now)
    .run();
}

/**
 * 全消去 (settings の「全データ消去」用). conversations / divination_results / user_responses も巻き添え.
 * Phase 2.1: user_responses を追加. 漏らすと device-id 再生成後に他人の回答が残留する.
 */
export async function deleteAllForDevice(
  db: D1Database,
  deviceId: string,
): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM conversations WHERE device_id = ?1").bind(deviceId),
    db.prepare("DELETE FROM divination_results WHERE device_id = ?1").bind(deviceId),
    db.prepare("DELETE FROM user_responses WHERE device_id = ?1").bind(deviceId),
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

// ============================================================
// user_responses (Phase 2.1 IPIP 統一項目 DB)
// ============================================================

/**
 * 複数 IPIP 項目の回答を upsert. 1 user × 1 item は 1 回答 (= 再受験 overwrite).
 *
 * 全 INSERT を batch() で atomic 実行 (= 一部失敗で部分書き込みを残さない).
 * D1 batch の statement 上限は 1,000 なので、Phase 2.1 想定 (1 scale ≤ 300 items) では十分.
 */
export async function upsertUserResponses(
  db: D1Database,
  args: {
    deviceId: string;
    source: string;
    responses: Array<{ itemId: string; value: number }>;
  },
): Promise<void> {
  if (args.responses.length === 0) return;
  const now = Date.now();
  await db.batch(
    args.responses.map((r) =>
      db
        .prepare(
          `INSERT INTO user_responses (device_id, item_id, value, answered_at, source)
           VALUES (?1, ?2, ?3, ?4, ?5)
           ON CONFLICT(device_id, item_id) DO UPDATE SET
             value       = excluded.value,
             answered_at = excluded.answered_at,
             source      = excluded.source`,
        )
        .bind(args.deviceId, r.itemId, r.value, now, args.source),
    ),
  );
}

/**
 * device 単位の回答件数. source 指定で scale 別の集計も可能 (例: 'scale:bigfive' で BigFive 完走件数).
 * Phase 2.5 朝の儀式 / Phase 2.6 進捗 N/M 表示の基礎.
 */
export async function countUserResponses(
  db: D1Database,
  deviceId: string,
  source?: string,
): Promise<number> {
  if (source) {
    const row = await db
      .prepare(`SELECT COUNT(*) AS n FROM user_responses WHERE device_id = ?1 AND source = ?2`)
      .bind(deviceId, source)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM user_responses WHERE device_id = ?1`)
    .bind(deviceId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}
