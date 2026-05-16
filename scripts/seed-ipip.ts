/**
 * IPIP 統一項目 DB seed script (Phase 2.1).
 * spec: docs/specs/ipip-unified-db-wedge-2026-05.md §"seed 生成 script"
 *
 * 入力:
 *   data/ipip-master/ipip-3320.xlsx              — IPIP 公式 3,320 項目 (Hxxx + en_text)
 *   data/ipip-master/tedone-item-assignment.xlsx — 36 instruments × 3,805 assignments
 *   data/ipip-master/ipip-translation-1941.csv   — ja 翻訳 1,911 件
 *   data/bigfive-questions.ts                    — BigFive 120 項目 (Hxxx 突合用)
 *
 * 出力:
 *   scripts/.cache/seed-ipip.sql                 — D1 に流す SQL (INSERT OR REPLACE)
 *   data/ipip-master/bigfive-id-mapping.json     — BigFive 120 ↔ Hxxx mapping (中間生成物)
 *
 * 実行:
 *   npx tsx scripts/seed-ipip.ts                       # SQL ファイル生成のみ
 *   npm run db:seed:local                              # 生成 + local D1 投入
 *   npm run db:seed:remote                             # 生成 + remote D1 投入
 *
 * 冪等性: INSERT OR REPLACE なので再実行で重複エラーにならない。
 */

import * as XLSX from "xlsx";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { bigFiveQuestions } from "../data/bigfive-questions";
import { industriousnessQuestions } from "../data/industriousness-questions";

// ============================================================
// Paths
// ============================================================

const ROOT = resolve(__dirname, "..");
const IPIP_3320_XLSX = resolve(ROOT, "data/ipip-master/ipip-3320.xlsx");
const TEDONE_XLSX = resolve(ROOT, "data/ipip-master/tedone-item-assignment.xlsx");
const TRANSLATION_CSV = resolve(ROOT, "data/ipip-master/ipip-translation-1941.csv");
const CLAUDE_TRANSLATION_JSON = resolve(ROOT, "data/ipip-master/claude-translation-2202.json");
const SCALE_META_JSON = resolve(ROOT, "data/ipip-master/scale-meta.json");
const SQL_OUT = resolve(ROOT, "scripts/.cache/seed-ipip.sql");
const BIGFIVE_MAPPING_OUT = resolve(ROOT, "data/ipip-master/bigfive-id-mapping.json");
const INDUSTRIOUSNESS_MAPPING_OUT = resolve(ROOT, "data/ipip-master/industriousness-id-mapping.json");

// ============================================================
// Utilities
// ============================================================

/**
 * en_text 正規化: 末尾ピリオド除去 / 連続 whitespace → 単一 space / Unicode quote → ASCII / lowercase / trim.
 * 3,320 + 3,805 + 1,911 + 120 の cross-file 突合の基本鍵。
 *
 * Unicode quote 変換は ipip-translation CSV に右シングル ’ (U+2019) が混じるため
 * (例: "people's problems" → IPIP master では ASCII apostrophe).
 */
function normalizeEn(s: string): string {
  return s
    .replace(/[‘’ʼ]/g, "'") // 左右 Unicode 単引用 → ASCII '
    .replace(/[“”]/g, '"') // 左右 Unicode 二重 → ASCII "
    .replace(/\.+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** SQLite literal escape: single quote を double にする。NULL は別扱い。NUL byte は除去。 */
function sqlStr(v: string | null | undefined): string {
  if (v === null || v === undefined) return "NULL";
  // NUL (U+0000) は SQLite TEXT に不正で wrangler 経由でも問題化するため除去.
  return `'${v.replace(/\0/g, "").replace(/'/g, "''")}'`;
}

function sqlNum(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "NULL";
  return String(v);
}

/** Tedone instrument 名を scale_id に正規化 (lowercase + 非英数値を underscore). */
function instrumentToScaleId(instrument: string): string {
  return instrument
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * RFC 4180 風 CSV parser.
 * quote 内の comma / newline を field の一部として扱う。"" は escape の ".
 * ipip-translation CSV の original 列に英文中 comma が混ざるため必須。
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        field = "";
        if (row.length > 0 && (row.length > 1 || row[0].length > 0)) rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0].length > 0) rows.push(row);
  }
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, j) => {
      obj[h] = r[j] ?? "";
    });
    return obj;
  });
}

