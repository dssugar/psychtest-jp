# Phase 2.1: IPIP 統一項目 DB Wedge

**Status**: Spec
**Date**: 2026-05-16
**Author**: Daisuke
**Source**: [ROADMAP.md](../../ROADMAP.md) v2.0 § "Phase 2"、[project-design.md](../project-design.md) v1.2 §7.4.1
**Related memory**: `[[project-ipip-unified-item-db]]` / `[[project-positioning-dual-entry]]` / `[[project-kpi-deep-usage]]`

---

## Problem

- **誰が困っているか**: Daisuke 自身 (= KPI a `[[project-kpi-deep-usage]]`)。月読 chat の context が「Big Five 完了済 / Rosenberg 未受験」レベルの粒度しか取れず、深い人物理解に至らない。朝の儀式 (Phase 2.5) / 月読会話駆動 IPIP (Phase 3.2) / 新規 IPIP 尺度追加 (Phase 3.1) **すべての基盤が欠けている**。
- **現状の workaround とコスト**:
  - 既存 7 心理尺度は `localStorage` の `UserProfile.tests` に各尺度 result を JSON 保存
  - `functions/uranai/profile.ts` がそれを D1 `profiles.test_results` に snapshot として丸ごと dump
  - 月読 `lib/uranai/profile-summarizer.ts` は dump を読んで詩的サマリ生成
  - → 項目レベルの蓄積なし、scale 重複検出不可、進捗 N/M 表示不可、会話駆動回答の保存先なし
- **業務上の実需の根拠**:
  - project-design.md §3.1「使うほど深くなる moat」の技術基盤
  - project-design.md §7.4.1 (v1.2 追加) で「3,300 IPIP 項目を統一 DB 化して複数尺度を view 化」が決定済
  - Daisuke 手持ち資産が揃った (IPIP3320.xlsx + Tedone 表 + 1,911 項目翻訳済) ため着手可能

---

## Goal

D1 に IPIP 統一項目 DB (ipip_items + user_responses + scales) を構築し、Big Five (IPIP-NEO-120) を内部 migration して **既存 `/bigfive` UX を 1 mm も変えずに**、回答が `user_responses` に蓄積される状態を観察可能にする。

**完成判定**: `npm run db:migrate:local` 後、`/bigfive` を完走すると `SELECT COUNT(*) FROM user_responses WHERE device_id=?` が 120 を返し、`/uranai/chat/tsukuyomi` で月読が「Big Five を完了済」を context として認識する (詩的に表現する、数値は出さない)。

---

## Non-Goals

Phase 2.1 wedge では **やらない** (= Phase 2.2 以降):

- **朝の儀式 UI** (Phase 2.5): 統一 DB から未回答項目をサンプリングして提示する画面
- **月読会話駆動 IPIP** (Phase 3.2): 月読 chat が文脈に応じて未回答項目を会話に挿入
- **進捗 N/M context 拡張** (Phase 2.6): 月読 system prompt に「Big Five 80/120 (うち朝の儀式 30)」を渡す
- **非 IPIP 系尺度の user_responses 統合** (Phase 2.3): Rosenberg / PHQ-9 / K6 / SWLS は scale-specific namespace で別途
- **トップを 2 入口ハブに書き換え** (Phase 2.4): `app/page.tsx` の構造変更
- **既存他 IPIP 系尺度の migration** (Phase 2.2 拡張): Industriousness (IPIP-300 C4+C5)、Self-Concept (IPIP Self-Consciousness Facet) は Phase 2.1 完了後の続編
- **HEXACO / IPC / VIA / MPQ 等の view 利用** (Phase 3.1): Phase 2.1 で `scales` テーブルへ seed はするが、UI で受験可能にするのは Phase 3
- **LLM 翻訳パイプライン拡張**: 1,409 未翻訳項目を埋める作業は別 wedge (ipip-translation repo の延長)
- **localStorage の完全廃止**: 過渡期は二重書き、Phase 2 完了時点で localStorage 切替判断

---

## Narrowest Wedge (MVP)

**Scope** (1 commit / 数日作業):

### Step 1: 資産の repo 取り込み

