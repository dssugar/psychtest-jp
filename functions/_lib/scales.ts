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
 */
export async function listInstrumentScales(
  db: D1Database,
  instrument: string,
): Promise<ScaleHierarchyRow[]> {
  const r = await db
    .prepare(
      `SELECT h.*, (
         SELECT COUNT(*) FROM scales s WHERE s.scale_id = h.scale_id
       ) AS item_count
       FROM scale_hierarchy h
       WHERE h.instrument = ?1 AND h.level >= 2
       ORDER BY h.level, h.scale_name, h.facet_name`,
    )
    .bind(instrument)
    .all<ScaleHierarchyRow>();
  return r.results ?? [];
}

/**
 * 1 scale の詳細 + parent chain.
 */
export async function getScale(db: D1Database, scaleId: string): Promise<ScaleHierarchyRow | null> {
  const r = await db
    .prepare(
      `SELECT h.*, (
         SELECT COUNT(*) FROM scales s WHERE s.scale_id = h.scale_id
       ) AS item_count
       FROM scale_hierarchy h WHERE h.scale_id = ?1`,
    )
    .bind(scaleId)
    .first<ScaleHierarchyRow>();
  return r ?? null;
}

/**
 * 1 scale の items 全件 (scales table と ipip_items を JOIN).
 */
export async function listScaleItems(
  db: D1Database,
  scaleId: string,
): Promise<ScaleItemRow[]> {
  const r = await db
    .prepare(
      `SELECT s.scale_id, s.item_id, s.key, s.label, i.en_text, i.ja_text
       FROM scales s
       JOIN ipip_items i ON i.item_id = s.item_id
       WHERE s.scale_id = ?1
       ORDER BY s.item_id`,
    )
    .bind(scaleId)
    .all<ScaleItemRow>();
  return r.results ?? [];
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
