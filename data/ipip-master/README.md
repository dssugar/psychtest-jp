# IPIP Master Data

IPIP 統一項目 DB (Phase 2.1) の seed 元素材。
spec: `docs/specs/ipip-unified-db-wedge-2026-05.md`

これらは `scripts/seed-ipip.ts` から読まれて D1 (`ipip_items` / `scales`) に投入される。
ファイル自体は git に commit (合計 ~430 KB)。

## ファイル一覧

| File | 行数 | source | license |
|---|---|---|---|
| `ipip-3320.xlsx` | 3,320 | [IPIP 公式](https://ipip.ori.org/) | **Public Domain** — Goldberg, L. R. et al. International Personality Item Pool |
| `tedone-item-assignment.xlsx` | 4,006 (36 instruments) | Tedone Item Assignment Table 30APR21 | Academic release (Goldberg et al.) — 学術利用前提 |
| `ipip-translation-1941.csv` | 1,911 | [ipip-translation](https://github.com/) (Daisuke 自身の LLM 翻訳 + adjudication pipeline) | MIT (Daisuke の生成物) |

## 各ファイルの schema

### `ipip-3320.xlsx`

IPIP の全 3,320 項目。列構成は (header 行 + body):

| 列 | 内容 |
|---|---|
| `id` (Hxxx) | IPIP 公式 ID (例: `H1` ~ `H3320`) |
| `text` (en) | 英語原文 |

→ `ipip_items.item_id` + `ipip_items.en_text` に投入。

### `tedone-item-assignment.xlsx`

各 IPIP 項目がどの心理尺度 (instrument) に属するかの mapping。1 項目が複数の instrument に登場することがあるので 4,006 行ある。

| 列 | 内容 |
|---|---|
| `instrument` | NEO / HEXACO_PI / 16PF / VIA / MPQ / ... など 36 種類 |
| `alpha` | Cronbach's α |
| `key` | +1 (正) or -1 (逆転) |
| `text` (en) | 英語原文 (= ipip-3320.xlsx と一致) |
| `label` | facet 名 |

→ `scales` テーブルに投入。`item_id` は `text` (en) の正規化一致で `ipip_items.item_id` に解決。

### `ipip-translation-1941.csv`

Daisuke が ipip-translation pipeline で生成・adjudicate した日本語訳。1,911 項目 / approved=1 のみ採用。

| 列 | 内容 |
|---|---|
| `id` | ipip-translation 内部 ID (`I0001` 形式) **← IPIP 公式 ID とは異なる** |
| `original` | 英語原文 |
| `translation` | 日本語訳 |
| `approved` | 0/1 (1 のみ採用) |
| `drift_score` | LLM 翻訳ドリフト度 (高いほど忠実) |
| `validation_score` | 検証スコア |

→ `original` の正規化一致で `ipip_items.ja_text` に populate。

## 正規化規則 (en_text マッチング)

3 ファイル間の en_text 一致は以下のルールで判定:

1. 末尾ピリオド `.` の除去
2. 連続 whitespace を単一 space に
3. lowercase
4. trim

不一致 (= 主語省略のような揺れ) があれば seed script の log に warn 出力。

## 注意

- xlsx ファイルは sensitive ではないが、`production-1941/results.csv` は Daisuke の LLM コスト消費の結晶。
- 再生成は `ipip-translation` repo の pipeline 経由。
- 1,409 項目 (= 3,320 - 1,911) は **ja_text=NULL** で投入 (= 「項目は存在するが日本語版未整備」)。
