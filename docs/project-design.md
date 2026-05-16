# AI性格診断・占いプラットフォーム 設計書

> **プロジェクト名**: (仮称) psychtest.jp 拡張プロジェクト
> **初版**: 2026年5月15日 / **v1.1**: 2026年5月16日 / **v1.2**: 2026年5月16日 (ロードマップ見直し)
> **位置づけ**: 個人副業 / 将来的にMS法人事業候補
> **本書の目的**: コンセプト、技術選定、段階展開、収益モデル、プライバシー方針を一望し、Claude Code 駆動開発のリファレンスとして機能させる

---

## v1.2 更新サマリ (2026-05-16、ロードマップ見直し)

Phase 1.7 α wedge 完了直後にロードマップ全体を見直し。以下を確定:

- **Positioning 確定**: 「心理尺度サイト (`/shindan/*`)」と「占い + 月読 chat (`/uranai/*`)」を**並列の独立した入口**として扱う (uranai moat フルピボットは却下)。詳細は memory `[[project-positioning-dual-entry]]`
- **§5 ロードマップ全面書き換え**: Phase 1.5 → 1.7 まで完了、Phase 2 を「IPIP 統一項目 DB + 朝の儀式 UI」に確定、Phase 4-5 (公開 + 収益化) は KPI 達成後の見直し判断 = 現時点 punt
- **§7 心理測定コーパスに統合 DB 計画追記**: 3,300 IPIP 項目を ipip_items / user_responses / scales(view) の 3 テーブルで統合し、単発受験 / 毎日蓄積 / 占い会話駆動の 3 mode が同じ DB を共有
- **§13.1 URL 戦略更新**: トップを「2 入口ハブ」に書き換え、現心理尺度トップは `/shindan/` に退避
- **§19 次のアクション全面更新**: Phase 1.9 (地ならし) → Phase 2.1-2.6 のステップを ROADMAP.md に詳述
- **KPI 確定**: Daisuke 本人の deep usage 単独 (期間定めず)。知人 invite / public 公開 / 課金検証は明示的に non-KPI = memory `[[project-kpi-deep-usage]]`

詳細な実装ステップは [ROADMAP.md](../ROADMAP.md) v2.0 を参照。

---

## v1.1 更新サマリ (2026-05-16)

Phase 1 を wedge 化（`docs/specs/tarot-llm-wedge-2026-05.md`）し、**タロット 1 流派 × LLM 統合解釈 × 結果表示** を end-to-end で稼働確認。これに伴い以下を更新:

- **§4.4 推論**: vLLM 経路が確定。`vllm.psychtest.jp` (Cloudflare Tunnel + Access service token + vLLM api-key の 2 段認証) で稼働中。Anthropic / OpenAI 直契約なしのため、§15.1 のフォールバック計画は再設計が必要
- **§5 ロードマップ**: Phase 1 を「wedge 完了部 (タロットのみ)」と「**Phase 1.5: 4 流派追加 + 自由質問入力 + 課金前 UI 仕上げ**」に分割
- **§15.1 技術リスク**: Cloudflare Pages auto-build が 3 ヶ月失敗状態だった bug を v1.1 で fix（`wrangler.toml` の `[build]` セクション削除）。CI/CD health monitoring を新規リスクとして追加
- **§16 MVP実装計画**: Day 1-4 計画は wedge 化により再構成。「§16.4 wedge 完了状況 (2026-05-16)」追加
- **§19 次のアクション**: Week 0/Week 1-2 のアイテムを完了済としてマーク、Phase 1.5 移行判断を新規追加

主な前提変更:
- 当初想定の「Anthropic / OpenRouter にフォールバック」は契約なし状態で書かれていた → フォールバック先は再選定要 (Cloudflare Workers AI, DeepInfra 等)
- `Allow Daisuke` policy で apex は内輪公開可能になった ([[psychtest-jp-access-gated]] 参照)。当初の「完全非公開」前提は変化

---

## 1. プロジェクト概要

### 1.1 ビジョン

「**医師が運営する、心理学に基づいた、データ主権を尊重するAI性格診断・占いプラットフォーム**」を構築する。

普通のAI占いサイト(Co-Star, 16Personalities等)との決定的な差別化要因は3つ:

1. **医師(Daisuke)による運営** — E-E-A-T観点で他の運営者には絶対真似できない権威性
2. **複数流派の統合占い** — 単発占いサイトでは実現できない多軸統合解釈
3. **使うほど深くなる継続型プロファイル** — IPIPベースの心理測定が日次で蓄積、他社が後から追いつけないmoat構造

### 1.2 ポジショニング

| 軸 | Daisukeさんのサイト | 一般的なAI占い | Co-Star等 |
|---|---|---|---|
| 流派 | 5-7流派統合 | 単一流派 | 西洋占星術のみ |
| 性格モデル | IPIP/HEXACO/IPC等を統合 | なし or MBTI | 占星術ベースのみ |
| 蓄積データ | 数ヶ月〜数年の縦断データ | セッション単発 | 日次ログ程度 |
| 信頼性 | 医師運営、心理学的根拠 | 不明な運営者 | テック企業 |
| データ管理 | 自宅推論、国内完結 | 海外API依存多数 | 海外サーバー |
| AIキャラ | 複数ペルソナ選択可 | 単一AI | 単一AI |

### 1.3 既存資産

- **psychtest.jp**: IPIP-Big5系の心理テストサイト、SEO資産あり、Cloudflare Pages運用
- **ローカルLLM基盤**: RTX 5090 + RX 7900 XTX×2、vLLM稼働、Gemma4 MoE等使用可能
- **ComfyUI環境**: FLUX/SDXL画像生成、商用利用可能なモデル群
- **Cloudflareスタック経験**: Workers, Pages, D1, R2
- **LINE Bot SDK経験**: Connectome開発で実績
- **vibe coding環境**: Claude Code/CLAUDE.md駆動開発
- **vLLM 公開経路** (v1.1 追加, 2026-05-16): `vllm.psychtest.jp` で自宅 vLLM を Cloudflare Tunnel + Access service token + vLLM api-key 経由で公開。Pages Function から OpenAI 互換 API として叩ける状態。Gemma-4-26B-A4B-NVFP4 (256K context) を serve 中
- **Phase 1 wedge 実装** (v1.1 追加): `/uranai-proto/` でタロット 3 枚引き + LLM 統合解釈の end-to-end フローが稼働中。実装パターン (Pages Function での 2 段認証 OpenAI 互換クライアント) が確立済

---

## 2. ターゲットユーザー

### 2.1 主要ペルソナ

**プライマリ**: 20-40代女性、心理テスト・占いに月数百〜数千円使う層
- 占い文化に親和性
- LINE/Instagramのアクティブユーザー
- "自分を理解したい"動機が強い
- スマホファースト

