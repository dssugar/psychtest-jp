# 3 流派統合占術 Wedge (numerology + kyusei + tarot)

**Status**: Spec
**Date**: 2026-05-16
**Author**: Daisuke
**Source**: `docs/handoff/2026-05-16-tarot-wedge.md` §3 候補 A を office-hours で wedge 化したもの。`docs/specs/tarot-llm-wedge-2026-05.md` の続編 (Phase 1.5)。

## Problem

- **誰**: Daisuke さん本人（feasibility 確認モード継続）。Phase 1 wedge (`/uranai-proto/`) が end-to-end で動いたことで、project-design.md §3.2 の **「複数流派統合解釈」moat 命題** に進める下地が整った。
- **業務上の実需**: project-design.md §3.2 で謳う「**5 つの占術が共通して示しているのは...**」という統合解釈は、現状タロット 1 流派しか動いてないので命題未検証。流派統合の差別化が成立するかが Phase 2 以降（別ドメイン切り出し・課金検討・LINE Bot 統合）の意思決定すべての前提になっている。
- **現状の workaround**: `/uranai-proto/` でタロット 3 枚引きの統合解釈は出るが、それは「3 枚を物語として繋ぐ」だけ。**異なる流派間の共通項を言語化させる**プロンプトはまだ書かれていない。Phase 1 では検証範囲外。
- **観察ベース**: Daisuke 本人が「出生時刻なんて知らない」と発言（office-hours 内）。多くのユーザーも同様と推察され、出生時刻が必須な流派（西洋占星術・四柱推命）は scope に入れると別問題（出生時刻不明 fallback 設計）に巻き込まれ wedge が肥大化する。

## Goal

タロット 3 枚引き + 数秘術 + 九星気学 の **3 流派並列計算 + LLM 統合解釈** が `/uranai-proto/` で end-to-end で動き、LLM が「3 流派が共通して示すテーマ」を 1 つの物語として言語化する状態。

観察可能な完成判定: `https://psychtest.jp/uranai-proto/` で生年月日を入力して「占う」を押すと、5〜30 秒以内に (a) タロット 3 枚 + 正逆位置、(b) 数秘術 (ライフパスナンバー + 今日のパーソナルデイ)、(c) 九星気学 (本命星 + 今日の運勢) が全部表示され、最後に LLM が **3 流派の共通項を 1 つの物語に統合した解釈文** (400-600 字程度) を返す。

## Non-Goals

- 西洋占星術・四柱推命・易経 (Phase 1.5 候補 A の 4 流派からは 2 つに削減)
- 出生時刻・出生地入力 (生年月日のみ)
- 出生時刻不明時の fallback 設計（西洋占星術 wedge を切る時に考える）
- 自由質問テキスト入力 (Phase 1.5 候補 B、別 wedge)
- ペルソナ選択 (候補 B、別 wedge)
- 知人 invite (候補 C、これは tech 仕事ほぼゼロなので別軸で並行可能)
- ユーザー登録 / LINE 連携 / 認証 (Cloudflare Access ゲートに依存)
- 課金 / AdSense / 占いアフィリ
- 利用規約・プライバシーポリシー (Access ゲート裏なので公開時に整備)
- 結果のシェア URL / OG 画像 / 履歴保存 (永続化不要、Daisuke + 知人内輪)
- 別ドメイン取得 / 別 repo 切り出し ([[project-new-domain-pivot]] の判断は handoff §4 deferred decision 1 に保留)
- カード画像表示 (Phase 1 wedge と同じくテキストのみで feasibility は判断可能)

## Narrowest Wedge (MVP)

**Scope**: 既存 `/uranai-proto/` を **生年月日入力 + 3 流派並列計算 + 統合解釈** に拡張。現 psychtest-jp repo の同一サブルートで完結。

**含むもの**:
- `app/uranai-proto/page.tsx` を `'use client'` のまま拡張: 生年月日 input + 「占う」ボタン
- `data/numerology.ts`: ライフパスナンバー (生年月日の各桁を還元) + パーソナルデイ (今日の日付との合算) の算術
- `data/kyusei.ts`: 本命星マッピング (生年月日 → 9 星) + 今日の運勢 (日盤の九星 → 本命星との関係)
- 既存 `data/tarot-cards.ts` + `drawThreeCards()` をそのまま再利用
- `functions/uranai/interpret.ts` を拡張: 入力 schema を `{ tarot: [...], numerology: {...}, kyusei: {...} }` に拡張、system prompt を「3 流派の共通項を 1 つの物語に統合」指示に書き換え
- 結果表示は既存タロットカード UI + 数秘術 / 九星気学の DataBadge 風カード + 最後に統合解釈 1 枚

