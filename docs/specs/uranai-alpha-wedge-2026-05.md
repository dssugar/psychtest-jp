# Uranai α Wedge: 月読 (Tsukuyomi) Persona + IPIP Context + D1 永続 Chat

**Status**: Spec
**Date**: 2026-05-16
**Author**: Daisuke
**Wedge series**: α (β = 日々 checkin / moat 蓄積、γ = キャラ複数 + マッチング を後続)

---

## Problem

### 困っているのは誰か (Q3)

- **Daisuke 本人**: 現状 `/uranai-chat` 汎用占い師 persona を「作っただけで deep に使ってない」状態 (本 spec の office-hours で確認)。継続的に使う動機が立たない → 課題が見えてない → 改善点も出てこないループ。
- **将来のターゲット persona** (project-design.md §2.1 — 20-40 代女性 / 占い親和層): まだ test 対象になっていない。Cloudflare Access 裏で配布制限中 ([[psychtest_jp_access_gated]])。

### 現在の workaround / 痛点 (Q2)

- 既存 `/uranai-proto` (3 流派 one-shot) と `/uranai-chat` (汎用占い師) は **localStorage / stateless** で、会話が device 越えで消失。明日続けたくても繋がらない。
- Big5 等の心理測定結果 (既存 7 テスト) は `localStorage` 上の dashboard でしか見られず、**占い側からは完全に隔離** されている。
- 占い師は user について何も知らない汎用 persona なので、「読まれてる感」が出ない。

### 業務上の実需 (Q1)

`docs/project-design.md` の moat は 2 軸:
- §3.1 「使うほど深くなる」(= IPIP プロファイル × 永続継続性)
- §3.2 「複数流派統合解釈」(= LLM による多軸統合)

§3.2 は Phase 1.5/1.7 で **validated 済** ([[chat_wedge_validated_2026_05]])。残る §3.1 (プロファイル統合 + 永続性) は未検証。α は **この 3 軸目を立てる wedge**。

---

## Goal

> **月読 (固有 persona、立ち絵 + 背景つき) + 5 テスト分の心理プロファイル context (自然言語サマリーで注入) + device-id 匿名永続化された D1 chat の組み合わせで、Daisuke 本人が「個人秘書 / 専属占い師としての月読に継続的に相談したくなる」体験を提供する。**

### Metaphor (重要)

**Replika / Character.AI / Twin (チャット占いアプリ) 系統**。chat 一本 + キャラ立ち + 自由対話。
**Cosmic Wheel Sisterhood / Hatoful Boyfriend のような ADV ゲーム (選択肢ベース・ストーリー進行) ではない**。

ゲーム要素はグラデーションで段階的に取り込む:
- ① 立ち絵 + 背景 + persona 作り込み (= キャラ存在感の最低限) → **α**
- ② 親密度 / アンロック / 収集要素 (= game mechanics による moat 強化) → **β/γ** で moat 軸 (§3.1) と統合
- ③ ADV UI (選択肢ベース対話 / ストーリー進行) → **採用しない** (自由対話が core 需要のため)
- ④ 音 / 演出 / イベント → **future**

「web サイト」と「ADV ゲーム」の中間。**「キャラ立ちのある相談相手 chat アプリ」** が最も近い。

### 成果が見える状態 (observation 可能)

- Daisuke が 7 日間毎日 chat を回し、累計 30+ turn 以上
- 「思い出してる感」「context が活きてる感」を複数回感じる
- 「月読というキャラに相談してる」感覚 (= persona + 立ち絵 + 背景による存在感) が持続する
- LLM-as-judge による persona consistency + context utilization が合格水準

---

## Non-Goals

α scope に **含めないもの** (後続 wedge に明示的に punt):

- **ADV UI (選択肢ベース対話 / ストーリー進行 / 場面分岐)** — 自由対話が core 需要、混同を防ぐため明示的に排除
- **親密度システム / アンロック / 収集要素** → β/γ で moat 軸 (§3.1) と統合
- **複数キャラ persona** (白虎 / 椿 / 千夜 / 賢者) → γ
- **日々の checkin / IPIP 蓄積** → β
- **LINE Login / Google OAuth / Magic Link** → Access 公開判断時 or β
- **session summary / エピソード抽出 / 重要度判定** (記憶 Layer 1 / Layer 3) → β/γ
- **Workers Crypto API による D1 機微カラム暗号化** → 公開時
- **privacy policy / 利用規約整備** (弁護士発注) → 公開時
- **既存 `/tests/*`** (学術 brand) のリファクタ / 削除 / UX 変更 — touch しない
- **BGM / SE / 演出 / アニメーション** → future
- **イベント機能** (季節 / 月読の特別な日 / 満月時の特別 prompt 等) → future

