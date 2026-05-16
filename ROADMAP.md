# psychtest.jp - 実装ロードマップ

> **最終更新**: 2026-05-17 (v2.4.5、Phase 2.x.C.1+2 IPIP page direct fetch supplement で 9 主要 instrument 完全 fidelity)
> **前版**: v2.4.4 (2026-05-17) Phase 2.x.A+B / v2.4.3 (2026-05-17) Phase 2.2.1 既完了 + 2.3 完了 / v2.4.2 (2026-05-17) Phase 2.1.δ IPIP supplement / v2.4.1 (2026-05-17) Phase 2.1.γ sanitization / v2.4 (2026-05-16) Phase 2.1.γ ipip-seed-completeness 完了反映 / v2.3 (2026-05-16) Phase 2.1.β scale_meta / v2.2 (2026-05-16) sub-phase 分割 / v2.1 (2026-05-16) Phase 2.1 完了反映 / v2.0 (2026-05-16) ロードマップ見直し / v1.0 (2026-01-20) 心理尺度路線中心
> **位置づけ**: [project-design.md](./docs/project-design.md) の Phase 設計を実装視点でブレイクダウン

---

## 📍 現在地 (2026-05-16)

### ✅ 完了済

#### Phase 0: 心理尺度路線 (〜2026-01)
- 7 つの心理尺度 (Big Five 120 / Industriousness 20 / Rosenberg 10 / PHQ-9 9 / K6 6 / SWLS 5 / Self-Concept 8 = **計 178 問**)
- Trait-State-Outcome-Skill フレームワークに基づく統合ダッシュボード
- Neo-Brutalist デザインシステム × データビジュアライゼーション
- Next.js 16 App Router + Tailwind v4 + TypeScript + Cloudflare Pages 静的エクスポート
- E2E テスト (Playwright)

#### Phase 1: 占い + 月読 chat (2026-05)
- **Phase 1.0**: tarot 1 流派 wedge (LLM 統合解釈の feasibility 確認)
- **Phase 1.5**: 3 流派 wedge (tarot + 数秘術 + 九星気学) — moat §3.2 一次検証
- **Phase 1.7 (α)**: 月読 persona + D1 永続 chat + IPIP context — moat §3.1 一次検証
- 周辺基盤: 自宅 vLLM 経路 (Gemma 4 26B + Cloudflare Tunnel + Access service token)
- セキュリティ: prompt injection 防御 L0+L1 ship 済、eval automation (21 case)、baseline 14 PASS / 0 FAIL

---

## 🎯 確定方針 (2026-05-16 ロードマップ見直しでの決定)

### 1. Dual-entry Positioning (並列入口)

「心理尺度」と「占い」は **両方とも独立した入口** として等格扱い。完全な uranai moat ピボットは却下、並列路線継続。

```
psychtest.jp/
├─ /              = 2 入口ハブ (診断 / 占い を等格提示)
├─ /shindan/*     = 心理尺度サイト (現トップを退避)
└─ /uranai/*      = 月読 chat + 3 流派占い (既存)
```

DB は device-id で統合: 月読 context が心理尺度結果を参照、心理尺度結果ページから月読への誘導。AdSense は心理尺度ページのみ配置 (占い chat 併用は AdSense ポリシー違反)。

### 2. IPIP 統一項目 DB を基盤に (技術的基盤)

3,300 IPIP 項目を統一 DB 化し、複数尺度を view として表現:

```
ipip_items テーブル     (= 3,300 項目の正典)
  └─ item_id / ja_text / en_text / reverse / tags

user_responses テーブル (= 1 user 1 item 1 回答)
  └─ device_id / item_id / value / answered_at / source

scales テーブル         (= 各尺度の view 定義)
  └─ scale_id / items[] / scoring_rule
```

→ 「単発受験 (iii)」「毎日蓄積 (i)」「占い会話駆動 (ii)」が同じ DB を共有し、相互補完。これが §3.1 継続 moat の技術基盤。

### 3. KPI = Daisuke 本人の deep usage 単独

期間定めず。占い chat (月読) と IPIP 蓄積が自分にとって機能するか・継続するか・「思い出してる感」と「裏打ち感」が効くかを最優先で検証。**知人 invite / public 公開 / 課金検証は KPI から明示的に外した**。

### 4. Phase 4-5 (公開 + 収益化) は punt

KPI a (Daisuke deep usage) 達成後に着手判断。現時点では計画にコミットしない。Access policy は当面解かない。

---

## 🟡 Phase 1.9 (地ならし完了)

α wedge 直後の小タスク群。Phase 2 着手前の準備。

**Deep usage week は Phase 1.9 から削除** (= 機能が thick 化してから実施。詳細は §"Deep usage week のタイミング" 参照)。

**ComfyUI 月読 assets 差し替えは Phase 3.4 ペルソナ複数化と合流** (= 個別キャラの assets は他キャラと一緒にまとめて生成する方が効率的)。

- [x] **生年月日を profile に永続化** (UX 改善) ✅ 2026-05-16 (commit 91c210a)

---

## 🟢 Phase 2 (確定路線、KPI a 直結、数週〜1-2 ヶ月)

**目的**: IPIP 統一項目 DB を基盤に既存 7 尺度を内部 migration、その上で「朝の儀式」UI を新設して Daisuke の日々利用を支える環境を作る。

### 2.1 IPIP 統一項目 DB スキーマ構築 ✅ 2026-05-16

実装サマリ (commits `c34a4ba` / `9c61094` / `d81e3ad`):

