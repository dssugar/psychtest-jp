/**
 * Phase 2.x.C: page-fetch JSON → ipip-scales-supplement.json 変換 script.
 *
 * 使い方:
 *   npx tsx scripts/convert-page-to-supplement.ts scripts/.cache/page-fetch-<INSTRUMENT>.json
 *
 * 動作:
 *   1. page-fetch JSON (= WebFetch で IPIP 公式 page から抽出した item list) を読み込む
 *   2. 各 scale の items を IPIP master / supplement (ipip-3320-supplement.json) と norm match で item_id 解決
 *   3. ipip-scales-supplement.json に新規 entries を append (= 重複 scale_id は skip 警告)
 *   4. 解決失敗 item は WARN log (= 手動 audit 候補)
 *
 * INVARIANT: ipip-scales-supplement.json は IPIP 公式 page の単一 source of truth.
 *            既存 entry を上書きしない (= 同 scale_id 再追加要なら手動削除してから再実行).
 */

import * as XLSX from "xlsx";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "..");

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const norm = (s: string) =>
  s.replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\.+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

interface PageFetchScale {
  label: string;
  alpha?: number;
  plus_keyed: string[];
  minus_keyed: string[];
}

interface PageFetch {
  instrument: string;
  source_url: string;
  scales: PageFetchScale[];
}

interface ScaleSupplementItem { item_id: string; key: number; text?: string }
interface ScaleSupplement {
  scale_id: string;
  label: string;
  instrument: string;
  alpha?: number | null;
  source_url?: string;
  reference?: string;
  note?: string;
  items: ScaleSupplementItem[];
}

function buildNormToIdMap(): Map<string, string> {
  const map = new Map<string, string>();
  // IPIP master 3,320
  const wb = XLSX.readFile(resolve(ROOT, "data/ipip-master/ipip-3320.xlsx"));
  const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]], {
    header: ["text", "id"],
    defval: null,
  });
  // corrections 適用
  try {
    const corr = JSON.parse(readFileSync(resolve(ROOT, "data/ipip-master/ipip-master-corrections.json"), "utf-8"));
    for (const r of rows) {
      if (r.id && corr[r.id]) r.text = corr[r.id];
    }
  } catch {}
  for (const r of rows) {
    if (!r.id || !r.text) continue;
    const ids = r.id.split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const canonical = ids.find((id: string) => id.startsWith("H")) ?? ids[0];
    map.set(norm(r.text), canonical);
  }
  // ipip-3320-supplement.json (EX-NNN 等)
  try {
    const sup = JSON.parse(readFileSync(resolve(ROOT, "data/ipip-master/ipip-3320-supplement.json"), "utf-8"));
    for (const it of sup.items ?? []) {
      if (it.item_id && it.en_text) map.set(norm(it.en_text), it.item_id);
    }
  } catch {}
  return map;
}

/**
 * seed-ipip.ts の lookupItemId と同等の 6 段階突合.
 * normalize 完全一致 → 縮約展開 → that 補完 → am prefix → 末尾補完 → 単複正規化.
 */