- 以下 3 ファイルを `psychtest-jp/data/ipip-master/` に copy (xlsx は xlsx のまま、CSV はそのまま):
  - `/mnt/c/Users/dai/Downloads/IPIP3320.xlsx` (3,320 行: 英文 + Hxxx ID)
  - `/mnt/c/Users/dai/Downloads/TedoneItemAssignmentTable30APR21 (3).xlsx` (4,006 行: instrument / alpha / key / text / label)
  - `/home/user/ipip-translation/data/output/production-1941/results.csv` (1,911 行: I0xxx / 英 / 日 / approved / scores)
- ライセンス明示 README 追加 (IPIP = Public Domain、Tedone Table = academic release、ipip-translation = MIT?)

### Step 2: D1 schema migration

```
migrations/0003_ipip_unified.sql:

CREATE TABLE ipip_items (
  item_id    TEXT PRIMARY KEY,        -- Hxxx (IPIP 公式 ID)
  en_text    TEXT NOT NULL,           -- 英語原文 (Tedone と一致)
  ja_text    TEXT,                    -- 日本語訳 (~1,911 / 3,320 で populate, 残は NULL)
  source     TEXT NOT NULL DEFAULT 'ipip_3320',  -- 将来 'llm_generated' 等の拡張余地
  created_at INTEGER NOT NULL
);

CREATE TABLE user_responses (
  device_id    TEXT NOT NULL,
  item_id      TEXT NOT NULL,
  value        INTEGER NOT NULL,        -- 1-5 (尺度により 1-4, 1-7 等あり、scale 側で正規化)
  answered_at  INTEGER NOT NULL,
  source       TEXT NOT NULL,           -- 'scale:bigfive' | 'daily_ritual' | 'chat:tsukuyomi' 等
  PRIMARY KEY (device_id, item_id),    -- 1 user 1 item 1 回答 (再回答は overwrite)
  FOREIGN KEY (item_id) REFERENCES ipip_items(item_id)
);

CREATE INDEX idx_user_responses_device ON user_responses (device_id, answered_at DESC);

CREATE TABLE scales (
  scale_id    TEXT NOT NULL,            -- 'bigfive' | 'hexaco_pi' | 'neo' | etc
  instrument  TEXT,                     -- Tedone 'instrument' (NEO, HEXACO_PI, ...)
  item_id     TEXT NOT NULL,            -- Hxxx (= ipip_items.item_id)
  key         INTEGER NOT NULL DEFAULT 1, -- +1 = 正、-1 = 逆転 (Tedone 'key')
  label       TEXT,                     -- facet 名 (Tedone 'label')
  alpha       REAL,                     -- Cronbach's α (Tedone 'alpha')
  PRIMARY KEY (scale_id, item_id),
  FOREIGN KEY (item_id) REFERENCES ipip_items(item_id)
);

CREATE INDEX idx_scales_scale ON scales (scale_id);
```

### Step 3: seed 生成 script

`scripts/seed-ipip.ts` (or `.mjs`):

1. `IPIP3320.xlsx` を openpyxl 相当 (`xlsx` npm) で読み、3,320 行を ipip_items に投入 (en_text + Hxxx)
2. `production-1941/results.csv` の 1,911 行を読み、**en_text の正規化一致**で ipip_items.ja_text を populate
   - 正規化: 末尾ピリオド除去 / 連続 whitespace → 単一 space / lowercase / トリム
   - マッチ件数を log (期待値: 1,911 中 1,800+ が成功、残はテキスト揺れ調査要)
3. `TedoneItemAssignmentTable30APR21.xlsx` の 4,006 行を読み、各行を scales テーブルに投入
   - instrument を scale_id に正規化 (例: "16PF" → "16pf", "HEXACO_PI" → "hexaco_pi")
   - en_text 一致で item_id (= Hxxx) を解決、解決できなかった行は warn log + skip
4. 投入後 sanity check:
   - `SELECT COUNT(*) FROM ipip_items` → 3,320
   - `SELECT COUNT(*) FROM ipip_items WHERE ja_text IS NOT NULL` → 1,500-1,911 (= 想定範囲)
   - `SELECT scale_id, COUNT(*) FROM scales GROUP BY scale_id` → 36 instruments × items

実行は手動: `npx tsx scripts/seed-ipip.ts` または `wrangler d1 execute --file=...`。
本番反映は `npm run db:migrate:remote` 後に同 script を `--remote` で。