**セカンダリ**: 30-50代男性、自己分析・自己開発志向
- IPIP/HEXACO等の心理測定への関心
- データドリブンに自己理解したい層
- リテンション率が高くLTV大

### 2.2 ユースケース

- 毎朝の儀式: チェックイン、今日の占い、性格テスト1セッション
- 人生の岐路: 転職・恋愛・人間関係の意思決定支援
- 自己理解の深化: 数ヶ月の継続でプロファイル深化
- 友人との相性: シェアバイラルから新規流入

---

## 3. コアコンセプトと差別化要素

### 3.1 「使うほど深くなる」moat構造

毎日のIPIP回答を蓄積することで、ユーザー側に**時間的スイッチングコスト**が積み上がる。60日継続したユーザーは新規参入競合に絶対真似できないプロファイル深度を持つ。

### 3.2 流派統合の独自性

ユーザーの生年月日と今日の日付から:
- タロット3枚引き
- 西洋占星術トランジット
- 四柱推命の日柱と今日の干支
- 九星気学の今日の運勢
- 数秘術の今日のパーソナルデイ

これらを並列計算し、LLMが「**5つの占術が共通して示しているのは...**」と統合解釈する。1流派のサイトでは絶対実現不可能。

### 3.3 構造的コスト優位

- 推論: 自宅vLLMで電気代のみ
- 画像: ComfyUIで電気代のみ
- ストレージ: Cloudflare D1/R2の超低価格
- スケール時の限界費用が事実上ゼロに近い

競合(API依存のサイト)はユーザー1人あたり月数百円の推論コストが発生する。Daisukeさんの構成だと電気代のみ。**スケールするほど構造的に勝つ**設計。

---

## 4. 技術スタック

### 4.1 全体アーキテクチャ

```
[ユーザー]
   ↓ LINE / Web
[Cloudflare エッジ]
   - Pages (Next.js): フロントエンド
   - Pages Functions: edge LLM proxy (Phase 1 wedge で実装パターン確立)
   - Workers: API、orchestration (Phase 2+)
   - D1: リレーショナルDB (プロファイル, 会話, セッション)
   - R2: 画像、生成済みアセット
   - KV: セッションキャッシュ、要約一覧
   - Vectorize: (Phase 3以降、必要時のみ)
   - Workers AI: 埋め込み生成 (BGE系) + vLLM フェイルオーバー候補 (Phase 2+)
   - Queue: 非同期fact抽出、エピソード抽出
   - Cron Triggers: 毎日の質問配信スケジュール
   ↓ Cloudflare Tunnel (cloudflared, systemd-managed) ← v1.1 で確立
   - vllm.psychtest.jp (Access app + service token)
[自宅サーバー (dai-gpu-server / 将来 荻窪オフィス)]
   - vLLM + Gemma-4-26B-A4B-NVFP4 (主推論、256K context、現稼働)
   - vLLM + 軽量モデル (バッチ処理用)
   - ComfyUI + FLUX/SDXL (画像生成)
```

### 4.2 フロントエンド

- **Next.js 16** (Connectome経験流用)
- **React 19 + React Compiler** (memoryに記載の方針と一致)
- **Tailwind CSS** + shadcn/ui
- **LIFF SDK** (LINE WebView対応)
- **MediaPipe Face Landmarker** (Phase 2の人相診断用、ブラウザ完結)

### 4.3 バックエンド

- **Cloudflare Workers (TypeScript)** で完結
- 占術計算ライブラリ:
  - `astronomy-engine` (西洋占星術、Apache 2.0)
  - `lunar-typescript` (旧暦/干支/四柱推命)
  - 数秘術・九星気学・タロットは自作 (数十行で済む)
- **neverthrow Result-type** (Connectomeの方針一致)
- **direct SDK usage、ラッパクラス禁止** (Connectomeの方針一致)

### 4.4 推論

- **主推論** (v1.1 確定): 自宅 vLLM + Gemma-4-26B-A4B-NVFP4 を `vllm.psychtest.jp` で公開
  - 経路: Pages Function → CF Access service token + vLLM api-key の 2 段認証 → Cloudflare Tunnel (QUIC, Tokyo POP) → cloudflared daemon (systemd on `.50`) → 127.0.0.1:8000 → vLLM
  - 2026-05-16 動作確認済 (`/uranai-proto/` wedge で end-to-end verified、レスポンス 0.5-数秒)
  - 環境変数 (Pages secrets): `LLM_BASE_URL` / `LLM_MODEL` / `VLLM_API_KEY` / `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET`
- **フォールバック** (v1.1 で再設計が必要): 元々 DeepInfra / OpenRouter 想定だったが、Daisuke は Anthropic / OpenAI / DeepInfra 直契約なし。Phase 2 で再選定:
  - 候補 A: **Cloudflare Workers AI** (binding 一発、契約不要、Llama/Qwen 系)
  - 候補 B: **OpenRouter** (アカウント作成のみ、無料モデルあり)
  - 候補 C: フェイルオーバーなし、503 を返すだけ (内輪リリース段階なら許容)
- **埋め込み**: Cloudflare Workers AI (BGE-base)、Phase 3以降に使用

### 4.5 配信

- **LINE Bot + LIFF** (主動線、日本市場最強)
- **Web PWA** (Cloudflare Pages、SEO流入受け皿)
- **将来のネイティブアプリ化**: Capacitor (PWAコード流用)

### 4.6 課金

- **Stripe** (主要、サブスクと単発購入)
- **将来**: Komoju / Univapay (コンビニ決済、Phase 5以降)
- **LINE Pay**: 月売上100万超えてから検討

---

## 5. 段階的ロードマップ

### Phase 1 (v1.1 で wedge 化、2026-05-16 完了)

元々「5 流派一気通貫 MVP」をスコープ想定していたが、wedge 化（`docs/specs/tarot-llm-wedge-2026-05.md`）して以下のみ実装・検証:

**完了済 (Phase 1 wedge)**:
- タロット 3 枚引き → LLM 統合解釈 → 結果表示の end-to-end (`/uranai-proto/`)
- Cloudflare Pages Functions による LLM プロキシ (2 段認証)
- 自宅 vLLM の Cloudflare Tunnel 公開
- 自宅 vLLM の Cloudflare Access service token による保護

**意図的に未着手 (Phase 1.5 で対応)**:
- 数秘術・九星気学・西洋占星術・四柱推命の計算ロジック
- 生年月日入力フォーム
- 質問テキスト自由入力
- 結果のシェア URL
- AdSense + 占いアフィリエイト
- 利用規約・プライバシーポリシー