**含まないもの**:
- 出生時刻 / 出生地入力 (上記 Non-Goals)
- スプレッド選択 UI (タロット 3 枚引き固定継続)
- 流派の on/off 切り替え (3 流派固定)
- ローディング以上の UI 装飾

**入力 → 出力フロー**:
```
[user input] 生年月日 (YYYY-MM-DD)
   ↓
[client] drawThreeCards() + calcNumerology(birth) + calcKyusei(birth, today)
   ↓
[POST /uranai/interpret] { tarot, numerology, kyusei }
   ↓
[Pages Function] vLLM (Gemma 4 26B) ← 3 流派の生データ + 共通項抽出指示
   ↓
[response] { interpretation: "..." } 400-600 字
   ↓
[UI] 3 流派の結果カード + 統合解釈文
```

## Constraints

### 既存 invariant (CLAUDE.md / 既存 wedge から継承)
- Next.js 16 (App Router) + TypeScript + Tailwind v4 を使い、新規 framework / lib を増やさない
- 静的エクスポート (`out/`) 構成を崩さない → LLM 呼び出しは Pages Functions 継続 (`functions/uranai/interpret.ts` を拡張)
- 既存テスト群 (rosenberg / bigfive / phq9 / k6 / swls / selfconcept / industriousness) の registry や import 経路を触らない
- vLLM 経路 (`vllm.psychtest.jp` + Cloudflare Access service token + vLLM api-key) を継続使用、env var 命名規約 (`LLM_BASE_URL` / `LLM_MODEL` / `VLLM_API_KEY` / `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET`) を踏襲 ([[project-tarot-wedge-local-vllm]])
- handoff `[[handoff-2026-05-16-tarot-wedge]]` の「token を inline で書かない」方針を継承

### 技術制約
- 数秘術 / 九星気学はライブラリ不要 (生年月日からの算術 / 表引きで済む) → 新規 npm パッケージは追加しない
- 数秘術: マスターナンバー (11/22/33) を還元しない特殊ルールを実装
- 九星気学: 立春で年が変わる扱い、節入りの厳密判定は wedge では割愛 (2 月 4 日固定で近似)
- LLM プロンプトの token 数は Gemma 4 26B の 256K max_model_len に収まる範囲 (3 流派のデータは合計 1000 token 程度、余裕あり)

### 業務制約
- 「医療診断ではない」「占いは娯楽目的」disclaimer は Phase 1 wedge から継続
- メンタルヘルス配慮の prompt 調整 (handoff §4 deferred decision 3) は本 wedge では割愛、Phase 2 で再考
- 数秘術・九星気学はそれぞれ Wikipedia ベースの伝統的解釈で十分 (オリジナル占術定義は不要)

## Open Questions

1. **3 → 5 流派のスケーラビリティ未検証**: 本 wedge で 3 流派統合が動いても、5 流派 (西洋占星術・四柱推命を足す) でプロンプトが破綻しないかは別検証。token 数は余裕あるが、LLM が「共通項を見出す」処理の品質劣化リスクはある。
2. **九星気学の節入り判定**: 2 月 4 日固定で年境界を切ると、立春前後生まれの一部ユーザーで本命星が 1 つズレる。本格運用時には太陽黄経 315° 判定が要るが wedge では割愛。
3. **数秘術のマスターナンバー扱い**: 11/22/33 は「還元しない」が伝統だが、これを LLM に渡すときに「特別扱い」と明示するか、単に数値だけ渡すか。プロンプト設計で決める。
4. **統合解釈の文体**: 「3 流派が共通して〇〇を示している」と機械的に並べない指示 (Phase 1 wedge のタロット指示と同じトーン) を踏襲。具体例は実装中に調整。
5. **生年月日の UI**: 3 つの `<input type="number">` (YYYY/MM/DD) か、`<input type="date">` 1 つか。後者がモバイル UX に優しい、前者は LLM 解釈時にズレない。実装中に決める。
6. **既存タロット wedge の UI を破壊しない**: 生年月日 input が空でも「占う」ボタンで動かすか、必須にするか。3 流派全部出すなら必須、タロット fallback を残すなら任意。実装中に決める。