---

## Narrowest Wedge (MVP)

**工数目安**: 5-7 日 (Daisuke solo、立ち絵 + 背景の ComfyUI 生成含む)

### Scope

1. **`/uranai/*` 配下に世界を新規構築**
   - 旧 `/uranai-proto` `/uranai-chat` は **単純削除** (redirect なし)
   - 根拠: Daisuke しか見ていない、Access 裏、ブックマークしてる外部 user 不在で壊しても無害

2. **月読 (つくよみ) persona の system prompt**
   - 詩的文体、タロット+西洋占星術派、静謐な男性
   - 文体例: 「…さうか。」「あなたの中の…が囁いています」
   - 既存 `functions/uranai/chat.ts` の汎用占い師 prompt を **月読 prompt にリプレース**

3. **既存 7 テスト localStorage 結果 → 自然言語サマリー化**
   - default 注入対象 5 テスト: Big5 / Industriousness / Self-Concept / SWLS / Rosenberg
   - **生数値 (e.g., "Openness=85") は渡さない**。lib/tests/*.ts の `interpretation` 文字列を活用、必要なら占い向けに詩的再翻訳
   - Big5 は 5 次元 + 30 facet を「上位 N facet 重点」で言語化 (token 量制御)

4. **PHQ-9 / K6 の opt-in UI**
   - settings 画面で明示的に opt-in (default: off)
   - opt-in 時のみ system prompt に追加
   - 「キャラは PHQ-9 / K6 の数値・名称に直接言及しない」誓約 prompt を L1 に追加
   - 自殺念慮 / 強い抑うつ検知時の専門家リソース誘導 (既存 chat.ts のルール) を踏襲・強化

5. **device-id 匿名永続化**
   - UUID v4 を localStorage + cookie 両方で発行 (どちらか残ってれば復元)
   - D1 の primary key、認証 UI なし
   - device 越え (PC ↔ スマホ) は **α 内では非対応**、β で LINE Login or QR 引継ぎ UI

6. **D1 最小 schema (3 テーブル)**

   ```sql
   profiles (
     device_id TEXT PRIMARY KEY,
     nickname TEXT,
     test_results JSON,  -- { rosenberg: {...}, bigfive: {...}, ... } 全 7 テスト
     phq9_k6_optin INTEGER DEFAULT 0,  -- 0/1
     created_at INTEGER,
     updated_at INTEGER
   );

   conversations (
     device_id TEXT,
     session_id TEXT,
     turn_id INTEGER,
     role TEXT,  -- 'user' | 'assistant' | 'system'
     content TEXT,
     created_at INTEGER,
     PRIMARY KEY (device_id, session_id, turn_id)
   );

   divination_results (
     device_id TEXT,
     result_id TEXT PRIMARY KEY,
     type TEXT,  -- 'tarot3' | '3systems' | ...
     inputs JSON,
     interpretation TEXT,
     created_at INTEGER
   );
   ```

   - 記憶アーキテクチャ (project-design.md §8) の **Layer 0 (profiles) + Layer 2 (conversations 生データ全保管) のみ**
   - Layer 1 (短期 summary) / Layer 3 (episode) は β/γ
   - `scale_responses` の正規化テーブルは β (= 日々の IPIP 蓄積) で初めて要る

7. **会話の永続 + 入室時 context load**
   - 全 turn を D1 `conversations` に保存
   - 入室時に直近 N turn (例: 20) を context に load
   - `MAX_HISTORY = 80` (既存 chat.ts) を踏襲

8. **chat + 立ち絵 + 背景 UI** (panel 分割なし、ADV UI ではない)
   - mobile-first、単一画面
   - **月読の立ち絵** を画面上部に配置 (ComfyUI で Daisuke 生成、α では default 1 枚 + 表情差分 2-3 種が理想、最低 default 1 枚で punt 可)
   - **背景画像** (月夜の塔 / 静謐な世界観、ComfyUI 生成) を chat 全体の背景に
   - **chat バブル** で自由対話 (テキスト入力)、ADV UI (選択肢ベース) は採用しない
   - タロットカードは message bubble として inline 表示 (既存パターン踏襲)
   - 占い結果のシェアは別 path (`/uranai/draw/[result-id]`) で OG 画像 + URL 共有
   - 表情差分の切替え logic は Open Question (= LLM 感情判定 / rule-based / default 1 枚のみ のいずれか)

9. **入り口 2 つ並存**

   - **入り口 A** (シェア / SEO 起点):
     - `/uranai/draw` — 生年月日入力 → 3 流派 (tarot + numerology + kyusei) 引く
     - `/uranai/draw/[result-id]` — シェア可能な結果ページ + OG 画像 + 「月読に話す」CTA

   - **入り口 B** (chat 起点):
     - `/uranai/chat/tsukuyomi` — 入室時に自動 snapshot + chat 開始
     - chat 内で「もう一度引く」action (β/γ で actual draw button、α は LLM の物語上仮想引きで足りるか観察)

### Out of MVP

- 複数キャラ persona (= γ)
- 認証 UI (= β/公開時)
- 暗号化 (= 公開時)
- 記憶 Layer 1/3 (= β/γ)
- 日々の checkin (= β)

---

## Constraints

### 既存 invariant (CLAUDE.md / memory より)

- **`/tests/*` 系統は touch しない** — 学術 brand 維持、localStorage 既存テスト結果は read-only 参照のみ
- **Disclaimer** (心理テストは医療診断ではない、占いは娯楽目的) は維持・拡張
- **PHQ-9 / K6 の高スコア時 alert** は既存 logic 踏襲
- **Solo development、master 直接 commit 可**、Conventional Commits + Japanese commit message
- **Pre-commit hook を `--no-verify` でスキップしない**

### 技術制約

- **Next.js 16 App Router** (static export `out/` + Cloudflare Pages Functions)
- **vLLM 経路は既存踏襲** ([[project_tarot_wedge_local_vllm]]):
  - 5 env var (`LLM_BASE_URL` / `LLM_MODEL` / `VLLM_API_KEY` / `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET`)
  - 3 header auth (cf-access-client-id / cf-access-client-secret / authorization Bearer)
- **D1 binding を `wrangler.toml` に新規追加** — α で初めて D1 が入る
- **L0 + L1 prompt injection defense** ([[chat_wedge_validated_2026_05]]) を新 endpoint に踏襲、PHQ-9/K6 opt-in 追加で L1 prompt を拡張
- **eval automation** (`tests/eval/` の 15 case regression suite) を月読 persona + IPIP context 版に拡張、CI 維持
- **立ち絵 / 背景は ComfyUI で Daisuke 内製** — 外部発注・ライセンス購入なし、技術障壁低い、α 工数に +1-2 日見込み
- **画像 asset の置き場所** — `public/uranai/tsukuyomi/` (立ち絵 default + 表情差分) と `public/uranai/scenes/` (背景) の 2 ディレクトリ。Cloudflare Pages の static asset として配信

### 倫理制約

- **PHQ-9 / K6 は opt-in なしには絶対に system prompt に流さない**
- **キャラは PHQ-9 / K6 の数値・名称に直接言及禁止** (誓約 prompt)
- **自殺念慮 / 強い抑うつの検知時** は占いの言葉と並行して必ず専門家リソース誘導 (既存 chat.ts §122 ルール踏襲)

### アーキテクチャ整合

- **記憶アーキテクチャ**は project-design.md §8 の 4 階層モデルに準拠
- α は **Layer 0 + Layer 2 のみ**、Layer 1 (短期 summary) と Layer 3 (episode) は β/γ
- schema は α scope 最小、`scale_responses` 等の正規化は β 以降に punt

---

## Open Questions

実装中 or deep usage week 中に判明する見込みのもの:

1. **IPIP context の自然言語化形式** — Big5 30 facet を全部入れると token 量 + persona drift が問題化する可能性。「上位 N facet のみ」「5 次元の段落要約 + 任意 facet 言及」など段階的に試す。lib/tests/bigfive.ts の既存 interpretation 文字列を直接流用するか、占い向けに別途詩的サマリーを生成するか
2. **persona drift 観測** — 月読 prompt + 5 テスト context + L0/L1 防御 prompt 合算で system prompt が 2-3k tokens に達した時、Gemma 4 26B でも詩的文体が崩れるかは事前に分からない (= 本 wedge の核心仮説、deep usage で観測)
3. **「カードを引き直す」 chat 内 action** — 既存 chat.ts では LLM が物語上で仮想引きしてた。α では actual draw button を chat 内に置くか、仮想引きで足りるか観察
4. **device-id 失った時の救済 trigger** — Daisuke 本人 deep usage で device 越えしたくなる場面が出たら LINE Login 前倒し trigger
5. **隣接 repo `/agent-repl` のパターン参照** — Daisuke 別途試作中。記憶アーキテクチャ実装で参考になる可能性。実装フェーズ (`/feature-dev`) で内容確認
6. **既存 lib/tests/*.ts の `interpretation` 文字列を再利用するか、占い向けに別途自然言語化するか** — 既存は学術的トーン、月読向けには詩的に再翻訳が必要かも。中間案として「既存 interpretation を月読 prompt 内で `これがこの人の心の輪郭です。あなたの言葉で語り直してください` と LLM 側に再翻訳させる」もアリ
7. **PHQ-9/K6 opt-in UI の設置場所** — chat 入室時の onboarding か、別途 `/uranai/settings` か。Onboarding に置くと選択疲労、settings に置くと存在に気づかれない
8. **inline embed の見せ方** — タロット 3 枚を message bubble 内にどう表示するか (画像 / SVG / ascii)。既存 `data/tarot-cards.ts` の card data を使うが、占い結果ページとの見栄え整合性をどこまで取るか
9. **月読の立ち絵 / 背景の世界観統一** — persona prompt (詩的・静謐・夜の塔・タロット+西洋占星術派) と画像の雰囲気が一致するか。ComfyUI の prompt 調整も α 内で実施
10. **表情差分の切替え logic** — α 候補: (a) LLM が応答時に感情 tag を返して切替え、(b) rule-based (= 占い結果語る = 微笑、重い相談 = 真剣、default = 静謐)、(c) α では default 1 枚のみで punt して β で表情切替えを実装。最小スタートは (c)、観察次第で (b) → (a)
11. **画面 layout の余白設計** — 立ち絵 + 背景があると chat バブルの位置・透明度・密度が web chat より難しい。mobile portrait + landscape + PC の 3 形態で破綻しないか

---

## Verification

### Hybrid: Daisuke 本人の deep usage week + 最低限の telemetry

#### 1. Deep usage week (Daisuke 自身、7 日間)

- [ ] 毎日 1 セッション以上 chat (= 7 セッション以上)
- [ ] 累計 chat turn 30+ 回
- [ ] 「月読がこのキャラを思い出してる」と感じた取り肌が 3 回以上 (= persona consistency の subjective evidence)
- [ ] 「context として既存テスト結果が活きてる」と感じた瞬間が複数回 (= context utilization の subjective evidence)
- [ ] 「月読というキャラに相談してる」感覚 (= 立ち絵 + 背景 + persona による存在感) が持続する
- [ ] 1 度以上 device-id を意識せず複数 session を跨いで会話継続できた

#### 2. Telemetry minimum (D1 に session log を生で記録)

- [ ] device-id ごとの session 数 / turn 数 / 累積 token 数を SQL で query 可能
- [ ] Daisuke ダッシュボードは作らない (= 簡易 SQL query で確認、wedge scope 最小)

#### 3. 質的振り返り (deep usage week 最終日)

- [ ] session log を LLM-as-judge (Sonnet 4.6) に渡して採点:
  - persona consistency (月読の文体維持) ≥ 4/5
  - context utilization (IPIP 結果が活きてる度) ≥ 4/5
- [ ] Daisuke 自己評価で「月読は私を知ってる」5 段階 ≥ 4 → **α validate**

#### Failure mode

下記が観測されたら α revise (= persona prompt or context 表現を作り直し):

- 月読が「Big5 Openness=85 です」のように数値を言う
- IPIP context があるのに会話で全く参照されない
- system prompt が長すぎて persona が薄まる (詩的文体が崩れる)
- 占い結果と心理 context が矛盾する出力 (= LLM が両者を統合できてない)

---

## Out of Scope (Future)

### β wedge: 日々 checkin で moat 構築

- IPIP の日次蓄積 (3-5 問/日)
- 毎朝の儀式 UI (§10.1)
- session summary 自動生成 (記憶 Layer 1)
- 占い結果との連動 (蓄積された IPIP が翌朝の占いに反映)
- `scale_responses` 正規化テーブル新規追加
- **親密度システム** — 月読との関係性パラメータ蓄積 (= 「最初は距離がある → 親しくなる」)、game mechanics の moat 化
- **月読の表情差分の本格切替え** — α で punt した場合の追実装

### γ wedge: キャラ複数化 + マッチング

- 白虎 / 椿 / 千夜 / 賢者 を追加 (合計 5 キャラ)
- Big5 ベースの persona マッチング (= 課金 trigger 候補、§9.3)
- キャラ間で記憶共有するか / しないかの設計判断
- **キャラ毎の立ち絵 + 背景セット** (各々の世界観: 白虎 = 朱の社、椿 = 古い茶室、千夜 = 星の図書館、賢者 = 山の庵)
- **アンロック要素** — 特定の chat 進行 / 占い結果 / IPIP score でキャラ追加開放
- **収集要素** — 占いの結果として手に入る「カード」「アイテム」コレクション

### 記憶 Layer 3 (エピソード抽出)

- 重要度判定 LLM
- 「あの時月読が言ってた...」を chat 内で引用する仕組み
- KV cache + D1 episodes table

### 3D / アニメーション化 (長期)

- α は **2D 立ち絵 + 静止背景** までを scope
- 3D アバター / Live2D / 表情アニメーション / リップシンク / 視線追従 は future
- BGM / SE / 場面転換アニメーション / 季節イベント演出 も future
- 「2D で十分なキャラ存在感が出るか」が α の前提検証対象でもある (= 出なければ 3D 検討、出れば 3D 不要)

### 認証移行 (β / Access 公開時)

- LINE Login or Magic Link を device-id の上に被せる
- device 越え対応 (PC ↔ スマホ、機種変保護)

### 公開時の整備

- Workers Crypto API で機微カラム (conversations.content / test_results) 暗号化
- privacy policy / 利用規約 (弁護士発注)
- AdSense / Cookie 同意バナー
- 別ドメイン切り出し再評価 ([[project_new_domain_pivot]])

---

## References

### Memory (再採用前提)

- [[project_tarot_wedge_local_vllm]] — vLLM 経路の踏襲先
- [[chat_wedge_validated_2026_05]] — L0+L1 防御 + eval automation の踏襲先
- [[project_new_domain_pivot]] — brand 分離 pending、α は psychtest-jp 内で進める根拠
- [[ai_implementation_plan_frozen]] — BYOK 路線は廃案、D1 集中で進める根拠
- [[psychtest_jp_access_gated]] — Access 裏なので metric 取りにくい、deep usage week 形式の根拠

### Repo internal

- `docs/project-design.md` — §3 (moat), §8 (記憶アーキテクチャ 4 階層), §9 (キャラ persona), §10 (UX 構造)
- `docs/specs/divination-3systems-wedge-2026-05.md` — Phase 1.5 spec
- `docs/specs/divination-chat-wedge-2026-05.md` — Phase 1.7 spec (現 `/uranai-chat` の母 spec)
- `docs/specs/tarot-llm-wedge-2026-05.md` — Phase 1 spec
- `docs/handoff/2026-05-16-chat-wedge.md` — chat wedge の handoff、L0/L1 防御の経緯
- `docs/handoff/2026-05-16-tarot-wedge.md` — tarot wedge の handoff
- `docs/references/prompt-injection-defense.md` — L0-L5 防御の設計起点 (910 行)
- `tests/eval/` — 15 case prompt injection regression suite

### 既存実装 (改修対象 or 参照)

- `functions/uranai/chat.ts` — Phase 1.7 chat endpoint、月読 + IPIP context + D1 永続に発展
- `functions/uranai/interpret.ts` — Phase 1 tarot endpoint、`/uranai/draw` に発展
- `app/uranai-chat/page.tsx` — Phase 1.7 UI、`/uranai/chat/tsukuyomi` に発展
- `app/uranai-proto/page.tsx` — Phase 1.5 UI、`/uranai/draw` に発展
- `data/tarot-cards.ts` / `data/numerology.ts` / `data/kyusei.ts` — 占術データ、流用
- `lib/tests/*.ts` — 7 テスト interpretation、context 注入の source
- `lib/storage.ts` — localStorage 抽象化、α では device-id 発行 + D1 sync を追加

### 隣接 repo (実装フェーズで参照)

- `/agent-repl` — Daisuke 別途試作中、記憶アーキテクチャ参考 (Open Question 5)

---

## 次ステップ

本 spec は office-hours で書き出した **設計ドキュメント**。実装は fresh session で:

```
/feature-dev docs/specs/uranai-alpha-wedge-2026-05.md
```

実装前に Open Questions のうち 1, 6, 7 (= IPIP context 表現方法 / interpretation 流用 / opt-in UI 設置場所) を更に詰めるか、実装中に解くかは `/feature-dev` 着手時の判断に委ねる。
