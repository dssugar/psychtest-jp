-- Phase 2.x.D.1: IPIP canonical labels (= newIndexofScaleLabels.htm "Alphabetical Index of 274 Labels for 463 IPIP Scales").
-- spec: Daisuke 質問 "label とは?" + IPIP page audit
--
-- IPIP 公式 page の Alphabetical Index は **構成概念名 (= label) → 各 inventory の facet code listing** の構造.
-- 同 facet が複数 synonym label に属する (= "Conformity/.../Need" と "Dependence/.../Approval" は同じ 4 facet を別 wording で list).
-- → canonical_label と scale (= (instrument, facet)) は many-to-many = junction table で表現.
--
-- WHY 別 table:
--   - scale_hierarchy = tree (instrument → scale → facet → items 階層)、1 scale = 1 entry
--   - canonical_labels = IPIP page の Alphabetical Index 検索 view、1 label が 複数 scale を contain、1 scale が 複数 label に属する
--   - 別 concern なので別 table.

-- 276 unique canonical labels (= IPIP Index 274 + synonym alias 2 件)
CREATE TABLE IF NOT EXISTS canonical_labels (
  canonical_label   TEXT PRIMARY KEY,         -- 例: "Achievement-striving" / "Conformity/Dependence/Need for approval"
  display_label_ja  TEXT,                     -- 日本語訳 (Phase 2.x.E で手動 audit populate)
  description       TEXT,                     -- 構成概念説明 (= Phase 2.x.E)
  created_at        INTEGER NOT NULL
);

-- 547 (canonical_label, instrument, facet_code) pairs (= IPIP page の各 label の括弧内 listing)
CREATE TABLE IF NOT EXISTS canonical_label_implementations (
  canonical_label   TEXT NOT NULL,            -- canonical_labels.canonical_label への FK
  instrument        TEXT NOT NULL,            -- 例: "NEO" / "TCI" / "Big-Five"
  facet_code        TEXT NOT NULL,            -- 例: "C4" / "P3" / "Domain" / "Carver & White, 1994"
  scale_id          TEXT,                     -- scale_hierarchy.scale_id への解決 (= 命名揺れで NULL 許容、Phase 2.x.D.2 で fuzzy match)
  created_at        INTEGER NOT NULL,
  PRIMARY KEY (canonical_label, instrument, facet_code),
  FOREIGN KEY (canonical_label) REFERENCES canonical_labels(canonical_label)
);

CREATE INDEX IF NOT EXISTS idx_canonical_label_impl_scale_id
  ON canonical_label_implementations (scale_id);

CREATE INDEX IF NOT EXISTS idx_canonical_label_impl_instrument
  ON canonical_label_implementations (instrument, facet_code);