- [x] D1 migration 追加 (`migrations/0003_ipip_unified.sql`)
- [x] `ipip_items` (3,320 行) / `user_responses` (CHECK value 1-5, PK = device_id+item_id) / `scales` (37 instruments × items) の 3 テーブル
- [x] IPIP 原典 3,320 項目データの正典化 (= `data/ipip-master/ipip-3320.xlsx` + Tedone Item Assignment Table + ipip-translation CSV)
- [x] 項目 ID 体系: IPIP 公式 Hxxx / Xxxx / Exxx / Fxxx 等を canonical key (= 67 行の複数 ID 行は H 始まり優先で 1 つに正規化)
- [x] **scales テーブル**で scale マッピング (Big Five 120 / NEO 179 / HEXACO_PI 221 / Rosenberg1965 10 / VIA 248 等 36 instruments + bigfive 仮想 scale)
- [x] 日本語訳 3,320 / 3,320 完備 (= BigFive UI 訳 120 + ipip-translation 1,093 + claude opus 4.7 翻訳 2,202)
- [x] BigFive 完走時の D1 二重書き (`POST /ipip/responses` + `lib/ipip/responses-client.ts`)

spec: `docs/specs/ipip-unified-db-wedge-2026-05.md`

### 2.1.α BigFive 120 訳の facet audit + 修正 🔄 (今 session)

Phase 2.1 直後の品質保証。Sonnet agent で 120 訳を facet 構成概念と突合 → 16 件 (high 5 / medium 8 / low 3) を検出 → high + medium で明確な誤訳のみ反映。

- [x] audit agent 実行 (`/tmp/bigfive-audit-output.json`)
- [ ] high 5 件 + medium 適用分を `data/bigfive-questions.ts` に反映
- [ ] `npm run db:seed:local` で ipip_items.ja_text 同期

### 2.1.β `scale_meta` 構築 ✅ 2026-05-16

UI 表示用 scale-level metadata (ja_label / category / reference / source URL / 公式定義の項目数) を `scale_meta` table に一元化。Phase 3.1 (新規 IPIP 尺度 UI 追加) の必須前提を達成。

実装サマリ (commit `ea4896e`):

- [x] `migrations/0004_scale_meta.sql`: scale_meta table 新設 (scale_id PK / category / ja_label / ja_description / source_url / reference / official_total_items)
- [x] `data/ipip-master/scale-meta.json`: 手動キュレーション 12 row (既存 7 + Phase 3.1 候補 5)
- [x] `scripts/seed-ipip.ts` step 5.7: INSERT OR REPLACE で seed 投入
- [x] `functions/_lib/d1.ts`: `getScaleMeta(scaleId)` / `listScaleMeta(category?)` helper
- [x] 完成判定 `COUNT(*) WHERE ja_label IS NOT NULL AND reference IS NOT NULL` = **12**

spec: `docs/specs/scale-meta-wedge-2026-05.md`

**scope 外 (= 別 wedge に切り出し)**:
- α / scoring_rule の column 追加 → 既存 `scales` table に facet 別 α が入っているため重複 (= 必要時は集約 SQL で取得)
- 17 inventories / 36 instruments 全件 → 本 wedge は 12 scale のみ、残りは Phase 3.x 以降
- Self-Concept の textEn 追加 + IPIP master 紐付け → Phase 2.2.2 で扱う
- 371 行 skip 修復 → Phase 2.1.γ で別 office-hours

### 2.1.γ ipip-seed-completeness wedge ✅ 2026-05-17

`scale_meta.official_total_items` と `scales` COUNT の乖離を修復し、IPIP 統一 DB の moat (= 一次キーマスタの完全性) を強化。Phase 1 (機械的修復) + Phase 2 (instrument 別手動 audit) + sanitization を一気通貫で実施。

実装サマリ (commits `c04f1bb` + `c5ba87d` + `9244a94`):

**Phase 1: 機械的修復 + diagnostic 整備 (commit `c04f1bb`)**
- [x] ORVIS を scale_meta + scales 両 table から tombstone 除外 (= IPIP master 完全不在の Holland RIASEC 系、UI 化計画なし)
- [x] `scripts/seed-ipip.ts` に `lookupItemId()` 6 段階突合導入 (override → normalize → 縮約 → am prefix → 末尾補完 → 単複)
- [x] `data/ipip-master/tedone-overrides.json` 新規 (手動 audit hook、value 形式 `[A-Z]\d+` で validate)
- [x] Tedone Table 内重複行 pre-dedupe (instrument + normalize)
- [x] `scripts/.cache/seed-skip-report.json` 生成 (instrument 別 skip 集計、Phase 2 audit 入力)

**Phase 2: 17 inventory audit (commit `c5ba87d`)**
- [x] IPIP 公式 Key page と Tedone Table の wording 突合 (WebFetch + IPIP master 内 keyword search)
- [x] `data/ipip-master/ipip-master-corrections.json` 新規: IPIP master 側 typo を ID 体系保持のまま訂正 (T1442 / B20 / B22 / V139)
- [x] tedone-overrides.json 拡充 16 manual mappings (CAT-PD 6 / AB5C 2 / 他 8 = hyphen / quote / em-dash / 単複 / Tedone typo / I prefix)
- [x] `lookupItemId()` bulk "that" 補完 rule (`Believe X` ↔ `Believe that X` + `Do X Y` ↔ `Do X that Y` 後置構造)

**Sanitization (commit `9244a94`)**
- [x] ORAIS (200 件) を SCALE_TOMBSTONES に追加 → seed log の雑音除外
- [x] scale_meta completeness verification step を seed 末尾に追加 (IPIP 系 / 非 IPIP 系を区別 log)
- [x] 補助 audit 完了: IPIP master 内 normalize collision **0 件**、Tedone wording IPIP master cover **96.9%** (1,592/1,642)
- [x] 残 Pattern E 6 件 scoring key 反転再 audit → 全て却下 (= wording 意味同一性崩壊で IPIP master 拡張対象)