// ============================================================
// Load sources
// ============================================================

interface IpipMasterRow {
  text: string;
  id: string;
}

interface TedoneRow {
  instrument: string;
  alpha: number;
  key: number;
  text: string;
  label: string;
}

interface TranslationRow {
  id: string;
  original: string;
  translation: string;
  approved: string;
}

function loadIpip3320(): IpipMasterRow[] {
  const wb = XLSX.readFile(IPIP_3320_XLSX);
  const ws = wb.Sheets[wb.SheetNames[0]];
  // ヘッダー無しの shape: 全 3,320 行を 'text' + 'id' で読む.
  const rows = XLSX.utils.sheet_to_json<IpipMasterRow>(ws, {
    header: ["text", "id"],
    defval: null as unknown as string,
  });
  // 67 行 (~2%) で id 列が "H1157, X5" 形式 (= 複数 namespace の同一項目). canonical を 1 つ選ぶ:
  //   優先順位 = "H" 始まり (IPIP 公式の標準 namespace) → 先頭. 残り ID は alias として保持しない (= Phase 2.2 検討).
  for (const r of rows) {
    if (!r.id) continue;
    const ids = r.id.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    if (ids.length === 1) continue;
    const hFirst = ids.find((id) => id.startsWith("H")) ?? ids[0];
    r.id = hFirst;
  }
  return rows;
}

function loadTedone(): TedoneRow[] {
  const wb = XLSX.readFile(TEDONE_XLSX);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<TedoneRow>(ws);
}

function loadTranslations(): TranslationRow[] {
  const text = readFileSync(TRANSLATION_CSV, "utf-8");
  return parseCsv(text) as unknown as TranslationRow[];
}

// ============================================================
// Build SQL
// ============================================================

interface BigFiveMapping {
  generatedAt: string;
  matched: number;
  unmatched: number;
  items: {
    bigfiveId: number;
    facetName: string;
    textEn: string;
    matchedItemId: string | null; // null = 不一致 → BF_xxx legacy source 使用
  }[];
}

