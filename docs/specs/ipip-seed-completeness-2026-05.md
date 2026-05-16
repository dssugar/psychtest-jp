# Phase 2.1.γ: IPIP seed completeness wedge

**Status**: Spec
**Date**: 2026-05-16
**Author**: Daisuke
**Source**: [ROADMAP.md](../../ROADMAP.md) v2.3 §"Phase 2.1.γ"、office-hours session 2026-05-16
**Related memory**: `[[project-ipip-unified-item-db]]`、`[[project-kpi-deep-usage]]`
**Related spec**:
  - `docs/specs/ipip-unified-db-wedge-2026-05.md` (Phase 2.1 基盤)
  - `docs/specs/scale-meta-wedge-2026-05.md` (Phase 2.1.β、本 wedge の発端)

---

## Problem

### 表面症状

Phase 2.1 完了時、`scripts/seed-ipip.ts` が **3,331 scale 行追加 + 371 行 skip** (= `en_text unresolved`) を出力。Phase 2.1.β で `scale_meta.official_total_items` を投入した結果、**公式定義の項目数と `scales` COUNT が乖離している scale が複数存在** することが明確化。

### Distribution (= office-hours で取得した実態)

| Instrument | Skip 件数 | UI 化計画 | 性質 |
|---|---|---|---|
| **ORAIS** | 200 | なし (scale_meta 不在) | 行動チェックリスト — IPIP master 完全不在 |
| **ORVIS** | 92 | ~~Phase 3.1~~ → 撤回 | 職業興味 — IPIP master 完全不在 (= Holland RIASEC 系の別 source) |
| **VIA** | 5 | Phase 3.1 | 一部は単数複数差 (Pattern D) |
| **MPQ** | 3 | Phase 3.1 | Tedone 独自 wording (Pattern E) |
| **CAT-PD / TCI / AB5C / NEO / 16PF / 6FPQ / JPI / 7FACTOR / CPI / HPI-HIC / Levenson1981 / ほか 14** | 79 (合計) | Phase 3.x 候補含む | 動詞接頭辞欠落 / 異形 wording / IPIP master 不在 が mix |

### Root cause (= 表面 skip 修復だけでは解決しない)

**Tedone Table (= `tedone-item-assignment.xlsx`) と IPIP 公式 (ipip.ori.org) の data lineage が一致しない**。Tedone は学術論文向けの集約ファイルで、IPIP master 不在 wording を含む。office-hours で Daisuke が「Tedone Table の正しさをチェックする必要が出てきた、IPIP サイトを instrument ごとに調べる」と reframe した通り、**source of truth 階層の整理** が本質。

### Pattern 分類 (= 79 件の内訳目算、ORAIS/ORVIS を除く)

| Pattern | 件数推定 | 例 |
|---|---|---|
| A. 動詞接頭辞 "Am " 欠落 | ~10 | "Willing to try anything once." ↔ IPIP master "Am willing to try anything once." |
| B. 主語 "I've" / "I have" 異形 | ~5 | "...I haven't done." ↔ "...I have not done." |
| C. 接続詞 "or" ↔ "and" | ~3 | "right or wrong" ↔ "right and wrong" |
| D. 単複・冠詞・人称・末尾欠落 | ~12 | "awkward situations" ↔ "situation"、"...understanding" ↔ "...understanding me." |
| E. IPIP master **完全不在** (Tedone 独自) | ~40 | "Believe laws should be strictly enforced" (4 instruments で重複)、"Want everything to be just right" (4 instruments)、CAT-PD clinical 系 |
| F. Tedone Table 内重複行 | 1+ | LEVENSON1981 "Believe some people are born lucky" × 3 |
| G. 末尾欠落 (= Pattern D に合流) | — | — |

### 業務上の実需

- **Phase 3.1 直接影響**: VIA 5 件 + MPQ 3 件 = 8 件が UI 化計画 scale (`scale_meta` 投入済) で skip 中。これらは `scales` table に登録されないため UI 化時に scoring 不可能。
- **moat completeness**: 「IPIP 統一 DB が一次キーマスタ」という Phase 2.1 の moat 主張 (`[[project-ipip-unified-item-db]]`) を守るには、Tedone Table と IPIP 公式の整合性検証が必須。Tedone を盲信すると後続 instrument 追加でも同じ問題が再発する。