**意図的に切る (Phase 2 以降)**:
- ユーザー登録、ログイン
- IPIP質問、性格テスト
- AIチャット
- 課金
- 人相、画像生成
- 暗号化レイヤー (生年月日のみで個人特定情報なし)

**Phase 1 wedge の目的 (達成済)**: 「占術計算 + LLM 統合 + 結果表示」スタックが end-to-end で動くかの feasibility 確認、および LLM 出力品質 (日本語ストーリー性) の検証。

### Phase 1.5 (2026-05): 3 流派 wedge ✅ (v1.2 更新)

**完了** (`docs/specs/divination-3systems-wedge-2026-05.md`):
- ✅ 3 流派 (tarot + 数秘術 + 九星気学) 並列計算 + LLM 統合解釈
- ✅ 生年月日入力 + UI
- ✅ moat §3.2 一次検証 (= 流派統合解釈の feasibility 確認)

**意図的に切った** (Phase 5 に punt):
- 西洋占星術 + 四柱推命 (出生時刻 fallback 設計が重い)
- 易経 (自由質問入力 UI が要)
- 利用規約 / AdSense / Cookie 同意 (公開判断とセット)

### Phase 1.7 / α (2026-05): 月読 chat + D1 永続 ✅ (NEW v1.2)

**完了** (`docs/specs/uranai-alpha-wedge-2026-05.md`):
- ✅ 月読 persona (静謐な男性占い師) + L1 prompt 防御
- ✅ D1 永続 chat (device-id 匿名認証、conversations / profiles / divination_results)
- ✅ IPIP context (心理尺度結果を月読の system prompt に詩的サマリで注入)
- ✅ Settings (nickname / PHQ-9/K6 opt-in / 全消去)
- ✅ Share URL (`/uranai/share?id=`)
- ✅ Prompt injection eval automation (21 case)
- ✅ moat §3.1 一次検証 (= 「思い出してる感」「裏打ち感」の feasibility 確認)

### Phase 1.9 (現在 = 地ならし、数日) (NEW v1.2)

- Daisuke deep usage week (7 日 / 30 turn / LLM-as-judge ≥ 4/5)
- 生年月日を profile に永続化 (UX 改善)
- ComfyUI で月読 立ち絵 / 背景を本番化

### Phase 2 (確定路線、KPI a 直結) (REWRITTEN v1.2)

**目的**: IPIP 統一項目 DB を基盤に既存 7 尺度を内部 migration、その上で「朝の儀式」UI を新設して Daisuke の日々利用を支える環境を作る。詳細ステップは ROADMAP.md §"Phase 2" 参照。

- 2.1 IPIP 統一項目 DB スキーマ (ipip_items / user_responses / scales view)
- 2.2 既存 IPIP 系 3 尺度 (Big Five / Industriousness / SCC) を内部 migration
- 2.3 非 IPIP 系 4 尺度 (Rosenberg / PHQ-9 / K6 / SWLS) を user_responses 統合
- 2.4 トップを 2 入口ハブに書き換え (現心理尺度トップは `/shindan/` 退避)
- 2.5 「朝の儀式」UI 新設 (毎日 3-5 問、未回答からサンプリング)
- 2.6 月読 chat に「進捗 N/M」context 追加

**意図**: §3.1 継続 moat の技術基盤完成、Daisuke の日々利用環境構築。

### Phase 3 (Phase 2 完了後、moat thick 化、1-2 ヶ月) (REWRITTEN v1.2)

- 3.1 新規 IPIP 尺度追加 (HEXACO / IPC / RIASEC / MPQ = view 追加のみ)
- 3.2 月読会話駆動 IPIP (= 文脈タグで未回答項目を chat に挿入)
- 3.3 月読記憶強化 (session_summaries 自動生成、Layer 1-3)
- 3.4 ペルソナ複数化 (γ 軽め、月読 + 1-2 キャラ追加)

### Phase 4-5 (KPI a 達成後に着手判断 — 現時点 punt) (REWRITTEN v1.2)

KPI a (Daisuke deep usage) で moat の体感が確認されてから初めて着手判断する。memory `[[project-public-release-punt]]` 参照。

**Phase 4: 公開準備**
- 利用規約 / プライバシーポリシー (弁護士発注、5-15 万円)
- メンタルヘルス配慮 prompt 本格化 (「死神」→「変革」等)
- AdSense 申請 + 動線 (心理尺度ページのみ — AI chat 併用はポリシー違反)
- Cookie 同意バナー
- Access policy 解除 → public 公開

**Phase 5: 収益化 + 占い拡張**
- Stripe 統合 (Standard 980 / Premium 2,980)
- 占い拡張: 西洋占星術 + 四柱推命 + 易経 (= 5-7 流派化、moat §3.2 本検証)
- デバイス越え引き継ぎ (LINE Login or HMAC)
- コイン制 (Phase 5 後半)
- 人相診断 / 動的画像生成 / 法人化検討 (Phase 5 末期 or Phase 6)

---

## 6. 占術体系

### 6.1 採用流派と実装難易度

| 流派 | 入力 | 計算難易度 | 実装ルート | Phase |
|---|---|---|---|---|
| タロット | カード乱数 | ★ | 78枚定義+乱数 | 1 |
| 数秘術 | 生年月日+名前 | ★ | 算数のみ | 1 |
| 九星気学 | 生年月日 | ★ | テーブル参照 | 1 |
| 西洋占星術 | 生年月日時+場所 | ★★ | astronomy-engine | 1-2 |
| 四柱推命 | 生年月日時 | ★★★ | lunar-typescript | 1-2 |
| 易経 | 質問+乱数 | ★★ | 64卦データ+乱数 | 2 |
| 人相 | 顔写真 | ★★★ | MediaPipe | 2 |
| 手相 | 手のひら写真 | ★★★★ | 独自実装 | 5+ |

### 6.2 占術の決定論的/ランダム性の分類

**完全決定論的** (profileから都度計算、保存不要):
- 西洋占星術 (出生情報固定)
- 四柱推命 (生年月日時固定)
- 九星気学 (生年月日固定)
- 数秘術 (生年月日+名前固定)
- 人相 (顔ランドマーク固定)

**ランダム性が本質** (inputs保存必須):
- タロット (引いたカード)
- 易経 (出た卦)

**時間で変動** (date入力含めてseed固定):
- 今日の運勢
- 月運、年運

### 6.3 著作権・ライセンス

