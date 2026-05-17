/**
 * D1 access helpers for scale_hierarchy / canonical_labels / scales (Phase 2.x.F).
 *
 * UI 探索・受験・結果表示で使う共通 query 群.
 */

export interface ScaleHierarchyRow {
  scale_id: string;
  parent_scale_id: string | null;
  level: number;
  instrument: string;
  scale_name: string | null;
  facet_name: string | null;
  subfacet_name: string | null;
  display_label_en: string | null;
  display_label_ja: string | null;
  alpha: number | null;
  source_url: string | null;
  item_count?: number;
  // Phase 2.x.D.3: items の出所. 'direct' = IPIP 公式 single scale (= 短縮版あり) / 'aggregated' = children 集計 (= 公式 domain scale なし、facet items を sum)
  items_source?: "direct" | "aggregated" | null;
}

export interface CanonicalLabelRow {
  canonical_label: string;
  display_label_ja: string | null;
  description: string | null;
  impl_count?: number;
}

export interface CanonicalImplRow {
  canonical_label: string;
  instrument: string;
  facet_code: string;
  scale_id: string | null;
  display_label_ja?: string | null;
}

export interface ScaleDescriptionRow {
  scale_id: string;
  description_long: string | null;
  description_short: string | null;
  reference: string | null;
  source_url: string | null;
  threshold_low: number | null;
  threshold_high: number | null;
  threshold_kind: string | null;
}

export interface ScaleInterpretationRow {
  scale_id: string;
  band: "very_low" | "low" | "mid" | "high" | "very_high";
  interpretation_long: string | null;
  interpretation_short: string | null;
  caveat: string | null;
}

export interface ScaleItemRow {
  scale_id: string;
  item_id: string;
  key: number;
  label: string | null;
  en_text: string;
  ja_text: string | null;
}

/**
 * instrument 一覧 (level 1 entries) + 各 instrument の scale 数.
 */
export async function listInstruments(db: D1Database): Promise<ScaleHierarchyRow[]> {
  const r = await db
    .prepare(
      `SELECT h.*, (
         SELECT COUNT(*) FROM scale_hierarchy h2 WHERE h2.instrument = h.instrument AND h2.level >= 2
       ) AS item_count
       FROM scale_hierarchy h
       WHERE h.level = 1
       ORDER BY h.instrument`,
    )
    .all<ScaleHierarchyRow>();
  return r.results ?? [];
}

/**
 * 1 instrument 配下の scale 階層 (level 2-4) を tree 順で取得.
 *
 * Phase 2.x.D.3: domain (level 2) で scales table に直接 row が無い場合、
 * children の items を集計して表示 (= IPIP page 通り「BFAS / Agreeableness = 20 items」).
 */
export async function listInstrumentScales(
  db: D1Database,
  instrument: string,
): Promise<ScaleHierarchyRow[]> {
  const r = await db
    .prepare(
      `WITH base AS (
         SELECT h.*, (SELECT COUNT(*) FROM scales s WHERE s.scale_id = h.scale_id) AS direct_items
         FROM scale_hierarchy h
         WHERE h.instrument = ?1 AND h.level >= 2
       )
       SELECT b.*,
         CASE WHEN b.level = 2 AND b.direct_items = 0 THEN
           COALESCE((SELECT SUM(c.direct_items) FROM base c WHERE c.parent_scale_id = b.scale_id), 0)
         ELSE b.direct_items END AS item_count,
         CASE WHEN b.level = 2 AND b.direct_items = 0 THEN 'aggregated' ELSE 'direct' END AS items_source
       FROM base b
       ORDER BY b.level, b.scale_name, b.facet_name`,
    )
    .bind(instrument)
    .all<ScaleHierarchyRow>();
  return r.results ?? [];
}

/**
 * 1 scale の詳細 + parent chain.
 *
 * Phase 2.x.D.3: domain (level 2) で direct items 0 の場合、children を sum して item_count に.
 */
export async function getScale(db: D1Database, scaleId: string): Promise<ScaleHierarchyRow | null> {
  const r = await db
    .prepare(
      `WITH base AS (
         SELECT h.*, (SELECT COUNT(*) FROM scales s WHERE s.scale_id = h.scale_id) AS direct_items
         FROM scale_hierarchy h WHERE h.scale_id = ?1
       )
       SELECT b.*,
         CASE WHEN b.level = 2 AND b.direct_items = 0 THEN
           COALESCE((SELECT COUNT(DISTINCT s.item_id) FROM scales s
             WHERE s.scale_id IN (SELECT scale_id FROM scale_hierarchy WHERE parent_scale_id = b.scale_id)), 0)
         ELSE b.direct_items END AS item_count,
         CASE WHEN b.level = 2 AND b.direct_items = 0 THEN 'aggregated' ELSE 'direct' END AS items_source
       FROM base b`,
    )
    .bind(scaleId)
    .first<ScaleHierarchyRow>();
  return r ?? null;
}

