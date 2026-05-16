# D1 Migrations

`functions/` から触る Cloudflare D1 (`psychtest-alpha`) の schema 履歴。
全 migration は `0001_init.sql` から連番。`wrangler d1 migrations` で apply する。

## 初回 setup (Daisuke 一度だけ)

```bash
# 1. 本番 D1 を作成 (一度だけ。CF account に紐づく)
npx wrangler d1 create psychtest-alpha
# → 出力された database_id を wrangler.toml の REPLACE_AFTER_WRANGLER_D1_CREATE に貼る

# 2. ローカルと本番に migration を流す
npm run db:migrate:local
npm run db:migrate:remote
```

## 日常運用

```bash
# 新 migration を追加した時
# (ファイル名は 0002_xxx.sql のように連番)
npm run db:migrate:local       # local 開発 DB に apply
npm run db:migrate:remote      # production D1 に apply

# 中身を確認したい時
npx wrangler d1 execute psychtest-alpha --local --command "SELECT * FROM profiles"
npx wrangler d1 execute psychtest-alpha --remote --command "SELECT count(*) FROM conversations"

# local DB をまっさらに作り直したい時 (本番には触らない)
npm run db:reset:local
```

## ファイル

| File | 内容 |
|---|---|
| `0001_init.sql` | profiles / conversations / divination_results (α wedge 初期 schema) |
| `0002_birth_date.sql` | profiles に birth_date 列を追加 (Phase 1.9) |
| `0003_ipip_unified.sql` | ipip_items / user_responses / scales (Phase 2.1 IPIP 統一項目 DB) |

## CI への対応

`.github/workflows/eval.yml` は本番 D1 を触らず、`npm run preview` (= 別 worker)
を起動して eval を回す方針。CI runner からの remote D1 migration は **手動 ritual**。

Daisuke が schema 変更を push した後、本人が次回 deploy 前に `npm run db:migrate:remote`
を叩く。

## 注意

- `wrangler d1 migrations apply` は **transactional ではない**。
  schema 変更を 1 migration に詰め込みすぎると途中失敗時に手で巻き戻しが要る。
- production への apply 前に **local で apply** + 動作確認するのが鉄則。
- α wedge は **暗号化なし** (公開時 phase で Workers Crypto API 導入予定)。
  conversations.content / test_results に機微な内容が入るので、production DB の
  dump を Slack 等に貼らない。