| 体系 | 商用利用 | 注意点 |
|---|---|---|
| タロット (Rider-Waite伝統的意味) | OK | デッキアートはAI生成かWikimedia Commons版を |
| 西洋占星術 | OK | 計算ロジックは公知 |
| 四柱推命 | OK | 中国古典体系 |
| 易経 | OK | 古典 |
| 九星気学 | OK | 日本伝統 |
| 数秘術 | OK | 古代起源 |
| 人相学 | OK | 古典体系、ただし差別表現は避ける |
| 「動物占い」名称 | NG | 商標、別名で実装 |
| 「MBTI」名称 | NG | 商標 |
| 「○○式タロット/姓名判断」 | NG | 現代流派名は要注意 |
| 現代占い師の文体模倣 | NG | 著作権リスク |

### 6.4 統合解釈アーキテクチャ

```typescript
// ユーザーの生年月日 + 今日の日付から並列計算
const [tarot, astro, meishi, kyusei, numerology] = await Promise.all([
  drawTarot(seed),                    // ランダム
  calculateAstrology(profile),        // 決定論
  calculateMeishi(profile),           // 決定論
  calculateKyusei(profile, today),    // 日付依存
  calculateNumerology(profile, today) // 日付依存
]);

// LLMで統合解釈
const interpretation = await callLLM({
  system: "複数流派を統合する占い師として、5つの占術結果を矛盾なく統合し...",
  user: { tarot, astro, meishi, kyusei, numerology, query: userQuestion }
});
```

---

## 7. 心理測定コーパス (IPIP)

### 7.1 採用コーパス

すべて**パブリックドメイン**、商用利用OK:

- **IPIP-NEO-300** (Big5の30 facet)
- **IPIP-NEO-120** (短縮版)
- **IPIP-HEXACO-240** (Honesty-Humility含む6次元)
- **IPIP-IPC-32** (対人円環)
- **IPIP-RIASEC** (Holland Code相当、興味/職業)
- **IPIP Six Factor** (Jackson 6因子)
- **IPIP-MPQ** (Tellegen 多次元、Achievement, Stress Reaction等)

合計3,300項目+、463スケール。

### 7.2 商用NGで避けるコーパス

- HEXACO-PI-R 本家 (IPIP-HEXACOで代替)
- NEO-PI-R / NEO-FFI (IPIP-NEOで代替)
- BFI-2, TIPI (IPIP-50/100で代替)
- VIA Character Strengths
- Schwartz Values Survey (PVQ-R等)
- MBTI, 16PF本家
- エニアグラム公式テスト
- CD-RISC

### 7.3 メンタルヘルス系 (Phase 5+検討)

商用OK:
- PHQ-9, GAD-7 (Pfizer PD)
- DASS-21, WHO-5, K6/K10
- Rosenberg Self-Esteem Scale

### 7.4 LLMベース項目生成 (Phase 3-4の差別化機能)

**手順**:
1. IPIP 3,300項目を「種」として
2. Gemma4 MoEで構造維持しつつ新項目を10万〜100万規模で生成
3. ユーザーサンプルで因子負荷を検証
4. IPIP原版と因子構造が一致する項目だけ採用

**意義**:
- 3年以上枯渇しない項目プール
- 日本語ネイティブ生成 (機械翻訳より自然)
- 競合との差別化資産

### 7.4.1 IPIP 統一項目 DB (NEW v1.2)

3,300 IPIP 項目を統一 DB 化し、複数尺度 (Big Five / HEXACO / IPC / RIASEC / MPQ ...) を view として表現する設計。詳細は memory `[[project-ipip-unified-item-db]]` 参照。

```
ipip_items テーブル     (= 3,300 項目の正典)
  └─ item_id / ja_text / en_text / reverse / tags

user_responses テーブル (= 1 user 1 item 1 回答)
  └─ device_id / item_id / value / answered_at / source

scales テーブル         (= 各尺度の view 定義)
  └─ scale_id / items[] / scoring_rule
```

**Why**: 同じ IPIP 項目が複数尺度で重複する。項目主体 DB にして回答を再利用することで:
- 単発受験 (iii): scale の items[] のうち未回答だけ提示
- 毎日蓄積 (i, 朝の儀式): 全項目から未回答をサンプリング
- 占い会話駆動 (ii): 月読が文脈タグから未回答項目を chat に挿入

の 3 mode が同じ DB を共有し、相互補完する。これが §3.1 継続 moat の技術基盤。

**Phase 2** で既存 7 尺度 (Big Five / Industriousness / SCC / Rosenberg / PHQ-9 / K6 / SWLS) を順次 migration。Phase 3 で HEXACO / IPC / RIASEC / MPQ を view 追加で実装。

### 7.5 日本語化方針

初期: 機械翻訳ベース、ただし以下のLLMパイプライン処理を自動実施
- 複数モデル並行翻訳 (Qwen/Claude/Gemini) + アンサンブル
- 逆翻訳ループで意味崩れ検出
- 文化的妥当性チェック (日本人母集団でidentifying/discriminatingな表現)
- 語尾統一、敬体常体統一
- **Reverse-scored項目の事故防止**: 否定文+リッカートは肯定形リフレーミング

将来: ユーザーデータ蓄積後の因子分析で本格バリデーション。

---

## 8. 記憶アーキテクチャ

### 8.1 4階層モデル

```
Layer 0: 永続プロファイル (構造化、別格扱い)
  profiles, ipip_responses, big5_history

Layer 1: 短期記憶 (active context)
  Layer 2の直近N件のビュー or キャッシュ

Layer 2: 長期記憶 (全会話ログ、生データ永続)
  conversations (生ターン全部保存)
  session_summaries (LLMで生成、KVキャッシュ)

Layer 3: エピソード (印象的な出来事の抜粋)
  episodes (LLMで重要度判定して保存)
```

### 8.2 設計思想

**「全ログ保管 + 必要時に動的検索」型**を採用 (抽出型より優位):
- 情報損失なし
- モデル進化に強い (未来モデルが再解釈可能)
- デバッグ可能
- ストレージは安い (10kユーザー × 1年で数十GB)

### 8.3 検索戦略

**Phase 1-2 (シンプル)**: 直近N件 + プロファイル要約のみでプロンプト構成。Vectorize不要。

**Phase 3+ (リッチ化)**: セッションサマリ二段階検索方式を採用
1. 各セッションをLLMで要約 → KVキャッシュ
2. ユーザー新メッセージで「セッションサマリ一覧」をLLMにscan
3. 関連セッションの生ターンだけD1から取得
4. 全部入れて応答生成

これでベクトル検索なしでも意味検索相当の体験を実現。Vectorize は必要に応じて後から追加。

### 8.4 D1スキーマ (主要テーブル)