/**
 * 1 scale の items 全件 (scales table と ipip_items を JOIN).
 *
 * Phase 2.x.D.3: domain (level 2) で direct items 0 の場合、children scale (= sub-facet)
 * の items を集計して返す (= IPIP NEO convention: domain test は全 facet item を含む).
 *   重複は item_id で dedup. key は同一 item で複数 scale 間で異なる場合があるが、
 *   level 3 の最初の出現を採用 (= rare case、psycho_scoring 上の影響なし).
 */
export async function listScaleItems(
  db: D1Database,
  scaleId: string,
): Promise<ScaleItemRow[]> {
  // まず direct items を試す
  const direct = await db
    .prepare(
      `SELECT s.scale_id, s.item_id, s.key, s.label, i.en_text, i.ja_text
       FROM scales s
       JOIN ipip_items i ON i.item_id = s.item_id
       WHERE s.scale_id = ?1
       ORDER BY s.item_id`,
    )
    .bind(scaleId)
    .all<ScaleItemRow>();
  if ((direct.results?.length ?? 0) > 0) return direct.results ?? [];

  // direct 0 件 → domain (level 2) で children に items がある場合に集計
  const aggregated = await db
    .prepare(
      `SELECT s.scale_id AS source_scale_id, ?1 AS scale_id, s.item_id, s.key, s.label, i.en_text, i.ja_text
       FROM scales s
       JOIN ipip_items i ON i.item_id = s.item_id
       WHERE s.scale_id IN (SELECT scale_id FROM scale_hierarchy WHERE parent_scale_id = ?1)
       GROUP BY s.item_id
       ORDER BY s.item_id`,
    )
    .bind(scaleId)
    .all<ScaleItemRow & { source_scale_id: string }>();
  return aggregated.results ?? [];
}

/**
 * 既存 user_responses から、scale items に該当する回答を取得 (= 結果計算用).
 */
export async function getUserResponsesForScale(
  db: D1Database,
  deviceId: string,
  scaleId: string,
): Promise<Array<{ item_id: string; value: number; answered_at: number }>> {
  const r = await db
    .prepare(
      `SELECT ur.item_id, ur.value, ur.answered_at
       FROM user_responses ur
       JOIN scales s ON s.item_id = ur.item_id
       WHERE ur.device_id = ?1 AND s.scale_id = ?2`,
    )
    .bind(deviceId, scaleId)
    .all<{ item_id: string; value: number; answered_at: number }>();
  return r.results ?? [];
}

/**
 * Phase 2.x.H: user が受験「完走」した scale を band 付きで集計.
 * 完走 = 当該 scale の全 item に user_responses が存在する.
 * 月読 chat context に inject される (= description_short / interpretation_short の供給源).
 */
export interface CompletedScaleRow {
  scale_id: string;
  instrument: string;
  scale_name: string | null;
  facet_name: string | null;
  display_label_ja: string | null;
  description_short: string | null;
  band: "low" | "mid" | "high";
  interpretation_short: string | null;
  raw_score: number;
  max_possible: number;
  min_possible: number;
  items_answered: number;
  items_total: number;
  /**
   * 当該 scale で最後に回答された item の answered_at (epoch ms).
   * 対話途中の受験を「新たに紐解いた」として識別するのに使う.
   */
  latest_answered_at: number;
}

