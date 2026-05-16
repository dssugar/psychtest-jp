/**
 * Phase 2.x.E: ja 翻訳 populate 用に、翻訳が必要な対象を SQL ファイルから抽出して dump.
 *   全 INSERT + UPDATE を順次適用して final state の ja_text=NULL なものだけを抽出.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");
const SQL = resolve(ROOT, "scripts/.cache/seed-ipip.sql");
const OUT_DIR = resolve(ROOT, "scripts/.cache/ja-targets");
mkdirSync(OUT_DIR, { recursive: true });

const sql = readFileSync(SQL, "utf-8");

// 1. scale_hierarchy 抽出 (= 全 INSERT, DELETE は単発のみ)
const hierLines: string[] = [];
const hierRe = /INSERT INTO scale_hierarchy[^V]*VALUES \('([^']*)', ('[^']*'|NULL), (\d+), '([^']*)', ('[^']*'|NULL), ('[^']*'|NULL), [^,]+, '([^']*)'/g;
let m: RegExpExecArray | null;
while ((m = hierRe.exec(sql)) !== null) {
  const [, scaleId, _parentId, level, instrument, scaleName, facetName, displayEn] = m;
  hierLines.push([scaleId, level, instrument, scaleName.replace(/^'|'$/g, ""), facetName.replace(/^'|'$/g, ""), displayEn].join("\t"));
}
writeFileSync(resolve(OUT_DIR, "scale-hierarchy.tsv"), hierLines.join("\n"));
console.log(`scale_hierarchy: ${hierLines.length} entries → scale-hierarchy.tsv`);

// 2. canonical_labels 抽出
const clLines: string[] = [];
const clRe = /INSERT INTO canonical_labels[^V]*VALUES \('([^']*)'/g;
while ((m = clRe.exec(sql)) !== null) {
  clLines.push(m[1]);
}
writeFileSync(resolve(OUT_DIR, "canonical-labels.txt"), clLines.join("\n"));
console.log(`canonical_labels: ${clLines.length} entries → canonical-labels.txt`);

// 3. ipip_items state 構築: INSERT OR REPLACE + UPDATE を順次適用
type ItemState = { en_text: string; ja_text: string | null; source: string };
const items = new Map<string, ItemState>();

// INSERT OR REPLACE INTO ipip_items (item_id, en_text, ja_text, source, created_at) VALUES (...)
const insertRe = /INSERT OR REPLACE INTO ipip_items[^V]*VALUES \('([^']+)', '((?:[^']|'')*)', (NULL|'(?:[^']|'')*'), '([^']*)'/g;
while ((m = insertRe.exec(sql)) !== null) {
  const [, itemId, enText, jaText, source] = m;
  const ja = jaText === "NULL" ? null : jaText.slice(1, -1).replace(/''/g, "'");
  items.set(itemId, { en_text: enText.replace(/''/g, "'"), ja_text: ja, source });
}

// UPDATE ipip_items SET ja_text = '...' WHERE item_id = '...' [AND ja_text IS NULL]
const updateRe = /UPDATE ipip_items SET ja_text = '((?:[^']|'')*)' WHERE item_id = '([^']+)'( AND ja_text IS NULL)?/g;
while ((m = updateRe.exec(sql)) !== null) {
  const [, jaText, itemId, isNullCond] = m;
  const existing = items.get(itemId);
  if (!existing) continue;
  if (isNullCond && existing.ja_text !== null) continue;
  existing.ja_text = jaText.replace(/''/g, "'");
}

// NULL final state の item を抽出
const itemLines: string[] = [];
for (const [itemId, st] of items) {
  if (st.ja_text !== null) continue;
  itemLines.push([itemId, st.source, st.en_text].join("\t"));
}
itemLines.sort();
writeFileSync(resolve(OUT_DIR, "items-null-ja.tsv"), itemLines.join("\n"));
console.log(`ipip_items NULL ja_text (final state): ${itemLines.length} entries → items-null-ja.tsv`);

// source 別 count
const bySource = new Map<string, number>();
for (const [, st] of items) {
  if (st.ja_text !== null) continue;
  bySource.set(st.source, (bySource.get(st.source) ?? 0) + 1);
}
for (const [s, n] of bySource) console.log(`  ${s}: ${n}`);
