-- Phase 2.x.D: scale_hierarchy table.
-- spec: ROADMAP Phase 2.x.D (= "instrument → scale → facet → subfacet → items" 階層保持)
--
-- 既存 scales table は (scale_id, item_id) PK の junction table (= scale-item 多 many-to-many DAG).
-- これに加えて、scale 自体の階層 (instrument / scale / facet / subfacet) を tree 構造で保持するため
-- 別 table scale_hierarchy を追加. 1 scale_id = 1 階層 entry (PK).
--
-- WHY tree + junction 分離:
--   - Scale 階層は tree (= 純粋親子関係、1 facet は 1 scale に属する)
--   - Scale-item 関係は DAG (= 同 item が複数 scale で再利用、例: P473 が Rosenberg/Levenson/BIDR 4 scale で再利用)
--   - relational DB の典型的「階層 entity + junction table」パターン.
--
-- WHY scales.scale_id への FK 制約なし:
--   - scales.scale_id は 1 scale に対して N item rows、PK は (scale_id, item_id)
--   - scale_hierarchy.scale_id は 1 scale = 1 row、PK は scale_id 単独
--   - 別 cardinality のため FK 制約は逆 (= scales → scale_hierarchy への論理 FK だが定義しない)
--
-- 階層 level:
--   1 = instrument 単位 (e.g., scale_id='neo' or 'levenson1981', parent=NULL)
--   2 = scale 単位 (e.g., scale_id='levenson1981_locus_of_control', parent='levenson1981', scale_name='Locus of Control')
--   3 = facet 単位 (e.g., scale_id='levenson1981_locus_of_control_internal', parent='levenson1981_locus_of_control', facet_name='Internal')
--   4 = subfacet 単位 (= 稀、IPIP project には少ない)
--
-- ja_label は Phase 2.x.E (= 別 wedge) で手動 audit populate. 現状は NULL.

CREATE TABLE IF NOT EXISTS scale_hierarchy (
  scale_id          TEXT PRIMARY KEY,         -- scales.scale_id と一致 (FK 制約なし、scales 多 row のため)
  parent_scale_id   TEXT,                     -- tree 親 (self-reference, NULL = top level instrument)
  level             INTEGER NOT NULL,         -- 階層深さ (1=instrument / 2=scale / 3=facet / 4=subfacet)
  instrument        TEXT NOT NULL,            -- "Levenson1981" / "NEO" / "HEXACO_PI" 等
  scale_name        TEXT,                     -- 中位 scale 名 (英、e.g., "Locus of Control" / "Neuroticism"), NULL = instrument level
  facet_name        TEXT,                     -- facet 名 (英、e.g., "Internal" / "Anxiety"), NULL = scale level
  subfacet_name     TEXT,                     -- subfacet 名 (= 稀、NULL がほとんど)
  display_label_en  TEXT,                     -- UI 表示用 full path 英 (e.g., "Levenson1981 / Locus of Control / Internal")
  display_label_ja  TEXT,                     -- UI 表示用 full path 日 (NULL = Phase 2.x.E で手動 audit populate)
  alpha             REAL,                     -- Cronbach's α (scale 単位の代表値)
  source_url        TEXT,                     -- IPIP 公式 Key page URL
  created_at        INTEGER NOT NULL,
  FOREIGN KEY (parent_scale_id) REFERENCES scale_hierarchy(scale_id)
);

CREATE INDEX IF NOT EXISTS idx_scale_hierarchy_parent
  ON scale_hierarchy (parent_scale_id);

CREATE INDEX IF NOT EXISTS idx_scale_hierarchy_instrument_level
  ON scale_hierarchy (instrument, level);
