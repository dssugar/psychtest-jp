# 専属占い師チャット Wedge (Phase 1.7)

**Status**: Spec
**Date**: 2026-05-16
**Author**: Daisuke
**Source**: 2026-05-16 session office-hours (`docs/specs/divination-3systems-wedge-2026-05.md` の完成後に派生)

## Problem

- **誰**: Daisuke さん本人 (feasibility 確認モード継続).
- **業務上の実需**: project-design.md §3.1「**継続プロファイル積み上げ moat**」§3.2「**複数流派統合解釈 moat**」のうち、§3.2 は Phase 1.5 wedge で 3 流派 one-shot 統合解釈が動いたが、**moat の本体は「ユーザーが占い師と関係を継続する」体験部分**にある (one-shot だと 16personalities や mgram と差別化が薄い)。Phase 1.5 完了時点で「LLM が複数流派を統合する」事実は確認できたが、これだけだと競合 (Yahoo 占い等) が真似可能。**継続対話 (専属占い師)** モードに移ることで初めて moat 命題の核に到達する。
- **観察ベース**: ユーザーは占い結果をもらった後「で、これってどういう意味？」「私の場合は？」と続けたくなる. 1 ターンで完結する占いは "読んで終わり" の消費体験 になる. 専属占い師なら **会話履歴 + 全流派結果が context として常駐** している前提でユーザーと向き合える.
- **memory link**: [[ai-implementation-plan-frozen]] (BYOK 路線の chat 実装は廃案だが、自宅 vLLM 経路では再活性化可能).

## Goal

`/uranai-chat/` で生年月日を入力すると、3 流派 (タロット / 数秘術 / 九星気学) を pre-compute した上で **LLM が「専属占い師」として挨拶 + 初回統合解釈を返し、その後ユーザーと自然な往復チャットができる**.

観察可能な完成判定: `https://psychtest.jp/uranai-chat/` で

1. 生年月日入力 → 「占い師を呼ぶ」ボタン押下で初回 assistant message (占い師の挨拶 + 3 流派の統合解釈) が表示される
2. ユーザーが下のテキスト入力で「最近〇〇で悩んでて」等を送信できる
3. LLM が 3 流派結果 + 全会話履歴を context に持って自然に応答する
4. 5-10 ターン続けても「あなたの本命星は」「ライフパス〇〇から見ると」と context を保持していることが体感できる
5. 同じ会話の中で LLM が必要に応じて他の流派 (易経・タロット再引き等) を **言及**できる (実際の引き直しは future scope、現 wedge では言及のみで OK)

## Non-Goals

- 流派の動的追加引き (tool calling / function calling)
- 会話履歴の永続化 (DB / KV / localStorage)
- ユーザー認証・session 管理 (Cloudflare Access ゲート裏で内輪運用)
- 複数ペルソナ切替 (姉御 / 学者 / 詩人) — Phase 1.8 で別 wedge
- 流派の増加 (太陽星座・姓名判断等) — Phase 1.6 で別 wedge、本 wedge では 3 流派固定
- prompt injection 対策の本格実装 (内輪運用のため最小限の sanitize のみ)
- 課金 / AdSense
- 別ドメイン切り出し ([[project-new-domain-pivot]] は punt 継続)
- モバイル最適化 (PC ブラウザで feasibility 確認できれば OK)
- 会話のシェア URL / OG 画像

## Narrowest Wedge (MVP)

**Scope**: 既存 `/uranai-proto/` を残したまま、`/uranai-chat/` を新規追加. 既存と共存させ side-by-side で one-shot vs chat を比較できるようにする.

**含むもの**:
- `app/uranai-chat/page.tsx`: 生年月日 input + チャット UI (吹き出し列 + textarea + 送信)
- `functions/uranai/chat.ts`: stateless chat completion endpoint (毎リクエストで client が会話履歴 + 流派 context を送る)
- `data/numerology.ts` / `data/kyusei.ts` / `data/tarot-cards.ts`: 既存 wedge と共用
- 既存 `/uranai-proto/` トップに「専属占い師モードを試す」リンク追加
- 初回 assistant message は LLM 自身に生成させる (固定文ではなく、占い結果込みで挨拶 + 統合解釈)

**含まないもの**:
- 流派の動的追加引き (LLM が「タロット引き直しますね」と言っても実際の draw API は呼ばない、文章上で済ます)
- 会話履歴の永続化
- ペルソナ切替