```sql
profiles (
  user_id, line_id, nickname,
  birthdate, birthtime, birthplace_lat, birthplace_lng,
  big5_o, big5_c, big5_e, big5_a, big5_n,
  hexaco_h, ipc_x, ipc_y,
  persona_summary,  -- LLM生成の自然言語プロファイル要約
  plan, created_at, updated_at
)

ipip_responses (
  user_id, item_id, value, asked_at
)

conversations (
  user_id, session_id, turn_id, role, content,
  encrypted_content,  -- 機微カラムはアプリ層で暗号化
  created_at
)

session_summaries (
  user_id, session_id, title, summary,
  emotion_tag, importance_score, created_at
)

episodes (
  user_id, episode_id, title, summary,
  source_turn_ids,  -- JSON array
  emotion_tag, importance_score,
  occurred_around, created_at
)

divination_results (
  user_id, result_id, type,
  query, inputs JSONB, interpretation TEXT,
  is_premium, created_at, shared_to
)
```

### 8.5 暗号化方針

- Layer: 転送 (TLS) → 保管 (Cloudflare自動) → アプリ層 (Workers Crypto API)
- ユーザー固有キーで機微カラムを暗号化
- 万一D1漏洩してもWorkersキーなしでは読めない

---

## 9. キャラクター (占い師ペルソナ)

### 9.1 設計方針

著作権リスクを下げ、ユーザーに選択肢を与える独自ペルソナを5-10人作成。

### 9.2 ペルソナ案

(Phase 3で初期実装、Phase 5で拡張)

例:
- **月読 (つくよみ)**: 静謐な男性占い師、タロット+西洋占星術派、詩的文体
- **白虎 (びゃっこ)**: 力強い女性占い師、四柱推命派、率直で励まし系
- **椿 (つばき)**: 優しい母性キャラ、九星気学+人相派、伝統的文体
- **千夜 (ちや)**: ミステリアスな若い女性、易経+数秘術派、哲学的
- **賢者 (けんじゃ)**: 老成した男性、全流派統合、論理的

各ペルソナで:
- 得意流派
- 文体 (語尾、漢字率、比喩の好み)
- 性格 (率直/慎重/楽観/慎重)
- 背景設定

LLMのsystem promptにペルソナ設定を注入することで一貫性を担保。Few-shotで文体安定化。

### 9.3 ペルソナとユーザーのマッチング

ユーザーのプロファイルから推奨ペルソナを提示:
- Big5外向性高 → 千夜・白虎
- Conscientiousness高 → 賢者
- Agreeableness高 → 椿
- Openness高 → 月読

これは「Premium機能=占い師を選べる」の課金トリガーにもなる。

---

## 10. UI/UX設計

### 10.1 朝の儀式設計 (Phase 3以降のコア体験)

```
朝7時 LINE通知 (or PWA push):
  "おはようございます。今日のチェックインの時間です"
↓ タップ
  - 昨日の出来事を1行 (任意自由記述)
  - IPIP 3-5問 (1分)
  - ↓ 答え終わると即座に
  - 今日のあなたへの占い (3パラグラフ、プロファイル+昨日の入力反映)
  - 今日のラッキーカラー、行動、避けるべきこと
  - シェアボタン
  - Premium誘導: "今日の星座ランキング", "もっと深く占う"
```

体験名: 「1日1セッション」「1分の朝の儀式」(「1日1問」と表現しない)

### 10.2 配信チャネル戦略

| | PWA | LINE Bot + LIFF |
|---|---|---|
| 主動線 | SEO流入受け皿 | 日次エンゲージメント |
| 通知信頼性 | △ | ◎ |
| 登録摩擦 | 中 | 極小 (QR一発) |
| 課金導線 | Stripe直 | LIFF経由Stripe |

両方併用。SEOで集めてLINE Botに誘導、LINE Botで継続。

### 10.3 主要画面

(Phase別)

Phase 1: トップ、占い入力フォーム、結果表示、結果シェア
Phase 2: + マイページ、占い履歴、LINE連携
Phase 3: + 毎朝のチェックイン、プロファイル可視化、AIチャット
Phase 4: + プラン選択、課金画面、Customer Portal連携
Phase 5: + 人相診断、相性診断、占い師選択、動的画像生成結果

---

## 11. 収益モデル

### 11.1 プラン設計 (Phase 4以降)

```
Free (永続):
  - 1日1セッション (IPIP 3-5問)
  - 簡易占い (5流派の短文統合)
  - AIキャラとチャット 5-10往復/日
  - 簡易プロファイル可視化 (Big5レーダー)
  - 占い履歴閲覧
  - 広告表示 (AdSense + 占いアフィリ)

Standard 月額780-980円 (年額9,800円で2ヶ月分得):
  - 質問無制限
  - 詳細プロファイル (HEXACO, 価値観, RIASEC)
  - AI占い詳細版 (毎朝5パラグラフ)
  - AIチャット 月100ターン
  - 広告非表示

Premium 月額1,980-2,980円 (年額19,800-29,800円):
  - AIチャット無制限
  - 占い師ペルソナ選択
  - 流派切替自由
  - 相性診断無制限 (リンク共有)
  - 月次パーソナリティレポート
  - 動的画像生成 (専用守護キャラ等)
  - 早期アクセス機能
```

### 11.2 コイン制 (Phase 5、Standard/Premiumに加えて)

```
無料配布:
  - 初回登録 5コイン
  - 毎日ログイン 1コイン
  - 友達招待 5コイン

購入:
  500円 → 5コイン
  1,000円 → 12コイン (+2)
  3,000円 → 40コイン (+10)
  5,000円 → 75コイン (+25)

消費例:
  詳細占い = 3コイン
  AIチャット 10ターン = 2コイン
  相性診断 = 5コイン
  月次レポート = 10コイン
```

### 11.3 期待値

| 期間 | MAU | 課金率 | 月収 |
|---|---|---|---|
| 6ヶ月 | 1,000-3,000 | 5% | 5-15万円 |
| 1年 | 10,000 | 5-10% | 50-100万円 |
| 2-3年 | 50,000+ | 5-10% | 200-500万円 |

### 11.4 重要な転換率施策

1. **30日streak で詳細プロファイル開放** (課金前にmoat構築)
2. **AI占いの「続き」を有料化** (深掘り部分)
3. **AIチャットの「3往復まで無料」** (継続会話で課金トリガー)
4. **相性診断のリファラル** (シェアした側も受けた側も流入)
5. **「3ヶ月後の予測」機能** (継続データの価値見せる)

---

## 12. プライバシー・法務

### 12.1 法的フレーム

- **個人情報保護法**: ほぼ全データ該当
- **要配慮個人情報**: 心理測定データは「精神的健康に関する情報」に該当の可能性
- **電気通信事業法 (2023改正)**: Cookie・識別子の外部送信同意取得必須
- **未成年保護**: 親権者同意が必要なケース対応

