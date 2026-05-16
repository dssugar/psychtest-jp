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
import { rosenbergQuestions } from "../data/rosenberg-questions";
import { phq9Questions } from "../data/phq9-questions";
import { questions as k6Questions } from "../data/k6-questions";
import { swlsQuestions } from "../data/swls-questions";

// ============================================================
// Paths
// ============================================================

const ROOT = resolve(__dirname, "..");
const IPIP_3320_XLSX = resolve(ROOT, "data/ipip-master/ipip-3320.xlsx");
const TEDONE_XLSX = resolve(ROOT, "data/ipip-master/tedone-item-assignment.xlsx");
const TRANSLATION_CSV = resolve(ROOT, "data/ipip-master/ipip-translation-1941.csv");
const CLAUDE_TRANSLATION_JSON = resolve(ROOT, "data/ipip-master/claude-translation-2202.json");
const SCALE_META_JSON = resolve(ROOT, "data/ipip-master/scale-meta.json");
const TEDONE_OVERRIDES_JSON = resolve(ROOT, "data/ipip-master/tedone-overrides.json");
const IPIP_MASTER_CORRECTIONS_JSON = resolve(ROOT, "data/ipip-master/ipip-master-corrections.json");
const IPIP_SUPPLEMENT_JSON = resolve(ROOT, "data/ipip-master/ipip-3320-supplement.json");
const IPIP_SCALES_SUPPLEMENT_JSON = resolve(ROOT, "data/ipip-master/ipip-scales-supplement.json");
const IPIP_CANONICAL_LABELS_JSON = resolve(ROOT, "data/ipip-master/ipip-canonical-labels.json");
const SQL_OUT = resolve(ROOT, "scripts/.cache/seed-ipip.sql");
const BIGFIVE_MAPPING_OUT = resolve(ROOT, "data/ipip-master/bigfive-id-mapping.json");
const INDUSTRIOUSNESS_MAPPING_OUT = resolve(ROOT, "data/ipip-master/industriousness-id-mapping.json");
const SKIP_REPORT_OUT = resolve(ROOT, "scripts/.cache/seed-skip-report.json");

/**
 * Phase 2.1.γ: scale 廃止用 tombstone — seed のたびに scale_meta + scales 両 table から DELETE する scale_id 一覧.
 * scale-meta.json 側を編集しただけでは過去に投入された row が残り続けるので明示的 DELETE を投入する (冪等、row 不在 no-op).
 *
 * WHY 両 table: scale_meta のみ消すと UI badge は消えるが scales 側の facet mapping は残る.
 * 「scale を廃止する」という意図と整合させるため scales 側も同時に sweep する.
 *
 * Phase 2.x.B (2026-05-17): orvis / orais を auto-supplement で復活 (= IPIP project 正規拡張).
 * 現在 tombstone 対象なし.
 */
const SCALE_TOMBSTONES: string[] = [];

/**
 * Phase 2.x.B: IPIP master Hxxx 体系外だが Tedone Table に items があり、IPIP project 正規拡張
 * (= IPIP Index に listed) として ipip_items に auto-supplement する instrument 一覧.
 *
 * 各 instrument について:
 *   - Tedone Table の wording から ID `{prefix}-NNN` を自動生成 (= 連番、wording 単位 dedup)
 *   - ipip_items に source='tedone_extension' で投入 (ja_text=NULL、別 wedge で翻訳)
 *   - normEnToId に登録され lookupItemId 経由で scales table に自動投入
 *   - facet auto-view にも自動含まれる
 *
 * source: IPIP newIndexofScaleLabels.htm
 *   - ORAIS = Oregon Avocational Interest Scales (Goldberg, 2010)
 *   - ORVIS = Oregon Vocational Interest Scales (Pozzebon et al., 2010)
 */
const AUTO_SUPPLEMENT_INSTRUMENTS: Array<{ instrument: string; idPrefix: string }> = [
  { instrument: "ORAIS", idPrefix: "ORAIS" },
  { instrument: "ORVIS", idPrefix: "ORVIS" },
];

// ============================================================
// Utilities
// ============================================================