function lookupItemId(text: string, normEnToId: Map<string, string>): string | null {
  const n = norm(text);
  if (normEnToId.has(n)) return normEnToId.get(n)!;

  // 縮約展開
  const nc = n
    .replace(/\bcan't\b/g, "cannot")
    .replace(/n't\b/g, " not")
    .replace(/'ve\b/g, " have")
    .replace(/'re\b/g, " are")
    .replace(/'ll\b/g, " will")
    .replace(/'d\b/g, " would")
    .replace(/\s+/g, " ")
    .trim();
  if (nc !== n && normEnToId.has(nc)) return normEnToId.get(nc)!;

  // 動詞 + that 補完
  const m1 = n.match(/^(believe|do|don't think|feel|know|suspect|think|thought|worry) (?!that\b)(.+)$/);
  if (m1 && normEnToId.has(`${m1[1]} that ${m1[2]}`)) return normEnToId.get(`${m1[1]} that ${m1[2]}`)!;

  // 動詞 + 目的語 + that 後置補完
  const m2 = n.match(/^(do|have|thought) ([\w']+) (?!that\b)(.+)$/);
  if (m2 && normEnToId.has(`${m2[1]} ${m2[2]} that ${m2[3]}`)) return normEnToId.get(`${m2[1]} ${m2[2]} that ${m2[3]}`)!;

  // am prefix 補完
  if (!n.startsWith("am ") && normEnToId.has("am " + n)) return normEnToId.get("am " + n)!;

  // 末尾補完
  for (const suffix of [" me", " you", " us"]) {
    if (normEnToId.has(n + suffix)) return normEnToId.get(n + suffix)!;
  }

  // 単複正規化
  if (n.endsWith("s") && normEnToId.has(n.slice(0, -1))) return normEnToId.get(n.slice(0, -1))!;

  // hyphen 揺れ補正 (e.g., "hang gliding" → "hang-gliding")
  const hyphenated = n.replace(/(\w+) (\w+)/g, "$1-$2");
  if (hyphenated !== n && normEnToId.has(hyphenated)) return normEnToId.get(hyphenated)!;

  return null;
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: npx tsx scripts/convert-page-to-supplement.ts <page-fetch.json>");
    process.exit(1);
  }
  const pageFetch = JSON.parse(readFileSync(resolve(inputPath), "utf-8")) as PageFetch;
  const normToId = buildNormToIdMap();

  // 既存 supplement を load
  const supPath = resolve(ROOT, "data/ipip-master/ipip-scales-supplement.json");
  const existing = JSON.parse(readFileSync(supPath, "utf-8")) as { _comment: string; scales: ScaleSupplement[] };
  const existingScaleIds = new Set(existing.scales.map((s) => s.scale_id));

  const newEntries: ScaleSupplement[] = [];
  let totalItems = 0;
  let unresolvedItems = 0;
  const unresolved: Array<{ scale_id: string; text: string }> = [];

  for (const sc of pageFetch.scales) {
    const scaleId = `${slugify(pageFetch.instrument)}_${slugify(sc.label)}`;
    if (existingScaleIds.has(scaleId)) {
      console.log(`  SKIP: ${scaleId} already in supplement`);
      continue;
    }
    const items: ScaleSupplementItem[] = [];
    for (const t of sc.plus_keyed) {
      const id = lookupItemId(t, normToId);
      if (!id) {
        unresolvedItems++;
        unresolved.push({ scale_id: scaleId, text: t });
        continue;
      }
      items.push({ item_id: id, key: 1, text: t });
      totalItems++;
    }
    for (const t of sc.minus_keyed) {
      const id = lookupItemId(t, normToId);
      if (!id) {
        unresolvedItems++;
        unresolved.push({ scale_id: scaleId, text: t });
        continue;
      }
      items.push({ item_id: id, key: -1, text: t });
      totalItems++;
    }
    if (items.length === 0) {
      console.log(`  SKIP: ${scaleId} has no resolvable items`);
      continue;
    }
    newEntries.push({
      scale_id: scaleId,
      label: sc.label,
      instrument: pageFetch.instrument,
      alpha: sc.alpha ?? null,
      source_url: pageFetch.source_url,
      items,
    });
  }

  // append + write
  const merged = { ...existing, scales: [...existing.scales, ...newEntries] };
  writeFileSync(supPath, JSON.stringify(merged, null, 2) + "\n", "utf-8");

  console.log(`\n=== ${pageFetch.instrument} → ipip-scales-supplement.json ===`);
  console.log(`Added scales: ${newEntries.length}`);
  console.log(`Total items: ${totalItems}`);
  console.log(`Unresolved items: ${unresolvedItems}`);
  if (unresolved.length > 0) {
    console.log("\nUnresolved wordings (= 手動 audit 候補):");
    for (const u of unresolved) console.log(`  [${u.scale_id}] ${u.text}`);
  }
}

main();