海外展開は**Phase 5以降に検討** (GDPR対応はコスト重い)。MVPは日本人限定。

### 12.2 設計原則

**データ最小化の徹底**:
- LINEプロフィール全保存 ❌ → user IDとnicknameのみ ✅
- 自由テキスト全保存 ❌ → 必要情報抽出 + N日後削除 or 暗号化 ✅
- 出生地を住所文字列で ❌ → 緯度経度に変換、住所破棄 ✅
- 写真をサーバー送信 ❌ → MediaPipeでブラウザ内処理、座標だけ送信 ✅

**自宅LLMの法的優位**:
- OpenAI/Anthropic APIに送ると国外移転に該当、本人同意必須
- 自宅vLLMなら国内・自分の管理下で完結
- フォールバックAPI使用時も機微データは送らない設計

**ユーザー側の制御権** (最初から実装):
- 自分のデータ閲覧 (開示請求対応)
- データ削除 (退会時にVectorize含め完全削除)
- データエクスポート (JSON出力、ポータビリティ権相当)
- 個別セッション削除 ("このセッションは忘れて")
- 話題カテゴリ除外設定

### 12.3 メンタルヘルスへの配慮 (医師運営の責務)

- 自傷リスクの発言検知時、AIチャットは深掘りせず支援リソースに繋ぐ
- 占い結果から絶望的表現を排除 (タロットの「死神」も「変革」と表現)
- 24時間相談窓口の案内を常時アクセス可能位置に
- これらは法的義務でなく**倫理基準**、ただし差別化要素として強力

### 12.4 利用規約・プライバシーポリシー

MVP前に弁護士or行政書士に1度作成依頼 (5-15万円程度)。
内容:
- データ収集項目の明示
- 利用目的の限定
- 第三者提供しないこと
- 自宅サーバー処理を明示
- データ削除の権利
- AI学習に使わないこと
- メンタルヘルスへの対応方針
- 問い合わせ窓口

### 12.5 真診会・Connectomeとの分離

- **完全に別事業**として運営
- 真診会のPostgreSQLとデータ混在禁止
- ユーザーデータを「医療LLM構築」(memoryの長期ビジョン)に転用するのは法的・倫理的に避ける

---

## 13. ドメイン・SEO戦略

### 13.1 単一ドメイン集約 + 2 入口ハブ (UPDATED v1.2)

**psychtest.jp に全機能集約 + トップは 2 入口ハブ**:

```
/                          → 2 入口ハブ (診断 / 占い 等格提示) [NEW v1.2, Phase 2.4]
/shindan/                  → 心理尺度サイト (現トップを退避) [Phase 2.4]
/shindan/[testType]        → 各心理尺度ページ
/shindan/daily             → 朝の儀式 UI [Phase 2.5]
/uranai/draw               → 3 流派 (tarot + 数秘 + 九星) one-shot [Phase 1.5 完了]
/uranai/chat/tsukuyomi     → 月読 chat [Phase 1.7 完了]
/uranai/chat/[character]   → 他キャラ chat [Phase 3.4]
/uranai/share?id=          → share URL [Phase 1.7 完了]
/uranai/settings           → 設定 [Phase 1.7 完了]
/api/                      → Pages Functions
```

memory `[[project-positioning-dual-entry]]` / `[[project-top-dual-entry-hub]]` 参照。

複数ドメイン相互リンク戦略は2024年以降逆効果。Topic Authorityを単一ドメインで育てる。AdSense は心理尺度ページのみ配置 (AI chat ページ併用はポリシー違反)。

### 13.2 E-E-A-T最大化

- About ページで医師・心理学背景を明示
- 記事に著者プロフィール (schema.org Author)
- 監修記事として運営者情報明示
- 心理学・占いの境界記事 ("Big Fiveと占星術の対応" 等) でTopic Authority強化

### 13.3 既存資産活用

psychtest.jp の既存SEOトラフィックを新機能ページに流す。ドメインオーソリティをゼロから育てるコスト回避。

---

## 14. 競合分析

### 14.1 主要競合

| | 強み | 弱み | Daisukeさんの優位 |
|---|---|---|---|
| Co-Star | 占星術深い、デザイン秀逸 | 占星術のみ | 流派統合、心理学根拠 |
| 16Personalities | 認知度、Big5系 | テスト1回で終わる | 継続蓄積、占いとの統合 |
| Replika | AIキャラチャット先駆 | 占い要素なし、海外運営 | 占い統合、国内信頼 |
| LINE占い | 動線最強 | 占い師人手依存 | AI効率、自由度高 |
| ココナラ占い | 多様な占い師 | 単発、高単価 | 継続型、低単価 |
| 国内中小AI占い | 多数乱立 | 単一流派、薄い実装 | 統合解釈、医師運営 |

### 14.2 ポジショニング上の差別化

「**医師×心理学×AI×複数流派**」の組み合わせはほぼユニーク。模倣困難なエッジ。

---

## 15. リスクと対策

### 15.1 技術リスク

| リスク | 影響 | 対策 |
|---|---|---|
| 自宅vLLMダウン | サービス停止 | フォールバック先は v1.1 時点未確定 (§4.4)。Phase 2 で Workers AI / OpenRouter のいずれかに切替実装 |
| cloudflared tunnel 切断 | 502 を返す | systemd auto-restart + 4 conn QUIC で軽減、ただし `.50` マシン側の障害は別途 |
| vLLM serve モデル変更時の不整合 | 推論失敗 | `LLM_MODEL` secret を `wrangler pages secret put` で更新する手作業手順を必ず実施 |
| 自宅電力瞬断 | データ損失なし、推論停止 | UPS導入、Cloudflare側状態は無影響 |
| Cloudflare障害 | 全停止 | 各社マルチクラウド級の信頼性なので許容 |
| **Pages auto-build の sileｎt 失敗** (v1.1 追加) | コミットが本番反映されない (実例: 3 ヶ月放置) | CI/CD health monitoring。push 後 `wrangler pages deployment list` を見るか、Pages dashboard に通知設定 |
| Google アルゴリズム変更 | SEO流入減 | LINE Bot動線でリテンション、SEO一本足回避 |

### 15.2 法務リスク

| リスク | 影響 | 対策 |
|---|---|---|
| 個人情報漏洩 | 致命的 | アプリ層暗号化、データ最小化 |
| 占い結果による被害クレーム | 訴訟リスク | 利用規約に「娯楽目的」明示、医療・財産助言禁止 |
| 著作権侵害指摘 | サービス停止 | IPIP系のPD体系のみ採用、AI生成画像、商標名回避 |
| メンタルヘルス事案 | 倫理・訴訟両方 | 自傷検知、リソース案内、医師運営の責務として |

