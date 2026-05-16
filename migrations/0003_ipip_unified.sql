-- Phase 2.1: IPIP 統一項目 DB wedge.
-- spec: docs/specs/ipip-unified-db-wedge-2026-05.md §"D1 schema migration"
--
-- IPIP 3,320 項目を一次キー化し、各心理尺度を view 的に scales テーブルで管理する。
-- Big Five (= NEO instrument 185 から抽出した 120) を内部 migration し、
-- /bigfive 完走時に user_responses へ raw 1-5 値を蓄積する基盤。
--
-- 朝の儀式 (Phase 2.5) / 月読会話駆動 (Phase 3.2) / 進捗 N/M 表示 (Phase 2.6) の前提。

-- ============================================================
-- ipip_items: IPIP 公式 3,320 項目 (Hxxx / Exxx) のマスタ
-- ============================================================
CREATE TABLE IF NOT EXISTS ipip_items (
  item_id    TEXT PRIMARY KEY,                            -- IPIP 公式 ID (例: H1, H1131, E118)
  en_text    TEXT NOT NULL,                               -- 英語原文 (Tedone / IPIP-3320 と一致)
  ja_text    TEXT,                                        -- 日本語訳. ipip-translation 1,911 / 3,320 を populate, 残は NULL
  source     TEXT NOT NULL DEFAULT 'ipip_3320',           -- 'ipip_3320' | 'llm_generated' | 'legacy_bigfive' 等
  created_at INTEGER NOT NULL
);

-- ============================================================
-- user_responses: device-id × item の生回答 (1 user 1 item 1 回答、再回答は overwrite)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_responses (
  device_id    TEXT NOT NULL,
  item_id      TEXT NOT NULL,                             -- ipip_items.item_id への参照
  value        INTEGER NOT NULL CHECK(value BETWEEN 1 AND 5),  -- 1-5 (尺度により 1-4, 1-7 もあり scale 側で正規化)
  answered_at  INTEGER NOT NULL,                          -- epoch ms
  source       TEXT NOT NULL,                             -- 'scale:bigfive' | 'daily_ritual' | 'chat:tsukuyomi' 等
  PRIMARY KEY (device_id, item_id),
  FOREIGN KEY (item_id) REFERENCES ipip_items(item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_responses_device_answered
  ON user_responses (device_id, answered_at DESC);

-- ============================================================
-- scales: 各 instrument がどの IPIP 項目を使うかの mapping (Tedone Table から seed)
-- ============================================================
CREATE TABLE IF NOT EXISTS scales (
  scale_id    TEXT NOT NULL,                              -- 'bigfive' | 'hexaco_pi' | 'neo' | '16pf' | etc
  instrument  TEXT,                                       -- Tedone 'instrument' 原文 (NEO, HEXACO_PI, ...)
  item_id     TEXT NOT NULL,                              -- ipip_items.item_id への参照
  key         INTEGER NOT NULL DEFAULT 1,                 -- +1=正、-1=逆転 (Tedone 'key')
  label       TEXT,                                       -- facet 名 (Tedone 'label')
  alpha       REAL,                                       -- Cronbach's α (Tedone 'alpha')
  PRIMARY KEY (scale_id, item_id),
  FOREIGN KEY (item_id) REFERENCES ipip_items(item_id)
);

CREATE INDEX IF NOT EXISTS idx_scales_scale ON scales (scale_id);