**数値結果**:
| 指標 | Before | After |
|---|---|---|
| skip 総数 | 371 | **6** (= 真の Pattern E のみ) |
| Non-ORAIS skip | 172 | **6** (= 96.5% 削減) |
| scales 行 | 3,331 | 3,402 (+71) |
| scale_meta rows | 12 | 11 (ORVIS tombstone) |
| tombstone scales | 0 | 2 (orvis + orais) |
| Tedone cover | — | 96.9% direct hit + 残 lookupItemId 拡張で 99.6% |
| 完全救出 instrument | — | 16 (AB5C / 6FPQ / BIS_BAS / Buss1980 / CPI / Foa1998 / Foa2002 / Goldberg1999 / HEXACO_PI / HPI-HIC / Hoyle2002 / IPIP-IPC / JPI / MPQ / Radloff1977 / VIA) + 連鎖 |
| scale_meta completeness | — | IPIP 系 6/6 ✓ / 非 IPIP 系 5 は意図的 0 |
| INVARIANT | bigfive 120/120 / industriousness 20/20 / normEnToId 3320 unique | 全維持 ✅ |

**残 Pattern E 6 件** (= 真の IPIP master 不在 or scoring key 反転考慮しても却下):
- BFAS 2 (Do not have an assertive personality / Rarely put people under pressure = H774 と wording 意味同一性崩壊で却下)
- CAT-PD 1 (I am known for saying offensive things — "offensive" 自体が IPIP master 不在)
- TCI+NEO 1 (Believe ... right or wrong = X184 と or/and 意味反転、Daisuke 前回 revert と整合)
- 16PF 1 (Believe ... whole truth = X139 と truth/story 意味差大)

→ Phase 2.1.δ で IPIP supplement (`source='tedone_extension'`) として全 5 wording 投入完了 (= skip 0 達成)。

spec: `docs/specs/ipip-seed-completeness-2026-05.md`

### 2.1.δ IPIP supplement (skip 6 → 0 完全カバー) ✅ 2026-05-17

残 Pattern E 6 件を IPIP 公式 web page で audit した結果、全 5 wording (TCI/NEO 同 wording 共有で 5 件) が各 inventory Key page には掲載されていることが判明。ただし IPIP master Hxxx 体系の **外** (= inventory-specific 独自項目)。これらを新 ID namespace `EX-NNN` で ipip_items に追加投入し、scales table 100% カバーを達成。

実装サマリ (commit `ac929bf`):

- [x] `data/ipip-master/ipip-3320-supplement.json` 新規 5 items (EX-001..005)
  - EX-001 BFAS Assertiveness (`Do not have an assertive personality`)
  - EX-002 BFAS Politeness (`Rarely put people under pressure` = H774 reverse-wording、IPIP 公式注釈)
  - EX-003 CAT-PD Rudeness (`I am known for saying offensive things`)
  - EX-004 TCI/NEO Conservatism/Liberalism (`Believe that there is no absolute right or wrong`)
  - EX-005 16PF Distrust (`Believe that people seldom tell you the whole truth`)
- [x] `scripts/seed-ipip.ts` 拡張: supplement loader + `source='tedone_extension'` 投入 + `normEnToId` 統合
- [x] `ITEM_ID_RE` 拡張: `/^[A-Z]\d+$/` → `/^[A-Z]+(?:-?\d+)$/`
  (= 既存 H184 / X1234 / 新 EX-001 / 将来 GAD9-001 等を一貫対応)
- [x] supplement 5 items の ja_text 追加 (bigfive UI 訳スタイル: 一人称省略 / 「だ」「と思う」終止)

**ID namespace 設計 (将来も含む統一)**:
| 種別 | format | 例 |
|---|---|---|
| IPIP master (3,320) | 1 文字 prefix + 数字 | `H184` / `X1234` / `T2078` |
| IPIP supplement (project 内、master 外) | `EX-` + 数字 | `EX-001` |
| 非 IPIP scale 固有 (将来想定) | scale 略称 + `-` + 数字 | `GAD9-001` / `PHQ9-001` |

**数値結果 (Phase 2.1.γ + 2.1.δ 累計)**:
| 指標 | Phase 2.1.γ 完了時 | Phase 2.1.δ 完了時 |
|---|---|---|
| skip 件数 | 6 | **0** ✅ |
| scales 行 | 3,402 | 3,408 (= 100% Tedone coverage) |
| ipip_items | 3,320 | 3,325 (+5 supplement) |
| normEnToId unique | 3,320 | 3,325 |
| scale_meta completeness | 全 ✓ | 全 ✓ |
| 残 Pattern E | 6 | **0** |
| INVARIANT | 全維持 | 全維持 ✅ |

### 2.2 既存 IPIP 系尺度の内部 migration (UX 維持)

既存 UI / 結果表示はそのまま、内部実装だけ user_responses 書き込みに変更。

- [x] **Big Five (IPIP-NEO-120)** → 完了 (Phase 2.1 内で実装、120/120 Hxxx マッピング達成)
- [x] **2.2.1 Industriousness (IPIP-300 C4+C5, 20 項目)** ✅ 完了 (Phase 2.1.β 内で実装、`IPIP_SCALE_ADAPTERS` に登録済、20/20 Hxxx マッピング)
- [ ] **2.2.2 Self-Concept (IPIP Self-Consciousness Facet, 8 項目)** → Daisuke 独自編集 (8 items) vs IPIP NEO N4 facet (10 items) の意味対応決定が要、別 wedge
- [x] localStorage と D1 の二重書き機構 (= silent log + adapter pattern) 確立 (Phase 2.1 + 2.3)
- [ ] 各尺度ページの内部 fetch を D1 経由に (= localStorage 廃止) は Phase 2 完了後判断

### 2.3 非 IPIP 系尺度の user_responses 統合 ✅ 2026-05-17

非 IPIP 系 (Rosenberg / PHQ-9 / K6 / SWLS) を Phase 2.1.δ で確立した supplement file 機構で IPIP 統一 DB に統合。各 scale 独自 namespace (RSE-/PHQ9-/K6-/SWLS-) で `ipip_items` に投入、`source='tedone_extension'`。

実装サマリ (commit `2fe790f`):

