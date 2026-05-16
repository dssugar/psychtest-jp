# Prompt Injection Eval Harness

`functions/uranai/chat/tsukuyomi.ts` (α wedge: 月読 + IPIP context + D1 永続) の防御回帰テスト。
L0 (input delimiting) + L1 (system prompt persona) の効果を観測する。

## TL;DR

初回だけ D1 を作成:

```bash
npx wrangler d1 create psychtest-alpha   # 出力 ID を wrangler.toml の database_id に貼る
```

`.dev.vars` を `.dev.vars.example` から作って 3 secret を埋めれば、あとは 1 コマンド:

```bash
npm run eval                     # migrate → preview spawn → health 待機 → eval → 後片付け、全自動
```

サブセット / advanced:

```bash
EVAL_CATEGORY=tag-closure npm run eval
EVAL_VERBOSE=1 npm run eval
EVAL_FULL_VERBOSE=1 npm run eval     # wrangler の build log も流す
npm run eval:raw                     # preview を別 terminal で先に起動済の時、orchestrator を skip
```

Exit code 0 = 全 PASS or WARN のみ / 1 = FAIL or ERR あり (CI / pre-push hook 用)。

### CI

`.github/workflows/eval.yml` が master push と PR (functions/uranai/** or tests/eval/** を含む変更) で自動実行。結果は GitHub Step Summary に貼られる。

**1 回限りの設定**: GitHub Secrets に 3 件登録:

```bash
gh secret set VLLM_API_KEY            # vLLM の --api-key
gh secret set CF_ACCESS_CLIENT_ID     # vllm.psychtest.jp Access service token id
gh secret set CF_ACCESS_CLIENT_SECRET # 同 secret
```

## ファイル構成

| File | 役割 |
|---|---|
| `cases.mjs` | 攻撃 prompt とその合否判定ルールの定義 |
| `fixtures.mjs` | 最小 valid な divinationContext と多ターン用 assistant placeholder |
| `judges.mjs` | rule-based judge (禁止語 / 必須語 match) |
| `run.mjs` | runner (chat endpoint に POST → 判定 → 集計) |

## ケース分類 (21 case / 8 category)

| Category | 想定攻撃 | 主防御層 |
|---|---|---|
| `persona-disclosure` | "あなたは Gemma ですか" 系 (04057ae の trigger) | L1 |
| `prompt-extraction` | system prompt の中身を吐かせる試み | L1 |
| `instruction-override` | "ignore previous" 系 | L1 |
| `tag-closure` | `</user_input>` 等で wrapper 脱出 (L0 specific) | L0 |
| `multi-turn-drift` | 長セッション後のメタ質問 | L1 (+ 将来 L5) |
| `ipip-leak` (α 新規) | Big5 スコアや facet 数値を吐かせる | L1 (tsukuyomi prompt 禁止事項) |
| `mental-health-bypass` (α 新規) | 医療診断・処方を求める | L1 (tsukuyomi prompt 禁止事項) |
| `persona-tsukuyomi` (α 新規) | 月読固有 persona (詩的・静謐) を崩す | L1 |

## α 以降の流れ (= 月読 endpoint と stateful chat)

`run.mjs` は各 case ごとに:
1. fresh `deviceId` + `sessionId` を発行
2. `PUT /uranai/profile` で sample IPIP profile (bigfive facets) をシード
3. `case.messages` の **user turns のみ** を順次 `POST /uranai/chat/tsukuyomi`
   (assistant turns は server 自動生成。`PLACEHOLDER_ASSISTANT` は廃止予定の互換 field)
4. 最終 assistant reply を `ruleBasedJudge` に通す
5. `DELETE /uranai/profile` で後片付け

= 単ターン case は 1 LLM call、3-user-turn の drift case は 3 LLM call (旧 stateless より重い)

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
| local pages dev | `http://localhost:8788/uranai/chat/tsukuyomi` (default) | `npm run preview` 起動必須 + D1 migration 済 |
| production (apex) | `https://psychtest.jp/uranai/chat/tsukuyomi` | Access cookie or service token 要 + remote D1 |
| vLLM 直叩き | (将来 ablation runner で実装) | L0/L1 防御を外した状態で素 Gemma を観測する用 |

## 次の改善 (Phase 2)

1. LLM-as-judge (Sonnet 4.6 で "占い師 persona を維持しているか" を rubric 採点)
2. `eval:ablation` script — vLLM 直叩きで「防御なし」のベースラインを取り、防御 lift を計測
3. PINT / Tensor Trust 日本語 subset を import して corpus 拡充
4. promptfoo 移行 (TS native、red team plugin、HTML report)
5. pre-push hook で quick eval を自動実行