### 15.3 ビジネスリスク

| リスク | 影響 | 対策 |
|---|---|---|
| MVP受けない | 時間損失 | Phase 1を2週間で出して早期検証 |
| 大手参入 (LINE占い等) | 競合圧力 | 心理学統合の独自性で差別化、moat構造 |
| 課金転換率低い | 売上立たない | Phase 4前に課金前提のUX検証、Free層体験充実 |
| 規約整備が間に合わない | リリース遅延 | MVP前に弁護士依頼 (Phase 0で着手) |

---

## 16. MVP実装計画 (Phase 1詳細)

### 16.1 スコープ確定

**やる**:
- 生年月日入力 → 5流派統合占い
- 質問テキスト自由入力
- 結果のシェアURL
- AdSense + 占いアフィリ
- Cookie同意バナー
- 利用規約・プライバシーポリシー

**意図的に切る**:
- ユーザー登録、LINE連携
- IPIP質問、性格テスト
- AIチャット
- 課金
- 人相、画像生成
- 暗号化レイヤー
- データ削除機能

### 16.2 実装ステップ (元 v1.0 の Day 1-4 計画 — 部分的に完了)

v1.0 では週末 2 回での Day 1-4 計画を立てたが、wedge 化により実態は以下:

**Day 1 想定** → **wedge で実施済 (2026-05-16)**:
- ✅ Cloudflare Pages + Next.js セットアップ (既存 psychtest-jp repo 流用)
- ✅ タロット78枚データ (`data/tarot-cards.ts`)
- ⏳ 数秘術・九星気学・西洋占星術・四柱推命の計算関数 → Phase 1.5

**Day 2 想定** → **wedge で実施済**:
- ✅ 自宅vLLMをcloudflared公開、Pages Function から接続テスト
- ⏳ 統合占いプロンプト設計 (現在はタロット 3 枚向けのみ) → Phase 1.5 で 5 流派対応
- ✅ LLM呼び出し関数実装 (`functions/uranai/interpret.ts`)
- ✅ 結果ページUI実装 (最小版、Neo-Brutalist デザイン)

**Day 3 想定** → **未着手 (Phase 1.5)**:
- ⏳ デザイン整備 (Tailwind v4 で既存 Neo-Brutalist スタイル流用、shadcn/ui は未導入)
- ⏳ 結果のシェアURL機能
- ⏳ 結果のOGP画像生成 (既存 `functions/og/[test].tsx` パターンを流用)

**Day 4 想定** → **未着手 (Phase 1.5)**:
- ⏳ Cookie同意バナー
- ⏳ AdSense組込
- ⏳ 利用規約・プライバシーポリシー配置
- ⏳ リリース、ドメイン設定 (現在は `/uranai-proto/` で内輪公開、本番は `/uranai/` 配下を予定)

### 16.3 Phase 1 wedge 成功指標 (達成判定: 2026-05-16)

wedge `docs/specs/tarot-llm-wedge-2026-05.md` §Verification で定義:

- ✅ Access 認証通過後「占う」ボタン表示
- ✅ 5〜30 秒以内にレスポンス (実測 0.5-数秒、想定より高速)
- ✅ 3 枚のカード名 + 正逆位置 + 解釈文表示
- ✅ 機械的羅列ではなくストーリーとして繋がる (Gemma 4 26B が想定以上の日本語品質)
- ✅ 再押下で別の引き + 別の解釈 (ユーザー側ブラウザで verified)

**feasibility 確認 OK。Phase 1.5 へ移行可能。**

### 16.4 Phase 1.5 / 公開 MVP 成功指標 (旧 16.3 の流用)

- リリース後1ヶ月:
  - 月間ユニーク訪問者 500-2,000
  - 占い実行数 1,000-5,000
  - シェア率 5-10%
  - 直帰率 50%以下
  - 平均滞在時間 3分以上

これを満たせばPhase 2 (LINE Bot + ユーザー登録) に進む。満たさない場合はコンセプト見直し or UI改善。

---

## 17. 関連リソース

### 17.1 既存プロジェクトとの関係

- **psychtest.jp**: ベースドメイン、既存SEO資産流用
- **Connectome**: 技術スタック流用 (Next.js, neverthrow, LINE Bot SDK, Cloudflare経験)
- **自宅LLM基盤**: vLLM + Gemma4 MoE (memoryに記載)
- **ComfyUI環境**: 画像生成
- **MS法人 (将来)**: 法人化時の事業移管先候補

### 17.2 別軸の不労所得方針 (本書スコープ外)

memoryに記載済みの方針 (このプロジェクトとは別軸):

- **GPU貸出 (Vast.ai/Salad)**: 余剰GPU時間の収益化
- **訪看/介護事業所M&A**: 真診会の戦略的拡張
- **データセンター事業**: 荻窪オフィス起点、MS法人で運営
- **中小企業経営強化税制**: 即時償却で実質コスト半減

これらは並行検討中だが、本占いサイトとは独立して進める。

---

## 18. 開発方針 (CLAUDE.md的指針)

### 18.1 コーディング原則

- **Vertical Slices** (Connectomeの方針一致)
- **CQRS** (Connectomeの方針一致)
- **neverthrow Result-type** (try/catch禁止)
- **direct SDK usage** (ラッパクラス禁止)
- **comments explaining "why" over "how"**
- **LLM-readable code over documentation**
- **specs crystallize only after patterns emerge** (最初は薄く、後から固める)

### 18.2 リポジトリ構成案

```
psychtest-jp/
  apps/
    web/           # Next.js (Cloudflare Pages)
    workers/       # Cloudflare Workers
  packages/
    divination/    # 占術計算ライブラリ
    psychometry/   # IPIP関連
    llm-client/    # vLLM/API呼び出し
    memory/        # 記憶層 (Phase 3+)
  CLAUDE.md
  docs/
    project-design.md  # 本書
```

### 18.3 段階的にCLAUDE.mdを育てる

- 最初は本書とDaisukeさんの方針メモを置く
- Phase 1完了時点でアーキテクチャ図、主要モジュール責務を追加
- Phase 2以降、データモデル、認証フロー、課金フローを追加
- Phase 5までにフル仕様書化

---

## 19. 次のアクション

### 19.1 Week 0 (v1.1 時点で部分完了)

1. ⏳ 弁護士or行政書士に利用規約・プライバシーポリシー作成依頼 (Phase 1.5 公開前までに)
2. ✅ リポジトリ確認 (`psychtest-jp` 既存 repo 流用、monorepo 化は見送り)
3. ✅ CLAUDE.md 整備 (Trait-State-Outcome フレームワーク等で既に充実)
4. ✅ psychtest.jp の現状確認 (apex は Allow Daisuke policy 裏、www は公開中、`[[psychtest-jp-access-gated]]` 参照)

