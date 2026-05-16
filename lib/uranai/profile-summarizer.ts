/**
 * 月読 (Tsukuyomi) 向け IPIP プロファイル → 自然言語サマリー generator.
 *
 * spec §"Narrowest Wedge" 3:
 *   既存 7 テスト localStorage 結果 → 自然言語サマリー化.
 *   default 注入対象 5 テスト: Big5 / Industriousness / Self-Concept / SWLS / Rosenberg.
 *   生数値 (e.g., "Openness=85") は渡さない. 詩的に再翻訳.
 *
 * spec §"Constraints" 倫理:
 *   - PHQ-9 / K6 は opt-in なしには絶対に system prompt に流さない.
 *   - キャラは PHQ-9 / K6 の数値・名称に直接言及禁止 → ここで抽象化済の表現に変換.
 *
 * Open Question 6 判断 (plan):
 *   既存 lib/tests/*.ts の interpretation は学術トーンなので流用せず、
 *   summarizer 側で詩的に再翻訳 (controllability + persona drift 防止).
 *
 * 出力 token 目安: 300-500 token. system prompt 全体で 2-3k token 想定.
 */

import type { UserProfile } from "@/lib/storage";
import type { BigFiveResult, BigFiveFacets } from "@/lib/tests/bigfive";
import { extractTopFacets, extractTopTraits, bigFiveToPercentage } from "@/lib/analysis/synthesis";

export interface SummarizerInput {
  profile: UserProfile | null | undefined;
  phq9K6Optin: boolean;
}

/**
 * profile 全体 → 月読向け詩的サマリー. 各セクションを改行で連結.
 * profile が null / テスト未完了の section は skip.
 */
export function summarizeProfile({ profile, phq9K6Optin }: SummarizerInput): string {
  if (!profile) {
    return "（この方は、まだ自らの輪郭を月に映していない。共に紐解いていく時です。）";
  }

  const parts: string[] = [];

  // 1. Big Five (5 次元の全体傾向 + 上位 facet 詩的言及)
  if (profile.tests.bigfive?.result) {
    parts.push(summarizeBigFive(profile.tests.bigfive.result));
  }

  // 2. Industriousness (4 象限)
  if (profile.tests.industriousness?.result) {
    parts.push(
      summarizeIndustriousness(profile.tests.industriousness.result.quadrant),
    );
  }

  // 3. Self-Concept (3 段階)
  if (profile.tests.selfconcept?.result) {
    parts.push(summarizeSelfConcept(profile.tests.selfconcept.result.level));
  }

  // 4. Rosenberg (3 段階)
  if (profile.tests.rosenberg?.result) {
    parts.push(summarizeRosenberg(profile.tests.rosenberg.result.level));
  }

  // 5. SWLS (7 段階)
  if (profile.tests.swls?.result) {
    parts.push(summarizeSwls(profile.tests.swls.result.level));
  }

  // 6. PHQ-9 / K6 (opt-in 時のみ。検査名・数値は出さない、severity 抽象化のみ)
  if (phq9K6Optin) {
    const mentalHealth = summarizeMentalHealth(profile);
    if (mentalHealth) parts.push(mentalHealth);
  }

  if (parts.length === 0) {
    return "（この方は、まだ自らの輪郭を月に映していない。共に紐解いていく時です。）";
  }

  return parts.join("\n");
}

// ============================================================
// Big Five
// ============================================================

