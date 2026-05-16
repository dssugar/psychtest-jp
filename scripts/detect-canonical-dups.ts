/**
 * Phase 2.x.D.3: canonical_label naming と IPIP page naming が同 instrument 内で
 * items overlap している scale_id ペアを検出. tombstone 候補として stdout に列挙.
 *
 * 使い方: npx tsx scripts/detect-canonical-dups.ts > /tmp/dups.txt
 *   (実行前提: npm run db:seed:local 後の local D1 に投入済)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");
const CL_PATH = resolve(ROOT, "data/ipip-master/ipip-canonical-labels.json");

const INSTRUMENT_ALIASES: Record<string, string> = {
  "HEX": "HEXACO_PI", "Big-Five": "BFAS", "Big-7": "BFAS",
  "Cognitive Failures": "BIDR", "Scheier, et al.": "Scheier1994",
  "Mood Intensity/Change": "Chapman1986", "Self-Monitoring": "Snyder1974",
  "Self-Esteem": "Rosenberg1965", "Need for Cognition": "Cacioppo1982",
  "Locus of Control": "Levenson1981", "Public Self-Consciousness": "Buss1980",
  "Private Self-Consciousness": "Buss1980", "Exhibitionism": "Chapman1986",
  "Need for Order and Cleanliness": "Foa1998", "Obsessive-Compulsive Symptoms": "Foa2002",
  "Impulsive Thrill-seeking": "Hoyle2002", "Dangerous Thrill-seeking": "Hoyle2002",
  "Calculated Thrill-seeking": "Hoyle2002", "Physical Attractiveness": "Buss1980",
  "Perfectionism": "Hoyle2002", "Dissociation": "Goldberg1999",
  "CES-D": "Radloff1977", "Barchard": "Barchard2001", "ADHD": "Span2002",
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

const cl = JSON.parse(readFileSync(CL_PATH, "utf-8")) as {
  labels: Array<{ canonical_label: string; implementations: Array<{ instrument: string; facet_code: string }> }>;
};

const aliasIds = new Set<string>();
for (const entry of cl.labels) {
  for (const impl of entry.implementations) {
    const inst = INSTRUMENT_ALIASES[impl.instrument] ?? impl.instrument;
    aliasIds.add(`${slugify(inst)}_${slugify(entry.canonical_label)}`);
  }
}
console.error(`canonical_label alias ids: ${aliasIds.size}`);

// 1 つの SQL で全 instrument の scale-pair overlap を取得
const wlist = [...aliasIds].map(s => `'${s.replace(/'/g, "''")}'`).join(",");
const sql = `
WITH alias_scales AS (
  SELECT scale_id, instrument FROM scale_hierarchy WHERE scale_id IN (${wlist}) AND level >= 2
)
SELECT a.scale_id AS alias_sid, h.scale_id AS other_sid,
       (SELECT COUNT(*) FROM scales s1 INNER JOIN scales s2 USING(item_id)
        WHERE s1.scale_id = a.scale_id AND s2.scale_id = h.scale_id) AS overlap,
       (SELECT COUNT(*) FROM scales WHERE scale_id = a.scale_id) AS alias_items,
       (SELECT COUNT(*) FROM scales WHERE scale_id = h.scale_id) AS other_items
FROM alias_scales a
INNER JOIN scale_hierarchy h ON h.instrument = a.instrument AND h.scale_id != a.scale_id AND h.level >= 2
WHERE h.scale_id NOT IN (${wlist})
ORDER BY a.scale_id, overlap DESC;
`;

writeFileSync("/tmp/detect-dups.sql", sql);
const raw = execSync(`npx wrangler d1 execute psychtest-alpha --local --file=/tmp/detect-dups.sql`, {
  encoding: "utf-8",
  stdio: ["ignore", "pipe", "ignore"],
});

const json = raw.slice(raw.indexOf("[")).trim();
const parsed = JSON.parse(json) as Array<{ results: Array<{ alias_sid: string; other_sid: string; overlap: number; alias_items: number; other_items: number }> }>;
const rows = parsed[0]?.results ?? [];
console.error(`raw rows: ${rows.length}`);

// per-alias の best match
const bestByAlias = new Map<string, { other: string; overlap: number; aliasItems: number; otherItems: number }>();
for (const r of rows) {
  const current = bestByAlias.get(r.alias_sid);
  if (!current || r.overlap > current.overlap) {
    bestByAlias.set(r.alias_sid, { other: r.other_sid, overlap: r.overlap, aliasItems: r.alias_items, otherItems: r.other_items });
  }
}

const dups: string[] = [];
for (const [alias, best] of bestByAlias) {
  if (best.overlap === 0) continue;
  // ほぼ完全一致 (= overlap >= 0.85 * max) かつ |alias - other| <= 2 で dup 認定.
  // これにより main scale vs short / aggregate vs sub-facet を除外.
  const maxSide = Math.max(best.aliasItems, best.otherItems);
  if (
    best.overlap >= 0.85 * maxSide &&
    Math.abs(best.aliasItems - best.otherItems) <= 2
  ) {
    dups.push(`  "${alias}", // = ${best.other} (overlap ${best.overlap}/${best.aliasItems}↔${best.otherItems})`);
  }
}
dups.sort();
console.error(`tombstone candidates: ${dups.length}`);
console.log("// Add to HIERARCHY_TOMBSTONES:");
for (const d of dups) console.log(d);
