-- Phase 2.3: user_responses の value CHECK 制約を拡張.
-- spec: docs/specs/ipip-seed-completeness-2026-05.md (の続編)
--
-- 既存制約 (0003): CHECK(value BETWEEN 1 AND 5) — IPIP 5-point Likert 想定.
-- 非 IPIP 4 scale を統合する Phase 2.3 では以下の value range が必要:
--   Rosenberg: 1-4 (4-point Likert)
--   PHQ-9: 0-3 (4-point 0-base)
--   K6: 0-4 (5-point 0-base)
--   SWLS: 1-7 (7-point Likert)
-- これらを raw value のまま保存 (= 原データ保護、後で再 scoring 可能) するため
-- CHECK を 0-7 に緩和する.
--
-- SQLite には ALTER TABLE で CHECK 変更がないため、table 再作成 + データ移行が必要.
-- WHY raw 保存: 学術的に value range を保護することで、scoring rule (各 scale 側) と分離.
-- Phase 4 以降で正規化 (= 1-5 / 0-1 等) する場合も raw から計算可能.

-- 1. 一時 table を新 CHECK で作成
CREATE TABLE user_responses_new (
  device_id    TEXT NOT NULL,
  item_id      TEXT NOT NULL,
  value        INTEGER NOT NULL CHECK(value BETWEEN 0 AND 7),
  answered_at  INTEGER NOT NULL,
  source       TEXT NOT NULL,
  PRIMARY KEY (device_id, item_id),
  FOREIGN KEY (item_id) REFERENCES ipip_items(item_id)
);

-- 2. 既存データを移行 (= 既存 1-5 値は新 CHECK 0-7 範囲内なので全件 OK)
INSERT INTO user_responses_new (device_id, item_id, value, answered_at, source)
  SELECT device_id, item_id, value, answered_at, source FROM user_responses;

-- 3. 旧 table を drop して新 table を rename
DROP TABLE user_responses;
ALTER TABLE user_responses_new RENAME TO user_responses;

-- 4. index 再作成 (= table rename で index は維持されない可能性、念のため CREATE IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_user_responses_device_answered
  ON user_responses (device_id, answered_at DESC);