- [x] `migrations/0005_user_responses_value_range.sql`: D1 CHECK 緩和 (1-5 → 0-7)、raw value 保護
- [x] `data/ipip-master/ipip-3320-supplement.json`: 30 items 追加 (RSE 10 + PHQ9 9 + K6 6 + SWLS 5)
- [x] `lib/tests/types.ts`: `BaseQuestion.itemId?: string` field 追加
- [x] `data/{rosenberg,phq9,k6,swls}-questions.ts`: 各 question に `itemId` 付与
- [x] `lib/ipip/responses-client.ts`: `buildResponses` helper で 6 adapter 統一 (bigfive / industriousness / rosenberg / phq9 / k6 / swls)、scale 別 value validation
- [x] `functions/ipip/responses.ts`: value validation を 0-7 に緩和
- [x] `scripts/seed-ipip.ts`: 非 IPIP 4 scale を scales table に投入 (instrument 別 + scale_meta completeness check 更新)

**scale_meta completeness (Phase 2.3 後)**:

| scale | actual / official | status |
|---|---|---|
| bigfive | 120/120 | ✓ |
| industriousness | 20/20 | ✓ |
| **rosenberg** | **10/10** | ✓ (新規) |
| **phq9** | **9/9** | ✓ (新規) |
| **k6** | **6/6** | ✓ (新規) |
| **swls** | **5/5** | ✓ (新規) |
| hexaco_pi | 223/223 | ✓ |
| via | 252/252 | ✓ |
| ipip_ipc | 32/32 | ✓ |
| mpq | 95/95 | ✓ |
| selfconcept | 0/8 | Phase 2.2.2 pending |
| **完全** | **10/11** | ✓ |

**ID namespace 体系の整理 (Phase 2.1.δ + 2.3 で完成)**:
| 種別 | format | 例 |
|---|---|---|
| IPIP master (3,320) | 1 文字 prefix + 数字 | `H184` / `X1234` / `T2078` |
| IPIP supplement (project 内、master 外) | `EX-` + 数字 | `EX-001..005` |
| 非 IPIP scale 固有 | scale 略称 + `-` + 数字 | `RSE-001..010` / `PHQ9-001..009` / `K6-001..006` / `SWLS-001..005` |

**残課題**:
- Phase 2.2.2 Self-Concept: Daisuke 独自編集との意味対応決定が要 (= 別 wedge)
- VIRTUAL_SCALES 機構 (= IPIP-native facet 単体の自動 view 化、e.g., TCI-P3 / NEO-C4-Achievement-Striving) は将来の thick design wedge

### 2.x.A+B IPIP Index facet auto-view + ORAIS/ORVIS auto-supplement ✅ 2026-05-17

IPIP 公式 `newIndexofScaleLabels.htm` の「Alphabetical Index of 274 Labels for 463 IPIP Scales」 structure を DB 上で表現する基盤実装。Tedone Table を source として fine-grained facet view を自動生成 + IPIP project 正規拡張の ORAIS/ORVIS を auto-supplement で復活。

実装サマリ (commit `ea79b9c`):

- [x] **Phase 2.x.A**: `scripts/seed-ipip.ts` に facet auto-view generator 追加 — Tedone Table の (instrument, label) ペアを fine-grained scale view として `scales` table に投入. scale_id 命名: `{instrument_slug}_{label_slug}` (例: `neo_achievement_striving` / `bidr_cognitive_failures`)
- [x] **Phase 2.x.B**: `SCALE_TOMBSTONES = []` で orvis/orais の tombstone 解除. `AUTO_SUPPLEMENT_INSTRUMENTS = [ORAIS, ORVIS]` を seed-ipip.ts に追加し、Tedone Table から auto-generate ID (`ORAIS-001..199` / `ORVIS-001..092`) で ipip_items に source='tedone_extension' 投入
- [x] 既存 lookupItemId / facet auto-view が自動再活用 (= 291 supplement items が自動的に scales + facet view に反映)

**数値結果**:
| 指標 | Before (Phase 2.3 後) | After (Phase 2.x.A+B) |
|---|---|---|
| scales 行 | 3,408 | **3,699** (+291) |
| facet auto-view | — | **442 facet scale_ids** |
| ipip_items | 3,325 | **3,616** (+291 auto-supplement) |
| **IPIP Index 463 カバー** | 87% (401/463) | **95.5% (442/463)** |
| INVARIANT | ✓ | bigfive 120/120 / industriousness 20/20 / type-check pass |

**ID namespace 体系 (Phase 2.x で完成)**:
| 種別 | format | 例 |
|---|---|---|
| IPIP master (3,320) | 1 文字 prefix + 数字 | `H184` / `X1234` / `T2078` |
| IPIP supplement (project 内、master 外) | `EX-` + 数字 | `EX-001..005` |
| 非 IPIP scale 固有 | scale 略称 + `-` + 数字 | `RSE-/PHQ9-/K6-/SWLS-` |
| IPIP auto-supplement (Tedone 由来) | instrument prefix + `-` + 数字 | `ORAIS-001..199` / `ORVIS-001..092` |

**残課題 (Phase 2.x.C 候補、別 wedge)**:
- **IPIP Index 463 のうち未カバー 21 件**: Broadbent 1982 (Cognitive Failures) / Saucier 1997 (Big-Seven 525) など Tedone Table 不在の独立 instrument → Phase 2.x.C で Broadbent 1982 は BIDR 内 label として実は存在を発見、reference として投入
- **Tedone Table の dump 粒度問題**: 同 wording が複数 (instrument, label) で再利用される IPIP project 構造 (例: P473 が 9 scale で再利用) のうち、Tedone Table dump が完全 reproduction を carry していない (BIDR/Cognitive-Failures が 10 items 中 8 件のみ等)
- **対応案**: IPIP 公式各 inventory Key page を direct fetch して (scale, item) pair の不足分を `scales` table に追加 INSERT する supplement 拡張 (Phase 2.x.C)。既存 ipip_items + scales table の relational design はそのまま活用 (= テーブル設計変更不要)
- **UI 化** (動的 [ipipFacetId] route + scoring + 結果表示): Phase 2.x.A+B で DB 基盤完成、UI wedge は /office-hours で spec 切ってから別 wedge

