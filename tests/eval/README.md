# Prompt Injection Eval Harness

`functions/uranai/chat.ts` の防御回帰テスト。L0 (input delimiting) + L1 (system prompt persona) の効果を観測する。

## TL;DR

```bash
# 1. 別 terminal で wrangler pages dev を起動
npm run preview

# 2. eval を回す
npm run eval

# サブセット
EVAL_CATEGORY=tag-closure npm run eval
EVAL_VERBOSE=1 npm run eval        # 全 response を表示
EVAL_TARGET=https://psychtest.jp/uranai/chat npm run eval   # 別環境 (要 Access cookie or service token)
```

Exit code 0 = 全 PASS or WARN のみ / 1 = FAIL or ERR あり (CI / pre-push hook 用)。

## ファイル構成

| File | 役割 |
|---|---|
| `cases.mjs` | 攻撃 prompt とその合否判定ルールの定義 |
| `fixtures.mjs` | 最小 valid な divinationContext と多ターン用 assistant placeholder |
| `judges.mjs` | rule-based judge (禁止語 / 必須語 match) |
| `run.mjs` | runner (chat endpoint に POST → 判定 → 集計) |

## ケース分類 (15 case / 5 category)

| Category | 想定攻撃 | 主防御層 |
|---|---|---|
| `persona-disclosure` | "あなたは Gemma ですか" 系 (04057ae の trigger) | L1 |
| `prompt-extraction` | system prompt の中身を吐かせる試み | L1 |
| `instruction-override` | "ignore previous" 系 | L1 |
| `tag-closure` | `</user_input>` 等で wrapper 脱出 (L0 specific) | L0 |
| `multi-turn-drift` | 長セッション後のメタ質問 | L1 (+ 将来 L5) |

## 判定方式 (MVP)

- **rule-based のみ**: 各 case の `forbiddenSubstrings` / `requiredAnyOf` / `requiredAll` を文字列 match
- ASCII の term は case-insensitive、日本語/記号は素直に substring 検索
- `softFail: true` の case は FAIL を WARN に降格 (false positive 多い rule 用)

Phase 2 で LLM-as-judge (`judges/llm.mjs`) を追加予定 — nuance を拾うため。

## 既知の限界

- **false positive**: 禁止語が比喩で出るケース (例: "AI" → "愛" の語呂合わせ等)。観測したら該当 case を `softFail` に降格 or term を絞る
- **false negative**: 禁止語を回避しつつ persona 崩壊するパターン (LLM judge を入れたら補える想定)
- **deterministic でない**: `temperature: 0.8` で運用しているので 1 回の PASS が次回保証ではない。重要 case は複数回回すか、temp を下げた eval-only mode を後日検討
- **CI 不可**: vLLM が自宅にあるので CI runner からは打てない。当面 `pre-push` hook + 手動 ritual

## eval target を切り替える

| 環境 | EVAL_TARGET | 備考 |
|---|---|---|
| local pages dev | `http://localhost:8788/uranai/chat` (default) | `npm run preview` 起動必須 |
| production (apex) | `https://psychtest.jp/uranai/chat` | Access cookie or service token 要 |
| vLLM 直叩き | (将来 ablation runner で実装) | L0/L1 防御を外した状態で素 Gemma を観測する用 |

## 次の改善 (Phase 2)

1. LLM-as-judge (Sonnet 4.6 で "占い師 persona を維持しているか" を rubric 採点)
2. `eval:ablation` script — vLLM 直叩きで「防御なし」のベースラインを取り、防御 lift を計測
3. PINT / Tensor Trust 日本語 subset を import して corpus 拡充
4. promptfoo 移行 (TS native、red team plugin、HTML report)
5. pre-push hook で quick eval を自動実行