### 19.2 Phase 1 wedge (2026-05-16 完了)

5. ✅ wedge spec 策定 (`docs/specs/tarot-llm-wedge-2026-05.md`)
6. ✅ タロット 3 枚引き + LLM 統合解釈 end-to-end 実装
7. ✅ 自宅 vLLM の Cloudflare Tunnel + Access 公開経路確立
8. ✅ Cloudflare Pages auto-build 故障 (3 ヶ月分) を `wrangler.toml` 修正で解消

### 19.3 Phase 1.5 / 1.7 完了 (2026-05-16)

9. ✅ Phase 1.5: 3 流派 wedge (tarot + 数秘 + 九星) 実装完了
10. ✅ Phase 1.7 / α: 月読 chat + D1 永続 + IPIP context 実装完了
11. ⏳ vLLM フォールバック戦略は Phase 4 公開判断時に再評価

### 19.4 Phase 1.9 → Phase 2 移行 (NEW v1.2)

12. ⏳ Daisuke deep usage week (7 日 / 30 turn / LLM-as-judge ≥ 4/5)
13. ⏳ 生年月日 profile 永続化 (30 分作業)
14. ⏳ ComfyUI で月読 立ち絵 / 背景を本番化
15. ⏳ Phase 2.1 IPIP 統一項目 DB の spec 化 (`/office-hours` 推奨)
16. ⏳ Phase 2.1-2.6 を順次 wedge 化して実装

### 19.5 Phase 4-5 移行は KPI a 達成後に判断 (NEW v1.2)

17. ⏳ Phase 4 (公開準備) / Phase 5 (収益化) は punt 状態。KPI a で moat の体感が確認されてから着手判断 = memory `[[project-public-release-punt]]`

---

## 付録A: 占術別データ仕様

(Phase 1実装時に拡張、本書では概要のみ)

### タロット
- データ: 78枚 × {name, ja_name, keywords, upright_meaning, reversed_meaning, suit, number}
- スプレッド: 1枚引き / 3枚引き / ケルト十字 (Phase 2以降)

### 西洋占星術
- 入力: 出生日時 + 緯度経度
- 計算: 太陽/月/水/金/火/木/土/天/海/冥 の黄経、各ハウス、アスペクト
- ライブラリ: astronomy-engine

### 四柱推命
- 入力: 出生日時 (節入り考慮)
- 計算: 年月日時の干支、五行、通変星
- ライブラリ: lunar-typescript

### 九星気学
- 入力: 生年月日 (立春境)
- 計算: 本命星、月命星、今日/今月/今年の方位
- 実装: テーブル参照

### 数秘術
- 入力: 生年月日 + 氏名
- 計算: ライフパス、ソウル、デスティニー、パーソナルイヤー/マンス/デイ
- 実装: 算数のみ

### 易経
- 入力: 質問 + 乱数 (本卦+変爻)
- データ: 64卦 × {name, judgment, image, 6_lines}

### 人相 (Phase 2+)
- 入力: 自撮り → MediaPipe Face Landmarker 478点
- 計算: 三停五眼の比率、各パーツの相対位置
- ライブラリ: @mediapipe/tasks-vision

---

## 付録B: LLMプロンプト設計指針

### B.1 統合占いプロンプト構造

```
SYSTEM:
あなたは複数流派を統合する熟達した占い師です。
[ペルソナ設定 - Phase 3以降]
[文体ガイドライン]

USER:
ユーザー情報:
- ニックネーム: {nickname}
- 生年月日: {birthdate}
[Phase 3+: プロファイル要約]

今日の占術結果:
- タロット (3枚引き): {cards}
- 西洋占星術: {astro_today}
- 四柱推命の日柱: {meishi_day}
- 九星気学: {kyusei_today}
- 数秘術のパーソナルデイ: {numerology_day}

ユーザーの質問:
{user_question}

これらの占術結果を統合し、5つすべてが共通して示している傾向を見出してください。
特定の流派に偏らず、矛盾は丁寧に解消してください。
ネガティブな表現は変革・成長の機会として再フレーミングしてください。
{文体・トーン指定}
```

### B.2 セッション要約プロンプト (Phase 3)

```
以下の会話から、ユーザーの長期的なプロファイルに加えるべき情報を抽出してください。

カテゴリ: family / work / health / values / relationships / recent_concern / preferences / dislikes

形式: JSON
{
  "facts": [
    {"category": "...", "content": "...", "confidence": 0.0-1.0}
  ],
  "title": "セッションタイトル",
  "summary": "100文字程度の要約",
  "emotion": "neutral / positive / negative / mixed",
  "importance": 0.0-1.0
}

会話:
{conversation}
```

### B.3 リバースプロンプト (品質チェック)

応答生成後、別途軽量モデルでチェック:
- ユーザープロファイルとの一貫性
- 既存fact(妻と娘いる等)との矛盾なし
- ネガティブ表現の混入なし
- 占術結果に忠実か

矛盾検知時は再生成 or 警告ログ。

---

## 付録C: メモリ参照(プロジェクト外の関連事項)

Daisukeさんの周辺コンテキスト (本プロジェクトに影響する範囲):

- **Connectome**: 別本業プロジェクト、技術スタック・経験を流用
- **真診会 (医療法人理事)**: 本プロジェクトとは完全分離
- **MS法人 (構想中)**: Phase 5での法人化時に受け皿候補
- **荻窪オフィス (構想中)**: 自宅サーバー移転先候補、Phase 2-3の頃に検討
- **訪看M&A・GPU貸出・データセンター事業**: 別軸の不労所得方針、本プロジェクトと独立

---

**文書バージョン**: v1.2 (2026年5月16日、ロードマップ見直し)
**変更履歴**:
- v1.0 (2026-05-15): 初版、5 流派一気通貫の Phase 1 MVP 計画
- v1.1 (2026-05-16): Phase 1 を wedge 化、タロット + LLM 統合解釈 end-to-end 完了反映、Phase 1.5 分割、vLLM 経路確定、フォールバック再設計の必要性明記
- v1.2 (2026-05-16): Phase 1.5 (3 流派) + Phase 1.7 (月読 chat α) 完了反映、ロードマップ全面見直し。Dual-entry positioning 確定、IPIP 統一項目 DB 計画追加、Phase 2 を「IPIP 統一 DB + 朝の儀式」に確定、Phase 4-5 (公開 + 収益化) を KPI a 達成後の punt 状態に。詳細は ROADMAP.md v2.0

**次回更新**: Phase 2 完了 (IPIP 統一 DB + 朝の儀式稼働) + KPI a 達成判断時点 → v1.3
