# psychtest.jp - 実装ロードマップ

> **最終更新**: 2026-05-16 (v2.2、Phase 2 を sub-phase 分割 + scale_meta 整理 wedge 追加)
> **前版**: v2.1 (2026-05-16) Phase 2.1 完了反映 / v2.0 (2026-05-16) ロードマップ見直し / v1.0 (2026-01-20) 心理尺度路線中心
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

### 2.1.β `scale_meta` 構築 + IPIP psychometric 整理 (新 wedge、要 office-hours)

「scale として使える形」にするため、α / 採点方法 / category 等を整理。Phase 3.1 (新規 IPIP 尺度 UI 追加) の必須前提。

- [ ] `/office-hours` で wedge spec 化
- [ ] `migrations/0004_scale_meta.sql`: `scale_meta` table 新設
  - scale_id PK / category (`multi-construct` | `single-construct`) / total_items / alpha / scoring_rule / source_url / reference / ja_label / ja_description
- [ ] IPIP 公式 17 inventories の Key ページから psychometric data 取得 (例: `newNEOKey.htm`、`newHEXACOPIKey.htm` 等)
- [ ] Tedone Table の alpha 値と突合 (= 既存 data の活用)
- [ ] Multi-construct / Single-construct 区分 (= 36 instruments の分類)
- [ ] **Self-Concept (現 `data/selfconcept-questions.ts`) の元 IPIP scale 特定 + textEn 追加** もここで対処
- [ ] seed 拡張 (`scripts/seed-ipip.ts`)

### 2.2 既存 IPIP 系尺度の内部 migration (UX 維持)

既存 UI / 結果表示はそのまま、内部実装だけ user_responses 書き込みに変更。Self-Concept は 2.1.β 完了が前提 (= textEn 欠如のため)。

- [x] **Big Five (IPIP-NEO-120)** → 完了 (Phase 2.1 内で実装、120/120 Hxxx マッピング達成)
- [ ] **2.2.1 Industriousness (IPIP-300 C4+C5, 20 項目)** → adapter 追加のみ (textEn 完備、2.1.β 待たずに着手可)
- [ ] **2.2.2 Self-Concept (IPIP Self-Consciousness Facet, 8 項目)** → 2.1.β で textEn 追加 + adapter
- [ ] 各尺度ページ (`app/[testType]/page.tsx`, `app/results/[testType]/page.tsx`) の内部 fetch を D1 経由に
- [ ] localStorage と D1 の二重書きは過渡期のみ (Phase 2 完了で localStorage 廃止)

### 2.3 非 IPIP 系尺度の user_responses 統合

非 IPIP 系は項目 DB に入れず、scale ごとに別 namespace で user_responses に保存:

- [ ] Rosenberg / PHQ-9 / K6 / SWLS の回答を user_responses に書き込み (source 区別)
- [ ] 月読 context が「Rosenberg 完了済 / K6 未受験」を把握できるように

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
3. **Phase 2.1.α** BigFive audit 反映 — 16 件中 high+medium で明確分のみ data + DB 同期
4. **Phase 2.2.1** Industriousness migration — adapter 追加のみ、textEn 完備で即着手可
5. **Phase 2.6** 月読 context 進捗 N/M — `lib/uranai/profile-summarizer.ts` 拡張

**次 session 候補**:
- **Phase 2.1.β** scale_meta wedge — `/office-hours` で spec 化推奨 (= α / 採点 / multi vs single 区分整理、Phase 3.1 前提)
- **Phase 2.2.2** Self-Concept migration — 2.1.β 完了後 (= textEn 追加必要)
- **Phase 2.4** トップ 2 入口ハブ書き換え — UI 大改修、独立 wedge
- **Phase 2.3** 非 IPIP 系統合 — scale-specific namespace 設計が要

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
