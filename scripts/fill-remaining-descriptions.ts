/**
 * Phase 2.x.G.fill: scale-descriptions.json で template 残りを「やや better template」で埋める.
 * 既存 handcraft (scale-descriptions-handcraft.json) は影響なし.
 * 残 template entry に対して、scale_hierarchy の情報 + inventory overview を組合せた
 * compact handcraft entry を生成し scale-descriptions-handcraft.json に追記.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");
const HANDCRAFT = resolve(ROOT, "data/ipip-master/scale-descriptions-handcraft.json");
const ALL = resolve(ROOT, "data/ipip-master/scale-descriptions.json");

type Entry = { scale_id: string; description_long?: string | null; description_short?: string | null; reference?: string | null; source_url?: string | null; threshold_low?: number | null; threshold_high?: number | null; threshold_kind?: string | null; interpretations?: Array<{ band: string; interpretation_long?: string | null; interpretation_short?: string | null; caveat?: string | null }> };

const handcraft = JSON.parse(readFileSync(HANDCRAFT, "utf-8")) as { scales: Entry[]; _note?: string; _facet_format?: string };
const all = JSON.parse(readFileSync(ALL, "utf-8")) as { scales: Entry[] };

const handcraftIds = new Set(handcraft.scales.map(s => s.scale_id));

// template 判定: description_long が template パターンに一致
function isTemplate(e: Entry): boolean {
  const dl = e.description_long ?? "";
  return /に属する facet。\d+ 項目 5 段階 Likert、α/.test(dl) || /の主要尺度のひとつ。\d+ 項目 5 段階 Likert、α/.test(dl);
}

// scale_id from naming heuristic
function inferInfo(scaleId: string, dl: string): { instrument: string; facetName: string } {
  // 既存 description_long から instrument / facet 抽出
  const facetMatch = dl.match(/\*\*([^*]+)\*\*\s+は\s+\*\*([^*]+)\*\*/);
  const scaleMatch = dl.match(/\*\*([^*]+)\*\*\s+は\s+\*\*([^*]+)\*\*\s+の\s+\*\*([^*]+)\*\*/);
  if (scaleMatch) {
    return { instrument: scaleMatch[2], facetName: scaleMatch[1] };
  }
  if (facetMatch) {
    return { instrument: facetMatch[2], facetName: facetMatch[1] };
  }
  return { instrument: scaleId.split("_")[0].toUpperCase(), facetName: scaleId };
}

const newHandcraft: Entry[] = [];
for (const e of all.scales) {
  if (handcraftIds.has(e.scale_id)) continue;
  if (!isTemplate(e)) continue;
  // template → compact handcraft 化
  const info = inferInfo(e.scale_id, e.description_long ?? "");
  const facetJa = info.facetName;
  const inst = info.instrument;
  const compact: Entry = {
    scale_id: e.scale_id,
    description_long: `**${facetJa}** は ${inst} の facet。${facetJa}に関する個人差を測定。`,
    description_short: `${facetJa}。${inst} facet。`,
    reference: e.reference ?? `IPIP ${inst}.`,
    source_url: e.source_url ?? null,
    threshold_low: e.threshold_low ?? null,
    threshold_high: e.threshold_high ?? null,
    threshold_kind: e.threshold_kind ?? "equal_split",
    interpretations: [
      { band: "low", interpretation_long: `**${facetJa}** が低め。この facet で測定される傾向が控えめ。`, interpretation_short: `${facetJa} 低め`, caveat: null },
      { band: "mid", interpretation_long: `**${facetJa}** は中程度。標準範囲。`, interpretation_short: `${facetJa} 中程度`, caveat: null },
      { band: "high", interpretation_long: `**${facetJa}** が高め。この facet で測定される傾向が顕著。`, interpretation_short: `${facetJa} 高め`, caveat: null },
    ],
  };
  newHandcraft.push(compact);
}

console.log(`adding ${newHandcraft.length} compact handcraft entries`);

handcraft.scales.push(...newHandcraft);
writeFileSync(HANDCRAFT, JSON.stringify(handcraft, null, 2));
console.log(`updated ${HANDCRAFT}`);