### Step 4: Big Five 内部 migration

1. **mapping 表生成**: 既存 `data/bigfive-questions.ts` の 120 項目を **英語テキスト正規化一致** で Tedone NEO instrument (185 items) と突合 → 自前 id (1-120) ↔ Hxxx の対応表を作成 (= `data/ipip-master/bigfive-id-mapping.json` または別 csv)
   - **Open Question**: 120 全部マッチするか? マッチしない項目は手動 audit + 追加 mapping
   - マッチしない場合の fallback: 既存 BigFive 120 を別 source として ipip_items に追加投入 (例: `item_id = BF_001`, source='legacy_bigfive')、scale 'bigfive' に組み込む
2. `scales` テーブルに `scale_id='bigfive'` の 120 行 (= Hxxx + key (正/逆) + facet label) を確定
3. `/bigfive` page (= `app/(psychtest)/[testType]/page.tsx` 経由 or 専用 page) の回答 submit 処理を改修:
   - 既存: `localStorage.setItem('userProfile', JSON.stringify(...))`
   - 改修後: localStorage に加えて `POST /uranai/profile` (= 既存) で `testResults` 送信 + 新たに `POST /ipip/responses` (新規 endpoint) で `user_responses` 書き込み
   - 過渡期は両方書く (= regression 0、Phase 2.2 で localStorage 切替判断)
4. `functions/ipip/responses.ts` (新規 endpoint):
   - POST: `{ deviceId, scaleId, answers: [{itemId, value}] }` を受けて user_responses に upsert (= 再受験時の overwrite 想定)

### Step 5: 月読 context 確認

`lib/uranai/profile-summarizer.ts` に **既存の `profiles.test_results` 経路はそのまま** (= regression 0)、月読が「Big Five を完了済」を引き続き認識することを確認。

進捗 N/M context の追加は Phase 2.6 (= Non-Goal)。

### Step 6: Verification

完成判定 (すべて満たせば Phase 2.1 完了):

1. `npm run db:migrate:local` → schema 反映、エラーなし
2. `npx tsx scripts/seed-ipip.ts --local` → ipip_items 3,320 行 / scales 36 instruments × N items 投入完了、ja_text populate 率 ≥ 50%
3. `/bigfive` 完走 → D1 `user_responses` を select すると 120 行 (= `SELECT COUNT(*) FROM user_responses WHERE device_id=?`)
4. `/uranai/chat/tsukuyomi` で月読が以前と同じく「Big Five を完了済」context を取れる (= 詩的に表現、数値出さない、回帰なし)
5. `npm run type-check` pass
6. `npm run eval` で既存 21 case が PASS or WARN (= FAIL/ERR 0、回帰なし)

---

## Constraints

### 既存 invariant (CLAUDE.md / 既存 wedge から継承)

- Next.js 16 (App Router) + TypeScript + Tailwind v4 を使い、新規 framework / lib を増やさない (xlsx parse のみ `xlsx` or `exceljs` npm が追加可能、軽量)
- 静的エクスポート (`out/`) 構成を崩さない → D1 access は Pages Functions 経由継続
- 既存 7 尺度 (rosenberg / bigfive / phq9 / k6 / swls / selfconcept / industriousness) の **UX を変更しない** (= regression 0)
- 既存テスト群の registry / import 経路を触らない (Phase 2.2 で内部実装変更時に最小限の touch)
- 月読 chat の system prompt / IPIP context 構造を変更しない (進捗 N/M 追加は Phase 2.6)
- vLLM 経路 (`vllm.psychtest.jp` + 5 env vars) を継続使用 ([[project-tarot-wedge-local-vllm]])
- D1 binding は既存の `DB` を使い、`wrangler.toml` の `database_id` は変更しない ([[psychtest-jp-access-gated]])

### 技術制約

- xlsx parse は build 時または手動 script 実行のみ (runtime に xlsx を読まない、= bundle size 増避ける)
- seed script は冪等 (= 再実行で重複 INSERT エラーにならない、`INSERT OR REPLACE` or `ON CONFLICT DO UPDATE`)
- user_responses の PRIMARY KEY = (device_id, item_id) は **再受験を overwrite** する設計 (= 「最新回答が正」、history を残すのは Phase 3 検討)
- value の正規化は scale 側に持たせる (= 1-5 Likert は ipip_items に保存、1-7 や 1-4 scale は scale view の scoring_rule で変換)
- migration の atomic 性は D1 の `batch()` API で担保 (失敗時は rollback)
- ipip-translation results.csv の `approved` フラグが 0 の行は ja_text に投入しない (= 品質維持)

