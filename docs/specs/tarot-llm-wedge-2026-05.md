# Tarot × LLM E2E Wedge (uranai-proto)

**Status**: Spec
**Date**: 2026-05-15
**Author**: Daisuke
**Source**: `docs/project-design.md` v1.0 の Phase 1 MVP を office-hours で wedge 化したもの

## Problem

- **誰**: Daisuke さん本人と知人（内輪リリース）。
  - リリース当日に能動的に開くのは「Daisuke さん自身/知人」と Q1 で確定。Co-Star ユーザーや SEO 流入は Phase 1 では対象外。
- **業務上の実需**: `docs/project-design.md` v1.0 で構想された「占術計算 + LLM 統合 + 結果表示」スタックが、**一連の機能として end-to-end で動かせるか未検証**。
  - Daisuke さん自身が「まず作れるかどうかからだな」と Q2 で表明（feasibility 確認モード）。
  - 市場検証・UX 検証・課金転換率は Phase 1 では問わない。この feasibility が通らないと Phase 2 以降の意思決定（別ドメイン取得、LINE Bot 統合、IPIP 蓄積設計）が空転する。
- **現状の workaround**: project-design.md §16.2 の Day 1-4 スコープ（5流派一気通貫）は wedge として広すぎる。どこか1箇所（占術計算の実装難度 / LLM 統合解釈の品質 / 推論経路 / 結果 UI）で詰まると全体が止まり、何が原因か切り分けにくい。

## Goal

タロット3枚引き → LLM 統合解釈 → 結果表示の単機能フローが、Daisuke さんのブラウザで end-to-end で動く状態。

観察可能な完成判定: `https://psychtest.jp/uranai-proto/`（Cloudflare Access 認証通過後）で「占う」ボタンを押すと、5〜30 秒以内に 3 枚のタロットカード名と、それを統合解釈した日本語文章が表示される。

## Non-Goals

- 5 流派並列計算（タロット以外の4流派 = 数秘術・九星気学・西洋占星術・四柱推命）
- 生年月日入力フォーム
- 質問テキスト自由入力
- ユーザー登録 / LINE 連携 / 認証（Cloudflare Access ゲートに依存）
- 課金 / AdSense / 占いアフィリ
- 利用規約・プライバシーポリシー（Access ゲート裏なので一般公開時に整備）
- 結果のシェア URL / OG 画像生成（公開対象がいない）
- データ永続化（D1 / KV / R2 / localStorage いずれも不要）
- 別ドメイン取得 / 別 repo セットアップ
- 自宅 vLLM への cloudflared 経路の本格構築（Open Questions 参照）
- カード画像表示（テキストのみで feasibility は判断可能）

## Narrowest Wedge (MVP)

**Scope**: タロット3枚引き × LLM 統合解釈 1 画面、現 psychtest-jp repo の `/uranai-proto/` sub-route に同居。

**含むもの**:
- `app/uranai-proto/page.tsx`（「占う」ボタン1つの最小画面）
- `data/tarot-cards.ts`（78 枚 × {id, name, ja_name, upright_meaning, reversed_meaning} の最低限）
- 3 枚引き乱数ロジック（重複なし、正逆位置含む）
- LLM 呼び出し（Pages Functions または Server Action のいずれか）で 3 枚の意味を統合解釈
- 結果表示（3 枚のカード名 + 正逆位置 + 統合解釈文章 200-400 字）

**含まないもの**:
- スプレッド選択 UI（3 枚引き固定）
- 質問テキスト入力欄
- ペルソナ選択
- 結果保存・履歴
- ローディング以上の UI 装飾（最低限の文字情報があれば feasibility は確認できる）

## Constraints

### 既存 invariant（CLAUDE.md / 既存実装から）
- Next.js 16 (App Router) + TypeScript + Tailwind v4 を使い、新規 framework / lib を増やさない
- 静的エクスポート (`out/`) 構成を崩さない → LLM 呼び出しは Pages Functions 必須（Server Action だと static export と相性が悪い）
- 既存テスト群（rosenberg / bigfive / phq9 / k6 / swls / selfconcept / industriousness）の registry や import 経路を触らない
- `data/` 直下と `app/` 直下に新しいサブツリーを足すのは OK、既存ファイル改変は最小

