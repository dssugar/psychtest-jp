-- α wedge (uranai / 月読) 初期 schema.
-- spec: docs/specs/uranai-alpha-wedge-2026-05.md §"D1 最小 schema"
-- 記憶アーキテクチャ (project-design.md §8) の Layer 0 (profiles) + Layer 2 (conversations 生データ全保管) のみ.
-- Layer 1 (短期 summary) / Layer 3 (episode) は β/γ で追加.

CREATE TABLE IF NOT EXISTS profiles (
  device_id     TEXT PRIMARY KEY,
  nickname      TEXT,
  test_results  TEXT,                                  -- JSON. lib/storage.ts の UserProfile.tests snapshot.
  phq9_k6_optin INTEGER NOT NULL DEFAULT 0,            -- 0/1. キャラに PHQ-9/K6 を渡してよいかの明示同意.
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  device_id  TEXT NOT NULL,
  session_id TEXT NOT NULL,
  turn_id    INTEGER NOT NULL,                         -- 0-origin の連番. session 内でユニーク.
  role       TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content    TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (device_id, session_id, turn_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_device_created
  ON conversations (device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS divination_results (
  result_id      TEXT PRIMARY KEY,                     -- UUID v4.
  device_id      TEXT NOT NULL,
  type           TEXT NOT NULL,                        -- 'tarot3' | '3systems' | ...
  inputs         TEXT NOT NULL,                        -- JSON (cards + numerology + kyusei).
  interpretation TEXT NOT NULL,
  created_at     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_divination_device_created
  ON divination_results (device_id, created_at DESC);