**フロー**:
```
[user input] 生年月日 (YYYY-MM-DD) → 「占い師を呼ぶ」
   ↓
[client] drawThreeCards() + calcNumerology + calcKyusei
   ↓
[POST /uranai/chat] { messages: [], divinationContext: {tarot, numerology, kyusei} }
   ↓
[Pages Function] vLLM ← system prompt (専属占い師指示 + 流派結果 inject) + 空 messages
   ↓
[response] { reply: "ようこそ。本日あなたを担当する占い師の..." }
   ↓
[UI] 初回 assistant 吹き出しを表示

(以降ユーザー入力ごとに)
[user input] "最近仕事のことで悩んでて..."
   ↓
[POST /uranai/chat] { messages: [{role:"assistant", ...初回}, {role:"user", "最近..."}], divinationContext: {...} }
   ↓
[Pages Function] vLLM ← system prompt + 全 messages
   ↓
[response] { reply: "..." }
   ↓
[UI] 新しい assistant 吹き出しを append
```

## Constraints

### 継承 invariant
- Next.js 16 App Router + TypeScript + Tailwind v4
- 静的エクスポート (`out/`) 構成、LLM call は Pages Functions
- vLLM 経路 (env 5 つ) を継続使用 ([[project-tarot-wedge-local-vllm]])
- 既存テスト群の registry / import は触らない

### 技術制約
- 会話履歴は client → server で毎回全送 (stateless). Cloudflare KV 不使用
- Gemma 4 27B の 256K context 内で会話 50 ターン程度は余裕
- 流派 context は `divinationContext` フィールドで明示的に渡し、system prompt 組み立ては Pages Function 側で行う (client から system prompt 改ざんさせない)

### 業務制約
- 「占いは娯楽目的」 disclaimer 継続
- メンタルヘルス系の depthful な相談に対しては LLM 側で「専門家相談」を促す指示を system prompt に入れる

## Open Questions

1. **初回 assistant message の生成方法**: (A) 空 messages で LLM に投げて初回を生成 (B) クライアント側で固定 prompt 入れて初回を促す. 後者の方が deterministic だが前者の方が "占い師らしさ" 出る. 実装中に決める.
2. **会話履歴の長さ制御**: 50 ターン超えた時の挙動. 当面は無制限で context 詰めて動かし、token 限界に当たったらその時考える.
3. **「もう一度カードを引いて」等のユーザー要求**: 現 wedge では LLM が「では新たに引いてみましょう...」と物語上で再引きする (実際の draw API は呼ばない). これが feasibility 上問題なら Phase 1.8 で tool calling 実装.
4. **/uranai-proto/ との UX 共存**: トップ画面でモード選択させるか、両方を直接リンクで並べるか. 後者で start.

## Verification

1. `/uranai-chat/` で生年月日入力 → 「占い師を呼ぶ」 → 5-30 秒以内に初回 assistant 吹き出し表示
2. 初回吹き出しに 3 流派 (タロット / 数秘術 / 九星気学) の結果が反映されている
3. ユーザー入力に対する 2 回目以降の応答が、初回 context (流派結果 + 自己紹介) を保持している
4. 5 ターン続けた時点で context drift を感じない (「あなたの本命星は」が一貫している)
5. Daisuke 主観で「専属感がある」と感じるか (one-shot wedge と比較して)

## Out of Scope (Future)

- **Phase 1.6** (流派充実): 太陽星座 + 月星座 + 姓名判断 + 易経 等を追加し、5 体系完成
- **Phase 1.8** (ペルソナ): system prompt 切替で姉御 / 学者 / 詩人モード
- **Phase 1.9** (蓄積): 会話履歴 KV 保存、別日訪問時に "前回〇〇でしたね" の長期記憶
- **Phase 2.0** (tool calling): LLM が動的に占術を引き直す機能、流派追加に応じた menu 拡張
- **継続プロファイル積み上げ moat 本体** (project-design §3.1): user ID + 心理測定 + 占い履歴の時系列蓄積. 認証 / 別ドメイン切り出しと同時.

## 参照

- 素材:
  - `docs/specs/divination-3systems-wedge-2026-05.md` (Phase 1.5、本 wedge の前提)
  - `docs/project-design.md` v1.1 §3.1 (継続プロファイル moat)、§3.2 (複数流派統合 moat)
- memory:
  - `[[project-tarot-wedge-local-vllm]]`
  - `[[psychtest-jp-access-gated]]`
  - `[[ai-implementation-plan-frozen]]` (BYOK 路線、本 wedge では vLLM 経路で再活性化)
- 既存実装:
  - `functions/uranai/interpret.ts` (Phase 1.5 の one-shot endpoint、本 wedge では chat.ts を新規追加)
  - `data/{numerology,kyusei,tarot-cards}.ts` (流派計算ロジック、本 wedge で再利用)
  - `app/uranai-proto/page.tsx` (one-shot UI、本 wedge で共存)
