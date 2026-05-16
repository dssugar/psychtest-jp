# Handoff: Uranai α Wedge (月読 + IPIP context + D1 永続 chat) — 2026-05-16

**Date**: 2026-05-16
**Author**: Daisuke (実装は Claude Opus)
**Spec**: [docs/specs/uranai-alpha-wedge-2026-05.md](../specs/uranai-alpha-wedge-2026-05.md)
**Plan**: `/home/user/.claude/plans/noble-twirling-fountain.md`
**Status**: 実装完了 (deep usage week 待ち)

---

## 何が変わったか (1 行)

旧 `/uranai-chat` (汎用占い師 + stateless) と `/uranai-proto` (3 流派 one-shot) を引退させ、
**`/uranai/*` 配下に 月読 (つくよみ) persona + 5 テスト IPIP context + device-id 匿名 D1 永続 chat** を構築した。

---

## 変更ファイル一覧

### 削除 (4 file + 2 dir)
- `app/uranai-chat/page.tsx` (+ dir)
- `app/uranai-proto/page.tsx` (+ dir)
- `functions/uranai/chat.ts` → 後継 `functions/uranai/chat/tsukuyomi.ts`
- `functions/uranai/interpret.ts` → 後継 `functions/uranai/draw.ts`

### 新規

| Path | 役割 |
|---|---|
| `wrangler.toml` (modify) | D1 binding 追加 (`[[d1_databases]]`, binding="DB") |
| `migrations/0001_init.sql` | profiles / conversations / divination_results (3 tables) |
| `migrations/README.md` | wrangler d1 migrations 運用手順 |
| `lib/uranai/types.ts` | DivinationContext / ChatRequest / ProfilePayload 等の共有型 |
| `lib/uranai/device-id.ts` | UUID v4 + localStorage + cookie 二重発行・復元 |
| `lib/uranai/profile-summarizer.ts` | 5 テスト Result → 月読向け詩的サマリー (生数値除外) |
| `lib/uranai/tsukuyomi-prompt.ts` | 月読 system prompt builder (persona + IPIP context + L1 防御) |
| `functions/_lib/vllm.ts` | vLLM client helper (auth header + fetch、DRY 化) |
| `functions/_lib/sanitize.ts` | L0 defense helper (DELIMITER_TAGS_RE + wrapUserMessage) |
| `functions/_lib/d1.ts` | D1 helpers (upsertProfile / appendTurn / getRecentTurns / saveDivinationResult) |
| `functions/uranai/chat/tsukuyomi.ts` | 月読 chat endpoint (D1 永続 + IPIP context) |
| `functions/uranai/draw.ts` | 3 流派 one-shot + D1 save (POST + GET) |
| `functions/uranai/profile.ts` | GET/PUT/DELETE profile |
| `functions/uranai/history.ts` | GET 直近 N turn (入室時 context load) |
| `app/uranai/chat/tsukuyomi/page.tsx` | 月読 chat UI (立ち絵 + 背景 + bubble) |
| `app/uranai/draw/page.tsx` | 3 流派 one-shot UI (生年月日 → 引き → 統合解釈 + share URL) |
| `app/uranai/share/page.tsx` | `?id=` から D1 fetch して結果表示 (静的 export 対応で query 形式) |
| `app/uranai/settings/page.tsx` | nickname + PHQ-9/K6 opt-in + 全消去 |
| `public/uranai/themes/tsukuyomi/character.svg` | 立ち絵 PLACEHOLDER (Daisuke が ComfyUI で差し替え) |
| `public/uranai/scenes/night-tower.svg` | 背景 PLACEHOLDER (同上) |
| `docs/handoff/2026-05-16-uranai-alpha-asset-prompts.md` | ComfyUI prompt メモ |
| `docs/handoff/2026-05-16-uranai-alpha-wedge.md` | この file |

### 拡張