function build() {
  const now = Date.now();
  const log: string[] = [];
  const sql: string[] = [];

  log.push("=== IPIP seed build ===");

  // 1. 3,320 items (ipip_3320)
  const ipipRows = loadIpip3320();
  log.push(`ipip-3320.xlsx: ${ipipRows.length} rows`);

  // text 正規化 → id の lookup を構築
  const normEnToId = new Map<string, string>();
  for (const r of ipipRows) {
    if (!r.id || !r.text) continue;
    normEnToId.set(normalizeEn(r.text), r.id);
  }
  log.push(`normEnToId: ${normEnToId.size} unique normalized texts`);

  // 2. 翻訳 CSV → en_text 一致で ja_text 解決
  const translations = loadTranslations();
  const approved = translations.filter((t) => t.approved === "1");
  log.push(`translations (approved=1): ${approved.length} / ${translations.length}`);

  const jaByItemId = new Map<string, string>();
  let jaMatched = 0;
  let jaMissed = 0;
  const jaMissExamples: string[] = [];
  for (const t of approved) {
    const itemId = normEnToId.get(normalizeEn(t.original));
    if (itemId) {
      jaByItemId.set(itemId, t.translation);
      jaMatched++;
    } else {
      jaMissed++;
      if (jaMissExamples.length < 5) jaMissExamples.push(t.original);
    }
  }
  log.push(`ja populate: ${jaMatched} matched, ${jaMissed} missed`);
  if (jaMissExamples.length > 0) {
    log.push(`  miss examples: ${JSON.stringify(jaMissExamples)}`);
  }

  // 3. ipip_items INSERT 生成
  sql.push("-- ipip_items (3,320 IPIP master items + ja_text where available)");
  // (wrangler d1 execute --file は単一 transaction で wrap するので BEGIN/COMMIT は書かない)
  for (const r of ipipRows) {
    if (!r.id || !r.text) continue;
    const ja = jaByItemId.get(r.id) ?? null;
    sql.push(
      `INSERT OR REPLACE INTO ipip_items (item_id, en_text, ja_text, source, created_at) VALUES (${sqlStr(r.id)}, ${sqlStr(r.text)}, ${sqlStr(ja)}, 'ipip_3320', ${now});`,
    );
  }
  // (COMMIT も wrangler 側で実行されるので不要)

  // 4. Tedone → scales INSERT 生成
  const tedone = loadTedone();
  log.push(`tedone-item-assignment.xlsx: ${tedone.length} rows`);

  let scalesAdded = 0;
  let scalesSkipped = 0;
  const skipExamples: string[] = [];
  const seenPk = new Set<string>(); // dedup (scale_id, item_id)
  sql.push("");
  sql.push("-- scales (36 instruments × IPIP items mapping)");
  // (wrangler d1 execute --file は単一 transaction で wrap するので BEGIN/COMMIT は書かない)
  for (const r of tedone) {
    if (!r.instrument || !r.text) continue;
    const itemId = normEnToId.get(normalizeEn(r.text));
    if (!itemId) {
      scalesSkipped++;
      if (skipExamples.length < 5) skipExamples.push(`${r.instrument}: ${r.text}`);
      continue;
    }
    const scaleId = instrumentToScaleId(r.instrument);
    const pk = `${scaleId}::${itemId}`;
    if (seenPk.has(pk)) continue; // 重複は skip (Tedone に同 item 重複 row があるケース)
    seenPk.add(pk);
    sql.push(
      `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES (${sqlStr(scaleId)}, ${sqlStr(r.instrument)}, ${sqlStr(itemId)}, ${sqlNum(Number(r.key) || 1)}, ${sqlStr(r.label ?? null)}, ${sqlNum(typeof r.alpha === "number" ? r.alpha : null)});`,
    );
    scalesAdded++;
  }
  // (COMMIT も wrangler 側で実行されるので不要)
  log.push(`scales: ${scalesAdded} added, ${scalesSkipped} skipped (en_text unresolved)`);
  if (skipExamples.length > 0) {
    log.push(`  skip examples: ${JSON.stringify(skipExamples)}`);
  }

  // 4.5. claude 翻訳 (= ipip-translation で残った 2,202 件) で ja_text NULL を埋める.
  //     初回 seed 時に claude opus 4.7 で BigFive UI 訳スタイルに揃えて生成済.
  //     再生成不要 (= JSON を git commit 済). 新規 item が増えた場合のみ追加翻訳要.
  log.push("");
  log.push("=== claude translation fill ===");
  let claudeApplied = 0;
  let claudeSkipped = 0;
  try {
    const claudeText = readFileSync(CLAUDE_TRANSLATION_JSON, "utf-8");
    const claudeItems = JSON.parse(claudeText) as Array<{ item_id: string; ja_text: string }>;
    sql.push("");
    sql.push("-- claude translation fill (= 残り NULL を claude opus 4.7 翻訳で埋める)");
    for (const it of claudeItems) {
      if (!it.item_id || !it.ja_text) continue;
      // ipip-translation でも bigfive override でもない項目 (= NULL 残) のみ埋める.
      // 既に ja_text が入っていればそちらを優先 (= ipip-translation が prior、bigfive は後で再上書き).
      sql.push(
        `UPDATE ipip_items SET ja_text = ${sqlStr(it.ja_text)} WHERE item_id = ${sqlStr(it.item_id)} AND ja_text IS NULL;`,
      );
      claudeApplied++;
    }
    log.push(`claude translation: ${claudeApplied} UPDATE statements queued`);
  } catch (err) {
    claudeSkipped = 1;
    log.push(`claude translation: skipped (${CLAUDE_TRANSLATION_JSON} not found)`);
  }

  // 5. BigFive 120 ↔ Hxxx mapping + scales(scale_id='bigfive') 生成
  //    + ja_text を BigFive 訳で上書き (= ipip-translation の直訳より bigfive-questions.ts の
  //    意訳/UI 馴染ませ版を一次正とする方針).
  log.push("");
  log.push("=== BigFive 120 ↔ Hxxx mapping ===");
  const mapping: BigFiveMapping = {
    generatedAt: new Date().toISOString(),
    matched: 0,
    unmatched: 0,
    items: [],
  };
  const bigfiveSql: string[] = [];
  bigfiveSql.push("");
  bigfiveSql.push("-- scales (scale_id='bigfive', 120 items from BigFive IPIP-NEO-120)");
  bigfiveSql.push("-- ja_text は bigfive-questions.ts の訳で上書き (= ipip-translation 直訳より優先).");

  let jaOverwritten = 0;
  let jaPopulated = 0; // NULL → bigfive 訳
  for (const q of bigFiveQuestions) {
    const textEn = q.textEn ?? "";
    let itemId: string | null = null;
    if (textEn) {
      itemId = normEnToId.get(normalizeEn(textEn)) ?? null;
    }

    if (itemId) {
      mapping.matched++;
      // scales に bigfive 行を追加 (key は reverse フラグから、label は facetName から)
      const key = q.reverse ? -1 : 1;
      const label = q.facetName ?? null;
      bigfiveSql.push(
        `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES ('bigfive', 'IPIP-NEO-120', ${sqlStr(itemId)}, ${key}, ${sqlStr(label)}, NULL);`,
      );
      // ja_text を bigfive 訳で上書き (UPDATE, en_text / source は触らない)
      const hadJa = jaByItemId.has(itemId);
      bigfiveSql.push(
        `UPDATE ipip_items SET ja_text = ${sqlStr(q.text)} WHERE item_id = ${sqlStr(itemId)};`,
      );
      if (hadJa) jaOverwritten++;
      else jaPopulated++;
    } else {
      mapping.unmatched++;
      // fallback: legacy id BF_NNN を ipip_items に追加 + scales へ
      const legacyId = `BF_${String(q.id).padStart(3, "0")}`;
      bigfiveSql.push(
        `INSERT OR REPLACE INTO ipip_items (item_id, en_text, ja_text, source, created_at) VALUES (${sqlStr(legacyId)}, ${sqlStr(textEn || q.text)}, ${sqlStr(q.text)}, 'legacy_bigfive', ${now});`,
      );
      const key = q.reverse ? -1 : 1;
      const label = q.facetName ?? null;
      bigfiveSql.push(
        `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES ('bigfive', 'IPIP-NEO-120', ${sqlStr(legacyId)}, ${key}, ${sqlStr(label)}, NULL);`,
      );
      itemId = legacyId;
    }

    mapping.items.push({
      bigfiveId: q.id,
      facetName: q.facetName ?? "",
      textEn,
      matchedItemId: itemId,
    });
  }
  log.push(`bigfive matched: ${mapping.matched} / 120, unmatched (legacy fallback): ${mapping.unmatched}`);
  log.push(`bigfive ja_text override: ${jaOverwritten} overwrote ipip-translation, ${jaPopulated} populated NULL`);

  sql.push(...bigfiveSql);

  // 5.5. Industriousness 20 ↔ Hxxx mapping + scales(scale_id='industriousness')
  //      bigfive と同 pattern. 20/20 完全マッチ確認済 (Phase 2.2.1).
  log.push("");
  log.push("=== Industriousness 20 ↔ Hxxx mapping ===");
  const industMapping: BigFiveMapping = {
    generatedAt: new Date().toISOString(),
    matched: 0,
    unmatched: 0,
    items: [],
  };
  const industSql: string[] = [];
  industSql.push("");
  industSql.push("-- scales (scale_id='industriousness', 20 items from IPIP-300 C4+C5)");
  industSql.push("-- ja_text は industriousness-questions.ts の訳で上書き.");
  let industJaOverwritten = 0;
  let industJaPopulated = 0;
  for (const q of industriousnessQuestions) {
    const textEn = q.textEn ?? "";
    let itemId: string | null = null;
    if (textEn) itemId = normEnToId.get(normalizeEn(textEn)) ?? null;

    if (itemId) {
      industMapping.matched++;
      const key = q.reverse ? -1 : 1;
      industSql.push(
        `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES ('industriousness', 'IPIP-300', ${sqlStr(itemId)}, ${key}, ${sqlStr(q.subscale)}, NULL);`,
      );
      const hadJa = jaByItemId.has(itemId);
      industSql.push(
        `UPDATE ipip_items SET ja_text = ${sqlStr(q.text)} WHERE item_id = ${sqlStr(itemId)};`,
      );
      if (hadJa) industJaOverwritten++;
      else industJaPopulated++;
    } else {
      industMapping.unmatched++;
      const legacyId = `IND_${String(q.id).padStart(3, "0")}`;
      industSql.push(
        `INSERT OR REPLACE INTO ipip_items (item_id, en_text, ja_text, source, created_at) VALUES (${sqlStr(legacyId)}, ${sqlStr(textEn || q.text)}, ${sqlStr(q.text)}, 'legacy_industriousness', ${now});`,
      );
      const key = q.reverse ? -1 : 1;
      industSql.push(
        `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES ('industriousness', 'IPIP-300', ${sqlStr(legacyId)}, ${key}, ${sqlStr(q.subscale)}, NULL);`,
      );
      itemId = legacyId;
    }
    industMapping.items.push({
      bigfiveId: q.id,
      facetName: q.subscale,
      textEn,
      matchedItemId: itemId,
    });
  }
  log.push(`industriousness matched: ${industMapping.matched} / 20, unmatched (legacy fallback): ${industMapping.unmatched}`);
  log.push(`industriousness ja_text override: ${industJaOverwritten} overwrote, ${industJaPopulated} populated NULL`);
  sql.push(...industSql);

  // 5.7. scale_meta 投入 (Phase 2.1.β: UI 表示用 metadata、12 scale)
  //      spec: docs/specs/scale-meta-wedge-2026-05.md §"Narrowest Wedge" Step 3
  //      scale-meta.json は Daisuke が手動キュレーション (LLM 生成は使わない方針).
  //      scales table と scale_id を semantic に共有するが FK 制約なし.
  log.push("");
  log.push("=== scale_meta seed (Phase 2.1.β) ===");
  try {
    const metaItems = JSON.parse(readFileSync(SCALE_META_JSON, "utf-8")) as Array<{
      scale_id: string;
      category: "multi-construct" | "single-construct";
      ja_label: string;
      ja_description?: string | null;
      source_url?: string | null;
      reference?: string | null;
      official_total_items?: number | null;
    }>;
    sql.push("");
    sql.push("-- scale_meta (Phase 2.1.β: UI 表示 metadata、12 scale)");
    for (const m of metaItems) {
      sql.push(
        `INSERT OR REPLACE INTO scale_meta (scale_id, category, ja_label, ja_description, source_url, reference, official_total_items, created_at, updated_at) VALUES (${sqlStr(m.scale_id)}, ${sqlStr(m.category)}, ${sqlStr(m.ja_label)}, ${sqlStr(m.ja_description ?? null)}, ${sqlStr(m.source_url ?? null)}, ${sqlStr(m.reference ?? null)}, ${sqlNum(m.official_total_items ?? null)}, ${now}, ${now});`,
      );
    }
    log.push(`scale_meta: ${metaItems.length} rows`);
  } catch (err) {
    log.push(`scale_meta: skipped (${SCALE_META_JSON} not found or invalid)`);
  }

  // 6. SQL ファイル + mapping JSON を出力
  mkdirSync(dirname(SQL_OUT), { recursive: true });
  writeFileSync(SQL_OUT, sql.join("\n") + "\n", "utf-8");
  log.push(`SQL: ${SQL_OUT} (${sql.length} lines)`);

  writeFileSync(BIGFIVE_MAPPING_OUT, JSON.stringify(mapping, null, 2) + "\n", "utf-8");
  log.push(`bigfive mapping: ${BIGFIVE_MAPPING_OUT}`);
  writeFileSync(INDUSTRIOUSNESS_MAPPING_OUT, JSON.stringify(industMapping, null, 2) + "\n", "utf-8");
  log.push(`industriousness mapping: ${INDUSTRIOUSNESS_MAPPING_OUT}`);

  // 7. summary log
  console.log(log.join("\n"));
}

build();