### 業務制約

- 「医療診断ではない」disclaimer 維持
- IPIP 公式 ID (Hxxx) を一次キーに採用 → 後で IPIP 公式 list 更新時に同期しやすい
- ライセンス: IPIP = Public Domain、Tedone Table = academic release (要確認)、ipip-translation 翻訳 = Daisuke 自身の生成物
- 1,409 未翻訳項目を ja_text=NULL で保持 (= 「項目は存在するが日本語版未整備」状態を可視化、後で incremental に埋める)

---

## Open Questions

実装中に答えが出る想定:

1. **既存 BigFive 120 ↔ Tedone NEO 185 のマッピング率**: 120 全部マッチするか? 不一致がいくつ出るか? 不一致時は手動 audit or 別 source 採用 (= legacy `BF_001` 形式) で吸収。
2. **en_text 正規化戦略**: 末尾ピリオド / whitespace / capitalization 以外に対応すべき揺れがあるか (例: "AM" vs "I am" の主語省略)。実装初期に 10-20 件サンプル diff を取って判断。
3. **Tedone instrument の scale_id 正規化命名**: "16PF" / "HEXACO_PI" / "NEO" → どう小文字化するか (`scales.scale_id` の英数値命名規約)。
4. **未翻訳 1,409 項目の扱い**: ja_text=NULL で投入 (= 朝の儀式や view で「日本語訳なし」表示) vs 完全に skip (= ipip_items にも入れない)。前者推奨だが、容量と将来翻訳 trigger を考慮して決める。
5. **`POST /ipip/responses` の認証**: 現状 device-id 知ってれば誰でも書き換え可 (α scope と同じ、`[[psychtest-jp-access-gated]]` の Access 裏で運用)。Phase 4 公開時に HMAC 等。
6. **scale view の scoring rule**: Tedone の `key` (+1/-1) は逆転項目フラグだが、合計スコア計算は scale 側 logic に残すか、view 化するか。Phase 2.1 は既存 `lib/tests/bigfive.ts` の `calculateScore` を流用 (= 改修最小)。
7. **`/bigfive` 完走時の二重書き失敗時挙動**: D1 書き込み失敗で localStorage 成功するケース。エラー表示せず silent log (= UX 維持優先)。
8. **xlsx ファイルの commit 対象**: `psychtest-jp/data/ipip-master/*.xlsx` を git commit するか、`.gitignore` で除外 (= 別 storage 想定)。サイズ次第 (3,320 行 ×2 + 4,006 行 = ~数百 KB 推定、commit して良さそう)。
9. **RIASEC が Tedone にない**: Phase 3.1 で RIASEC view を作るときの source 不明 (ORVIS instrument が代替か、別 source 必要か)。Phase 2.1 では影響なし。

---

## Verification

§"Narrowest Wedge" Step 6 と同じ:

1. ✅ migration 適用エラーなし
2. ✅ seed script で ipip_items 3,320 / scales N rows / ja_text populate ≥ 50%
3. ✅ `/bigfive` 完走 → D1 user_responses 120 行
4. ✅ 月読 chat の Big Five 認識 (= regression 0)
5. ✅ `npm run type-check` pass
6. ✅ `npm run eval` で FAIL/ERR 0 (= 既存 21 case 維持)

Daisuke の Phase 2.1 完了判定 (subjective):
- 「Big Five やったら裏で D1 に項目蓄積されてる」を SQL で確認できる
- 「これで Phase 2.5 朝の儀式の土台ができた」感

---

## Out of Scope (Future)

Phase 2.1 で feasibility が通った後の判断材料 / 構想:

1. **Phase 2.2 残り IPIP 系尺度 migration**: Industriousness (IPIP-300 C4+C5) / Self-Concept (IPIP Self-Consciousness) を同じ手順で internal migration。Tedone NEO instrument に C4 / C5 facet が含まれるので、view 定義は scales テーブルから filter で済む可能性。
2. **Phase 2.3 非 IPIP 系統合**: Rosenberg / PHQ-9 / K6 / SWLS を user_responses に統合。scale-specific item_id namespace (例: `RSE_001`, `PHQ9_001`) で IPIP と区別。
3. **Phase 2.5 朝の儀式 UI**: 全 ipip_items から未回答項目をランダム N 個サンプリング → 提示 → 回答を user_responses に投入。「Big Five 進捗 +1」等の feedback。
4. **Phase 2.6 月読 context 進捗 N/M 化**: `lib/uranai/profile-summarizer.ts` で `scale × completed / total` を計算し、月読 system prompt に詩的に注入 (数値は直接出さない)。
5. **Phase 3.1 新規 view 追加**: HEXACO_PI (223) / IPIP-IPC (32) / VIA (252) / MPQ (95) / 6FPQ (229) など、既に scales に seed 済の instrument を view 化して UI で受験可能に。
6. **Phase 3.2 月読会話駆動 IPIP**: 月読 chat が文脈に応じて未回答項目を会話に挿入。tool 呼び出しで `next_unanswered_item(facet_tag)` → 回答取得 → user_responses 投入。
7. **🌟「占い師兼心理カウンセラー」moat (= Phase 3.2 の発展)**:
   - 36 instruments × 246 facets を月読が「全部知ってる前提」で対話駆動
   - ユーザー発話 ("最近やる気が出ない") → 月読が facet (Achievement-striving) を選定 → 関連項目 1 つを会話で確認 → 回答蓄積
   - 数ヶ月で「16PF も VIA も HEXACO も裏で測れてる」状態を実現
   - **これが project-design.md §3.1 (使うほど深くなる moat) と §9 (占い師ペルソナ) の融合点**
   - 倫理: 「測ってます」と明示するか、自然な会話の一部に溶かすか — 公開判断時に再検討
8. **LLM 翻訳パイプライン拡張**: 1,409 未翻訳項目を ipip-translation pipeline で埋める。Tedone のうち α 高い scale 優先。
9. **項目 history 保存**: 再回答時の overwrite を「latest + history」に拡張 (= 縦断データ moat、project-design.md §3.1 の本体)。
10. **暗号化レイヤー**: user_responses は機微情報なので Workers Crypto API で encrypted_value 列追加 (Phase 4 公開判断時)。

---

## 参照

- 素材:
  - [ROADMAP.md](../../ROADMAP.md) v2.0 § "Phase 2"
  - [project-design.md](../project-design.md) v1.2 §7.4.1
  - `/mnt/c/Users/dai/Downloads/IPIP3320.xlsx` (3,320 items + Hxxx)
  - `/mnt/c/Users/dai/Downloads/TedoneItemAssignmentTable30APR21 (3).xlsx` (4,006 assignments × 36 instruments)
  - `/home/user/ipip-translation/data/output/production-1941/results.csv` (1,911 翻訳)
  - `data/translations/` (= 公開ソースの validated 翻訳、補助参考)
- memory:
  - `[[project-ipip-unified-item-db]]` — DB 設計の core 方針
  - `[[project-positioning-dual-entry]]` — DB 統合の positioning 根拠
  - `[[project-kpi-deep-usage]]` — KPI a (Daisuke 本人) との関係
  - `[[project-tarot-wedge-local-vllm]]` — vLLM 経路 (月読 context 経由で関連)
  - `[[psychtest-jp-access-gated]]` — Access 裏で device-id 認証のみ運用
- 既存実装 (本 wedge で改修対象):
  - `data/bigfive-questions.ts` (= migration source、120 項目)
  - `lib/tests/bigfive.ts` (= scoring、改修最小)
  - `app/(psychtest)/[testType]/page.tsx` 系 (= 回答 submit 改修)
  - `functions/_lib/d1.ts` (= helper 追加: appendUserResponses 等)
  - `migrations/` (= 0003_ipip_unified.sql 新規)
  - `wrangler.toml` (= 変更なし、既存 DB binding 流用)
- 新規ファイル想定:
  - `data/ipip-master/` (= xlsx + csv 取り込み先)
  - `scripts/seed-ipip.ts` (= seed 生成 script)
  - `functions/ipip/responses.ts` (= POST/GET endpoint)
  - `migrations/0003_ipip_unified.sql`