| Path | 変更 |
|---|---|
| `tests/eval/cases.mjs` | 月読 + IPIP 用に 3 category / 6 case 追加 (合計 21 case) |
| `tests/eval/fixtures.mjs` | `profileFixture` (bigfive facets 含む) 追加 |
| `tests/eval/run.mjs` | TARGET URL を `/uranai/chat/tsukuyomi` に変更、profile PUT seed + DELETE 後片付け対応 |
| `tests/eval/full.mjs` | orchestrator が `wrangler d1 migrations apply --local` を毎回実行 |
| `tests/eval/README.md` | category 数 / 流れの記述更新 |
| `.github/workflows/eval.yml` | path filter に `functions/_lib/**`, `lib/uranai/**`, `migrations/**`, `wrangler.toml` を追加 |
| `package.json` | `db:migrate:local`, `db:migrate:remote`, `db:reset:local` を `scripts` に追加 |

---

## D1 setup (Daisuke が最初に一度だけ)

```bash
# 1. 本番 D1 を作成 (Cloudflare account に紐づく、一度きり)
npx wrangler d1 create psychtest-alpha
# → 出力された database_id (UUID) を控える

# 2. wrangler.toml の placeholder UUID を実 ID に差し替え
#   現在: database_id = "00000000-0000-0000-0000-000000000000"
#   差し替え後: database_id = "<実 UUID>"

# 3. local と本番に schema 適用
npm run db:migrate:local       # local SQLite (.wrangler/state/v3/d1/)
npm run db:migrate:remote      # production D1
```

これで `npm run preview` / `npm run eval` / production deploy がすべて D1 経由で動くようになる。

---

## ComfyUI asset 生成 (deep usage 開始前に推奨)

立ち絵 + 背景は現状 SVG placeholder。Daisuke が ComfyUI で PNG/WebP を生成して差し替える。

詳細手順: [`docs/handoff/2026-05-16-uranai-alpha-asset-prompts.md`](./2026-05-16-uranai-alpha-asset-prompts.md)

差し替え後、`app/uranai/chat/tsukuyomi/page.tsx` の 2 か所の `src` を更新 (svg → png/webp)。

---

## 動作確認 (deep usage week 開始前 checklist)

```bash
# 1. type check
npm run type-check

# 2. eval (= 22 case PASS or WARN を確認)
npm run eval
# 期待: FAIL 0, ERR 0. WARN は softFail cases のみ.

# 3. preview (local)
npm run preview
# → http://localhost:8788
#    /uranai/draw           → 生年月日 → 3 流派引き → shareable URL
#    /uranai/chat/tsukuyomi → 月読を呼ぶ → chat → タブ閉じて再 open で履歴復元確認
#    /uranai/settings       → nickname 入力 + opt-in toggle + 保存
#    /uranai/share?id=<id>  → D1 から fetch して表示

# 4. D1 inspect
npx wrangler d1 execute psychtest-alpha --local --command "SELECT * FROM profiles"
npx wrangler d1 execute psychtest-alpha --local --command \
  "SELECT device_id, session_id, turn_id, role, substr(content, 1, 60) FROM conversations ORDER BY created_at DESC LIMIT 20"
```

---

## Dev workflow (Next.js 16.2 + Cloudflare Pages Functions + D1)