---

## Goal

2 軸の Goal を持つ:

### Goal A (短期、Phase 1 で達成)

機械的修復で確実に取れるものを救出し、scale_meta の整合性を取る:

- bulk normalize 強化で Pattern A/B/C/D/G を救出 (= ~30 件)
- ORVIS scale_meta row 削除 (= 12 → 11 scale、official_total_items=92 と scales COUNT=0 の乖離を解消)
- Tedone Table 内重複行 (LEVENSON1981 等) を seed 側で dedupe
- 完了後の skip 件数 / instrument 別残件を README に記録

### Goal B (長期、Phase 2 で継続)

IPIP 公式を一次正と確定し、Tedone Table の wording を IPIP master と突合・拡張する:

- 17 inventories (NEO / HEXACO_PI / VIA / MPQ / 16PF / TCI / CPI / 6FPQ / JPI / 7FACTOR / HPI / HPI-HIC / AB5C / CAT-PD / Levenson1981 / Foa / Chapman) の IPIP 公式 Key page を instrument ごとに audit
- Pattern E wording のうち IPIP 公式に対応するものを発見 → IPIP master に追加 (新 ID namespace 検討)
- 発見できないものは Tedone 由来の独自 source として `ipip_items.source = 'tedone_extension'` で IPIP master に登録 (= ORVIS と同じ拡張方針を後追い適用)
- 各 instrument 完了ごとに `scale_meta.official_total_items` を IPIP 公式定義に合わせて再確定

---

## Non-Goals

本 wedge では **やらない**:

- **ORAIS の救出** (= 200 件、scale_meta に row 無し、UI 化計画も無し)。Phase 3.x で ORAIS UI 化が再浮上したら別 wedge。
- **scale_meta の en_label / en_description 追加** (= Phase 4 公開時)
- **Tedone Table の書き換え** (= source of truth として保護、cleanup は重複行のみ)
- **IPIP 公式 page の自動 scrape** (= ipip.ori.org の HTML 構造が instrument ごとに揺れる、Daisuke 手動 audit ベース)
- **多言語 (en/中/韓) 拡張**
- **scales.alpha / scoring_rule の構造化** (= Phase 2.1.β で見送り済、scale_meta 拡張時に別検討)

---

## Narrowest Wedge (Phase 1: 機械的修復、数時間 - 1 日)

### Step 1: ORVIS scale_meta row 削除

```sql
DELETE FROM scale_meta WHERE scale_id = 'orvis';
```

- `data/ipip-master/scale-meta.json` から ORVIS エントリ削除 (= 12 → 11)
- `scale_meta` の完成判定を 12 → 11 に下方修正
- Phase 3.1 候補が hexaco_pi / via / ipip_ipc / mpq の 4 つに確定

### Step 2: `normalizeEn` 拡張 (= bulk normalize で取れる pattern を追加)

`scripts/seed-ipip.ts` の `normalizeEn` 関数を拡張:

```typescript
function normalizeEn(s: string): string {
  return s
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\.+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    // 追加 (Phase 2.1.γ):
    .replace(/\bn't\b/g, " not")              // "haven't" → "have not"
    .replace(/'ve\b/g, " have")                // "I've" → "I have"
    .replace(/'s\b/g, " is")                   // "it's" → "it is" (副作用: 所有格にも当たるが skip 例に少ない、test で確認)
    .replace(/\bor\b/g, "and")                 // Pattern C (副作用: 意味反転、慎重に test)
    ;
}
```