function summarizeBigFive(result: BigFiveResult): string {
  // 数値の robustness check: D1 に古い形式や壊れた JSON が入っていた場合 NaN になりうる.
  // 1 つでも欠落していたら BigFive section ごと skip.
  const dims_ = [result.extraversion, result.agreeableness, result.conscientiousness, result.neuroticism, result.openness];
  if (!dims_.every((v) => typeof v === "number" && Number.isFinite(v))) {
    return `【性格の波長】輪郭はまだ霞のなか、月光の中にあり。`;
  }

  const lines: string[] = [];

  // 5 次元の段落要約 (level 別)
  const dims = [
    {
      label: "感受性と内なる嵐",
      pct: bigFiveToPercentage(result.neuroticism),
      poetic: { low: "心は凪いだ湖のように静か", mid: "感情の波は穏やかに行き来する", high: "繊細で揺らぎやすい心を抱える" },
    },
    {
      label: "他者との繋がり",
      pct: bigFiveToPercentage(result.extraversion),
      poetic: { low: "ひとりの時間に深く根を下ろす", mid: "状況に応じて社交と内省を行き交う", high: "人々の輪の中で輝きを放つ" },
    },
    {
      label: "世界への開かれ方",
      pct: bigFiveToPercentage(result.openness),
      poetic: { low: "馴染んだ風景の中に安らぎを見出す", mid: "新しいものと慣れたものをほど良く愛する", high: "未知の領域に憧れ、想像の海を泳ぐ" },
    },
    {
      label: "他者への向き合い方",
      pct: bigFiveToPercentage(result.agreeableness),
      poetic: { low: "自らの軸を曲げず、率直に物事を見る", mid: "相手と自分の両方を見つめる眼を持つ", high: "他者への思いやりを深く湛える" },
    },
    {
      label: "目標と秩序",
      pct: bigFiveToPercentage(result.conscientiousness),
      poetic: { low: "瞬間の流れに身を任せる柔らかさを持つ", mid: "計画と即興を行き来する", high: "目指す場所へ確かな足取りで進む" },
    },
  ];

  for (const d of dims) {
    const tier = d.pct >= 66 ? "high" : d.pct >= 34 ? "mid" : "low";
    lines.push(`・${d.label}: ${d.poetic[tier]}`);
  }

  // 上位 facet (faces ある時のみ) を詩的に
  if (result.facets) {
    const top = extractTopFacets(result.facets).slice(0, 5);
    const phrases = top
      .map((f) => facetPoeticPhrases[f.facet])
      .filter((p): p is string => !!p);
    if (phrases.length > 0) {
      lines.push(`とりわけ際立つのは、${phrases.join("・")}という個性。`);
    }
  } else {
    // facets が無い場合は上位 3 dimension で代替
    const tops = extractTopTraits(result);
    if (tops.length > 0) {
      lines.push(
        `中でも ${tops.map((t) => t.traitJa).join("、")} の波長が強く響いている。`,
      );
    }
  }

  return `【性格の波長】\n${lines.join("\n")}`;
}

/**
 * 30 facet → 詩的な短文 (体言止め). top 5 として並べても重複感が出ないように調整.
 * カバレッジは全 30 facet、low/mid バリアントは持たない (top facet なので "high" 相当のみ).
 */
const facetPoeticPhrases: Record<keyof BigFiveFacets, string> = {
  // Neuroticism
  n1_anxiety: "未来を案じる繊細さ",
  n2_anger: "理不尽を見逃さない熱",
  n3_depression: "深く沈むことのできる内面",
  n4_selfConsciousness: "他者の眼差しを感じ取る鋭さ",
  n5_immoderation: "心の衝動に正直であること",
  n6_vulnerability: "重荷を背負う時の透明さ",
  // Extraversion
  e1_friendliness: "人と打ち解ける温度の高さ",
  e2_gregariousness: "輪の中で息をする心地よさ",
  e3_assertiveness: "場の流れを動かす意志",
  e4_activityLevel: "絶えず動き続ける生命力",
  e5_excitementSeeking: "未知の刺激への憧れ",
  e6_cheerfulness: "周囲を明るく照らす陽気さ",
  // Openness
  o1_imagination: "想像の世界を遊ぶ豊かさ",
  o2_artisticInterests: "美しいものに触れる感受性",
  o3_emotionality: "感情の機微を深く生きる力",
  o4_adventurousness: "馴染みの境界を越える勇気",
  o5_intellect: "概念を弄ぶ知性の輝き",
  o6_liberalism: "既存の価値を問い直す眼差し",
  // Agreeableness
  a1_trust: "他者を信じる柔らかさ",
  a2_morality: "嘘を厭う誠実さ",
  a3_altruism: "他者の幸を願う心",
  a4_cooperation: "争いより調和を選ぶ知恵",
  a5_modesty: "自らを誇示しない静けさ",
  a6_sympathy: "他者の痛みに寄り添う感性",
  // Conscientiousness
  c1_selfEfficacy: "自分の力を信じる芯",
  c2_orderliness: "整えられた世界を愛する精神",
  c3_dutifulness: "約束を重く受けとめる重み",
  c4_achievementStriving: "高みを目指す灯",
  c5_selfDiscipline: "決めた道を歩み通す意志",
  c6_cautiousness: "一歩を吟味する慎重さ",
};