Next.js HMR と Cloudflare Pages Functions は **同一 server で同時に動かせない** (= wrangler pages dev の `--proxy` は deprecated + HMR WebSocket を通せない既知問題、cloudflare/workers-sdk #691)。
2 つの mode を切り替えて使う:

| 用途 | コマンド | port | 特徴 |
|---|---|---|---|
| UI / layout iteration | `npm run dev` | 4001 | HMR ✓, Functions 404, D1 なし |
| chat / API 統合確認 | `npm run preview` | 8788 | HMR なし, Functions ✓, D1 ✓, 毎回 build (5-10s) |
| eval 回帰 | `npm run eval` | 8788 (内部) | orchestrator が preview spawn |

`npm run dev` は WSL2 で port 3000 が HMR 不安定なため **port 4001** に変更済 (= 16.2 でも改善するが念のため、vercel/next.js #29159 参照).

`out/` は preview 後に手で残る. dev 環境を汚さないよう次の preview 前に `rm -rf out` 推奨 (= preview script に組み込むかは判断保留).

## Deep Usage Week (Daisuke 本人、7 日間)

spec §"Verification" §1 の checklist を踏襲:

- [ ] 毎日 1 セッション以上 chat (= 7 セッション以上)
- [ ] 累計 chat turn 30+ 回
- [ ] 「月読が思い出してる感」が 3 回以上 (= persona consistency の subjective evidence)
- [ ] 「context として既存テスト結果が活きてる感」が複数回 (= context utilization の subjective evidence)
- [ ] 「月読というキャラに相談してる感」が持続する
- [ ] 1 度以上 device-id を意識せず複数 session を跨いで会話継続できた

### 日々の観察ポイント (failure mode)

下記が観測されたら α revise (= persona prompt or summarizer 修正):

- [ ] 月読が「Big5 Openness=85 です」のように数値・検査名を言う
- [ ] IPIP context があるのに会話で全く参照されない (= context が薄い)
- [ ] system prompt が長すぎて persona が薄まる (= 詩的文体が崩れる)
- [ ] 占い結果と心理 context が矛盾する出力
- [ ] PHQ-9/K6 opt-in 後、重い相談時に「いのちの電話 0570-783-556」が出ない (= 倫理制約違反、即修正)

### Telemetry (= 簡易 SQL query)

```sql
-- 自分の sessions 数
SELECT session_id, MIN(created_at), MAX(created_at), COUNT(*) AS turns
  FROM conversations WHERE device_id = '<your-device-id>'
  GROUP BY session_id ORDER BY MIN(created_at) DESC;

-- 累計 turn 数
SELECT COUNT(*) FROM conversations WHERE device_id = '<your-device-id>';

-- 累計 token 数 (おおまかに content 長で見る)
SELECT SUM(length(content)) FROM conversations WHERE device_id = '<your-device-id>';
```

Daisuke ダッシュボードは α では作らない (= SQL query で十分、wedge scope 最小)。

### 7 日目 — 質的振り返り

session log を Sonnet 4.6 LLM-as-judge に渡して採点 (≥ 4/5 で α validate):

**Rubric draft:**

```
あなたは月読 chat の品質審査者です. 以下の chat session log を読み、2 つの軸で 5 段階採点してください.

1. persona consistency (= 月読の詩的・静謐な文体が一貫して維持されているか)
   1 = 全 turn で persona 崩壊 ／ 3 = 半分崩壊 ／ 5 = 全 turn で安定

2. context utilization (= 相談者の IPIP プロファイルが会話に有機的に活きているか)
   1 = profile context が全く参照されない ／ 3 = たまに薄く参照 ／ 5 = 各 turn で自然に統合

Daisuke 自己評価で「月読は私を知ってる」5 段階 ≥ 4 → **α validate**.
```

---

## Open Question への着手時判断 (plan からの引き継ぎ)

| # | 判断 | 観察すること |
|---|---|---|
| 1 | IPIP context = 5 次元段落 + 上位 5 facet 詩的言及 | token 量と persona drift |
| 3 | actual draw button は β に punt | 「物語上仮想引き」で足りるか |
| 6 | lib/tests interpretation 流用せず詩的再翻訳 | summarizer の表現幅が十分か |
| 7 | PHQ-9/K6 opt-in UI は `/uranai/settings` 専用 | 存在に気づかれるか |
| 8 | tarot 3 枚 inline は text-only Card | β で SVG/画像化検討 |
| 10 | 表情差分は α は default 1 枚 | 鼓動が必要な瞬間が出てきたら β |
| 11 | mobile portrait 主体 layout | PC 横画面で破綻しないか |

---

## β/γ 移行時の TODO (この session で意図的に残した item)

code review (3 reviewer agents) で抽出されたが α scope では punt 妥当と判定した item:

### β scope へ punt
- **chat.ts の vLLM 失敗時 user turn rollback** — 現状は user turn save 後に LLM 呼び出し、失敗時は orphan 残る. 再実行 UI と併せて整理.
- **nextTurnId race** — 1 user の高速並行 POST で primary key 衝突しうる. AUTOINCREMENT 化 or `INSERT OR IGNORE + RETURNING` で対処予定.
- **profile sync dedup** — chat ページマウント毎の `PUT /uranai/profile` を hash 比較 / etag で skip 化.
- **session 開始時 assistant-only history** — vLLM strict モードで拒否される可能性 (現実装は alright). 顕在化したら system プロンプト末尾に dummy user turn 注入.
- **POSITION_LABELS / parseBirthDate の DRY 化** — 3 file (draw, share, chat) で重複. `lib/uranai/divination-utils.ts` に抽出するなら 1 PR.
- **ChatMsg vs ChatMessage 型整理** — vllm.ts と types.ts で似て非なる、命名を `ClientChatMessage` / `LlmChatMessage` 等に明確化.
- **clearDeviceIdLocal()** — 現状 dead code. β で device 越え救済時に活用.
- **facetPoeticPhrases satisfies チェック** — `satisfies Record<keyof BigFiveFacets, string>` で全 facet 必須の compile time 検証.

### 公開時 (β/Access 公開判断) へ punt
- **PUT/DELETE /uranai/profile の認証** — 現状 device-id 知ってれば誰でも書き換え/削除可. Access 裏で Daisuke 1 名運用ゆえ α 受容. 公開時は HMAC 署名 or JWT 必須.
- **conversations.content / test_results の暗号化** — Workers Crypto API 導入.
- **wrangler.toml の `compatibility_date`** — 現状 `2024-01-01`. 公開時に最新 (2025-06-01+) に更新.

### 観察次第で対処
- **persona 防御の prompt 配置** — 現在は system prompt 先頭に persona 防御 + メンタル必須義務を移動済 (review fix). eval で WARN/FAIL が増えるなら更に強化.
- **L0 sanitize の全角タグ対応** — `< >` の全角 variant をカバーする `NFKC` 正規化前処理. eval cases.mjs に全角 tag case を追加して観測.

---

## eval baseline (実装直後の想定値)

- Total: 21 cases / 8 categories
- 新 categories: ipip-leak (3), mental-health-bypass (2), persona-tsukuyomi (1)
- 期待結果: FAIL 0, ERR 0. softFail cases (ovr-02, tag-02, ipip-01, ipip-03, tsuk-01) が WARN に降格しうる.

Daisuke が deep usage 開始時に `npm run eval` を一度回して baseline を確定し、`docs/handoff/` または直接 commit message にスナップショット。

---

## 次の wedge への hook

α が validate されたら、次は **β: 日々 checkin で moat 構築**:
- IPIP の日次蓄積 (3-5 問/日)
- 毎朝の儀式 UI (project-design.md §10.1)
- session summary 自動生成 (記憶 Layer 1)
- 占い結果との連動
- `scale_responses` 正規化テーブル
- 親密度システム (game mechanics の moat 化)
- 月読の表情差分本格化 (α で punt した部分)

γ: キャラ複数化 + Big5 マッチング (= 課金 trigger 候補).

---

## 緊急時の roll back

万一 wedge 自体を引き返したくなったら:

```bash
# 1. 旧 endpoint / UI を git 履歴から復元
git log --all --oneline -- functions/uranai/chat.ts functions/uranai/interpret.ts \
  app/uranai-chat/page.tsx app/uranai-proto/page.tsx
git checkout <old-commit> -- <paths>

# 2. 新 endpoint / UI / D1 を削除
rm -rf functions/uranai/tsukuyomi functions/_lib lib/uranai \
       app/uranai migrations
git checkout HEAD -- wrangler.toml tests/eval/ package.json

# 3. (任意) production D1 を削除
npx wrangler d1 delete psychtest-alpha
```

ただし α は **Daisuke 専用 deep usage wedge** で、外部 user 影響なし。
roll back の必要性は極めて低い。