加えて **2 段階突合**:
```typescript
function lookupItemId(text: string): string | null {
  const norm = normalizeEn(text);
  // 1. 完全一致
  if (normEnToId.has(norm)) return normEnToId.get(norm)!;
  // 2. "am " prefix を補完して再 lookup
  if (!norm.startsWith("am ")) {
    const withAm = "am " + norm;
    if (normEnToId.has(withAm)) return normEnToId.get(withAm)!;
  }
  // 3. 末尾に " me"/" you"/" us" を補完
  for (const suffix of [" me", " you", " us"]) {
    if (normEnToId.has(norm + suffix)) return normEnToId.get(norm + suffix)!;
  }
  // 4. 単複正規化 (末尾 s 削除)
  if (norm.endsWith("s") && normEnToId.has(norm.slice(0, -1))) return normEnToId.get(norm.slice(0, -1))!;
  return null;
}
```

→ 期待救出: Pattern A/B/C/D/G で **~25-30 件**

### Step 3: 手動 mapping table

bulk normalize で取れない異形 wording 用に `data/ipip-master/tedone-overrides.json` を新規作成:

```json
{
  "_comment": "Tedone Table wording → IPIP master item_id への手動 mapping (Phase 2.1.γ)",
  "Believe that people seldom tell you the whole truth.": "Hxxxx",
  "Have a good memory for things I've done throughout the day.": "Hxxxx (= IPIP master は 'down' typo)"
}
```

Phase 1 では空 file を作成 + seed-ipip.ts で読み込み logic だけ追加。実際の mapping 追加は Phase 2 の investigation で発生分のみ。

### Step 4: Tedone Table 内重複行 dedupe

seed-ipip.ts 既存の `seenPk` set は `scale_id + item_id` 単位だが、Tedone Table 内で同 instrument に同 wording が重複している case (例: LEVENSON1981 "Believe some people are born lucky" × 3) は item_id 未解決のため skip カウントが 3 倍計上されている。

→ Tedone 行を `instrument + normalizeEn(text)` で dedupe する pre-processing を seed-ipip.ts に追加 (= 1 件として 1 回試行)。

### Step 5: skip diagnostic 出力

seed-ipip.ts に `--diagnose` mode (= もしくは常時) を追加:
- skip 行を `instrument` 別に集計
- `scripts/.cache/seed-skip-report.json` に書き出し (= Phase 2 investigation の入力)
- log に「ORAIS: 200 (out-of-scope) / ORVIS: 0 (deleted) / VIA: ~3 / MPQ: ~3 / ...」のような summary

### Phase 1 完成判定

- `npm run db:seed:local` 実行 → skip 件数が **371 → ~150 以下** (= ORAIS 200 は残存、Pattern A-D/G 救出で ~30 件減、Pattern E ~40 件は残存) に減少
- `scales` table で VIA / MPQ の COUNT が **official_total_items から ≤ Pattern E 件数 (3-4 件)** 以内に収束
- `scale_meta` row 数 = 11 (ORVIS 削除確認)
- `seed-skip-report.json` 生成、instrument 別件数 + pattern 分類済
- `npm run type-check` pass

---

## Phase 2: IPIP 公式 17 inventories investigation cycle (長期、数週間)

### 進め方

1 instrument ずつ次の loop を回す (= Daisuke の手動 ritual、Claude 補助可能):

1. `seed-skip-report.json` から対象 instrument の skip wording を取得
2. IPIP 公式の該当 Key page (例: `https://ipip.ori.org/newNEOKey.htm`) を fetch / human read
3. Tedone 由来 wording を IPIP 公式の wording / item_id と突合
4. 発見した対応関係を `tedone-overrides.json` に追記 OR IPIP master に Tedone 由来項目を追加 (= `data/ipip-master/ipip-3320.xlsx` 拡張 or 別 supplemental file)
5. `npm run db:seed:local` で再投入 → skip 減少を確認
6. `scale_meta.official_total_items` を IPIP 公式定義に合わせて再確定 (必要時)
7. 完了 instrument を `docs/ipip-completeness-progress.md` (新規) にチェックイン

### Phase 2 完了判定 (= 各 instrument 個別)

- 対象 instrument の skip = 0 (= IPIP master 拡張 or override で全件解決)
- `scale_meta.official_total_items` が `scales` COUNT と一致
- もしくは「Phase 3.x で UI 化しない」と決めた instrument は `scale_meta` row 不在 + skip 残存を progress doc に明記

