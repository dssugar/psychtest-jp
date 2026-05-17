/**
 * Phase 2.x.G.bulk: scale_hierarchy + scale_meta + facet_codes + canonical_labels を読んで、
 * 全 scale に対する scale-descriptions.json template entry を生成.
 *
 * 既存 scale-descriptions.json の hand-crafted entry は preserve (scale_id 一致でスキップ).
 *
 * 出力: data/ipip-master/scale-descriptions.json を上書き (= 既存 + 新規 template entry)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "data/ipip-master/scale-descriptions.json");
const HANDCRAFT = resolve(ROOT, "data/ipip-master/scale-descriptions-handcraft.json");
const JA_GLOSSARY = resolve(ROOT, "data/ipip-master/ja-glossary.json");

// ============================================================
// scale_hierarchy + scale_meta を D1 から query
// ============================================================
function queryD1(sql: string): unknown[] {
  writeFileSync("/tmp/q.sql", sql);
  const raw = execSync(`npx wrangler d1 execute psychtest-alpha --local --file=/tmp/q.sql`, {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const json = raw.slice(raw.indexOf("["));
  return (JSON.parse(json) as Array<{ results: unknown[] }>)[0]?.results ?? [];
}

type HierRow = {
  scale_id: string;
  instrument: string;
  level: number;
  scale_name: string | null;
  facet_name: string | null;
  display_label_en: string | null;
  display_label_ja: string | null;
  alpha: number | null;
  source_url: string | null;
  items: number;
};

const hier = queryD1(`
  SELECT h.scale_id, h.instrument, h.level, h.scale_name, h.facet_name,
         h.display_label_en, h.display_label_ja, h.alpha, h.source_url,
         (SELECT COUNT(*) FROM scales s WHERE s.scale_id = h.scale_id) AS items
  FROM scale_hierarchy h
  WHERE h.level >= 2
  ORDER BY h.instrument, h.level, h.scale_name, h.facet_name;
`) as HierRow[];
console.error(`hierarchy: ${hier.length} entries`);

// children items aggregation for domain (level 2 with direct items 0)
const childrenMap = new Map<string, number>();
const childrenSqlRows = queryD1(`
  SELECT h.parent_scale_id AS parent,
         (SELECT COUNT(DISTINCT s.item_id) FROM scales s
          WHERE s.scale_id IN (SELECT scale_id FROM scale_hierarchy WHERE parent_scale_id = h.parent_scale_id))
            AS agg_items
  FROM scale_hierarchy h
  WHERE h.level >= 3 AND h.parent_scale_id IS NOT NULL
  GROUP BY h.parent_scale_id;
`) as Array<{ parent: string; agg_items: number }>;
for (const r of childrenSqlRows) childrenMap.set(r.parent, r.agg_items);

// ============================================================
// ja glossary load (= 説明文に instrument ja 名を使う)
// ============================================================
const glossary = (() => {
  try {
    const g = JSON.parse(readFileSync(JA_GLOSSARY, "utf-8")) as {
      instruments?: Record<string, string>;
      terms?: Record<string, string>;
    };
    return { instruments: g.instruments ?? {}, terms: g.terms ?? {} };
  } catch {
    return { instruments: {}, terms: {} };
  }
})();

function jaTerm(en: string | null): string | null {
  if (!en) return null;
  const lower = en.toLowerCase();
  for (const [k, v] of Object.entries(glossary.terms)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}

// ============================================================
// instrument-level overview (= L2/L3 の description 末尾に短く挿入)
// ============================================================
const INSTRUMENT_OVERVIEW: Record<string, string> = {
  "NEO": "IPIP-NEO-300 は Big Five 5 因子 × 各 6 facet (合計 30 facet) を 300 項目で測定する標準的な性格検査。Costa & McCrae (1992) の NEO-PI-R を Goldberg が IPIP 化。",
  "HEXACO_PI": "HEXACO-PI-R (IPIP 版) は Big Five に Honesty-Humility を加えた 6 因子 × 4 facet = 24 facet 構成、240 項目。Lee & Ashton (2004) 提唱。",
  "BFAS": "Big Five Aspect Scales は 5 因子 × 2 aspect = 10 aspect を 100 項目で測る中粒度尺度。DeYoung, Quilty & Peterson (2007) 開発。",
  "6FPQ": "Six Factor Personality Questionnaire は Jackson (1996) の 6 因子モデル。各因子 10 項目 + 3 sub-facet × 8-10 項目。",
  "TCI": "Temperament and Character Inventory (Cloninger) は 7 因子 (Novelty-Seeking / Harm Avoidance / Reward Dependence / Persistence / Self-Directedness / Cooperativeness / Self-Transcendence)、神経生物学ベース。",
  "VIA": "VIA Character Strengths は Peterson & Seligman (2004) の 24 強み × 6 美徳の包括的フレーム。ポジティブ心理学の代表的尺度。",
  "16PF": "Cattell の 16 Personality Factors。因子分析で抽出された基本性格 16 因子 (Warmth / Reasoning / Emotional Stability / ...)。",
  "CPI": "California Psychological Inventory (Gough) は対人・自己制御・能力など 30+ scale を持つ実用志向尺度。",
  "JPI": "Jackson Personality Inventory-Revised は Murray のニーズ理論ベース 15 scale。",
  "MPQ": "Multidimensional Personality Questionnaire (Tellegen) は Positive/Negative Emotionality + Constraint の上位 3 因子下に 11 facet。",
  "HPI": "Hogan Personality Inventory は職場適応・組織行動の予測に特化した 7 主要尺度。",
  "HPI-HIC": "Hogan Personality Inventory の Homogeneous Item Composite (HIC) サブ単位、43 HIC。",
  "AB5C": "Abridged Big Five Circumplex は Big Five 各因子を 2 軸組合せて 45 中粒度 facet として記述するモデル (Hofstee & de Raad, 1992)。",
  "Barchard2001": "Barchard (2001) の感情知能尺度。表出 / 注意 / 感情ベース意思決定 / 共感 系の 7 facet。",
  "IPIP-IPC": "IPIP Interpersonal Circumplex は対人行動を 8 octant (= 支配-服従 × 親密-冷淡 の円環) で表現。",
  "CAT-PD": "Computerized Adaptive Test of Personality Disorder は DSM パーソナリティ障害領域の 33 facet。",
  "ORAIS": "Oregon Avocational Interest Scales (Goldberg 2010) は趣味・余暇活動 33 領域の興味。",
  "ORVIS": "Oregon Vocational Interest Scales (Pozzebon 2010) は職業興味 8 タイプ (Holland RIASEC の発展形)。",
  "Levenson1981": "Levenson の Locus of Control (内的統制 / 他者統制 / 偶然性) 3 次元モデル。",
  "Rosenberg1965": "Rosenberg Self-Esteem Scale (1965)。10 項目、世界で最も広く使われる自尊感情尺度。",
  "Scheier1994": "Scheier et al. (1994) Life Orientation Test-Revised (LOT-R)、性格特性的楽観性を測定。",
  "Snyder1974": "Snyder (1974) Self-Monitoring Scale。社会的状況に応じて自己呈示を調整する傾向。",
  "Cacioppo1982": "Cacioppo & Petty (1982) Need for Cognition Scale。考えること自体への動機。",
  "Buss1980": "Buss & Scheier (1980) Self-Consciousness Scale。私的・公的自己意識 + 社会的不安の 3 因子。",
  "Chapman1986": "Eckblad & Chapman (1986) Hypomanic Personality Scale。軽躁傾向のリスク指標。",
  "Span2002": "Span et al. (2002) Adult ADHD Self-Report Scale 系統の ADHD 傾向スクリーニング。",
  "Radloff1977": "Radloff (1977) Center for Epidemiologic Studies Depression Scale (CES-D)。一般人口向け抑うつ尺度。",
  "Foa1998": "Foa et al. (1998) Padua Inventory 関連。秩序と清潔さへの欲求 / 完璧主義。",
  "Foa2002": "Foa et al. (2002) Obsessive-Compulsive Inventory (OCI)。強迫症状スクリーニング。",
  "Hoyle2002": "Hoyle et al. (2002) Brief Sensation Seeking Scale。リスク追求の 3 サブタイプ (= 計算ずく / 危険志向 / 衝動的) + 統合。",
  "Goldberg1999": "Goldberg (1999) Multidimensional Dissociation Scale。解離傾向の 3 facet (= 没入 / 健忘 / 離人感) + 全体・短縮。",
  "BIDR": "Balanced Inventory of Desirable Responding (Paulhus 1991)。社会的望ましさバイアスの 2 facet (= 印象操作 + 自己欺瞞) + Cognitive Failures。",
  "Barchard": "Barchard 2001 (= 上記 Barchard2001 と同)。",
  "BIS_BAS": "Carver & White (1994) BIS/BAS Scales。行動抑制 (= 罰回避) / 活性化 (= 報酬接近) の 2 system モデル。",
  "7FACTOR": "Tellegen & Waller の 7 因子モデル (= Big Five + Positive/Negative Valence)。",
  "IPIP-Rational": "IPIP-Rational (= 用途未詳の Tedone Table カテゴリ、現在 1 件のみ)。",
};

// ============================================================
// instrument-level: L1 entry も description 追加
// ============================================================
const L1_DESCRIPTIONS: Record<string, { description_long: string; description_short: string; reference: string }> = {
  "NEO": {
    description_long: "**IPIP-NEO-300** は Big Five 性格理論 5 因子 (神経症傾向 / 外向性 / 開放性 / 協調性 / 誠実性) を各 6 facet × 10 項目で詳細測定する、300 項目の包括的性格検査。\n\nCosta & McCrae (1992) の商用 NEO-PI-R を Goldberg (1999) が public domain 化し、現在 IPIP の旗艦尺度のひとつ。心理学研究で最も引用される性格モデルの実装で、α = 0.81-0.90、再テスト信頼性 r = 0.83-0.91 (2年間) と高い精度。\n\n**得られる情報**:\n\n- 5 因子の総合スコア (= 大局的性格プロファイル)\n- 30 facet の細分スコア (= 同じ因子内でも個人差が出る部分の特定)\n- 因子間バランス (= 例: 高 N + 低 C は燃え尽きリスク等の組合せ解釈)",
    description_short: "IPIP-NEO-300 (300項目)。Big Five 5因子 × 30 facet。",
    reference: "Goldberg (1999) IPIP / Costa & McCrae (1992) NEO-PI-R. Johnson (2014) IPIP-NEO-120 短縮版。",
  },
  "HEXACO_PI": {
    description_long: "**HEXACO-PI-R (IPIP 版)** は Big Five に **Honesty-Humility (正直さ-謙虚さ)** を加えた **6 因子モデル** を 24 facet × 10 項目 = 240 項目で測定する性格検査。\n\nLee & Ashton (2004) が言語横断的因子分析から発見した第 6 因子は、Big Five の Agreeableness とは独立した「他者を搾取しない傾向」を捉え、ダークトライアド (マキャベリズム/ナルシシズム/サイコパシー) と強い負の相関を示すことが報告されている (Lee et al., 2013)。\n\nBig Five を補完したい場合や、組織における倫理的行動の予測に有用。",
    description_short: "HEXACO-PI-R (240項目)。Big Five + Honesty-Humility の 6 因子 × 24 facet。",
    reference: "Lee & Ashton (2004) The HEXACO Personality Inventory. Ashton & Lee (2007) Empirical, theoretical, and practical advantages of the HEXACO model.",
  },
  "BFAS": {
    description_long: "**Big Five Aspect Scales (BFAS)** は Big Five 5 因子をそれぞれ **2 aspect** に分解する中粒度モデル (= 100 項目)。\n\nDeYoung, Quilty & Peterson (2007) が NEO-PI-R の 30 facet を主成分分析で集約し、各因子内に統計的に独立な 2 つの aspect が存在することを実証 (例: Neuroticism = Volatility (感情の起伏) + Withdrawal (引きこもり傾向))。30 facet ほど細かくないが、Big Five 5 つよりは細かい、というバランス。\n\n項目数 100 で受験負荷が低く、研究・実務両方で広く採用されている。",
    description_short: "BFAS (100項目)。Big Five 各因子 × 2 aspect (合計 10 aspect)。",
    reference: "DeYoung, Quilty & Peterson (2007) Between facets and domains: 10 aspects of the Big Five. JPSP.",
  },
  "6FPQ": {
    description_long: "**Six Factor Personality Questionnaire (6FPQ)** は Jackson (1996) の **6 因子モデル** を 6 因子 × (10 項目主尺度 + 3 sub-facet × 8-10 項目) で測定。\n\n6 因子: Extraversion (外向性) / Agreeableness (協調性) / Methodicalness (几帳面さ) / Independence (独立性) / Intellectual Openness (知的開放性) / Industriousness (勤勉性)。Big Five に近いが Industriousness を独立因子化し、Conscientiousness を分解した点が特徴。\n\nIPIP では主尺度と各 sub-facet を独立して受験可能 (= 同じ概念を異なる item set で測る設計)。",
    description_short: "6FPQ。Jackson (1996) の 6 因子モデル × 3 sub-facet。",
    reference: "Jackson, Paunonen, Fraboni & Goffin (1996) A five-factor versus six-factor model of personality structure.",
  },
  "TCI": {
    description_long: "**Temperament and Character Inventory (TCI)** は Cloninger (1993) の **神経生物学ベース 7 因子モデル**。\n\n**Temperament 4 因子** (生得的、ドーパミン/セロトニン/ノルアドレナリン経路に対応):\n- Novelty-Seeking (新奇追求)\n- Harm Avoidance (損害回避)\n- Reward Dependence (報酬依存)\n- Persistence (持続性)\n\n**Character 3 因子** (成熟により発達):\n- Self-Directedness (自己志向性)\n- Cooperativeness (協調性)\n- Self-Transcendence (自己超越)\n\n精神医学領域での適用が多く、人格障害との関連研究が豊富。",
    description_short: "TCI。Cloninger の 7 因子 (Temperament 4 + Character 3) × facet。",
    reference: "Cloninger, Svrakic & Przybeck (1993) A psychobiological model of temperament and character.",
  },
  "VIA": {
    description_long: "**VIA Character Strengths Inventory** は Peterson & Seligman (2004) のポジティブ心理学を体現する **24 強み × 6 美徳** モデル。\n\n**6 美徳** (= 文化横断的に重視される徳):\n- Wisdom (知恵) - Curiosity / Love of Learning / Judgment / Originality / Perspective\n- Courage (勇気) - Valor / Persistence / Integrity / Zest\n- Humanity (人間性) - Capacity for Love / Kindness / Social Intelligence\n- Justice (正義) - Citizenship / Equity / Leadership\n- Temperance (節度) - Forgiveness / Modesty / Prudence / Self-regulation\n- Transcendence (超越) - Appreciation of Beauty / Gratitude / Hope / Humor / Spirituality\n\n「弱みを直す」ではなく「強みを活かす」アプローチに使う。",
    description_short: "VIA。Peterson & Seligman (2004) の 24 強み × 6 美徳。",
    reference: "Peterson & Seligman (2004) Character Strengths and Virtues: A Handbook and Classification.",
  },
  "16PF": {
    description_long: "**Cattell の 16 Personality Factor Questionnaire (16PF)** は因子分析で抽出された **基本性格 16 因子** を測定。\n\nWarmth (温かさ) / Reasoning (推論力) / Emotional Stability (情緒安定性) / Dominance (支配性) / Liveliness (活発さ) / Rule-Consciousness (規則意識) / Social Boldness (社会的大胆さ) / Sensitivity (感受性) / Vigilance (警戒心) / Abstractedness (抽象性) / Privateness (内秘性) / Apprehension (不安傾向) / Openness to Change (変化開放性) / Self-Reliance (自己依拠) / Perfectionism (完璧主義) / Tension (緊張)。\n\nBig Five 提唱以前の代表的多因子モデル。臨床・産業領域で歴史的に広く使用。",
    description_short: "16PF。Cattell の因子分析ベース 16 基本性格因子。",
    reference: "Cattell, Eber & Tatsuoka (1970) Handbook for the 16PF.",
  },
  "CPI": {
    description_long: "**California Psychological Inventory (CPI)** は Gough (1957) の **実用志向性格検査**。職場・教育・臨床現場で「他者から見た自分」を捉えるため、社会的に観察可能な行動傾向を 33 scale で測定。\n\n代表的 scale: Dominance / Capacity for Status / Sociability / Self-Acceptance / Responsibility / Socialization / Self-Control / Tolerance / Achievement via Independence など。\n\n採用選考・管理職評価・適性診断での運用実績が豊富。",
    description_short: "CPI (Gough 1957)。職場・教育向け実用志向 33 scale。",
    reference: "Gough (1957) California Psychological Inventory Manual.",
  },
  "JPI": {
    description_long: "**Jackson Personality Inventory-Revised (JPI-R)** は Murray (1938) の **ニーズ理論** をベースに 15 性格次元を測定。\n\n認知 / 情緒 / 対人 / 価値志向の 4 領域:\n- 認知: Complexity / Breadth of Interest / Innovation / Tolerance\n- 情緒: Empathy / Anxiety / Cooperativeness\n- 対人: Sociability / Social Confidence / Energy Level / Social Astuteness / Risk Taking\n- 価値: Organization / Traditional Values / Responsibility",
    description_short: "JPI-R。Jackson の 15 性格次元 (Murray ニーズ理論ベース)。",
    reference: "Jackson (1994) Jackson Personality Inventory-Revised Manual.",
  },
  "MPQ": {
    description_long: "**Multidimensional Personality Questionnaire (MPQ)** は Tellegen (1982) の **3 つの上位因子 + 11 primary scale** モデル。\n\n上位因子: Positive Emotionality (PEM) / Negative Emotionality (NEM) / Constraint (CON)。\nPrimary scale: Wellbeing / Social Potency / Achievement / Social Closeness / Stress Reaction / Aggression / Alienation / Control / Harmavoidance / Traditionalism / Absorption + 妥当性 scale (Unlikely Virtues)。\n\n双子研究で遺伝率 0.40-0.60 が報告されており、行動遺伝学領域の標準的尺度のひとつ。",
    description_short: "MPQ (Tellegen)。3 上位因子 + 11 primary scale。",
    reference: "Tellegen (1982) Brief Manual for the MPQ. Patrick, Curtin & Tellegen (2002) MPQ-BF.",
  },
  "HPI": {
    description_long: "**Hogan Personality Inventory (HPI)** は **職場適応・組織行動の予測** に特化した性格検査。Big Five を基盤としつつ、職務パフォーマンスとの関連を意識した 7 primary scale を持つ。\n\n7 主要 scale: Adjustment (適応) / Ambition (野心) / Sociability (社交性) / Likeability (好感度) / Prudence (慎重さ) / Intellectance (知的探求心) / School Success (学業成功)。\n\n人事・採用での運用実績が豊富。HIC (Homogeneous Item Composite) サブ単位は別途 HPI-HIC inventory として 43 細分尺度を提供。",
    description_short: "HPI (Hogan)。職場予測特化の 7 主要 scale。",
    reference: "Hogan & Hogan (2007) Hogan Personality Inventory Manual.",
  },
  "HPI-HIC": {
    description_long: "**HPI Homogeneous Item Composite (HIC)** は HPI の各主要 scale をさらに細分した **43 sub-construct**。\n\n例: Adjustment 主尺度の下に「Not Anxious」「No Guilt」「Calmness」「Even-tempered」「No Somatic Complaints」など、より specific な側面を測定する HIC。\n\n臨床・研究で specific facet を狙う場合に有用。",
    description_short: "HPI-HIC。HPI 7 主要 scale の細分 43 HIC。",
    reference: "Hogan & Hogan (2007) HPI Manual (HIC subscales)。",
  },
  "AB5C": {
    description_long: "**Abridged Big Five Circumplex (AB5C)** は Hofstee & de Raad (1992) の **Big Five 各因子を 2 軸組合せた 45 中粒度 facet** モデル。\n\nI (Extraversion), II (Agreeableness), III (Conscientiousness), IV (Emotional Stability), V (Intellect) の Big Five 5 因子について、(I+, I-) (II+, II-) … の +/- 方向 10 半軸を 2 つずつ組合せて 45 facet を生成。\n\n例:\n- I+/II+ = Friendliness (= 外向 ∩ 協調)\n- I+/III+ = Assertiveness (= 外向 ∩ 誠実)\n- IV+/I+ = Happiness (= 安定 ∩ 外向)\n\nBig Five 因子の「混合領域」を可視化する独特のフレーム。",
    description_short: "AB5C。Big Five 5因子の 2 軸組合せ 45 中粒度 facet。",
    reference: "Hofstee, de Raad & Goldberg (1992) Integration of the Big Five and circumplex approaches to trait structure. JPSP.",
  },
  "Barchard2001": {
    description_long: "**Barchard (2001) Emotional Intelligence Scale** は感情知能 (Emotional Intelligence) を 7 facet で測定する IPIP 公開尺度。\n\n7 facet:\n- Positive Expressivity (肯定的感情表出)\n- Negative Expressivity (否定的感情表出)\n- Attending to Emotions (感情への注意)\n- Emotion-based Decision-making (感情に基づく意思決定)\n- Responsive Joy (他者の喜びへの共鳴)\n- Responsive Distress (他者の苦痛への共鳴)\n- Empathic Concern (共感的配慮)\n\n感情の表出 / 注意 / 意思決定 / 共感の 4 領域を網羅。",
    description_short: "Barchard 2001 EI Scale。感情知能の 7 facet。",
    reference: "Barchard (2001) Seven Components Potentially Related to Emotional Intelligence. Educational and Psychological Measurement.",
  },
  "IPIP-IPC": {
    description_long: "**IPIP Interpersonal Circumplex (IPIP-IPC)** は対人行動を **支配-服従 軸 × 親密-冷淡 軸** の 2 次元円環上に配置した 8 octant モデル。\n\n8 octant (時計回り):\n- PA: Assured-Dominant (自信・支配的)\n- BC: Arrogant-Calculating (傲慢・打算的)\n- DE: Cold-Hearted (冷淡)\n- FG: Aloof-Introverted (よそよそしい・内向的)\n- HI: Unassured-Submissive (自信なし・従属的)\n- JK: Unassuming-Ingenuous (控えめ・素直)\n- LM: Warm-Agreeable (温かい・協調的)\n- NO: Gregarious-Extraverted (群居・外向的)\n\n対人関係パターンの可視化に有用。Wiggins (1979) IAS の系譜。",
    description_short: "IPIP-IPC。対人行動円環 8 octant モデル。",
    reference: "Markey & Markey (2009) A brief assessment of the interpersonal circumplex: The IPIP-IPC.",
  },
  "CAT-PD": {
    description_long: "**Computerized Adaptive Test of Personality Disorder (CAT-PD)** は Simms et al. (2011) のパーソナリティ障害ディメンション 33 facet モデル。\n\nDSM-5 Section III に近い適応的次元アプローチで、Negative Affectivity / Detachment / Antagonism / Disinhibition / Psychoticism の 5 上位領域下に 33 細分 facet (= Anger / Anxiousness / Anhedonia / Callousness / Manipulativeness / Risk Taking / Peculiarity 等)。\n\n臨床的水準のパーソナリティ機能不全を次元的に捉える。",
    description_short: "CAT-PD。DSM-5 Section III 系のパーソナリティ障害 33 facet。",
    reference: "Simms, Goldberg, Roberts, Watson, Welte & Rotterman (2011) Computerized adaptive assessment of personality disorder. JPD.",
  },
  "ORAIS": {
    description_long: "**Oregon Avocational Interest Scales (ORAIS)** は Goldberg (2010) が開発した **余暇・趣味活動への興味** を 33 領域で測定する尺度。\n\n例: Sports / Music / Reading / Travel / Cooking / Gardening / Drinking / Game-Playing / Pets / Volunteering 等、日常生活の non-vocational activities。\n\n性格特性と余暇選択の関連研究、ライフスタイル profiling に用いる。",
    description_short: "ORAIS (Goldberg 2010)。余暇活動 33 領域の興味。",
    reference: "Goldberg (2010) Personality, demographics, and self-reported behavioral acts: The development of avocational interest scales.",
  },
  "ORVIS": {
    description_long: "**Oregon Vocational Interest Scales (ORVIS)** は Pozzebon et al. (2010) の **職業興味 8 領域** モデル。\n\nHolland (1959) RIASEC モデルの発展形で、Leadership / Organization / Altruism / Creativity / Analysis / Production / Adventure / Erudition を測定。\n\n進路指導・キャリアカウンセリングに用いる。",
    description_short: "ORVIS (Pozzebon 2010)。職業興味 8 領域 (Holland RIASEC 発展形)。",
    reference: "Pozzebon, Visser, Ashton, Lee & Goldberg (2010) Psychometric characteristics of a public-domain self-report measure of vocational interests.",
  },
  "Levenson1981": {
    description_long: "**Levenson Locus of Control (1981)** は Rotter (1966) の Internal-External 2 極モデルを **3 次元** に拡張した尺度。\n\n3 次元:\n- Internal (内的統制): 自分の行動が結果を生むという信念\n- Powerful Others (他者統制): 結果は権力ある他者が決めるという信念\n- Chance (偶然性): 結果は運や偶然で決まるという信念\n\n単純な Internal-External 二分法では捉えきれない「外部要因の中身」を区別できる点が利点。臨床・産業領域で広く使用。",
    description_short: "Levenson 1981。統制の所在 3 次元 (内的/他者/偶然)。",
    reference: "Levenson (1981) Differentiating among internality, powerful others, and chance. Research with the Locus of Control Construct.",
  },
  "Rosenberg1965": {
    description_long: "**Rosenberg Self-Esteem Scale (1965)** は 10 項目で **全般的な自尊感情** を測定する、世界で最も広く使用されている自尊感情尺度。\n\n自尊感情 (Self-Esteem) とは自分自身の価値についての総合評価。Rosenberg 博士が 1965 年に開発、以降 60 年で 50,000+ 引用。Cronbach's α = 0.77-0.88、再テスト信頼性 r = 0.82-0.85。\n\n低自尊感情は将来のうつ病 (r = -0.64) や不安症 (r = -0.33) を縦断的に予測する一方、認知行動療法・自己コンパッション療法で改善可能なことが示されている。",
    description_short: "Rosenberg 自尊感情尺度 (10項目)。50,000+ 引用、世界最頻使用。",
    reference: "Rosenberg (1965) Society and the adolescent self-image. Princeton University Press.",
  },
  "Scheier1994": {
    description_long: "**Life Orientation Test-Revised (LOT-R, Scheier 1994)** は **性格特性的楽観性 (dispositional optimism)** を測定する 10 項目尺度。\n\n楽観性は「将来に良い結果を期待する一般的傾向」と定義され、健康・幸福・対処行動の予測因子として確立。α = 0.78、再テスト信頼性 r = 0.79 (4 ヶ月)。\n\n臨床的悲観傾向の screening、健康行動研究で広く用いられる。",
    description_short: "LOT-R (Scheier 1994)。性格特性的楽観性。",
    reference: "Scheier, Carver & Bridges (1994) Distinguishing optimism from neuroticism: A reevaluation of the LOT.",
  },
  "Snyder1974": {
    description_long: "**Self-Monitoring Scale (Snyder 1974)** は **社会的状況に応じて自己呈示を調整する傾向** を測定。\n\n高 self-monitor は状況や相手に合わせて行動を柔軟に変える「カメレオン」型、低 self-monitor は状況に関わらず内的価値観に従う「一貫性」型。\n\n対人関係・リーダーシップ・職業選択の研究で広く使用。",
    description_short: "Self-Monitoring (Snyder 1974)。社会的状況での自己呈示調整。",
    reference: "Snyder (1974) Self-monitoring of expressive behavior. JPSP.",
  },
  "Cacioppo1982": {
    description_long: "**Need for Cognition Scale (NCS, Cacioppo & Petty 1982)** は **考えること自体を楽しみ求める傾向** を測定。\n\n高 NCS は複雑な問題・抽象的議論・情報処理を内発的に好み、説得・態度形成研究で **中央処理経路** (= elaboration likelihood model の central route) を取りやすい個人差として知られる。教育・組織行動領域で広く使用。",
    description_short: "Need for Cognition (Cacioppo 1982)。考えること自体への動機。",
    reference: "Cacioppo & Petty (1982) The need for cognition. JPSP.",
  },
  "Buss1980": {
    description_long: "**Self-Consciousness Scale (Buss & Scheier 1980)** は **3 因子モデル**:\n\n- Private Self-Consciousness (私的自己意識): 自分の内的感情・思考への注意\n- Public Self-Consciousness (公的自己意識): 他者から見られる自分への注意\n- Social Anxiety (社会的不安): 公的場面での緊張\n\n臨床・対人関係研究で標準的に使用。",
    description_short: "Buss & Scheier 1980。自己意識 3 因子 (私的 / 公的 / 社会的不安)。",
    reference: "Fenigstein, Scheier & Buss (1975) Public and private self-consciousness. JCCP. (Buss 1980 expansion.)",
  },
  "Chapman1986": {
    description_long: "**Hypomanic Personality Scale (HPS, Eckblad & Chapman 1986)** は **軽躁傾向 (hypomanic personality)** を測定し、双極性障害発症リスクの指標として使われる。\n\n2 facet: Hypomanic Mood Intensity (気分の強度・変動) / Hypomanic Exhibitionism (誇大・顕示傾向)。\n\n臨床リスク screening 用途。",
    description_short: "Chapman 1986 HPS。軽躁傾向の 2 facet。",
    reference: "Eckblad & Chapman (1986) Development and validation of a scale for hypomanic personality. JAP.",
  },
  "Span2002": {
    description_long: "**Span et al. (2002) ADHD Self-Report Scale 系統** の成人 ADHD 傾向 screening 尺度。\n\n注意維持の困難 / 衝動性 / 過活動 etc を一次元で捉える。臨床診断ではなく screening 目的。",
    description_short: "Span 2002 ADHD screening。成人 ADHD 傾向。",
    reference: "Span, Earleywine & Strybel (2002) Confirming the factor structure of the ASRS.",
  },
  "Radloff1977": {
    description_long: "**CES-D (Center for Epidemiologic Studies Depression Scale, Radloff 1977)** は **一般人口向け抑うつ scale**。\n\n精神科患者ではなく地域住民の抑うつ症状を測定する目的で開発、20 項目で過去 1 週間の症状頻度を 4 段階で評定。臨床診断ではなく screening 用途。\n\n日本語版含め多言語版あり、疫学研究で広く使用。",
    description_short: "CES-D (Radloff 1977)。一般人口向け抑うつ screening。",
    reference: "Radloff (1977) The CES-D Scale: A self-report depression scale for research in the general population.",
  },
  "Foa1998": {
    description_long: "**Foa et al. (1998) Padua Inventory 系統** の強迫関連尺度。「秩序と清潔さへの欲求」「完璧主義」など強迫スペクトラム傾向を測定。",
    description_short: "Foa 1998 Padua 系。強迫関連 (秩序欲求・完璧主義)。",
    reference: "Foa, Kozak, Salkovskis, Coles & Amir (1998) The validation of a new obsessive-compulsive disorder scale: The OCI.",
  },
  "Foa2002": {
    description_long: "**Obsessive-Compulsive Inventory (OCI, Foa et al. 2002)** は強迫症状の screening 尺度。確認・洗浄・秩序・思考侵入等の subscale。臨床診断ではなく screening。",
    description_short: "OCI (Foa 2002)。強迫症状 screening。",
    reference: "Foa, Huppert, Leiberg, Langner, Kichic, Hajcak & Salkovskis (2002) The OCI: Development and validation of a short version.",
  },
  "Hoyle2002": {
    description_long: "**Hoyle et al. (2002) Brief Sensation Seeking Scale (BSSS)** は **リスク追求傾向** を 3 サブタイプ + 統合で測定。\n\n3 サブタイプ:\n- Sensation-Seeking Calculated (計算ずく)\n- Sensation-Seeking Dangerous (危険志向)\n- Sensation-Seeking Impulsive (衝動的)\n\nリスク行動 (= 違法薬物・無謀運転・性的リスク等) との関連研究で広く使用。",
    description_short: "BSSS (Hoyle 2002)。リスク追求 3 サブタイプ + 統合。",
    reference: "Hoyle, Stephenson, Palmgreen, Lorch & Donohew (2002) Reliability and validity of a brief measure of sensation seeking.",
  },
  "Goldberg1999": {
    description_long: "**Multidimensional Dissociation Scale (Goldberg 1999)** は **解離傾向** を 3 facet で測定。\n\n3 facet:\n- Dissociation Absorption (没入)\n- Dissociation Amnesia (健忘)\n- Dissociation Depersonalization (離人感)\n\n全体スケール + 短縮版あり。臨床的解離障害ではなく、健常範囲の解離傾向を捉える。",
    description_short: "Goldberg 1999 Dissociation。解離傾向 3 facet。",
    reference: "Goldberg (1999) Multidimensional Dissociation Scale. International Personality Item Pool.",
  },
  "BIDR": {
    description_long: "**Balanced Inventory of Desirable Responding (BIDR, Paulhus 1991)** は **社会的望ましさバイアス** を 2 facet で測定する妥当性尺度。\n\n- Impression Management (印象操作): 意識的に好印象を作ろうとする傾向\n- Self-Deception (自己欺瞞): 自分自身を肯定的に歪めて知覚する傾向\n\n他の質問紙の回答バイアス補正、被験者選別に用いる。IPIP 版では Cognitive-Failures も別 subscale で含む。",
    description_short: "BIDR (Paulhus 1991)。社会的望ましさバイアス 2 facet + Cognitive-Failures。",
    reference: "Paulhus (1991) Measurement and control of response bias. In Robinson, Shaver & Wrightsman (Eds.), Measures of personality and social psychological attitudes.",
  },
  "BIS_BAS": {
    description_long: "**BIS/BAS Scales (Carver & White 1994)** は Gray (1981) の **Reinforcement Sensitivity Theory** に基づく 2 system モデル。\n\n- **BIS (Behavioral Inhibition System)**: 罰・脅威への感度 (= Anxiety / 不安神経機構)\n- **BAS (Behavioral Activation System)** = 報酬接近系、3 sub-scale で測定:\n  - BAS-Drive (Ambition/Drive): 目標追求の積極性\n  - BAS-Fun-seeking (Risk-taking/Sensation-Seeking): 新規・楽しい刺激への接近\n  - BAS-Reward-Responsiveness (Excitement-seeking): 報酬獲得時の反応性\n\n動機づけ・情動研究の標準尺度。",
    description_short: "BIS/BAS (Carver & White 1994)。罰回避 (BIS) + 報酬接近 (BAS) の 2 system。",
    reference: "Carver & White (1994) Behavioral inhibition, behavioral activation, and affective responses to impending reward and punishment. JPSP.",
  },
  "7FACTOR": {
    description_long: "**Tellegen & Waller の 7 因子モデル** は Big Five に **Positive Valence (= 高評価バイアス、誇大傾向)** と **Negative Valence (= 病理的 / 普通でないと思われる行動)** を加えた拡張モデル。\n\n7 因子: Extraversion / Agreeableness / Conscientiousness / Emotional Stability / Intellect / Attractiveness / Negative Valence。\n\n「自己評価における歪み」を独立次元として扱う点が特徴。",
    description_short: "Tellegen & Waller 7 因子。Big Five + 評価バイアス (Positive/Negative Valence)。",
    reference: "Tellegen & Waller (1987) Re-examining basic dimensions of natural language trait descriptors.",
  },
};

// ============================================================
// existing scale-descriptions.json から hand-crafted entry を preserve
// ============================================================
type ScaleDescEntry = {
  scale_id: string;
  description_long?: string | null;
  description_short?: string | null;
  reference?: string | null;
  source_url?: string | null;
  threshold_low?: number | null;
  threshold_high?: number | null;
  threshold_kind?: string | null;
  interpretations?: Array<{
    band: string;
    interpretation_long?: string | null;
    interpretation_short?: string | null;
    caveat?: string | null;
  }>;
};

// hand-crafted entry の優先順位:
//   1. scale-descriptions-handcraft.json (= 専用ファイル、Phase B literature 引用版)
//   2. 既存 scale-descriptions.json (= 前回の neo_anxiety pilot 等、未移行分)
const existingEntries = new Map<string, ScaleDescEntry>();
if (existsSync(OUT)) {
  try {
    const ex = JSON.parse(readFileSync(OUT, "utf-8")) as { scales?: ScaleDescEntry[] };
    for (const e of ex.scales ?? []) {
      if (e.scale_id && !isTemplateGenerated(e)) existingEntries.set(e.scale_id, e);
    }
  } catch {}
}
if (existsSync(HANDCRAFT)) {
  try {
    const hc = JSON.parse(readFileSync(HANDCRAFT, "utf-8")) as { scales?: ScaleDescEntry[] };
    for (const e of hc.scales ?? []) {
      if (e.scale_id) existingEntries.set(e.scale_id, e); // override
    }
  } catch {}
}
console.error(`existing hand-crafted: ${existingEntries.size}`);

// template 生成された entry を判定する heuristic:
//   - description_long が template に書いた定型フレーズで始まる
//   - interpretation_short も「{name} 低め」等の定型
function isTemplateGenerated(e: ScaleDescEntry): boolean {
  const dl = e.description_long ?? "";
  // template の特徴的フレーズ
  if (/に属する facet。\d+ 項目 5 段階 Likert、α/.test(dl)) return true;
  if (/の主要尺度のひとつ。\d+ 項目 5 段階 Likert、α/.test(dl)) return true;
  return false;
}

// ============================================================
// template generator
// ============================================================
function genThreshold(items: number): { low: number; high: number; kind: string } {
  // Likert 1-5 想定. 中央 = items × 3. low = items × 2.4 (= 60%以下が low), high = items × 3.6 (= 72%以上が high)
  return {
    low: Math.round(items * 2.4),
    high: Math.round(items * 3.6),
    kind: "equal_split",
  };
}

function genFacetDescription(h: HierRow): string {
  const instJa = glossary.instruments[h.instrument] ?? h.instrument;
  const overview = INSTRUMENT_OVERVIEW[h.instrument] ?? "";
  const nameJa = jaTerm(h.facet_name ?? h.scale_name) ?? (h.facet_name ?? h.scale_name);
  const scaleNameJa = jaTerm(h.scale_name) ?? h.scale_name;
  const alphaStr = h.alpha ? `α = ${h.alpha.toFixed(2)}` : "α 未報告";
  const itemsStr = h.items > 0 ? `${h.items} 項目` : `${childrenMap.get(h.scale_id) ?? 0} 項目 (集約)`;

  if (h.level === 3 && scaleNameJa && nameJa) {
    // facet
    return `**${nameJa}** は **${instJa}** の **${scaleNameJa}** 因子に属する facet。${itemsStr} 5 段階 Likert、${alphaStr}。\n\n**スコアの解釈**\n\n- **高得点**: この facet で測定される傾向が顕著\n- **低得点**: 反対側の傾向 (= 対極の特徴) が顕著\n\n${overview}`;
  }
  // domain (level 2) or single-scale
  return `**${nameJa}** は **${instJa}** の主要尺度のひとつ。${itemsStr} 5 段階 Likert、${alphaStr}。\n\n**スコアの解釈**\n\n- **高得点**: この概念で測定される傾向が顕著\n- **低得点**: 反対側の傾向が顕著\n\n${overview}`;
}

function genShort(h: HierRow): string {
  const nameJa = jaTerm(h.facet_name ?? h.scale_name) ?? (h.facet_name ?? h.scale_name);
  const scaleNameJa = jaTerm(h.scale_name) ?? h.scale_name;
  if (h.level === 3 && scaleNameJa && nameJa && scaleNameJa !== nameJa) {
    return `${scaleNameJa}/${nameJa}。${h.instrument} facet。`;
  }
  return `${nameJa}。${h.instrument} scale。`;
}

function genReference(instrument: string): string {
  if (L1_DESCRIPTIONS[instrument]) return L1_DESCRIPTIONS[instrument].reference;
  return `IPIP (Goldberg, 1999). 出典 IPIP page (source_url 参照)。`;
}

function genInterpretations(h: HierRow, threshold: { low: number; high: number }): ScaleDescEntry["interpretations"] {
  const nameJa = jaTerm(h.facet_name ?? h.scale_name) ?? (h.facet_name ?? h.scale_name) ?? "この尺度";
  return [
    {
      band: "low",
      interpretation_long: `**${nameJa}** で低めの傾向。この特性が個人として相対的に弱く出ているか、あるいは「対極の傾向」が前景化している可能性。日常的な振る舞いで該当する場面が少ないと思われる。`,
      interpretation_short: `${nameJa} 低め`,
      caveat: null,
    },
    {
      band: "mid",
      interpretation_long: `**${nameJa}** で中程度。標準範囲で、状況に応じて柔軟に発現するレベル。極端な傾向は示していない。`,
      interpretation_short: `${nameJa} 中程度`,
      caveat: null,
    },
    {
      band: "high",
      interpretation_long: `**${nameJa}** で高めの傾向。この特性が個人として相対的に強く出ており、関連する行動パターンが日常的に観察されると思われる。`,
      interpretation_short: `${nameJa} 高め`,
      caveat: null,
    },
  ];
}

// ============================================================
// 全 entry 生成
// ============================================================
const allEntries: ScaleDescEntry[] = [];

// L1 instrument 自体 (= scale_hierarchy で level 1) も description 投入
const l1Rows = queryD1(`SELECT scale_id, instrument, source_url FROM scale_hierarchy WHERE level = 1`) as Array<{ scale_id: string; instrument: string; source_url: string | null }>;
for (const l1 of l1Rows) {
  if (existingEntries.has(l1.scale_id)) {
    allEntries.push(existingEntries.get(l1.scale_id)!);
    continue;
  }
  const meta = L1_DESCRIPTIONS[l1.instrument];
  if (meta) {
    allEntries.push({
      scale_id: l1.scale_id,
      description_long: meta.description_long,
      description_short: meta.description_short,
      reference: meta.reference,
      source_url: l1.source_url,
      threshold_low: null,
      threshold_high: null,
      threshold_kind: null,
      interpretations: [],
    });
  }
}

// L2 / L3
for (const h of hier) {
  if (existingEntries.has(h.scale_id)) {
    allEntries.push(existingEntries.get(h.scale_id)!);
    continue;
  }
  const itemsForThreshold = h.items > 0 ? h.items : (childrenMap.get(h.scale_id) ?? 10);
  const t = genThreshold(itemsForThreshold);
  allEntries.push({
    scale_id: h.scale_id,
    description_long: genFacetDescription(h),
    description_short: genShort(h),
    reference: genReference(h.instrument),
    source_url: h.source_url,
    threshold_low: t.low,
    threshold_high: t.high,
    threshold_kind: t.kind,
    interpretations: genInterpretations(h, t),
  });
}

console.error(`generated: ${allEntries.length} entries (hand-crafted: ${existingEntries.size})`);

const output = {
  _note: "Phase 2.x.G.bulk: 全 scale (L1 instrument + L2 domain + L3 facet) に description + threshold + interpretation を投入. hand-crafted entry (= scale_id 既存) は preserve. template entry は generate-scale-descriptions.ts で再生成可能.",
  _format: {
    scale_id: "scale_hierarchy.scale_id 一致",
    description_long: "200-400 字、UI scale intro ページ表示",
    description_short: "30-80 字、月読 LLM context 1 行要約",
    reference: "原著 citation (free text)",
    source_url: "IPIP page or 一次資料 URL",
    threshold_low: "raw score ≤ この値 → 'low' band",
    threshold_high: "raw score ≥ この値 → 'high' band",
    threshold_kind: "'percentile' | 'normed_z' | 'clinical_cutoff' | 'equal_split'",
    interpretations: "band 別 (low/mid/high) の解釈 + 短文 + caveat",
  },
  scales: allEntries,
};

writeFileSync(OUT, JSON.stringify(output, null, 2));
console.error(`wrote ${OUT}`);
