-- Phase 2.x.G: scale_descriptions + scale_interpretations.
-- spec: Daisuke 要望「scale 説明 + 結果解釈 + 占い (LLM) context 用短文を DB に持つ」
--
-- 2 つの読み手:
--   1. /shindan/ UI: 長文 description / interpretation で詳細表示
--   2. 月読 chat (= uranai): 短文だけ LLM context に inject (= context 爆発防止)
--
-- description_long と description_short は同じ意味を異なる詳細度で持つ.
-- 同じ理由で interpretation_long と interpretation_short を band ごとに分離.

-- ============================================================
-- scale_descriptions: scale の説明 + 学術 reference + threshold
-- ============================================================
CREATE TABLE IF NOT EXISTS scale_descriptions (
  scale_id            TEXT PRIMARY KEY,           -- scale_hierarchy.scale_id と一致 (FK 制約なし、scales 多 row のため)

  -- UI 用 長文 (200-400 字)
  description_long    TEXT,                       -- markdown OK、scale intro ページに表示
  reference           TEXT,                       -- 原著 citation (free text)
  source_url          TEXT,                       -- IPIP page or 一次資料 URL

  -- LLM context 用 短文 (30-80 字)
  description_short   TEXT,                       -- 月読が context 化する際の 1 行要約

  -- 結果解釈の閾値 (= raw score でのバンド境界)
  threshold_low       REAL,                       -- ≤ low = 'low' band
  threshold_high      REAL,                       -- ≥ high = 'high' band, mid = (low, high)
  threshold_kind      TEXT,                       -- 'percentile' | 'normed_z' | 'clinical_cutoff' | 'equal_split'

  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);

-- ============================================================
-- scale_interpretations: band 別の解釈文 (low / mid / high)
-- ============================================================
CREATE TABLE IF NOT EXISTS scale_interpretations (
  scale_id            TEXT NOT NULL,
  band                TEXT NOT NULL CHECK(band IN ('very_low', 'low', 'mid', 'high', 'very_high')),

  -- UI 用 長文 (100-200 字)
  interpretation_long TEXT,                       -- 結果ページの該当 band で表示

  -- LLM context 用 短文 (20-40 字)
  interpretation_short TEXT,                      -- 月読が「自尊感情やや低め」みたいに引く

  caveat              TEXT,                       -- 「医療診断ではない」等、必要時のみ

  created_at          INTEGER NOT NULL,
  PRIMARY KEY (scale_id, band)
);

CREATE INDEX IF NOT EXISTS idx_scale_interpretations_scale_id
  ON scale_interpretations (scale_id);