### Investigation order の優先順位

1. **VIA** (5 件、Phase 3.1) ← まず Phase 3.1 にとって critical な 4 scale を優先
2. **MPQ** (3 件、Phase 3.1)
3. **HEXACO_PI** (0 件、要確認、Phase 3.1)
4. **IPIP-IPC** (0 件、要確認、Phase 3.1)
5. **NEO** (6 件、bigfive と母体共有、検証価値高)
6. 残り 12 instruments は Phase 3.x で UI 化を検討するタイミングで個別 investigation

---

## Constraints

### 既存 invariant (CLAUDE.md / Phase 2.1 / 2.1.β から継承)

- IPIP master (`ipip_items.source = 'ipip_3320'`) は一次キーマスタ、`item_id = Hxxxx / Xxxx / Exxx` 体系を維持
- `wrangler.toml` の database_id は変更しない
- `scale_meta.scale_id` と `scales.scale_id` は semantic 共有 (FK 制約なし)
- 月読 chat の system prompt / eval 21 case の経路は触らない (= regression 0)

### 技術制約

- `normalizeEn` 拡張は **副作用 test 必須** (= 既存 3,320 → 3,320 unique 維持、衝突なし)。Phase 2.1 の seed log を baseline として `npm run db:seed:build` を run し、`bigfive matched: 120/120` `industriousness matched: 20/20` の維持を確認
- `tedone-overrides.json` は手動編集 + git commit、LLM 生成は使わない
- IPIP master 拡張時 (Phase 2 で追加項目発生) は `ipip_items.source` で出自を区別 (`'ipip_3320'` / `'tedone_extension'` / `'orvis_supplement'` 等)。3,320 件の正典 ID 体系には触らない

### 業務制約

- IPIP 公式 page (ipip.ori.org) を scrape しない (= 礼儀 + 構造揺れ)、Daisuke が手動 audit
- Tedone Table の typo (例: "down" vs "done") は IPIP master 優先で override mapping に記載
- 「Tedone Table が正しいかチェックする」プロセス自体が moat (`[[project-ipip-unified-item-db]]`) の信頼性を支える、急がない

---

## Open Questions

実装中に答えが出る想定:

1. **`normalizeEn` の "or" → "and" 副作用**: 意味反転リスク。例えば "I like dogs or cats" を "and" 化すると意味が変わる。IPIP master 内で "or" / "and" を含む項目数を事前 grep し、衝突の規模を確認してから採用判断
2. **IPIP master の "down" typo (CAT-PD のケース)**: IPIP master 側を訂正するか、Tedone 側を override で吸収するか。IPIP 公式 page で原典確認後判断
3. **拡張 item の ID namespace 命名**: `T_001..nnn` (Tedone supplement) / `O_001..nnn` (ORVIS supplement) / 各 inventory ごとに prefix を分ける？ 統一 prefix `X_` で source 列のみで区別?
4. **`tedone-overrides.json` の schema 拡張**: instrument 別 nesting にするか、フラット map で十分か (= 同 wording が複数 instrument にまたがる重複問題)
5. **Phase 2 の Claude 補助範囲**: Daisuke 手動 audit が原則だが、IPIP 公式 page の差分抽出 (= 既知 wording との編集距離 ranking) を Claude に補助させるか
6. **progress doc 形式**: `docs/ipip-completeness-progress.md` を markdown checklist で十分か、表形式 (instrument × IPIP master 突合状態) が要るか

---

## Verification

### Phase 1 完了判定 (= 数時間 - 1 日)

1. ✅ `npm run db:migrate:local` でエラーなし (本 Phase は migration なし、scale_meta 削除のみ)
2. ✅ `npm run db:seed:local` で skip 371 → ≤ 150
3. ✅ `bigfive matched: 120/120` 維持 (= regression 0)
4. ✅ `industriousness matched: 20/20` 維持
5. ✅ `scale_meta` row 数 = 11 (ORVIS 削除確認)
6. ✅ `scripts/.cache/seed-skip-report.json` 生成、instrument 別 count 出力
7. ✅ `npm run type-check` pass
8. ✅ Phase 2.1 既存 21 case eval 経路 untouched