### 2.x.C IPIP page direct fetch supplement ✅ 2026-05-17 (主要 9 instrument 完了)

IPIP 公式 page の (scale, item) pair 完全 list を `ipip-scales-supplement.json` に手動 audit + 自動 conversion で蓄積し、`scales` table に INSERT OR REPLACE で投入することで Tedone Table dump 粒度問題 (= 同 wording 複数 scale 共有の dump 漏れ) を解消。

実装サマリ (commits `07ad700` + `9b7fe8d`):

**Phase 2.x.C.0 機構 (commit `07ad700`)**:
- [x] `data/ipip-master/ipip-scales-supplement.json` 新規: schema `{ scales: [{ scale_id, label, instrument, alpha, items: [{ item_id, key, text }] }] }`
- [x] `scripts/seed-ipip.ts` 拡張: supplement loader 追加、scales table に INSERT OR REPLACE で投入 (Tedone 由来と merge)
- [x] reference: BIDR/Cognitive-Failures 10 items (Broadbent 1982) で動作確認

**Phase 2.x.C.1 diff tooling (commit `9b7fe8d`)**:
- [x] `scripts/audit-ipip-page.ts` 新規: 各 instrument の Tedone 由来 (instrument, label) 一覧を report、scale_id + item count 表示
- [x] `scripts/convert-page-to-supplement.ts` 新規: WebFetch 結果 JSON を読み込み、各 item を IPIP master + supplement と norm match (lookupItemId 6 段階突合) で item_id 解決 → supplement.json に append

**Phase 2.x.C.2 主要 instrument 拡張 (commit `9b7fe8d`)**:
- [x] WebFetch + page-fetch JSON save + convert script で 9 instrument 完全 fidelity 達成

| instrument | scales | items | scale_meta 登録 |
|---|---|---|---|
| BIDR/Cognitive-Failures (reference) | 1 | 10 | — |
| **HEXACO_PI** | 24 | 240 | ✓ |
| **VIA** | 24 | 213 | ✓ |
| **IPIP-IPC** | 8 | 32 | ✓ |
| **MPQ** | 12 | 127 | ✓ |
| NEO | 30 | 300 | (= bigfive 母体) |
| TCI | 30 | 290 | — |
| 16PF | 16 | 163 | — |
| CPI | 33 | 332 | — |
| **合計** | **178** | **1,707** | — |

**自動化 pipeline**:
1. WebFetch で IPIP 公式 Key page から item list を JSON 形式で抽出 (AI 介在)
2. `scripts/.cache/page-fetch-<INSTRUMENT>.json` に save (audit trail)
3. `convert-page-to-supplement.ts` で IPIP master + supplement と norm match → `ipip-scales-supplement.json` に append
4. seed 再 build で動作確認

**数値結果 (Phase 2.x 累計)**:
| 指標 | session 開始時 | Phase 2.x.C 後 |
|---|---|---|
| scales 行 (instrument 単位) | 3,408 | 3,699 |
| ipip_items | 3,325 | 3,616 |
| facet auto-view | — | **442 scale_ids** |
| **IPIP page supplement** | — | **178 scales / 1,707 items** |
| IPIP Index 463 カバー | 87% | **95.5%** (= 主要 9 instrument は item-level 100%) |
| INVARIANT | ✓ | bigfive 120/120 / industriousness 20/20 / type-check pass |

**残課題 (次 session)**:
- **残 instrument 拡張** (= 同 pipeline で順次): BFAS / 6FPQ / JPI / HPI / HPI-HIC / AB5C / Buss1980 / Foa1998 / Foa2002 / Hoyle2002 / Levenson1981 / Cacioppo1982 / Snyder1974 / Span2002 / Chapman1986 / Scheier1994 / Barchard2001 / 7FACTOR / BFAS-20 / NEO5-20
- **convert script lookup logic 改善**: hyphen 揺れ regex を specific keyword pair に絞る / quote 揺れ吸収 (現状 4 件の手動 patch で対応)
- **IPIP facet UI 化** (= 動的 [ipipFacetId] route + scoring + 結果表示): DB 基盤完成、UI wedge は別 spec
- **Phase 2.2.2 Self-Concept**: Phase 2.x.C で `neo_self_consciousness` 10 items 投入済、これと Daisuke 独自編集 8 items の対応決定で完了可能

### 2.4 トップを 2 入口ハブに書き換え

- [ ] `app/page.tsx` 新規ランディング (診断 / 占い 2 入口を等格提示)
- [ ] 現心理尺度トップの内容を `app/(shindan)/shindan/page.tsx` に退避
- [ ] `app/[testType]/page.tsx` の path を `app/shindan/[testType]/page.tsx` に移動するかは実装時判断
- [ ] header / nav に「診断 / 占い」リンク常時提供
- [ ] hero / about / dashboard の position も再検討

### 2.5 「朝の儀式」UI 新設

- [ ] `app/(shindan)/shindan/daily/page.tsx` (or `app/uranai/checkin/`)
- [ ] 全 IPIP 項目から未回答を 3-5 問サンプリングして提示
- [ ] 回答後「Big Five 進捗 +1」「Industriousness 進捗 +1」等の feedback
- [ ] 各尺度ページに「進捗 N/M (うち 30 は朝の儀式、20 は月読会話、25 は単発)」表示
- [ ] 通知 (Access 裏で push 不可なので訪問時 prompt)

### 2.6 月読 chat に「進捗 N/M」context 追加