## Verification

完成判定 (すべて満たせば feasibility 確認 OK):

1. `https://psychtest.jp/uranai-proto/` を開くと、生年月日 input + 「占う」ボタンが見える
2. 任意の生年月日を入れて「占う」を押すと 5〜30 秒以内にレスポンスが返る
3. 結果として以下が全部表示される:
   - タロット 3 枚 (日本語カード名 + 正逆位置)
   - 数秘術: ライフパスナンバー (1-9 or 11/22/33) + 今日のパーソナルデイ (1-9)
   - 九星気学: 本命星 (一白水星〜九紫火星のいずれか) + 今日の運勢キーワード
   - 統合解釈文 400-600 字
4. 統合解釈文が「タロットでは〇〇、数秘術では〇〇、九星気学では〇〇」と機械的に並べる形ではなく、**3 流派の共通項を 1 つの物語として紡いでいる**こと (Daisuke の主観評価: 「ストーリーになってる」と感じるか)
5. ボタン再押下で別のタロット 3 枚と別の解釈が出る (タロット部分の乱数は回る、数秘術/九星気学は生年月日固定なら不変なので明示的に「再シャッフル」が走るのはタロット部分のみ。これが期待動作)
6. 「3 流派の共通項を言語化できているか」を Daisuke が読んで判定 (subjective だが wedge では十分)。判定が **NO なら project-design.md §3.2 の moat 命題を見直し**、 YES なら西洋占星術 / 四柱推命を足す次 wedge へ進む判断材料になる。

## Out of Scope (Future)

本 wedge で feasibility が通った後の判断材料として:

1. **西洋占星術 + 四柱推命 wedge** (project-design.md §3.2 の本来 5 流派構想): 出生時刻不明 fallback 設計 (正午代用 / 月星座非表示等) + Swiss Ephemeris 統合 + 節入り厳密判定 + 通変星計算。技術的に最も重い wedge。
2. **易経 wedge**: 自由質問テキスト入力 UI + 64 卦 × 6 爻 = 384 通りの解釈データ整備。質問入力 UI が必要なので Phase 1.5 候補 B (`自由質問入力 + ペルソナ`) と合流させるのが自然。
3. **ペルソナ選択 wedge** (handoff §3 候補 B): system prompt を複数用意 (姉御肌 / 学者口調 / 詩的 etc) + UI で選択。prompt injection 対策が要。
4. **知人 invite + UX FB 収集 wedge** (handoff §3 候補 C): Access policy に email 追加するだけの 30 分作業 + FB 収集チャネル設計 (Slack / Google Form / 直接 LINE)。tech 仕事ほぼゼロなので本 wedge と並行可能。
5. **継続プロファイル積み上げ moat** (project-design.md §3.1): 占い結果と IPIP 心理測定を user ID で紐付けて時系列で蓄積。これは別ドメイン切り出し or 認証導入と同時。
6. **メンタルヘルス配慮の prompt 調整** (handoff §4 deferred decision 3): 「死神」→「変革」表現等。Gemma 4 26B は既に柔らかい出力を選ぶ印象、優先度は下がる可能性あり。

## 参照

- 素材:
  - `docs/handoff/2026-05-16-tarot-wedge.md` §3 候補 A (本 wedge の元)
  - `docs/specs/tarot-llm-wedge-2026-05.md` (Phase 1 wedge spec、本 wedge は同じ枠組みを拡張)
  - `docs/project-design.md` v1.1 §3.2 (5 流派統合 moat 命題の原典)
- memory:
  - `[[project-tarot-wedge-local-vllm]]` (vLLM 経路、env var 規約、auth 構成)
  - `[[psychtest-jp-access-gated]]` (apex Access policy)
  - `[[project-new-domain-pivot]]` (handoff §4 deferred decision 1、本 wedge では punt)
  - `[[ai-implementation-plan-frozen]]` (handoff §4 deferred decision 2、廃案気味)
- 既存実装:
  - `functions/uranai/interpret.ts` (Phase 1 wedge の Pages Function、本 wedge で拡張)
  - `data/tarot-cards.ts` + `drawThreeCards()` (再利用)
  - `app/uranai-proto/page.tsx` (拡張対象)