### 技術制約
- LLM 呼び出しは **Pages Functions** (`functions/uranai/interpret.ts` 想定) から行う
- API key は Cloudflare Pages の環境変数で渡す（commit 禁止）
- LLM 経路は **Open Question 1** で確定 → feasibility 確認だけなら摩擦の少ない API（Daisuke さんが既に key を持つ Anthropic API か OpenRouter）を採用

### 業務制約
- 「医療診断ではない」「占いは娯楽目的」の disclaimer は Access ゲート裏でも一応表示しておく（後の公開時に流用可能）
- メンタルヘルス配慮（タロットの「死神」を「変革」表現に）は今は割愛、Phase 2 以降の LLM プロンプト調整時に乗せる

## Open Questions

1. **LLM 経路**: 自宅 vLLM + cloudflared か、Anthropic API / OpenAI / OpenRouter か?
   - 推奨: **feasibility 確認だけなら API 経由**（自宅 vLLM 経路の確立は別 wedge）。
   - project-design.md §4.4 では自宅 vLLM 主体だが、wedge の趣旨（最短で end-to-end を貫通）からは API が摩擦最小。
   - 自宅 vLLM 経路の検証は「Tarot wedge が通った後」の別タスクとして切る。
2. **タロットデータ source**: 自作 JSON（Wikimedia の Rider-Waite テキストを要約）か、既存パブリックドメインデータセットか?
   - 簡易版（1 枚 = 1-2 行のキーワード）なら 1-2 時間で 78 枚整備可能
   - 本格データ（数行の意味文）は数日かかるので wedge では簡易版で十分
3. **プロンプト設計**: ペルソナなし、固定 system prompt 1 個でよいか?
   - 推奨: 最初は 1 個固定。「3 枚のカードをストーリーとして統合解釈してください」レベル。ペルソナは Phase 3 の話。
4. **デプロイ運用**: 既存 psychtest-jp の deploy フロー（git push → Cloudflare Pages 自動 build）に乗せるか、`wrangler pages deploy` を手動か?
   - 既存運用に従う。`/uranai-proto/` を static エクスポートに含めれば自動で出る。
5. **Access 認証**: 現在 apex のみ Access ゲート裏。`/uranai-proto/` も同じゲートに掛かるか確認（おそらく掛かる）。掛からないなら Access ルールを追加。

## Verification

完成判定（すべて満たせば feasibility 確認 OK）:
1. `https://psychtest.jp/uranai-proto/` を開くと、Access 認証ゲートを通過して「占う」ボタンが見える
2. ボタンを押すと 5〜30 秒以内にレスポンスが返る
3. 結果として 3 枚のカード名（日本語）+ 正逆位置 + 統合解釈文章が表示される
4. 解釈文が「1枚目は〜、2枚目は〜、3枚目は〜」と機械的に並べる形ではなく、3 枚を**ストーリーとして繋いでいる**（占いとして読み応えがある）
5. ボタン再押下で別の 3 枚と別の解釈が出る（乱数とプロンプトが回ってる証拠）

これが満たされれば feasibility 確認 OK。**満たせなければ何が詰まったかを記録し、project-design.md の Phase 1 MVP スコープ自体を見直す**（例: LLM 経路が遅すぎる、プロンプト設計が難しい、占術計算が想定以上に複雑、等）。

## Out of Scope (Future)

feasibility が通った後の判断材料として、以下を Future として保留:

1. **4 流派追加 + 生年月日入力** → project-design.md §16.1 の本来 Phase 1 MVP スコープ
2. **自宅 vLLM 経路の確立**（cloudflared、フォールバック設計、neverthrow Result-type）→ 推論コスト構造の検証用 wedge
3. **別ドメイン / 別 repo 切り出し** → memory `[[project-new-domain-pivot]]` 方針に沿った正式版立ち上げ。コードは現 repo から packages 切り出しで再利用検討
4. **シェア URL / OG 画像 / AdSense / 利用規約** → 市場検証フェーズ移行時。Access ゲート解除のタイミング
5. **5流派以外への拡張**（易経・人相・手相）→ project-design.md §6.1 の Phase 2-5

## 参照

- 素材: `docs/project-design.md` v1.0 (2026-05-15)
- memory: `[[project-new-domain-pivot]]` `[[ai-implementation-plan-frozen]]` `[[psychtest-jp-access-gated]]`
- 既存 OG 画像実装（`functions/og/[test].tsx`）が Pages Functions の参考になる