- [ ] `lib/uranai/profile-summarizer.ts` に IPIP 進捗情報を追加
- [ ] 月読が「あなたの Big Five は 80/120 答えた段階で、外向性傾向が...」のように context を活かす (数値・検査名は直接言わず詩的に)
- [ ] eval cases に「進捗 context 活用」評価を追加

**Phase 2 完了基準**:
- 既存 7 尺度の UX は何も変わらない (= regression 0)
- D1 に全 IPIP 系項目 + user_responses が入っている
- 朝の儀式 UI で毎日 IPIP 蓄積できる
- 月読 chat が IPIP 進捗を context として参照する
- Daisuke が「朝の儀式 → 月読」を毎日触れる状態

---

## 🔵 Phase 3 (Phase 2 完了後、moat thick 化、1-2 ヶ月)

**目的**: 月読の「思い出してる感」を強化、新規 IPIP 尺度追加、ペルソナ複数化で「キャラを選べる」moat。

### 3.1 新規 IPIP 尺度追加 (view 追加のみ)

- [ ] **IPIP-HEXACO-240** (Honesty-Humility 含む 6 次元)
- [ ] **IPIP-IPC-32** (対人円環、IPC X/Y 座標)
- [ ] **IPIP-RIASEC** (Holland Code、職業興味)
- [ ] **IPIP-MPQ** (Tellegen 多次元、Achievement / Stress Reaction 等)
- [ ] 朝の儀式で既に答えてる項目があれば「N/M 既回答」で表示

### 3.2 月読会話駆動 IPIP (= ii)

- [ ] 文脈タグで未回答項目を chat に自然挿入する prompt 設計
- [ ] tool 呼び出しで「未回答項目を 1 個提示 → ユーザー回答 → user_responses に記録」
- [ ] eval cases に「会話駆動 IPIP の自然さ」評価

### 3.3 月読記憶強化 (Layer 1-3)

- [ ] session_summaries 自動生成 (LLM で要約、KV キャッシュ)
- [ ] episodes 抽出 (印象的な出来事を別保存)
- [ ] セッションサマリ二段階検索 (= 関連 session の生ターン取得)
- [ ] `lib/uranai/profile-summarizer.ts` を session_summaries 込みに拡張

### 3.4 ペルソナ複数化 (γ 軽め)

- [ ] 月読 + 1-2 キャラ追加 (例: 白虎 / 椿 / 千夜 等から 1-2 種選定)
- [ ] system prompt 切り替え機構 (`/uranai/chat/[character]` 動的ルート)
- [ ] **月読 + 追加キャラ全員の立ち絵 / 背景 ComfyUI 生成** (= Phase 1.9 から合流)
  - 月読の SVG placeholder もここで差し替え
  - `docs/handoff/2026-05-16-uranai-alpha-asset-prompts.md` のプロンプトを月読用に流用
- [ ] Big5 マッチング (Phase 3 完了時の検討、Phase 4 で開放)

---

## ⏸ Phase 4-5 (KPI a 達成後に着手判断 — 現時点 punt)

KPI a (Daisuke deep usage) で moat の体感が確認されてから初めて着手判断する。

### Phase 4: 公開準備
- 利用規約 / プライバシーポリシー (弁護士発注、5-15 万円)
- メンタルヘルス配慮 prompt 本格化 (「死神」→「変革」等)
- AdSense 申請 + 動線 (心理尺度ページのみ)
- Cookie 同意バナー
- Access policy 解除 → public 公開

### Phase 5: 収益化 + 機能拡張
- Stripe 統合 (Standard 980 円 / Premium 2,980 円)
- 占い拡張: 西洋占星術 + 四柱推命 + 易経 (= 5-7 流派化、moat §3.2 本検証)
  - 西洋占星術 / 四柱推命 は出生時刻 fallback 設計が要 (重い wedge)
  - 易経は自由質問テキスト入力 UI が要
- デバイス越え引き継ぎ (LINE Login or HMAC)
- コイン制 (Phase 5 後半)

---

## 📊 KPI & 検証

### Deep usage week のタイミング (NEW)

α wedge handoff `2026-05-16-uranai-alpha-wedge.md` §"Deep Usage Week" は Phase 1.7 直後の検証想定だったが、**実施は機能 thick 化を待つ** (2026-05-16 ロードマップ見直しでの Daisuke 判断)。

**Why**: 現 α scope (月読 chat + 3 流派占い + IPIP context のみ) では 7 日連続使う動機が薄い。朝の儀式 (Phase 2.5) や月読記憶 (Phase 3.3) が動いて初めて「毎日触る理由」が成立する。早期に deep usage を強行しても自然な利用にならず、KPI a の検証として無効。

**実施候補タイミング**:
- **Phase 2 完了後** (= 朝の儀式 + IPIP 進捗 context が稼働): 「日々の儀式」moat が体感できるか検証
- **Phase 3 完了後** (= 月読記憶 + ペルソナ複数化が thick): 「思い出してる感」と「キャラ選択」moat が体感できるか検証
- どちらで判断するかは Phase 2 完了時点で再評価

### Phase 1.9 / Phase 2 検証指標 (= KPI a)

| 指標 | 方法 | 目標 |
|---|---|---|
| 月読 chat の persona consistency | LLM-as-judge (Sonnet 4.6) | ≥ 4/5 |
| 月読 chat の context utilization | LLM-as-judge | ≥ 4/5 |
| Daisuke 自己評価「月読は私を知ってる」 | subjective | ≥ 4/5 |
| 累計 chat turn | D1 SQL query | 30+ |
| 累計 session | D1 SQL query | 7+ |
| IPIP 蓄積項目数 | user_responses COUNT | 朝の儀式 1 週で 30+ |
| 朝の儀式継続日数 | D1 query | 7 日連続 |

### Telemetry

ダッシュボード UI は当面作らない。SQL query で軽量に観測:

```sql
-- 自分の sessions 数
SELECT session_id, COUNT(*) AS turns
  FROM conversations WHERE device_id = ?
  GROUP BY session_id ORDER BY MIN(created_at) DESC;

-- 累計 IPIP 蓄積
SELECT scale_id, COUNT(*)
  FROM user_responses JOIN scales USING (item_id)
  WHERE device_id = ? GROUP BY scale_id;
```

---

## 🎓 学術的根拠リファレンス

### Tier S (Gold Standard)
- **Big Five (IPIP-NEO)**: 数万研究、Public Domain、α=0.81-0.90
- **PHQ-9**: うつスクリーニング国際標準、Pfizer Free
- **K6**: 国民生活基礎調査採用、α=0.89
- **Rosenberg Self-Esteem**: 50,000+ 引用
- **SWLS**: 人生満足度の標準尺度 (Diener et al., 1985)

### Tier A (Strong Support)
- **Self-Concept Clarity (SCCS)**: α=0.86, retest r=0.79、2,000+ 引用
- **IPIP-HEXACO**: Honesty-Humility 6 次元、Phase 3 追加候補
- **IPIP-IPC**: 対人円環、Phase 3 追加候補
- **IPIP-RIASEC**: Holland Code、Phase 3 追加候補

### Tier C (非推奨、当サイトでは採用しない)
- **MBTI / 16Personalities**: 再テスト r=0.50、商標
- **動物診断系**: 科学的根拠なし

---

## 📚 参照ドキュメント

- **[project-design.md](./docs/project-design.md)** — プロジェクト全体設計 (v1.2 で本ロードマップと同期)
- **[CLAUDE.md](./CLAUDE.md)** — 実装ガイド / 心理尺度詳細 / 既存 7 尺度の Tier
- **[docs/handoff/2026-05-16-uranai-alpha-wedge.md](./docs/handoff/2026-05-16-uranai-alpha-wedge.md)** — α wedge 実装記録 + deep usage week 設計
- **[docs/specs/](./docs/specs/)** — 各 wedge の spec (tarot / 3 流派 / chat / α)
- **memory** — `~/.claude/projects/-home-user-psychtest-jp/memory/` 配下に positioning / IPIP 統一 DB / KPI / 公開 punt の経緯を保存

---

## ✅ 定義完了 (Definition of Done)

| Phase | 完了基準 |
|---|---|
| **Phase 0** ✅ | 7 尺度 + ダッシュボード + Trait-State-Outcome 可視化 + E2E |
| **Phase 1** ✅ | 月読 chat + 3 流派占い + D1 永続 + IPIP context + eval automation |
| **Phase 1.9** | deep usage week 完走 + LLM-as-judge ≥ 4/5 + 生年月日永続化 + 月読 assets 本番化 |
| **Phase 2** | IPIP 統一 DB 構築 + 既存 7 尺度 migration + トップ 2 入口化 + 朝の儀式 UI 稼働 |
| **Phase 3** | 新規 IPIP 4 尺度 + 月読会話駆動 IPIP + session_summaries + ペルソナ 2-3 体 |
| **Phase 4-5** | KPI a 達成後に着手判断 (現時点 punt) |

---

## 🔄 次のアクション

**最優先 (今すぐ着手可能)**:
1. ~~生年月日 profile 永続化~~ ✅ 完了 (commit 91c210a)
2. ~~Phase 2.1 IPIP 統一項目 DB~~ ✅ 完了 (commit c34a4ba 系)
3. ~~Phase 2.1.γ ipip-seed-completeness~~ ✅ 完了 (commits c04f1bb + c5ba87d + 9244a94)
4. ~~Phase 2.1.δ IPIP supplement~~ ✅ 完了 (commit ac929bf) — skip 0 / 100% coverage
5. ~~Phase 2.2.1 Industriousness D1 migration~~ ✅ 完了 (Phase 2.1.β 内で実装済を 2026-05-17 確認)
6. ~~Phase 2.3 非 IPIP 4 scale (Rosenberg/PHQ-9/K6/SWLS) 統合~~ ✅ 完了 (commit 2fe790f) — scale_meta 10/11 ✓
7. ~~Phase 2.x.A+B IPIP Index facet auto-view + ORAIS/ORVIS 復活~~ ✅ 完了 (commit ea79b9c) — 442/463 (95.5%) カバー
8. ~~Phase 2.x.C.1+2 IPIP page direct fetch supplement~~ ✅ 完了 (commits 07ad700 + 9b7fe8d) — 主要 9 instrument / 178 scales / 1,707 items
9. **Phase 2.1.α** BigFive audit 反映 — 16 件中 high+medium で明確分のみ data + DB 同期
10. **Phase 2.6** 月読 context 進捗 N/M — `lib/uranai/profile-summarizer.ts` 拡張

**次 session 候補**:
- **Phase 2.x.C.3 残 instrument 拡張** — BFAS / 6FPQ / JPI / HPI / HPI-HIC / AB5C / Buss1980 / Foa1998 / Foa2002 / Hoyle2002 / Levenson1981 / Cacioppo1982 / Snyder1974 / Span2002 / Chapman1986 / Scheier1994 / Barchard2001 / 7FACTOR (= 同 pipeline で順次)
- **Phase 2.2.2** Self-Concept migration — Phase 2.x.C で `neo_self_consciousness` 10 items 投入済、Daisuke 独自編集 8 items との対応決定で完了
- **Phase 2.4** トップ 2 入口ハブ書き換え — UI 大改修、独立 wedge
- **Phase 2.5** 朝の儀式 UI — Phase 2.3 完了で全 7 尺度が user_responses に集約された基盤の上で実装可能
- **IPIP facet UI 化** (= 動的 [ipipFacetId] route) — Phase 2.x.A+B+C で DB 基盤完成、UI wedge は別 spec 切る

**別タスク (Phase 2 と並列で要対応)**:
- **Production deploy**: `db:migrate:remote` が 7403 エラー → wrangler 再認証 必要、その後 migrate + seed + Pages deploy