/**
 * en_text 正規化: 末尾ピリオド除去 / 連続 whitespace → 単一 space / Unicode quote → ASCII / lowercase / trim.
 * 3,320 + 3,805 + 1,911 + 120 の cross-file 突合の基本鍵。
 *
 * Unicode quote 変換は ipip-translation CSV に右シングル ’ (U+2019) が混じるため
 * (例: "people's problems" → IPIP master では ASCII apostrophe).
 *
 * INVARIANT: ipip-3320 の 3,320 項目を normalize して unique 数が 3,320 を維持すること.
 * 衝突したら正規化が過剰. seed log の `normEnToId: 3320 unique normalized texts` で確認.
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

  // Phase 2.1.γ: IPIP master typo 訂正 (= Daisuke audit で発見した IPIP 側 typo を patch).
  // raw xlsx は保護 (= 再 download 可能性). corrections は json 別 file で audit trail を残す.
  // spec Open Q2 への回答 = 「IPIP master 側 typo は IPIP master を直して merge する」.
  try {
    const corrText = readFileSync(IPIP_MASTER_CORRECTIONS_JSON, "utf-8");
    const corrections = JSON.parse(corrText) as Record<string, string>;
    let applied = 0;
    const missing: string[] = [];
    for (const [itemId, correctedText] of Object.entries(corrections)) {
      if (itemId.startsWith("_")) continue;
      if (typeof correctedText !== "string") continue;
      const target = rows.find((r) => r.id === itemId);
      if (!target) {
        missing.push(itemId);
        continue;
      }
      target.text = correctedText;
      applied++;
    }
    if (applied > 0) console.log(`ipip-master-corrections: ${applied} typo patched`);
    if (missing.length > 0) console.warn(`  WARN: corrections target IDs not found in master: ${missing.join(", ")}`);
  } catch {
    // 訂正 file 不在は許容 (= 訂正 0 件)
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
  log.push(`normEnToId: ${normEnToId.size} unique normalized texts (ipip-3320)`);

  // Phase 2.1.δ: IPIP supplement (= IPIP project 内だが master 3,320 dump 外の inventory-specific 項目).
  // ipip-3320-supplement.json から読み込み、ipip_items に source='tedone_extension' で投入 +
  // normEnToId に登録して Tedone wording lookup で直接 hit させる.
  // ID namespace = 'EX-NNN' (= External、IPIP master 外).
  interface SupplementItem {
    item_id: string;
    en_text: string;
    ja_text?: string | null;
    source_inventory?: string;
    source_url?: string;
    facet?: string;
    note?: string;
  }
  const supplementInserts: string[] = [];
  let supplementCount = 0;
  let supplementWithJa = 0;
  try {
    const supText = readFileSync(IPIP_SUPPLEMENT_JSON, "utf-8");
    const supParsed = JSON.parse(supText) as { items?: SupplementItem[] };
    for (const it of supParsed.items ?? []) {
      if (!it.item_id || !it.en_text) continue;
      const norm = normalizeEn(it.en_text);
      if (normEnToId.has(norm)) {
        log.push(`  WARN: supplement ${it.item_id} '${it.en_text}' collides with existing ${normEnToId.get(norm)}, skipping`);
        continue;
      }
      normEnToId.set(norm, it.item_id);
      const ja = it.ja_text && typeof it.ja_text === "string" ? it.ja_text : null;
      if (ja) supplementWithJa++;
      supplementInserts.push(
        `INSERT OR REPLACE INTO ipip_items (item_id, en_text, ja_text, source, created_at) VALUES (${sqlStr(it.item_id)}, ${sqlStr(it.en_text)}, ${sqlStr(ja)}, 'tedone_extension', ${now});`,
      );
      supplementCount++;
    }
    log.push(`ipip-3320-supplement: ${supplementCount} items loaded (source='tedone_extension', ${supplementWithJa} with ja_text)`);
  } catch {
    log.push(`ipip-3320-supplement: not found (= 拡張なし)`);
  }

  // Phase 2.1.γ: 手動 override mapping (Tedone 異形 wording → IPIP item_id).
  // 空 file でも parse できるよう {} を許容. LLM 生成は使わず Daisuke 手動 audit のみ.
  // value は IPIP item_id format ([A-Z][\w-]*, 例: H184 / X1234 / EX-001) で validate して
  // placeholder ("Hxxxx" 等) や typo を silent corrupt させない.
  const tedoneOverrides: Record<string, string> = {};
  const ITEM_ID_RE = /^[A-Z]+(?:-?\d+)$/;
  try {
    const overrideText = readFileSync(TEDONE_OVERRIDES_JSON, "utf-8");
    const parsed = JSON.parse(overrideText) as Record<string, unknown>;
    for (const [wording, itemId] of Object.entries(parsed)) {
      if (wording.startsWith("_")) continue; // _comment 等の meta key は skip
      if (typeof itemId !== "string" || !ITEM_ID_RE.test(itemId)) {
        log.push(`  WARN: tedone-overrides.json["${wording}"] = ${JSON.stringify(itemId)} is not a valid item_id, skipping`);
        continue;
      }
      tedoneOverrides[normalizeEn(wording)] = itemId;
    }
    log.push(`tedone-overrides.json: ${Object.keys(tedoneOverrides).length} manual mappings`);
  } catch {
    log.push(`tedone-overrides.json: not found (= Phase 2 で追記)`);
  }

  /**
   * Tedone wording → IPIP master item_id 解決.
   * 順序: ① override → ② normalize 完全一致 → ③ 縮約展開 → ④ "that" 補完
   *      → ⑤ "am " prefix 補完 → ⑥ " me/you/us" 末尾補完 → ⑦ 末尾 s 削除 (単複正規化)
   * 副作用 risk が低い変形から順に試す.
   *
   * WHY NOT or↔and / 's↔is: 意味反転 ("right or wrong" ≠ "right and wrong") / 所有格誤射の risk があるため
   * 一律変換しない. semantically-different wording は tedone-overrides.json で 1 件ずつ手動 audit.
   */
  function lookupItemId(text: string): string | null {
    const norm = normalizeEn(text);
    if (tedoneOverrides[norm]) return tedoneOverrides[norm];
    if (normEnToId.has(norm)) return normEnToId.get(norm)!;

    // ③ 縮約展開 (can't → cannot, n't → not, 've → have, 're → are, 'll → will, 'd → would)
    const normContr = norm
      .replace(/\bcan't\b/g, "cannot")
      .replace(/n't\b/g, " not")
      .replace(/'ve\b/g, " have")
      .replace(/'re\b/g, " are")
      .replace(/'ll\b/g, " will")
      .replace(/'d\b/g, " would")
      .replace(/\s+/g, " ")
      .trim();
    if (normContr !== norm && normEnToId.has(normContr)) return normEnToId.get(normContr)!;

    // ④ 動詞 + "that" 補完: Tedone "Believe X" ↔ IPIP "Believe that X" 系の異形吸収.
    // 副作用 0: ② で直接一致を先に試すため、that 不要な wording は ② で確定する.
    const thatMatch = norm.match(/^(believe|do|don't think|feel|know|suspect|think|thought|worry) (?!that\b)(.+)$/);
    if (thatMatch) {
      const withThat = `${thatMatch[1]} that ${thatMatch[2]}`;
      if (normEnToId.has(withThat)) return normEnToId.get(withThat)!;
    }

    // ⑤ 動詞 + 目的語 + "that" 補完: "Do X Y" → "Do X that Y" 構造 (= 後置修飾).
    // 例: "Do things I later regret" → "Do things that I later regret" (E24).
    // 動詞 list は (Do|Have|Thought) に絞り false positive 抑制. ② で直接一致がある wording は先に確定.
    const thatPostMatch = norm.match(/^(do|have|thought) ([\w']+) (?!that\b)(.+)$/);
    if (thatPostMatch) {
      const withThat = `${thatPostMatch[1]} ${thatPostMatch[2]} that ${thatPostMatch[3]}`;
      if (normEnToId.has(withThat)) return normEnToId.get(withThat)!;
    }

    if (!norm.startsWith("am ") && normEnToId.has("am " + norm)) return normEnToId.get("am " + norm)!;
    for (const suffix of [" me", " you", " us"]) {
      if (normEnToId.has(norm + suffix)) return normEnToId.get(norm + suffix)!;
    }
    if (norm.endsWith("s") && normEnToId.has(norm.slice(0, -1))) return normEnToId.get(norm.slice(0, -1))!;
    return null;
  }

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
  sql.push("-- ipip_items (3,320 IPIP master items + supplement + ja_text where available)");
  // (wrangler d1 execute --file は単一 transaction で wrap するので BEGIN/COMMIT は書かない)
  // Phase 2.1.δ: supplement items (= EX-NNN, source='tedone_extension') を先に投入.
  // ja_text は NULL (= 翻訳は別 wedge or 手動追加).
  if (supplementInserts.length > 0) {
    sql.push("-- ipip-3320-supplement (= IPIP project 内、master 3,320 外、source='tedone_extension')");
    sql.push(...supplementInserts);
  }
  for (const r of ipipRows) {
    if (!r.id || !r.text) continue;
    const ja = jaByItemId.get(r.id) ?? null;
    sql.push(
      `INSERT OR REPLACE INTO ipip_items (item_id, en_text, ja_text, source, created_at) VALUES (${sqlStr(r.id)}, ${sqlStr(r.text)}, ${sqlStr(ja)}, 'ipip_3320', ${now});`,
    );
  }
  // (COMMIT も wrangler 側で実行されるので不要)

  // 4. Tedone → scales INSERT 生成
  const tedoneRaw = loadTedone();
  log.push(`tedone-item-assignment.xlsx: ${tedoneRaw.length} rows`);

  // Phase 2.1.γ: Tedone Table 内重複行を pre-dedupe (= 同 instrument に同 wording が複数登場).
  // 例: LEVENSON1981 "Believe some people are born lucky" × 3.
  // 既存 seenPk は (scale_id, item_id) 単位なので item_id 未解決時に skip カウントが膨れる問題に対応.
  // 残った 1 行のみで lookup を試みれば skip 数も diagnostic も実態を反映する.
  const tedone: TedoneRow[] = [];
  const seenTedoneRow = new Set<string>();
  let tedoneDuplicates = 0;
  for (const r of tedoneRaw) {
    if (!r.instrument || !r.text) continue;
    const key = `${r.instrument}::${normalizeEn(r.text)}`;
    if (seenTedoneRow.has(key)) {
      tedoneDuplicates++;
      continue;
    }
    seenTedoneRow.add(key);
    tedone.push(r);
  }
  log.push(`tedone dedupe: ${tedoneDuplicates} duplicate rows removed (instrument + normalized text)`);

  // Phase 2.x.B: AUTO_SUPPLEMENT_INSTRUMENTS の items を ipip_items に自動投入 + normEnToId 登録.
  // これ以降の lookupItemId で Tedone wording → 自動生成 ID に解決される (= 既存 logic 再利用).
  // ID は (instrument 別) 連番、wording 単位 dedup (= Tedone 内重複は既に上で除去済).
  let autoSupplementCount = 0;
  const autoSupplementSql: string[] = [];
  for (const conf of AUTO_SUPPLEMENT_INSTRUMENTS) {
    const items = tedone.filter((r) => r.instrument === conf.instrument);
    const seenNorm = new Set<string>();
    let seq = 0;
    for (const r of items) {
      const norm = normalizeEn(r.text);
      if (seenNorm.has(norm)) continue;
      if (normEnToId.has(norm)) continue; // 既存 IPIP master / supplement に同 wording があればそちらを優先
      seenNorm.add(norm);
      seq++;
      const itemId = `${conf.idPrefix}-${String(seq).padStart(3, "0")}`;
      normEnToId.set(norm, itemId);
      autoSupplementSql.push(
        `INSERT OR REPLACE INTO ipip_items (item_id, en_text, ja_text, source, created_at) VALUES (${sqlStr(itemId)}, ${sqlStr(r.text)}, NULL, 'tedone_extension', ${now});`,
      );
      autoSupplementCount++;
    }
    log.push(`auto-supplement ${conf.instrument}: ${seq} items (${conf.idPrefix}-001..${String(seq).padStart(3, "0")})`);
  }
  if (autoSupplementSql.length > 0) {
    sql.push("");
    sql.push(`-- AUTO_SUPPLEMENT_INSTRUMENTS (ORAIS/ORVIS auto-generated supplement, source='tedone_extension')`);
    sql.push(...autoSupplementSql);
  }
  log.push(`auto-supplement total: ${autoSupplementCount} items`);

  // Phase 2.1.γ: skip diagnostic collection (= instrument 別 skip 件数 + 全 wording).
  // scripts/.cache/seed-skip-report.json に書き出して Phase 2 investigation の入力に使う.
  type SkipEntry = { instrument: string; text: string; label: string | null };
  const skipByInstrument = new Map<string, SkipEntry[]>();

  let scalesAdded = 0;
  let scalesSkipped = 0;
  const seenPk = new Set<string>(); // dedup (scale_id, item_id)
  const tombstoneSet = new Set(SCALE_TOMBSTONES);
  // Phase 2.1.γ: scale_meta completeness check 用、scale_id 別 row 数を集計
  const scaleIdCount = new Map<string, number>();
  sql.push("");
  sql.push("-- scales (36 instruments × IPIP items mapping)");
  // Phase 2.1.γ: tombstone sweep — 過去 seed で投入された廃止 scale 行を消す (= scale_meta と同期).
  for (const stale of SCALE_TOMBSTONES) {
    sql.push(`DELETE FROM scales WHERE scale_id = ${sqlStr(stale)};`);
  }
  // (wrangler d1 execute --file は単一 transaction で wrap するので BEGIN/COMMIT は書かない)
  for (const r of tedone) {
    const scaleId = instrumentToScaleId(r.instrument);
    // tombstone 対象 instrument は scales に投入せず skip diagnostic にも含めない (= 廃止 scale なので雑音).
    if (tombstoneSet.has(scaleId)) continue;
    const itemId = lookupItemId(r.text);
    if (!itemId) {
      scalesSkipped++;
      const arr = skipByInstrument.get(r.instrument) ?? [];
      arr.push({ instrument: r.instrument, text: r.text, label: r.label ?? null });
      skipByInstrument.set(r.instrument, arr);
      continue;
    }
    const pk = `${scaleId}::${itemId}`;
    if (seenPk.has(pk)) continue; // 異なる wording が同 item_id に解決した場合の最終 dedup
    seenPk.add(pk);
    sql.push(
      `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES (${sqlStr(scaleId)}, ${sqlStr(r.instrument)}, ${sqlStr(itemId)}, ${sqlNum(Number(r.key) || 1)}, ${sqlStr(r.label ?? null)}, ${sqlNum(typeof r.alpha === "number" ? r.alpha : null)});`,
    );
    scalesAdded++;
    scaleIdCount.set(scaleId, (scaleIdCount.get(scaleId) ?? 0) + 1);
  }
  // (COMMIT も wrangler 側で実行されるので不要)
  log.push(`scales: ${scalesAdded} added, ${scalesSkipped} skipped (en_text unresolved)`);

  // instrument 別 skip summary を log (= 大きい順).
  const sortedSkipInstruments = [...skipByInstrument.entries()].sort((a, b) => b[1].length - a[1].length);
  if (sortedSkipInstruments.length > 0) {
    log.push("  skip by instrument:");
    for (const [inst, items] of sortedSkipInstruments) {
      log.push(`    ${inst}: ${items.length}`);
    }
  }

  // 4.1. Phase 2.x.A: IPIP facet auto-view (= 'Alphabetical Index of 274 Labels for 463 IPIP Scales').
  //      Tedone Table の各 (instrument, label) ペアを fine-grained scale view として scales table に追加投入.
  //      既存の instrument 単位 scale_id ('neo' / 'tci' 等) と並列、別 scale_id ('neo_c4_achievement_striving' 等)
  //      で投入. IPIP 公式 newIndexofScaleLabels.htm の 274 labels × 463 scales 構造を DB 上で表現する.
  //      UI 化は別 wedge (= 動的 [ipipFacetId] route で受験可能化).
  sql.push("");
  sql.push("-- IPIP facet auto-view (= (instrument, label) ペア単位の fine-grained scale)");
  let facetScalesAdded = 0;
  const seenFacetPk = new Set<string>(); // dedup (facet_scale_id, item_id)
  const facetScaleCount = new Map<string, number>();
  for (const r of tedone) {
    if (!r.instrument || !r.label) continue;
    const baseScaleId = instrumentToScaleId(r.instrument);
    if (tombstoneSet.has(baseScaleId)) continue;
    const itemId = lookupItemId(r.text);
    if (!itemId) continue; // skip 済は既に diagnostic 出力済、ここでは silent skip
    const facetScaleId = `${baseScaleId}_${instrumentToScaleId(r.label)}`;
    const pk = `${facetScaleId}::${itemId}`;
    if (seenFacetPk.has(pk)) continue;
    seenFacetPk.add(pk);
    sql.push(
      `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES (${sqlStr(facetScaleId)}, ${sqlStr(r.instrument)}, ${sqlStr(itemId)}, ${sqlNum(Number(r.key) || 1)}, ${sqlStr(r.label)}, ${sqlNum(typeof r.alpha === "number" ? r.alpha : null)});`,
    );
    facetScalesAdded++;
    facetScaleCount.set(facetScaleId, (facetScaleCount.get(facetScaleId) ?? 0) + 1);
  }
  log.push(`IPIP facet auto-view: ${facetScalesAdded} rows across ${facetScaleCount.size} facet scale_ids`);

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
  scaleIdCount.set("bigfive", bigFiveQuestions.length);

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
  scaleIdCount.set("industriousness", industriousnessQuestions.length);
  sql.push(...industSql);

  // 5.8. Phase 2.3: 非 IPIP 4 scale (Rosenberg / PHQ-9 / K6 / SWLS) を scales table に投入.
  //      各 question の itemId field (= RSE-/PHQ9-/K6-/SWLS-) を参照、supplement で投入済の
  //      ipip_items を FK で参照. ja_text は data file 由来で既に supplement.json に入れているので UPDATE 不要.
  //      Self-Concept は Daisuke 独自編集 (8 items vs IPIP NEO N4 10 items) で別 wedge.
  log.push("");
  log.push("=== Phase 2.3: 非 IPIP scales 投入 ===");
  const nonIpipScales: Array<{ scaleId: string; instrument: string; label: string; questions: ReadonlyArray<{ id: number; itemId?: string; reverse?: boolean }> }> = [
    { scaleId: "rosenberg", instrument: "RSES", label: "Self-Esteem", questions: rosenbergQuestions },
    { scaleId: "phq9", instrument: "PHQ-9", label: "Depression", questions: phq9Questions },
    { scaleId: "k6", instrument: "K6", label: "Psychological Distress", questions: k6Questions },
    { scaleId: "swls", instrument: "SWLS", label: "Life Satisfaction", questions: swlsQuestions },
  ];
  for (const s of nonIpipScales) {
    sql.push("");
    sql.push(`-- scales (scale_id='${s.scaleId}', source='${s.instrument}', supplement items)`);
    let count = 0;
    for (const q of s.questions) {
      if (!q.itemId) continue;
      const key = q.reverse ? -1 : 1;
      sql.push(
        `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES (${sqlStr(s.scaleId)}, ${sqlStr(s.instrument)}, ${sqlStr(q.itemId)}, ${key}, ${sqlStr(s.label)}, NULL);`,
      );
      count++;
    }
    scaleIdCount.set(s.scaleId, count);
    log.push(`  ${s.scaleId}: ${count} items (instrument='${s.instrument}')`);
  }

  // 5.9. Phase 2.x.C: IPIP 公式 page direct fetch supplement.
  //      Tedone Table の dump 漏れ (= 同 wording を複数 scale で共有する IPIP 構造の不完全 dump) を補完.
  //      ipip-scales-supplement.json から (scale_id, items[]) を読み込み、scales table に
  //      INSERT OR REPLACE で投入. 既存 facet auto-view と並列、同 pk があれば上書き、新規は追加.
  //      Daisuke が IPIP 公式 page を audit して 1 scale ずつ追記する設計.
  log.push("");
  log.push("=== Phase 2.x.C: IPIP page supplement ===");
  interface ScaleSupplementItem { item_id: string; key: number; text?: string }
  interface ScaleSupplement { scale_id: string; label?: string; instrument?: string; alpha?: number | null; items: ScaleSupplementItem[] }
  let scaleSupplementCount = 0;
  let scaleSupplementItems = 0;
  try {
    const ssText = readFileSync(IPIP_SCALES_SUPPLEMENT_JSON, "utf-8");
    const ssParsed = JSON.parse(ssText) as { scales?: ScaleSupplement[] };
    for (const sc of ssParsed.scales ?? []) {
      if (!sc.scale_id || !Array.isArray(sc.items)) continue;
      sql.push("");
      sql.push(`-- IPIP page supplement: ${sc.scale_id} (${sc.items.length} items)`);
      let count = 0;
      for (const it of sc.items) {
        if (!it.item_id || typeof it.key !== "number") continue;
        sql.push(
          `INSERT OR REPLACE INTO scales (scale_id, instrument, item_id, key, label, alpha) VALUES (${sqlStr(sc.scale_id)}, ${sqlStr(sc.instrument ?? null)}, ${sqlStr(it.item_id)}, ${it.key}, ${sqlStr(sc.label ?? null)}, ${sqlNum(sc.alpha ?? null)});`,
        );
        count++;
      }
      scaleIdCount.set(sc.scale_id, Math.max(scaleIdCount.get(sc.scale_id) ?? 0, count));
      scaleSupplementCount++;
      scaleSupplementItems += count;
      log.push(`  ${sc.scale_id}: ${count} items (= IPIP page audit, Tedone dump 漏れ補完)`);
    }
    log.push(`ipip-scales-supplement: ${scaleSupplementCount} scales / ${scaleSupplementItems} items 補完`);
  } catch {
    log.push(`ipip-scales-supplement: not found (= 補完なし)`);
  }

  // 5.9.5. Phase 2.x.D: scale_hierarchy populate.
  //   全 scale_id を集計し、階層情報 (instrument / scale / facet / subfacet) を Tedone label + supplement
  //   schema から parse → scale_hierarchy table に INSERT.
  //   階層深さ:
  //     level 1: instrument 単位 (scale_id = instrument slug 単独、e.g., 'neo' / 'levenson1981')
  //     level 2: scale 単位 (scale_id = `{instrument}_{scale}`, e.g., 'levenson1981_locus_of_control' = scale 'Locus of Control')
  //     level 3: facet 単位 (scale_id = `{instrument}_{scale}_{facet}`, e.g., 'levenson1981_locus_of_control_internal')
  //     level 4: subfacet (= 稀)
  //   ja 訳は Phase 2.x.E (= 別 wedge) で手動 audit populate.
  log.push("");
  log.push("=== Phase 2.x.D: scale_hierarchy populate ===");
  interface HierarchyEntry {
    scale_id: string;
    parent_scale_id: string | null;
    level: number;
    instrument: string;
    scale_name: string | null;
    facet_name: string | null;
    subfacet_name: string | null;
    display_label_en: string | null;
    alpha: number | null;
    source_url: string | null;
  }
  const hierarchyMap = new Map<string, HierarchyEntry>();

  // (a) Tedone Table の各 (instrument, label) ペアから階層 entries 生成.
  //   instrument 単位 (scale_id = slugify(instrument)) → level 1
  //   facet 単位 (scale_id = slugify(instrument)_slugify(label)) → level 2 or 3 (label 内 "," 区切りで判定)
  const seenInstruments = new Set<string>();
  for (const r of tedone) {
    if (!r.instrument || !r.label) continue;
    const baseScaleId = instrumentToScaleId(r.instrument);
    if (tombstoneSet.has(baseScaleId)) continue;

    // instrument level
    if (!seenInstruments.has(baseScaleId)) {
      seenInstruments.add(baseScaleId);
      hierarchyMap.set(baseScaleId, {
        scale_id: baseScaleId,
        parent_scale_id: null,
        level: 1,
        instrument: r.instrument,
        scale_name: null,
        facet_name: null,
        subfacet_name: null,
        display_label_en: r.instrument,
        alpha: null,
        source_url: null,
      });
    }

    // facet level: Tedone label を "," で split → scale_name + facet_name
    const labelParts = r.label.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    const scaleName = labelParts[0]; // 必ず 1 要素 (= scale 名)
    const facetName = labelParts[1] ?? null;
    const facetScaleId = `${baseScaleId}_${instrumentToScaleId(r.label)}`;

    if (!hierarchyMap.has(facetScaleId)) {
      let parentId = baseScaleId; // 通常 level 2 の親は instrument
      let level = 2;
      // facet level (= label に "," 区切り 2 要素以上、level 3)
      if (facetName) {
        const scaleScaleId = `${baseScaleId}_${instrumentToScaleId(scaleName)}`;
        // 中間 scale 単位 entry を確保 (level 2)
        if (!hierarchyMap.has(scaleScaleId)) {
          hierarchyMap.set(scaleScaleId, {
            scale_id: scaleScaleId,
            parent_scale_id: baseScaleId,
            level: 2,
            instrument: r.instrument,
            scale_name: scaleName,
            facet_name: null,
            subfacet_name: null,
            display_label_en: `${r.instrument} / ${scaleName}`,
            alpha: null,
            source_url: null,
          });
        }
        parentId = scaleScaleId;
        level = 3;
      }
      hierarchyMap.set(facetScaleId, {
        scale_id: facetScaleId,
        parent_scale_id: parentId,
        level,
        instrument: r.instrument,
        scale_name: scaleName,
        facet_name: facetName,
        subfacet_name: null,
        display_label_en: facetName ? `${r.instrument} / ${scaleName} / ${facetName}` : `${r.instrument} / ${scaleName}`,
        alpha: typeof r.alpha === "number" ? r.alpha : null,
        source_url: null,
      });
    }
  }

  // (b) ipip-scales-supplement.json の各 entry から階層情報を上書き / 補強.
  //   supplement の instrument + label を信頼 (= IPIP 公式 page audit 結果)
  try {
    const ssText = readFileSync(IPIP_SCALES_SUPPLEMENT_JSON, "utf-8");
    const ssParsed = JSON.parse(ssText) as { scales?: Array<{ scale_id: string; instrument?: string; label?: string; alpha?: number | null; source_url?: string }> };
    for (const sc of ssParsed.scales ?? []) {
      if (!sc.scale_id || !sc.instrument) continue;
      const existing = hierarchyMap.get(sc.scale_id);
      if (existing) {
        // alpha / source_url の補強のみ (既存 hierarchy structure は維持)
        if (sc.alpha !== undefined && sc.alpha !== null && existing.alpha === null) existing.alpha = sc.alpha;
        if (sc.source_url && !existing.source_url) existing.source_url = sc.source_url;
      } else {
        // 新規 entry: instrument + label から階層推定 (Tedone と同 logic)
        const labelParts = (sc.label ?? "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        const scaleName = labelParts[0] || null;
        const facetName = labelParts[1] ?? null;
        const baseScaleId = instrumentToScaleId(sc.instrument);
        // 中間 scale level を確保
        if (scaleName && facetName) {
          const scaleScaleId = `${baseScaleId}_${instrumentToScaleId(scaleName)}`;
          if (!hierarchyMap.has(scaleScaleId)) {
            hierarchyMap.set(scaleScaleId, {
              scale_id: scaleScaleId,
              parent_scale_id: baseScaleId,
              level: 2,
              instrument: sc.instrument,
              scale_name: scaleName,
              facet_name: null,
              subfacet_name: null,
              display_label_en: `${sc.instrument} / ${scaleName}`,
              alpha: null,
              source_url: sc.source_url ?? null,
            });
          }
        }
        // instrument level も確保 (Tedone にない instrument の場合)
        if (!hierarchyMap.has(baseScaleId)) {
          hierarchyMap.set(baseScaleId, {
            scale_id: baseScaleId,
            parent_scale_id: null,
            level: 1,
            instrument: sc.instrument,
            scale_name: null,
            facet_name: null,
            subfacet_name: null,
            display_label_en: sc.instrument,
            alpha: null,
            source_url: null,
          });
        }
        const parentId = facetName ? `${baseScaleId}_${instrumentToScaleId(scaleName!)}` : baseScaleId;
        hierarchyMap.set(sc.scale_id, {
          scale_id: sc.scale_id,
          parent_scale_id: parentId,
          level: facetName ? 3 : 2,
          instrument: sc.instrument,
          scale_name: scaleName,
          facet_name: facetName,
          subfacet_name: null,
          display_label_en: facetName ? `${sc.instrument} / ${scaleName} / ${facetName}` : `${sc.instrument} / ${scaleName}`,
          alpha: sc.alpha ?? null,
          source_url: sc.source_url ?? null,
        });
      }
    }
  } catch {}

  // (c) SQL 投入. DELETE → INSERT で冪等性確保 (= 既存 row 全削除してから新規 INSERT).
  sql.push("");
  sql.push("-- scale_hierarchy (Phase 2.x.D: 階層 tree)");
  sql.push("DELETE FROM scale_hierarchy;");
  for (const h of hierarchyMap.values()) {
    sql.push(
      `INSERT INTO scale_hierarchy (scale_id, parent_scale_id, level, instrument, scale_name, facet_name, subfacet_name, display_label_en, display_label_ja, alpha, source_url, created_at) VALUES (${sqlStr(h.scale_id)}, ${sqlStr(h.parent_scale_id)}, ${h.level}, ${sqlStr(h.instrument)}, ${sqlStr(h.scale_name)}, ${sqlStr(h.facet_name)}, ${sqlStr(h.subfacet_name)}, ${sqlStr(h.display_label_en)}, NULL, ${sqlNum(h.alpha)}, ${sqlStr(h.source_url)}, ${now});`,
    );
  }
  // level 別 count log
  const byLevel = new Map<number, number>();
  for (const h of hierarchyMap.values()) byLevel.set(h.level, (byLevel.get(h.level) ?? 0) + 1);
  log.push(`scale_hierarchy: ${hierarchyMap.size} entries`);
  for (const [lv, n] of [...byLevel.entries()].sort()) {
    const labelMap: Record<number, string> = { 1: "instrument", 2: "scale", 3: "facet", 4: "subfacet" };
    log.push(`  level ${lv} (${labelMap[lv] ?? "?"}): ${n}`);
  }

  // 5.9.6. Phase 2.x.D.1: IPIP canonical labels (= newIndexofScaleLabels.htm Alphabetical Index).
  //   276 unique canonical labels (= IPIP page の構成概念名) + 547 (label, instrument, facet_code) pairs.
  //   ipip-canonical-labels.json (= WebFetch 結果) を読み込み、canonical_labels + canonical_label_implementations 両 table に投入.
  //   scale_id resolution は best effort (= instrument + Tedone label fuzzy match で scale_hierarchy.scale_id を逆引き).
  //   解決不可は scale_id=NULL (= Phase 2.x.D.2 で手動 audit).
  log.push("");
  log.push("=== Phase 2.x.D.1: canonical labels populate ===");
  interface CanonicalImpl { instrument: string; facet_code: string }
  interface CanonicalLabelEntry { canonical_label: string; implementations: CanonicalImpl[] }
  let canonicalLabelsCount = 0;
  let canonicalImplsCount = 0;
  let canonicalResolved = 0;

  // scale_hierarchy から (instrument, facet_name) → scale_id の逆引き map
  // canonical page facet_code (e.g., "C4") と私の facet_name (e.g., "Achievement-striving") は一致しないが、
  // instrument 単位の scale_id 体系を活用して fuzzy match を試みる.
  const instrumentFacetToScaleId = new Map<string, string>();
  // Tedone label slug (= 私の scale_id suffix) で逆引き構築. e.g., "NEO::achievement-striving" → "neo_achievement_striving"
  for (const h of hierarchyMap.values()) {
    if (h.level < 2) continue;
    if (h.facet_name) {
      instrumentFacetToScaleId.set(`${h.instrument}::${h.facet_name.toLowerCase()}`, h.scale_id);
    }
    if (h.scale_name) {
      instrumentFacetToScaleId.set(`${h.instrument}::${h.scale_name.toLowerCase()}`, h.scale_id);
    }
  }

  // instrument 名 normalize (= IPIP page "HEX" → Tedone "HEXACO_PI", "Big-Five" → "BFAS" 等の異名)
  const INSTRUMENT_ALIASES: Record<string, string> = {
    "HEX": "HEXACO_PI",
    "Big-Five": "BFAS",
    "Big-7": "BFAS",
    "BFAS-20": "BFAS-20",
    "NEO5-20": "NEO5-20",
  };

  try {
    const clText = readFileSync(IPIP_CANONICAL_LABELS_JSON, "utf-8");
    const clParsed = JSON.parse(clText) as { labels?: CanonicalLabelEntry[] };
    sql.push("");
    sql.push("-- canonical_labels + canonical_label_implementations (Phase 2.x.D.1)");
    sql.push("DELETE FROM canonical_label_implementations;");
    sql.push("DELETE FROM canonical_labels;");

    for (const entry of clParsed.labels ?? []) {
      if (!entry.canonical_label) continue;
      sql.push(
        `INSERT INTO canonical_labels (canonical_label, display_label_ja, description, created_at) VALUES (${sqlStr(entry.canonical_label)}, NULL, NULL, ${now});`,
      );
      canonicalLabelsCount++;

      for (const impl of entry.implementations ?? []) {
        if (!impl.instrument || !impl.facet_code) continue;
        // instrument alias resolve
        const resolvedInstrument = INSTRUMENT_ALIASES[impl.instrument] ?? impl.instrument;
        // scale_id resolution (best effort fuzzy match)
        const lookupKey = `${resolvedInstrument}::${impl.facet_code.toLowerCase()}`;
        const scaleId = instrumentFacetToScaleId.get(lookupKey) ?? null;
        if (scaleId) canonicalResolved++;

        sql.push(
          `INSERT INTO canonical_label_implementations (canonical_label, instrument, facet_code, scale_id, created_at) VALUES (${sqlStr(entry.canonical_label)}, ${sqlStr(impl.instrument)}, ${sqlStr(impl.facet_code)}, ${sqlStr(scaleId)}, ${now});`,
        );
        canonicalImplsCount++;
      }
    }
    log.push(`canonical_labels: ${canonicalLabelsCount} labels / ${canonicalImplsCount} implementations`);
    log.push(`  scale_id resolved: ${canonicalResolved} / ${canonicalImplsCount} (= ${Math.round((canonicalResolved / canonicalImplsCount) * 100)}% , 残は命名揺れ / facet_code 直接 match 不可)`);
  } catch (err) {
    log.push(`canonical_labels: not found or error (${err})`);
  }

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
    sql.push("-- scale_meta (Phase 2.1.β: UI 表示 metadata)");
    // Phase 2.1.γ: scale-meta.json から除外された scale_id を明示的に削除 (= 冪等、row 不在 no-op).
    for (const stale of SCALE_TOMBSTONES) {
      sql.push(`DELETE FROM scale_meta WHERE scale_id = ${sqlStr(stale)};`);
    }
    for (const m of metaItems) {
      sql.push(
        `INSERT OR REPLACE INTO scale_meta (scale_id, category, ja_label, ja_description, source_url, reference, official_total_items, created_at, updated_at) VALUES (${sqlStr(m.scale_id)}, ${sqlStr(m.category)}, ${sqlStr(m.ja_label)}, ${sqlStr(m.ja_description ?? null)}, ${sqlStr(m.source_url ?? null)}, ${sqlStr(m.reference ?? null)}, ${sqlNum(m.official_total_items ?? null)}, ${now}, ${now});`,
      );
    }
    log.push(`scale_meta: ${metaItems.length} rows (tombstones: ${SCALE_TOMBSTONES.join(", ") || "none"})`);

    // Phase 2.1.γ + 2.3: completeness check — scale_meta.official_total_items と scales COUNT を比較.
    // Phase 2.3 で rosenberg/phq9/k6/swls も scales 投入したので IPIP 系と同じく完全一致期待.
    // selfconcept のみ Daisuke 独自編集 (= NEO N4 と 8/10 件数差) で別 wedge 待ち、現状 0 許容.
    log.push("");
    log.push("=== scale_meta completeness check ===");
    const pendingScales = new Set(["selfconcept"]);
    let mismatch = 0;
    for (const m of metaItems) {
      const actual = scaleIdCount.get(m.scale_id) ?? 0;
      const expected = m.official_total_items ?? null;
      const isPending = pendingScales.has(m.scale_id);
      if (expected === null) {
        log.push(`  ${m.scale_id}: official=— actual=${actual} (no expected count)`);
      } else if (actual === expected) {
        log.push(`  ${m.scale_id}: ${actual}/${expected} ✓`);
      } else if (isPending && actual === 0) {
        log.push(`  ${m.scale_id}: 0/${expected} (= Phase 2.2.2 pending, Daisuke 独自編集 vs IPIP NEO N4 の対応決定待ち)`);
      } else {
        mismatch++;
        log.push(`  ${m.scale_id}: ${actual}/${expected} ⚠ MISMATCH (diff: ${actual - expected})`);
      }
    }
    if (mismatch === 0) log.push("  → all scale_meta completeness ✓");
    else log.push(`  → ${mismatch} scale(s) with unexpected mismatch (要 investigation)`);
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

  // Phase 2.1.γ: skip diagnostic 書き出し (= Phase 2 instrument 別 audit の入力).
  const skipReport = {
    generatedAt: new Date().toISOString(),
    totalSkipped: scalesSkipped,
    tedoneDuplicatesRemoved: tedoneDuplicates,
    byInstrument: Object.fromEntries(
      sortedSkipInstruments.map(([inst, items]) => [
        inst,
        { count: items.length, items: items.map((e) => ({ text: e.text, label: e.label })) },
      ]),
    ),
  };
  writeFileSync(SKIP_REPORT_OUT, JSON.stringify(skipReport, null, 2) + "\n", "utf-8");
  log.push(`skip report: ${SKIP_REPORT_OUT} (${scalesSkipped} entries across ${sortedSkipInstruments.length} instruments)`);

  // 7. summary log
  console.log(log.join("\n"));
}

build();
