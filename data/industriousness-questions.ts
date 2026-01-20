/**
 * Industriousness (勤勉性) - IPIP-300 C4+C5
 *
 * Public Domain (IPIP)
 * DeYoung, C. G., Quilty, L. C., & Peterson, J. B. (2007). Between facets and domains:
 * 10 aspects of the Big Five. Journal of Personality and Social Psychology, 93(5), 880-896.
 *
 * Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item
 * public domain inventory: Development of the IPIP-NEO-120. Journal of Research in Personality, 51, 78-89.
 *
 * 20項目、5点リッカート尺度
 * 2つのサブスケール:
 * - C4: Achievement Striving (達成動機) - 10項目
 * - C5: Self-Discipline (自己鍛錬) - 10項目
 *
 * 日本語版: Omar Karlin, Ph.D. (Tokai University)
 * https://ipip.ori.org/JapaneseIPIP-NEOFacets.htm
 */

import type { BaseQuestion, ScaleInfo } from "@/lib/tests/types";

export interface IndustriousnessQuestion extends BaseQuestion {
  originalId: number; // IPIP-300 item number (271-290)
  textEn: string;
  subscale: "c4_achievement" | "c5_discipline";
  subscaleLabel: string;
}

/**
 * 5点リッカート尺度
 */
export const scaleLabels = [
  "全く当てはまらない",
  "あまり当てはまらない",
  "どちらとも言えない",
  "やや当てはまる",
  "非常に当てはまる",
];

/**
 * 勤勉性の質問（20項目）
 */
export const industriousnessQuestions: IndustriousnessQuestion[] = [
  {
    id: 1,
    originalId: 271,
    text: "目標に向かって突き進む",
    textEn: "Go straight for the goal",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: false,
  },
  {
    id: 2,
    originalId: 272,
    text: "よく働く",
    textEn: "Work hard",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: false,
  },
  {
    id: 3,
    originalId: 273,
    text: "有言実行である",
    textEn: "Turn plans into actions",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: false,
  },
  {
    id: 4,
    originalId: 274,
    text: "全力で課題に取り組む",
    textEn: "Plunge into tasks with all my heart",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: false,
  },
  {
    id: 5,
    originalId: 275,
    text: "求められていること以上のことをする",
    textEn: "Do more than what's expected of me",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: false,
  },
  {
    id: 6,
    originalId: 276,
    text: "自分にも他人にも厳しい",
    textEn: "Set high standards for myself and others",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: false,
  },
  {
    id: 7,
    originalId: 277,
    text: "質を要求する",
    textEn: "Demand quality",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: false,
  },
  {
    id: 8,
    originalId: 278,
    text: "あまり成功したいと思わない",
    textEn: "Am not highly motivated to succeed",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: true,
  },
  {
    id: 9,
    originalId: 279,
    text: "必要最低限のことしかやらない",
    textEn: "Do just enough work to get by",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: true,
  },
  {
    id: 10,
    originalId: 280,
    text: "仕事に時間と労力を裂きたくない",
    textEn: "Put little time and effort into my work",
    subscale: "c4_achievement",
    subscaleLabel: "達成動機",
    reverse: true,
  },
  {
    id: 11,
    originalId: 281,
    text: "雑用はすぐに済ませる",
    textEn: "Get chores done right away",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: false,
  },
  {
    id: 12,
    originalId: 282,
    text: "常に準備ができている",
    textEn: "Am always prepared",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: false,
  },
  {
    id: 13,
    originalId: 283,
    text: "課題はすぐに着手する",
    textEn: "Start tasks right away",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: false,
  },
  {
    id: 14,
    originalId: 284,
    text: "ただちに仕事にかかる",
    textEn: "Get to work at once",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: false,
  },
  {
    id: 15,
    originalId: 285,
    text: "計画は実行する",
    textEn: "Carry out my plans",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: false,
  },
  {
    id: 16,
    originalId: 286,
    text: "仕事を始める気になれない",
    textEn: "Find it difficult to get down to work",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: true,
  },
  {
    id: 17,
    originalId: 287,
    text: "時間を効率よく使わない",
    textEn: "Waste my time",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: true,
  },
  {
    id: 18,
    originalId: 288,
    text: "きっかけがないと仕事を始められない",
    textEn: "Need a push to get started",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: true,
  },
  {
    id: 19,
    originalId: 289,
    text: "仕事を始めるのが難しい",
    textEn: "Have difficulty starting tasks",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: true,
  },
  {
    id: 20,
    originalId: 290,
    text: "決断を先送りにする",
    textEn: "Postpone decisions",
    subscale: "c5_discipline",
    subscaleLabel: "自己鍛錬",
    reverse: true,
  },
];

/**
 * 尺度情報
 */
export const scaleInfo: ScaleInfo = {
  name: "Industriousness / Grit",
  nameJa: "勤勉性",
  abbreviation: "IND",
  description: "目標達成への意欲と実行力（やり抜く力）を測定する心理特性",
  category: "性格特性",
  psychologicalLayer: "trait",
  developer: "DeYoung, Quilty, & Peterson (2007)",
  reliability: {
    cronbachAlpha: "0.82 (統合), C4: 0.79, C5: 0.85",
    testRetest: "報告なし",
  },
  citations: "10,000+ (IPIP-NEO system)",
  tier: "S",
  academicReference: {
    original:
      "DeYoung, C. G., Quilty, L. C., & Peterson, J. B. (2007). Between facets and domains: 10 aspects of the Big Five. Journal of Personality and Social Psychology, 93(5), 880-896.",
    japanese:
      "Omar Karlin (Tokai University), IPIP Japanese Translation: https://ipip.ori.org/JapaneseIPIP-NEOFacets.htm",
  },
  scoring: {
    min: 20,
    max: 100,
    description:
      "C4 (達成動機): 10-50点、C5 (自己鍛錬): 10-50点。2軸マトリクスで4つの象限を表示。",
  },
  stats: {
    questions: 20,
    minutes: 4,
  },
};