export async function getCompletedScales(
  db: D1Database,
  deviceId: string,
  options?: { limit?: number },
): Promise<CompletedScaleRow[]> {
  // 完走判定: scale_id の全 item に対して user_responses があれば「完走」.
  // SQL: scales table の (scale_id, item_id) 全件 ⊆ user_responses(device_id=...) の item_id 集合
  // → answered_count = total_items の scale_id を抽出.
  //
  // band 判定はここでは生 score のみ取り、interpretation_short の取得を別 query で.
  // (= 結合してもよいが、scale_id 単位の小さい集合なので簡潔に分ける)
  const r = await db
    .prepare(
      `WITH scale_counts AS (
         SELECT s.scale_id, COUNT(*) AS total_items
         FROM scales s GROUP BY s.scale_id
       ),
       user_counts AS (
         SELECT s.scale_id,
                COUNT(DISTINCT ur.item_id) AS answered,
                SUM(CASE WHEN s.key >= 0 THEN ur.value ELSE 6 - ur.value END) AS raw_score,
                MAX(ur.answered_at) AS latest_answered_at
         FROM scales s
         JOIN user_responses ur ON ur.item_id = s.item_id AND ur.device_id = ?1
         GROUP BY s.scale_id
       ),
       completed AS (
         SELECT u.scale_id, u.answered, u.raw_score, u.latest_answered_at, c.total_items
         FROM user_counts u
         JOIN scale_counts c USING(scale_id)
         WHERE u.answered = c.total_items
       )
       SELECT comp.scale_id, comp.raw_score, comp.answered AS items_answered,
              comp.total_items AS items_total, comp.latest_answered_at,
              h.instrument, h.scale_name, h.facet_name, h.display_label_ja,
              sd.description_short, sd.threshold_low, sd.threshold_high
       FROM completed comp
       JOIN scale_hierarchy h ON h.scale_id = comp.scale_id
       LEFT JOIN scale_descriptions sd ON sd.scale_id = comp.scale_id
       ORDER BY comp.latest_answered_at DESC`,
    )
    .bind(deviceId)
    .all<{
      scale_id: string;
      raw_score: number;
      items_answered: number;
      items_total: number;
      latest_answered_at: number;
      instrument: string;
      scale_name: string | null;
      facet_name: string | null;
      display_label_ja: string | null;
      description_short: string | null;
      threshold_low: number | null;
      threshold_high: number | null;
    }>();

  const rows = r.results ?? [];

  // band 判定 + interpretation_short 取得 (= 別 query で各 scale の該当 band を引く)
  // 件数少ない想定 (= 数〜数十) なので個別 SELECT で十分.
  const out: CompletedScaleRow[] = [];
  for (const row of rows) {
    const minPossible = row.items_total * 1;
    const maxPossible = row.items_total * 5;
    let band: "low" | "mid" | "high";
    if (row.threshold_low !== null && row.threshold_high !== null) {
      if (row.raw_score <= row.threshold_low) band = "low";
      else if (row.raw_score >= row.threshold_high) band = "high";
      else band = "mid";
    } else {
      const norm = (row.raw_score - minPossible) / Math.max(1, maxPossible - minPossible);
      band = norm > 0.66 ? "high" : norm < 0.33 ? "low" : "mid";
    }

    const interp = await db
      .prepare(
        `SELECT interpretation_short FROM scale_interpretations WHERE scale_id = ?1 AND band = ?2`,
      )
      .bind(row.scale_id, band)
      .first<{ interpretation_short: string | null }>();

    out.push({
      scale_id: row.scale_id,
      instrument: row.instrument,
      scale_name: row.scale_name,
      facet_name: row.facet_name,
      display_label_ja: row.display_label_ja,
      description_short: row.description_short,
      band,
      interpretation_short: interp?.interpretation_short ?? null,
      raw_score: row.raw_score,
      max_possible: maxPossible,
      min_possible: minPossible,
      items_answered: row.items_answered,
      items_total: row.items_total,
      latest_answered_at: row.latest_answered_at,
    });
  }

  if (options?.limit && out.length > options.limit) return out.slice(0, options.limit);
  return out;
}

/**
 * 1 scale の description + interpretation 全 band.
 * 未登録 scale は null / 空配列を返す (= UI 側でフォールバック表示).
 */
export async function getScaleDescription(
  db: D1Database,
  scaleId: string,
): Promise<{ description: ScaleDescriptionRow | null; interpretations: ScaleInterpretationRow[] }> {
  const desc = await db
    .prepare("SELECT * FROM scale_descriptions WHERE scale_id = ?1")
    .bind(scaleId)
    .first<ScaleDescriptionRow>();
  const interps = await db
    .prepare("SELECT * FROM scale_interpretations WHERE scale_id = ?1 ORDER BY band")
    .bind(scaleId)
    .all<ScaleInterpretationRow>();
  return { description: desc ?? null, interpretations: interps.results ?? [] };
}

/**
 * canonical_labels 全件 + 各 label の impl 数.
 */
export async function listCanonicalLabels(db: D1Database): Promise<CanonicalLabelRow[]> {
  const r = await db
    .prepare(
      `SELECT cl.*, (
         SELECT COUNT(*) FROM canonical_label_implementations ci WHERE ci.canonical_label = cl.canonical_label
       ) AS impl_count
       FROM canonical_labels cl
       ORDER BY cl.canonical_label`,
    )
    .all<CanonicalLabelRow>();
  return r.results ?? [];
}

/**
 * 1 canonical_label の implementation 一覧 (scale_id resolved 済を優先).
 */
export async function listCanonicalLabelImpls(
  db: D1Database,
  canonicalLabel: string,
): Promise<CanonicalImplRow[]> {
  const r = await db
    .prepare(
      `SELECT ci.canonical_label, ci.instrument, ci.facet_code, ci.scale_id,
              h.display_label_ja
       FROM canonical_label_implementations ci
       LEFT JOIN scale_hierarchy h ON h.scale_id = ci.scale_id
       WHERE ci.canonical_label = ?1
       ORDER BY ci.instrument, ci.facet_code`,
    )
    .bind(canonicalLabel)
    .all<CanonicalImplRow>();
  return r.results ?? [];
}