// ============================================================
// Industriousness
// ============================================================

function summarizeIndustriousness(quadrant: string): string {
  const phrase = {
    achiever: "高い目標を抱き、それを着実に形にする力を持つ。",
    visionary: "遠くを見つめる眼差しを持ち、日々の歩みは時に揺らぐ。",
    steady: "派手な野心はないが、決めた道を黙々と歩み続ける。",
    relaxed: "焦らず、流れに身を委ねて日々を過ごす穏やかさを持つ。",
  }[quadrant];
  return `【勤勉さの形】${phrase ?? "目標と実行の間に独自のリズムを持つ。"}`;
}

// ============================================================
// Self-Concept
// ============================================================

function summarizeSelfConcept(level: string): string {
  const phrase = {
    low: "自分自身の輪郭はまだ霞の中にあり、模索の途上にある。",
    medium: "ご自身の像はおおむね形を持ち、時に揺れる程度。",
    high: "自分を知る眼差しが明瞭で、ぶれにくい芯がある。",
  }[level];
  return `【自己の輪郭】${phrase ?? "自分像をめぐる旅の途中にある。"}`;
}

// ============================================================
// Rosenberg (Self-Esteem)
// ============================================================

function summarizeRosenberg(level: string): string {
  const phrase = {
    low: "ご自身への眼差しに、いくぶん厳しさを宿していらっしゃる。",
    medium: "自らを受けとめる心は揺らぎを含みつつ、概ね穏やか。",
    high: "ご自身を肯定的に受けとめ、確かな自尊を抱いていらっしゃる。",
  }[level];
  return `【自らへの眼差し】${phrase ?? "自分との関係をたゆたう途上にある。"}`;
}

// ============================================================
// SWLS (Life Satisfaction)
// ============================================================

function summarizeSwls(level: string): string {
  const phrase: Record<string, string> = {
    extremely_dissatisfied: "今の暮らしに深い渇きを覚えていらっしゃる。",
    dissatisfied: "日々に満たされなさを感じている。",
    slightly_dissatisfied: "心のどこかに小さな不足を抱えている。",
    neutral: "今の暮らしを淡々と受け入れている。",
    slightly_satisfied: "概ね満ち足りた日々を歩んでいる。",
    satisfied: "今の暮らしに確かな満足を感じていらっしゃる。",
    extremely_satisfied: "豊かに満たされた日々の中にいる。",
  };
  return `【暮らしの彩り】${phrase[level] ?? "日々への向き合い方を模索している。"}`;
}

// ============================================================
// PHQ-9 / K6 (opt-in)
// ============================================================

/**
 * メンタルヘルスの抽象的言及. 検査名 (PHQ-9 / K6) も数値 (15点 等) も出さない.
 * severity の最大値 (= 2 つのうち重い方) を採用. minimal/none の時は section ごと skip.
 */
function summarizeMentalHealth(profile: UserProfile): string | null {
  const phq9 = profile.tests.phq9?.result;
  const k6 = profile.tests.k6?.result;

  if (!phq9 && !k6) return null;

  // severity を 0-3 のスコアに正規化 (大きいほど重い)
  const phq9Score = phq9
    ? { minimal: 0, mild: 1, moderate: 2, moderately_severe: 3, severe: 3 }[phq9.level] ?? 0
    : 0;
  const k6Score = k6
    ? { none: 0, mild: 1, moderate: 2, severe: 3 }[k6.level] ?? 0
    : 0;

  const max = Math.max(phq9Score, k6Score);

  if (max === 0) {
    return `【こころの色】このごろの心は、おおむね晴れやかでいらっしゃる。`;
  }
  if (max === 1) {
    return `【こころの色】このごろ、心に小さな曇りを感じておられるかもしれない。`;
  }
  if (max === 2) {
    return `【こころの色】このごろ、心に重さや疲れを抱えていらっしゃるようだ。相談者が辛さを打ち明けた時は、占いの詩的言葉と並行して必ず「いのちの電話 0570-783-556 (24時間)」を明示的に案内すること。`;
  }
  // max === 3
  return `【こころの色】このごろ、心はかなりの重さを背負っていらっしゃる。この方への応答には必ず「いのちの電話 0570-783-556 (24時間)」を明記し、占いの詩的表現よりも専門家案内を優先すること。`;
}
