# Handoff: Tarot LLM Wedge — 2026-05-16

**Session window**: 2026-05-15 → 2026-05-16
**Outcome**: ✅ Phase 1 wedge (`/uranai-proto/`) end-to-end 完成、本番稼働確認済
**Spec**: `docs/specs/tarot-llm-wedge-2026-05.md`
**Design doc updated**: `docs/project-design.md` v1.0 → v1.1

---

## 1. 完了したこと

### コード (psychtest-jp repo)
| File | 役割 |
|---|---|
| `data/tarot-cards.ts` | Rider-Waite 78 枚 + `drawThreeCards()` |
| `functions/uranai/interpret.ts` | Pages Function。CF Access service token + vLLM api-key の 2 段認証で OpenAI 互換 API を叩く |
| `app/uranai-proto/page.tsx` | `'use client'`、「占う」ボタン + 3 枚カード + 解釈文の最小 UI |
| `.dev.vars.example` | env var テンプレート (5 vars) |
| `.gitignore` | `.dev.vars` 追加 |
| `wrangler.toml` | `[build]` セクション削除 (3 ヶ月分の Pages auto-build 故障を解消) |
| `docs/specs/tarot-llm-wedge-2026-05.md` | wedge spec |
| `docs/project-design.md` | v1.1 更新 |

### コミット
```
e1c0a9b docs: update project-design to v1.1 reflecting tarot wedge completion
46d55f6 feat: add tarot 3-card LLM wedge at /uranai-proto/
fb3b1c7 fix: remove invalid [build] section from wrangler.toml
```
→ 全て push 済 (`master` ブランチ、`https://github.com/dssugar/psychtest-jp.git`)

### インフラ (.50 = dai-gpu-server 側)
- cloudflared 2026.5.0 install + systemd 化 (auto-restart, boot 起動)
- Tunnel `vllm-gpu-server` (UUID `d58aa151-54ae-41fc-aa78-cacc21be6039`)
- Public hostname: `vllm.psychtest.jp` → `http://127.0.0.1:8000` (vLLM)
- 4 QUIC connections to Tokyo POPs (nrt05/15/16/01)
- vLLM 起動構成: Gemma-4-26B-A4B-NVFP4, `--api-key c69322...`, max_model_len 262144

