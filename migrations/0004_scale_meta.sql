-- Phase 2.1.β: scale_meta table.
-- spec: docs/specs/scale-meta-wedge-2026-05.md §"Narrowest Wedge" Step 1
--
-- scales table (= 0003) は scale_id × item_id の mapping + facet 別 α までを持つ.
-- だが scale-level の UI 表示用 metadata (ja_label / category / reference / source URL /
-- 公式定義の項目数) は別軸の関心事 (= scale を view する人間に向けた解釈情報) なので
-- scales とは別 table に分離する.
--
-- 既存 7 (bigfive / industriousness / rosenberg / phq9 / k6 / swls / selfconcept) +
-- Phase 3.1 候補 5 (hexaco_pi / via / orvis / ipip_ipc / mpq) = 計 12 row を seed で投入.
--
-- scale_id は scales.scale_id と semantic に一致するが FK 制約は付けない:
-- 片方が欠けても他方を update できる柔軟性 + scales 側の同 scale_id が存在しない
-- 「定義だけある (= UI 準備中)」状態を許容するため.

CREATE TABLE IF NOT EXISTS scale_meta (
  scale_id              TEXT PRIMARY KEY,         -- scales.scale_id と一致 (FK 制約なし)
  category              TEXT NOT NULL,            -- 'multi-construct' | 'single-construct'
  ja_label              TEXT NOT NULL,            -- 例: 「ビッグファイブ性格特性」
  ja_description        TEXT,                     -- ~100 字、UI badge / hover 用
  source_url            TEXT,                     -- IPIP 公式 Key page or 一次資料 URL
  reference             TEXT,                     -- 原著 citation (free text、構造化は将来)
  official_total_items  INTEGER,                  -- IPIP 公式定義の項目数 (scales COUNT との差は 2.1.γ で修復対象)
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