**Phase 2 着手判断**:
- 上記 1-3 が回り始めたら Phase 2.1 → 2.6 を順次 wedge 化
- 各 sub-step は `/office-hours` で spec → `/feature-dev` で実装

**Deep usage week**:
- Phase 2 完了 or Phase 3 完了後に実施判断 (= 機能 thick 化後)
- 現 α scope では 7 日連続使う動機が薄いため

**中長期 (Phase 3 以降)**:
- 月読 deep usage が回ったら Phase 3 着手判断
- 公開判断は KPI a 達成後の見直しまで punt

---

**変更履歴**:
- v1.0 (2026-01-20): 心理尺度路線中心、PSS / ECR-R / BYOK Chat 計画 — 2026-05 ロードマップ見直しで陳腐化
- v2.0 (2026-05-16): 占い + 月読 chat 統合路線、IPIP 統一 DB + 朝の儀式 + 2 入口ハブ、KPI a 単独、Phase 4-5 punt
- v2.1 (2026-05-16): Phase 1.9 (生年月日永続化) + Phase 2.1 (IPIP 統一 DB) 完了反映
- v2.2 (2026-05-16): Phase 2 を sub-phase 分割 (= 2.1.α audit / 2.1.β scale_meta wedge / 2.2 を 2.2.1 + 2.2.2 へ細分化)、Production deploy を独立タスクに分離
- v2.3 (2026-05-16): Phase 2.1.β (scale_meta 構築) 完了反映、Phase 2.1.γ (371 行 skip 修復) を次 session 候補に追加
- v2.4 (2026-05-16): Phase 2.1.γ (ipip-seed-completeness wedge) 完了反映 — skip 371 → 205 (Non-ORAIS 172 → 6, 96% 削減)、IPIP master typo 訂正 + bulk "that" 補完 + 16 manual overrides、17 instrument 完全救出、残 Pattern E 6 件は別 wedge へ punt
- v2.4.1 (2026-05-17): Phase 2.1.γ sanitization 反映 — ORAIS (200 件) を SCALE_TOMBSTONES に追加で skip 雑音除外 (skip 205 → 6)、scale_meta completeness check 機構追加、IPIP master 内 normalize collision 0 件 / Tedone cover 96.9% を auxiliary audit で確認、残 Pattern E 6 件は scoring key 反転考慮しても wording 意味同一性で却下
- v2.4.2 (2026-05-17): Phase 2.1.δ IPIP supplement 反映 — 残 Pattern E 6 件を IPIP 公式 web page で audit、全 5 wording が各 inventory Key page に掲載されている (master 外、inventory 独自項目) ことを確認。新 ID namespace `EX-NNN` (= External) で ipip-3320-supplement.json を新規作成、source='tedone_extension' で ipip_items に投入。ITEM_ID_RE 拡張 (= 将来 GAD9-001 等の非 IPIP scale prefix も統一対応)。skip 6 → 0、scales 3,408 完全カバー、ja_text も bigfive UI 訳スタイルで揃え。
- v2.4.3 (2026-05-17): Phase 2.2.1 既完了確認 + Phase 2.3 非 IPIP 4 scale 統合完了反映 — Industriousness adapter は Phase 2.1.β 内で既実装済 (checkbox 同期のみ)。Phase 2.3 で migration 0005 (D1 CHECK 0-7 緩和) + supplement 30 items 追加 (RSE/PHQ9/K6/SWLS) + buildResponses helper で 6 adapter 統一 + 4 非 IPIP scale を scales table 投入。scale_meta completeness 10/11 ✓ (selfconcept のみ Phase 2.2.2 pending)。ID namespace 体系統一: IPIP master (Hxxx) / IPIP supplement (EX-) / 非 IPIP scale 固有 (RSE-/PHQ9-/K6-/SWLS-)。
- v2.4.4 (2026-05-17): Phase 2.x.A+B 完了反映 — IPIP 公式 `newIndexofScaleLabels.htm` の「Alphabetical Index of 274 Labels for 463 IPIP Scales」を DB 表現する基盤実装。Tedone Table の (instrument, label) ペアを fine-grained facet view として scales table に自動投入 (= 442 facet scale_ids 生成)。ORAIS (Goldberg 2010) / ORVIS (Pozzebon 2010) tombstone 解除 + AUTO_SUPPLEMENT_INSTRUMENTS 機構で 291 items 自動投入 (`ORAIS-001..199` / `ORVIS-001..092`)。IPIP Index 463 のうち **442 (95.5%) カバー**、残 21 件 (Broadbent/Saucier 等 Tedone 不在) は Phase 2.x.C (= IPIP page direct fetch supplement) で別 wedge。 Tedone Table の dump 粒度問題 (= 同 wording の複数 scale 共有を不完全 dump、BIDR/Cognitive-Failures 10 中 8 件のみ等) も Phase 2.x.C 対応。
- v2.4.5 (2026-05-17): Phase 2.x.C.1+2 完了反映 — IPIP 公式 page direct fetch supplement で主要 9 instrument 完全 fidelity 化。`scripts/audit-ipip-page.ts` (diff tooling) + `scripts/convert-page-to-supplement.ts` (WebFetch 結果 → supplement.json 自動 conversion) を新規実装、`data/ipip-master/ipip-scales-supplement.json` 拡充で BIDR/Cognitive-Failures 1 + HEXACO_PI 24 + VIA 24 + IPIP-IPC 8 + MPQ 12 + NEO 30 + TCI 30 + 16PF 16 + CPI 33 = **178 scales / 1,707 items 補完**。scale_meta 登録 11 scale の IPIP project 由来 4/4 (hexaco_pi/via/ipip_ipc/mpq) は item-level fidelity 100% 達成。Tedone Table dump 粒度問題が主要 instrument では実質解消。残 instrument (BFAS/6FPQ/JPI/HPI/HPI-HIC/AB5C/Buss1980/Foa/Hoyle2002 等) は次 session で同 pipeline 拡張可能。