### Cloudflare 側
- Pages secrets 5 つを `wrangler pages secret put` で本番投入:
  - `LLM_BASE_URL`, `LLM_MODEL`, `VLLM_API_KEY`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`
- Access app `vLLM GPU Server` (id `33ce2a1d-37ff-4042-99f4-ee2b7a6a2eb2`)
  - policy: Service Auth、service token id `348fad6e-...`
  - vLLM tunnel への Worker/Function アクセスを保護
- Access app `psychtest-jp - Cloudflare Pages` (id `6df395b9-...`)
  - apex `psychtest.jp` + `psychtest-jp.pages.dev` + `d-s-sugar.workers.dev` を保護
  - policy 構成変更:
    - **追加**: `Allow Daisuke` (precedence 1, allow, email d.s.sugar@gmail.com) — per-app policy
    - **既存**: `Block All Access` (precedence 2, deny, everyone) — reusable policy、detach せず順序入れ替えで対応

### 動作確認
spec §Verification の 5 項目中 1-4 ブラウザで verified (5 は再押下、すぐ確認可能)
- レスポンス時間: 0.5-数秒 (想定 5-30s より高速)
- Gemma 4 26B の日本語品質が想定以上 (ストーリー性 verified、Daisuke 本人「めっちゃ日本語ちゃんとしてる」評価)

---

## 2. 状態 (次セッションでも引き続き有効)

### 認証情報
- **Cloudflare API token** (Pages Edit + Access 管理権限付き) を 2026-05-16 セッション内で発行・利用。token 値は **revoke 済み** のためここには記載しない (push protection 検知歴あり: 旧 commit `81734f7` に inline で書いていた値は GitHub に到達せず、Dashboard から失効処理済)
  - 続きの設定変更が必要なら https://dash.cloudflare.com/profile/api-tokens で新規発行し、`! export CLOUDFLARE_API_TOKEN=...` パターンで session 内に閉じ込めて使う。**handoff / spec / memory に token 値を inline で書かない**
- **Access service token** (CF_ACCESS_CLIENT_ID/SECRET) は Cloudflare に保管済、紛失したら rotation 必要

### ドメインと公開状態
- `psychtest.jp` (apex) — Allow Daisuke policy 裏で内輪公開可能、Daisuke 本人のみ OTP login で通過
- `vllm.psychtest.jp` — Service Auth policy 裏、Pages Function のみアクセス可能
- `www.psychtest.jp` — Access なしで公開中 ([[psychtest-jp-access-gated]] 参照)
- `psychtest-jp.pages.dev` — Allow Daisuke policy 裏 (apex と同じ Access app)

---

## 3. 未着手 / 次セッション候補

### 即着手可能 (Phase 1.5 wedge 候補)
| 優先 | 候補 | 内容 | 推奨判断材料 |
|---|---|---|---|
| A | 4 流派の占術計算実装 | 数秘術・九星気学・西洋占星術・四柱推命 + プロンプト統合 | project-design.md 主軸、占術ロジックの正確性が焦点 |
| B | 自由質問入力 + ペルソナ | 質問テキスト UI + system prompt のペルソナ化 | UX 革新、prompt インジェクション対策が要 |
| C | 知人 invite + UX フィードバック | Allow policy に email 追加するだけ | 技術仕事少、市場検証寄り |

次の office-hours で 1 つに絞るのが筋。

### 技術負債
- **vLLM フォールバック未選定**: tunnel 切断 / .50 落ち時に 502。Phase 2 で Workers AI / OpenRouter / 諦め のいずれかに決める
- **Pages deploy health monitoring 無し**: 過去 3 ヶ月分の silent 失敗が再発する risk。push 後 `wrangler pages deployment list` 確認の習慣化 or Slack 通知
- **モデル変更時の secret 更新**: vLLM の serve モデルを変えたら `LLM_MODEL` を手動更新する必要、自動化されてない
- **`docs/handoff/` 構造の標準化**: 今回が初版、format 整理は次回以降

---

## 4. 開いた問い (deferred decisions)

1. **`[[project-new-domain-pivot]]` の urgency**: psychtest-jp 内で Phase 1 が動いた以上、別ドメイン切り出しの必要性は下がってる。再評価が必要
2. **`[[ai-implementation-plan-frozen]]` の位置づけ**: BYOK 路線設計はもう完全に obsolete。「凍結」→「廃案」に格上げするか、参照だけ残すか
3. **メンタルヘルス配慮の prompt 調整** (spec で Phase 2 と書いた死神 → 変革等): Gemma 4 26B の出力を見ると既に柔らかい表現を選んでる印象あり、優先度下げられる可能性あり
4. **`vllm.psychtest.jp` の WAF / Rate limit**: 今は Access のみ。Service Token が漏れた場合に備えた rate limit を入れるか

---

## 5. 関連 memory (次セッションで自動参照される)

- `[[project-tarot-wedge-local-vllm]]` — wedge の経路と env var 命名規約、verified 状態
- `[[psychtest-jp-access-gated]]` — apex Access policy の現状 (Allow Daisuke + Block All の precedence 構成)
- `[[project-new-domain-pivot]]` — 別ドメイン切り出し方針（urgency 再評価が必要、上記 deferred decision 1）
- `[[ai-implementation-plan-frozen]]` — 1月の BYOK 路線設計（廃案気味）

---

## 6. 推奨：次セッションの開始手順

1. このファイル (`docs/handoff/2026-05-16-tarot-wedge.md`) を最初に読む
2. memory の自動 load (MEMORY.md に index あり) で 4 項目が context に入る
3. `/office-hours` を起動して Phase 1.5 wedge 候補 A/B/C から 1 つに絞る
4. (A 選んだ場合) 占術計算ライブラリ選定 (`astronomy-engine`, `lunar-typescript`) と Phase 1 wedge コード構造の流用判断
5. (B 選んだ場合) 質問入力 UI 設計 + system prompt のペルソナ化方針議論
6. (C 選んだ場合) 招待先 email リストと feedback 収集方法決定
