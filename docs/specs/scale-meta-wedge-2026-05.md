# Phase 2.1.β: IPIP `scale_meta` Wedge

**Status**: Spec
**Date**: 2026-05-16
**Author**: Daisuke
**Source**: [ROADMAP.md](../../ROADMAP.md) v2.2 § "Phase 2.1.β"、office-hours session 2026-05-16
**Related memory**: `[[project-ipip-unified-item-db]]`、`[[project-kpi-deep-usage]]`
**Related spec**: `docs/specs/ipip-unified-db-wedge-2026-05.md` (Phase 2.1 基盤)

---

## Problem

- **誰が困っているか**: Daisuke 本人 (= KPI a, `[[project-kpi-deep-usage]]`)。Phase 3.1 (新規 IPIP UI 追加) で result page を作ろうとしたとき、各 scale の「学術的タイトル」「日本語 UI 名」「原著 reference」「multi/single-construct 区分」「IPIP 公式 source URL」が DB に無く、UI 仕様が定まらない。
- **現状の workaround とコスト**:
  - Phase 2.1 完了で `scales` テーブルに instrument / item / key / label / alpha は入った (= **scoring + facet 別 α は既に機能している**、当初の懸念「α / 採点方法が scale として機能しない」は誤認だった)。
  - だが scale-level metadata (ja_label / category / reference / source URL) は file 散在 (= `data/*-questions.ts` の `scaleInfo` 構造) もしくは未記載。
  - 7 既存尺度は手書き `scaleInfo` で UI 表示できているが、Phase 3.1 で新規 scale (HEXACO_PI / VIA / RIASEC / IPC / MPQ) を追加すると同じ pattern を 5 倍書く必要があり DRY 違反。
- **業務上の実需の根拠**: 
  - project-design §3.1「使うほど深くなる moat」と CLAUDE.md「学術的信頼性 ★★★★★」を core 差別化として打ち出す路線で、scale-level metadata が UI badge / 結果ページに必須。
  - Phase 2.6 月読 context 進捗 N/M の M (= total_items) は `SELECT COUNT(*) FROM scales WHERE scale_id = ?` で runtime に取れるが、これは「実装データ上の total」であって「IPIP 公式定義の total」とは 371 行 skip でズレている可能性。**scale_meta.official_total_items** を持つことで「公式準拠の M」を表示できる。

---

## Goal

D1 に `scale_meta` テーブルを追加し、**既存 7 scale + Phase 3.1 候補 5 scale = 計 12 scale** について以下を保持する:

- `scale_id` (PK、既存 `scales.scale_id` と一致)
- `category` ('multi-construct' | 'single-construct')
- `ja_label` (例: 「大五性格特性」「自尊感情」)
- `ja_description` (~100 字以内、UI badge / hover 用)
- `source_url` (IPIP 公式 newIndex or 各 Key ページ)
- `reference` (原著 citation、例: "Goldberg et al. (2006)")
- `official_total_items` (= IPIP 公式定義の項目数、scales table COUNT との差は Phase 2.1.γ 別 wedge で修復)

**完成判定**: `SELECT COUNT(*) FROM scale_meta WHERE ja_label IS NOT NULL AND reference IS NOT NULL` = 12

---

## Non-Goals

Phase 2.1.β wedge では **やらない**:

- **371 行 skip 修復** (= [Phase 2.1.γ ipip-seed-completeness wedge](#out-of-scope-future) で別途、別 office-hours)
- **α / scoring_rule の column 追加** (= 既存 `scales` table に facet 別 α が入っているため重複、必要時は集約 SQL で取得)
- **17 inventories / 36 instruments 全件カバー** (= 12 scale のみ、残りは Phase 3.x 以降に拡張)
- **Self-Concept の textEn 追加 + IPIP master 紐付け** (= Phase 2.2.2 で扱う、本 wedge では Self-Concept の scale_meta row は `selfconcept` という暫定 scale_id で登録するのみ)
- **scale_meta UI 管理画面** (= admin UI、Phase 4 公開時)
- **en_label / en_description** (= 多言語 UI、Phase 4 公開時)
- **runtime API endpoint** (= GET /scales/:scale_id、本 wedge では D1 helper 関数のみ、endpoint 化は Phase 3.1 で UI 着手時)

---

## Narrowest Wedge (MVP)

**Scope** (1 commit / 数時間作業):

### Step 1: migration `0004_scale_meta.sql`

```sql
CREATE TABLE IF NOT EXISTS scale_meta (
  scale_id              TEXT PRIMARY KEY,         -- scales.scale_id と一致 (FK 制約は付けない)
  category              TEXT NOT NULL,            -- 'multi-construct' | 'single-construct'
  ja_label              TEXT NOT NULL,            -- 例: 「大五性格特性」
  ja_description        TEXT,                     -- 例: 「~100 字の説明文」
  source_url            TEXT,                     -- 例: 'https://ipip.ori.org/newNEOKey.htm'
  reference             TEXT,                     -- 例: 'Goldberg et al. (2006). The international personality item pool...'
  official_total_items  INTEGER,                  -- IPIP 公式定義の項目数 (scales COUNT との差は 2.1.γ で修復対象)
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
```

### Step 2: `data/ipip-master/scale-meta.json` 手動編集

12 scale 分のデータを 1 JSON ファイルにまとめる:

```json
[
  {
    "scale_id": "bigfive",
    "category": "multi-construct",
    "ja_label": "ビッグファイブ性格特性",
    "ja_description": "5 つの主要な性格次元 (外向性・神経症傾向・開放性・協調性・誠実性) を 30 ファセットで測定。IPIP 公開版で NEO-PI-R 相当の信頼性。",
    "source_url": "https://ipip.ori.org/newNEOKey.htm",
    "reference": "Johnson, J. A. (2014). Journal of Research in Personality, 51, 78-89.",
    "official_total_items": 120
  },
  {
    "scale_id": "industriousness",
    "category": "multi-construct",
    "ja_label": "勤勉性 (達成努力 × 自己鍛錬)",
    "ja_description": "ビッグファイブ「誠実性」の中核 2 ファセット (C4 達成努力 + C5 自己鍛錬) を IPIP-300 から抽出。Grit Scale との相関 r > .75。",
    "source_url": "https://ipip.ori.org/new_ipip-300.htm",
    "reference": "DeYoung et al. (2007). JPSP, 93(5), 880-896.",
    "official_total_items": 20
  },
  ...
]
```

12 scale 内訳:
- **既存 7 (= 現実装ある UI scale)**:
  - bigfive (multi, official 120)
  - industriousness (multi, official 20)
  - rosenberg (single, official 10)
  - phq9 (single, official 9)
  - k6 (single, official 6)
  - swls (single, official 5)
  - selfconcept (single, official 8 = 暫定、Phase 2.2.2 で再確定)
- **Phase 3.1 候補 5 (= scales seed 済、UI 未実装)**:
  - hexaco_pi (multi, official 223)
  - via (multi, official 252)
  - riasec → 暫定 scale_id `orvis` (multi, official 92、Tedone instrument ORVIS が RIASEC 系)
  - ipip_ipc (single 寄り = 対人円環、official 32)
  - mpq (multi, official 95)

### Step 3: seed-ipip.ts 拡張

```typescript
// 既存の Industriousness step (5.5) 直後に追加:

// 5.7. scale_meta 投入 (= UI 表示用 metadata、12 scale)
const SCALE_META_JSON = resolve(ROOT, "data/ipip-master/scale-meta.json");
try {
  const metaItems = JSON.parse(readFileSync(SCALE_META_JSON, "utf-8"));
  sql.push("");
  sql.push("-- scale_meta (= UI 表示 metadata、12 scale)");
  for (const m of metaItems) {
    sql.push(
      `INSERT OR REPLACE INTO scale_meta (scale_id, category, ja_label, ja_description, source_url, reference, official_total_items, created_at, updated_at) VALUES (${sqlStr(m.scale_id)}, ${sqlStr(m.category)}, ${sqlStr(m.ja_label)}, ${sqlStr(m.ja_description ?? null)}, ${sqlStr(m.source_url ?? null)}, ${sqlStr(m.reference ?? null)}, ${sqlNum(m.official_total_items ?? null)}, ${now}, ${now});`
    );
  }
  log.push(`scale_meta: ${metaItems.length} rows`);
} catch (err) {
  log.push(`scale_meta: skipped (${SCALE_META_JSON} not found)`);
}
```

### Step 4: D1 helper 追加 (`functions/_lib/d1.ts`)

```typescript
export interface ScaleMetaRow {
  scale_id: string;
  category: 'multi-construct' | 'single-construct';
  ja_label: string;
  ja_description: string | null;
  source_url: string | null;
  reference: string | null;
  official_total_items: number | null;
  created_at: number;
  updated_at: number;
}

export async function getScaleMeta(
  db: D1Database,
  scaleId: string,
): Promise<ScaleMetaRow | null> {
  const row = await db
    .prepare("SELECT * FROM scale_meta WHERE scale_id = ?1")
    .bind(scaleId)
    .first<ScaleMetaRow>();
  return row ?? null;
}

export async function listScaleMeta(
  db: D1Database,
  category?: 'multi-construct' | 'single-construct',
): Promise<ScaleMetaRow[]> {
  const q = category
    ? db.prepare("SELECT * FROM scale_meta WHERE category = ?1 ORDER BY scale_id").bind(category)
    : db.prepare("SELECT * FROM scale_meta ORDER BY scale_id");
  const r = await q.all<ScaleMetaRow>();
  return r.results ?? [];
}
```

### Step 5: Verification

完成判定 (すべて満たせば 2.1.β 完了):

1. `npm run db:migrate:local` → schema 反映、エラーなし
2. `npm run db:seed:local` → scale_meta 12 行投入完了
3. `SELECT COUNT(*) FROM scale_meta WHERE ja_label IS NOT NULL AND reference IS NOT NULL` = 12
4. `npm run type-check` pass
5. (optional) Phase 2.6 月読 summarizer で `getScaleMeta(db, 'bigfive')` 試呼び → official_total_items 取得確認

---

## Constraints

### 既存 invariant (CLAUDE.md / Phase 2.1 から継承)

- D1 binding (`DB`) を使用、`wrangler.toml` の database_id は変更しない
- migration スタイル: `CREATE TABLE IF NOT EXISTS`、`INTEGER NOT NULL` for time
- 既存 `scales` table とは PK 共有しない (= scale_meta.scale_id は scales.scale_id と semantic に一致するが FK 制約は付けない、片方が欠けても他方を update できる柔軟性)
- 既存 7 scale の UI / scoring は変更しない (= regression 0)
- 月読 chat の system prompt 構造は変更しない (本 wedge では summarizer 拡張も最小、optional)

### 技術制約

- scale-meta.json は **手動編集 + git commit**。LLM 生成は使わない (= Daisuke のキュレーション結果を一次正に)
- 12 scale 全件で `ja_label` 必須、`reference` 必須。`ja_description` は ~100 字以内推奨
- `official_total_items` と `SELECT COUNT(*) FROM scales WHERE scale_id = ?` がズレるケースを許容 (= 差は 371 行 skip 由来、Phase 2.1.γ で修復対象)
- 新 column 追加 (= source_url 別 / DOI 別 等) は将来 migration `0005_*.sql` で

### 業務制約

- 「医療診断ではない」disclaimer は scale_meta.ja_description に含めない (= scale_meta は学術 metadata、disclaimer は UI 層の責務)
- 12 scale の category 判定は Daisuke 監修 (= IPIP 公式が「multi-construct inventories」と「single-construct scales」を区別している命名規約に従う、迷うものは Daisuke 判断)

---

## Open Questions

実装中に答えが出る想定:

1. **`riasec` の scale_id 命名**: Tedone instrument 名は `ORVIS`、ただし RIASEC は Holland Code の有名な概念。`scale_meta.scale_id = 'riasec'` で `scales.scale_id = 'orvis'` と分ける? それとも `orvis` で統一? → 統一する方が DRY、ただし UI 上の表示は ja_label で「RIASEC (Holland Code)」と注釈
2. **`selfconcept` の official_total_items**: 暫定 8 (= 現状の data/selfconcept-questions.ts と一致) で投入。Phase 2.2.2 で IPIP Self-Consciousness Facet と紐付けて再確定する
3. **`ja_description` の token 量**: 月読 chat context に流す場合の負担。本 wedge では「~100 字」目安で運用、月読 context 注入は Phase 3.x で判断
4. **multi vs single の判定基準**: 「factor が 2 つ以上 = multi」「単一構成概念 = single」で運用。境界ケース (例: IPIP-IPC は 2 軸 = multi 寄り、ただし Tedone では 1 instrument としてカウント) は Daisuke 判断
5. **PHQ-9 / K6 の category**: 単一構成概念 (鬱症状 / 心理的苦痛) なので single-construct。ただし PHQ-9 は実は 9 症状の項目集合 = 「factor 1 つだが項目は階層的」。本 wedge では single とする
6. **source_url の粒度**: scale-level URL (例: newRosenbergKey.htm) を入れる方針。Tedone Table 由来の scale は IPIP 公式に対応 page が無い場合あり、その時は `https://ipip.ori.org/newIndexofScaleLabels.htm` (index page) を fallback として使う

---

## Verification

§"Narrowest Wedge" Step 5 と同じ:

1. ✅ migration 適用エラーなし
2. ✅ seed で scale_meta 12 行投入
3. ✅ ja_label / reference NOT NULL 件数 = 12
4. ✅ `npm run type-check` pass
5. ✅ Phase 2.1 既存 21 case eval 維持 (= 月読 chat の system prompt 経路 untouched、regression 0)

Daisuke の 2.1.β 完了判定 (subjective):
- 「Phase 3.1 で HEXACO_PI を UI に出す準備が整った」感
- 「月読が "あなたは N/M 答えた" と言うとき、M が公式準拠の値で hydrate できる」感

---

## Out of Scope (Future)

Phase 2.1.β で feasibility が通った後の判断材料 / 構想:

1. **Phase 2.1.γ ipip-seed-completeness wedge** (= 別 office-hours): 371 行 skip の調査 + 修復
   - skip 例を pattern 別に分類 (大文字小文字 / 句読点違い / Unicode 文字 / `'s` の有無 / not 等の反転 / IPIP master に存在しない wording)
   - bulk normalize で取れる pattern は seed-ipip.ts の `normalizeEn` 関数を改善
   - 手動 mapping が必要な pattern は手動 audit (~100 件想定)
   - IPIP master に存在しない wording は諦める (= Tedone Table の typo or 別 source 由来)
   - 完了後、`scale_meta.official_total_items` と `scales` COUNT が一致するよう更新
2. **Phase 2.2.2 Self-Concept migration**: 本 wedge で `selfconcept` scale_id を仮確定したが、textEn 追加 + IPIP master 紐付けで再確定
3. **Phase 3.0+**: 残り 24 instruments (= CAT-PD / Foa / Chapman / 7FACTOR / BFAS / BIDR / BIS_BAS / Buss1980 / Cacioppo1982 / CPI / Goldberg1999 / Hoyle2002 / HPI / HPI-HIC / JPI / Levenson1981 / NEO5-20 / ORAIS / Radloff1977 / Scheier1994 / Snyder1974 / Span2002 / TCI / 6FPQ) の scale_meta 追加 → 全 36 + bigfive をカバー
4. **scale_meta.alpha column**: 現状 scales table の facet 別 α を集約した「scale 全体の代表 α」(= mean or median) を column 化する選択肢、運用判断後
5. **multi-language support**: en_label / en_description 追加 (= 公開時の英語 UI 用、Phase 4-5)
6. **scale_meta 管理 UI**: admin UI で edit (= Phase 4 公開時、現状は手動 JSON 編集 + commit)
7. **scale_meta から月読 context への注入**: 「あなたが受けた診断は『大五性格特性』(NEO-PI-R 系) で...」のように学術的タイトルを月読が知る (= Phase 3.x、persona 自然性と学術トーンのバランス判断要)
8. **scoring_rule column** (= 既存 scales table から導出可能だが explicit に持つ): 「sum」「mean」「weighted」等。Phase 4 で API 化したとき external consumer が parse できる形にする
9. **publication_year column** + DOI column の分離: reference を free text にせず構造化

---

## 参照

- 素材:
  - [ROADMAP.md](../../ROADMAP.md) v2.2 § "Phase 2.1.β"
  - [docs/project-design.md](../project-design.md) §3.1 (= 「使うほど深くなる moat」、scale 単位の学術信頼性)
  - `data/ipip-master/` (Phase 2.1 完了済)
  - [IPIP newIndex](https://ipip.ori.org/newIndexofScaleLabels.htm) (Daisuke が確認指示した一次資料)
- memory:
  - `[[project-ipip-unified-item-db]]` (= Phase 2.1 完了状態、本 wedge の前提)
  - `[[project-kpi-deep-usage]]` (= Daisuke 本人の信頼性体感を最優先)
- 関連 spec:
  - `docs/specs/ipip-unified-db-wedge-2026-05.md` (= Phase 2.1 基盤)
- 新規ファイル想定:
  - `migrations/0004_scale_meta.sql`
  - `data/ipip-master/scale-meta.json` (手動編集 + commit)
  - `functions/_lib/d1.ts` (= 拡張、`getScaleMeta` / `listScaleMeta` 追加)
  - `scripts/seed-ipip.ts` (= 拡張、5.7 step 追加)
