/**
 * Phase 2.x.C: IPIP 公式 page と Tedone Table dump の diff audit tooling.
 *
 * 使い方:
 *   npx tsx scripts/audit-ipip-page.ts <instrument>
 *
 * 例:
 *   npx tsx scripts/audit-ipip-page.ts HEXACO_PI
 *   → HEXACO_PI instrument の Tedone 由来 (scale, item) 一覧を report.
 *     IPIP 公式 page (newHEXACO_PI_key.htm) と比較するため、scale 別 item count を出力.
 *
 * 出力:
 *   - 該当 instrument の Tedone 由来 facet 一覧 (= scale_id × item count + items)
 *   - 既に ipip-scales-supplement.json で補完済の scale_id
 *   - IPIP page URL hint (= 公式 page の推奨 URL)
 *
 * spec: docs/specs/ipip-seed-completeness-2026-05.md / ROADMAP Phase 2.x.C
 */

import * as XLSX from "xlsx";
import { readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "..");

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

interface TedoneRow {
  instrument: string;
  label: string;
  text: string;
  key: number;
  alpha?: number;
}

interface IpipMasterRow {
  id: string;
  text: string;
}

function loadIpipMaster(): Map<string, string> {
  const wb = XLSX.readFile(resolve(ROOT, "data/ipip-master/ipip-3320.xlsx"));
  const rows = XLSX.utils.sheet_to_json<IpipMasterRow>(wb.Sheets[wb.SheetNames[0]], {
    header: ["text", "id"],
    defval: null as unknown as string,
  });
  // text → id map (Hxxx 優先正規化)
  const map = new Map<string, string>();
  const norm = (s: string) =>
    s.replace(/[‘’ʼ]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\.+\s*$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  for (const r of rows) {
    if (!r.id || !r.text) continue;
    const ids = r.id.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    const canonical = ids.find((id) => id.startsWith("H")) ?? ids[0];
    map.set(norm(r.text), canonical);
  }
  return map;
}

function loadTedone(instrument: string): TedoneRow[] {
  const wb = XLSX.readFile(resolve(ROOT, "data/ipip-master/tedone-item-assignment.xlsx"));
  const rows = XLSX.utils.sheet_to_json<TedoneRow>(wb.Sheets[wb.SheetNames[0]]);
  return rows.filter((r) => r.instrument === instrument);
}

function loadSupplement(): Map<string, Set<string>> {
  try {
    const text = readFileSync(resolve(ROOT, "data/ipip-master/ipip-scales-supplement.json"), "utf-8");
    const parsed = JSON.parse(text) as { scales?: Array<{ scale_id: string; items: Array<{ item_id: string }> }> };
    const map = new Map<string, Set<string>>();
    for (const s of parsed.scales ?? []) {
      const set = new Set<string>();
      for (const it of s.items) set.add(it.item_id);
      map.set(s.scale_id, set);
    }
    return map;
  } catch {
    return new Map();
  }
}

function main() {
  const instrument = process.argv[2];
  if (!instrument) {
    console.error("Usage: npx tsx scripts/audit-ipip-page.ts <instrument>");
    console.error("  例: npx tsx scripts/audit-ipip-page.ts HEXACO_PI");
    process.exit(1);
  }

  const ipipMaster = loadIpipMaster();
  const tedoneRows = loadTedone(instrument);
  const supplement = loadSupplement();

  if (tedoneRows.length === 0) {
    console.error(`Tedone Table: no rows found for instrument='${instrument}'`);
    console.error("Available instruments: bigfive と industriousness は NEO instrument 内. その他は Tedone Table 参照.");
    process.exit(1);
  }

  console.log(`=== Tedone Table: instrument='${instrument}' ===`);
  console.log(`Total rows: ${tedoneRows.length}`);

  // label 別に集計
  const byLabel = new Map<string, TedoneRow[]>();
  for (const r of tedoneRows) {
    if (!r.label) continue;
    if (!byLabel.has(r.label)) byLabel.set(r.label, []);
    byLabel.get(r.label)!.push(r);
  }
  console.log(`Unique labels (= facets / scales): ${byLabel.size}\n`);

  const norm = (s: string) =>
    s.replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/\.+\s*$/, "").replace(/\s+/g, " ").trim().toLowerCase();

  // 各 label について scale_id + items を出力
  const sorted = [...byLabel.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [label, items] of sorted) {
    const scaleId = `${slugify(instrument)}_${slugify(label)}`;
    const inSupplement = supplement.has(scaleId);
    console.log(`--- ${scaleId} (label="${label}", ${items.length} items in Tedone, supplement: ${inSupplement ? "YES ✓" : "no"}) ---`);
    for (const r of items) {
      const itemId = ipipMaster.get(norm(r.text)) ?? "??";
      console.log(`  ${itemId}  key=${r.key}  "${r.text}"`);
    }
    console.log();
  }

  // IPIP page URL hint
  const urlHint = `https://ipip.ori.org/new${instrument.replace(/_/g, "_")}Key.htm`;
  console.log(`\nIPIP page URL hint: ${urlHint}`);
  console.log(`(正確な URL は https://ipip.ori.org/newIndexofScaleLabels.htm から確認)`);
}

main();