### Phase 2 完了判定 (= instrument 別、長期)

- 各 instrument: skip = 0 OR progress doc に「out-of-scope 理由」明記
- `scale_meta.official_total_items` と `scales` COUNT が一致 (= UI 化 scale で `92/92` 表示)
- `docs/ipip-completeness-progress.md` に audit 履歴 (instrument × 日付 × 発見した override 件数 × IPIP master 拡張件数)

### Daisuke の subjective 完了判定

- 「Tedone Table が IPIP 公式と整合している (or どこが乖離しているか) を完全把握している」感
- 「Phase 3.1 で UI 化候補 4 scale (hexaco_pi / via / ipip_ipc / mpq) を出すとき、scoring が正しく動く」確信

---

## Out of Scope (Future)

Phase 2.1.γ で feasibility が通った後の判断材料 / 構想:

1. **ORAIS 救出**: 200 件、行動チェックリストとして将来 daily ritual 系の UI で再評価対象。IPIP master とは別 source として保持する選択肢も
2. **ORVIS 復活**: Holland RIASEC 系の代替 source (例: O*NET Interest Profiler) を一次正として別 wedge で再実装、IPIP master とは紐付けない
3. **`ipip_items.source` の値 enum 化**: `'ipip_3320' | 'tedone_extension' | 'orvis_supplement' | 'legacy_bigfive' | ...` の正規化を CHECK 制約で明示
4. **IPIP 公式 page 差分監視**: ipip.ori.org の更新を定期 fetch して新規項目を検出 (Phase 4+)
5. **Multi-language wording 突合**: 日本語版尺度 (e.g. 大五性格特性 BFI-J) の wording と IPIP master の cross-mapping (= 日本語 wording → IPIP item_id の逆引き)
6. **scoring_rule の構造化**: 現状 scales.alpha のみ持つが、subscale 集計関数 (sum / mean / weighted) を column 化
7. **Tedone Table の version 管理**: 元 Excel が更新されたとき diff を取って既知 wording の変化を検出
8. **`scale_meta.completeness` column**: 「公式定義 vs 実装」の差分件数を runtime column 化 (= UI に "92/92 (公式準拠)" / "84/92 (8 項目欠落)" を表示)

---

## 参照

- 素材:
  - [ROADMAP.md](../../ROADMAP.md) v2.3 §"Phase 2.1.γ"
  - `data/ipip-master/ipip-3320.xlsx` (= IPIP 公式 3,320 項目)
  - `data/ipip-master/tedone-item-assignment.xlsx` (= 36 instruments × items)
  - [IPIP newIndex](https://ipip.ori.org/newIndexofScaleLabels.htm)
- memory:
  - `[[project-ipip-unified-item-db]]` (= Phase 2.1 / 2.1.β 完了状態、本 wedge の前提)
  - `[[project-kpi-deep-usage]]` (= Daisuke 本人の信頼性体感を最優先)
- 関連 spec:
  - `docs/specs/ipip-unified-db-wedge-2026-05.md` (Phase 2.1 基盤)
  - `docs/specs/scale-meta-wedge-2026-05.md` (Phase 2.1.β、本 wedge の発端)
- 新規ファイル想定 (Phase 1):
  - `data/ipip-master/tedone-overrides.json` (空 file + Phase 2 で追記)
  - `scripts/.cache/seed-skip-report.json` (生成物、.gitignore)
  - `scripts/seed-ipip.ts` 拡張 (normalizeEn / lookupItemId / dedup / diagnose)
  - `data/ipip-master/scale-meta.json` 更新 (ORVIS row 削除)
- 新規ファイル想定 (Phase 2):
  - `docs/ipip-completeness-progress.md` (instrument 別 audit 履歴)
  - `data/ipip-master/ipip-3320-supplement.xlsx` or `*.json` (= Tedone/ORVIS 由来の IPIP master 拡張、source 列で区別)
