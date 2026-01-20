import { questions, scaleOptions, scaleInfo, instructionText } from "@/data/k6-questions";
import { getK6Result, type K6Result } from "@/lib/scoring/k6";
import type { TestConfig } from "../types";

/**
 * K6 (Kessler Psychological Distress Scale) テスト設定
 */
export const k6Config: TestConfig<K6Result> = {
  id: "k6",
  color: "cyan",
  basePath: "/k6",
  questions,
  scaleOptions,
  calculateScore: getK6Result,
  scaleInfo,
  headerInstruction: instructionText,

  // 結果ページ設定
  scoreDisplay: {
    type: "progress",
    maxScore: 24,
  },
  resultAlerts: [
    {
      type: "urgent",
      condition: (result: K6Result) => result.totalScore >= 13,
      title: "専門家への相談を推奨します",
      message:
        "あなたのスコアは13点以上です。重度の心理的苦痛が示唆されています。精神科医または心療内科医への受診をご検討ください。",
    },
  ],
  resultExtensions: {
    shareButtons: true,
    treatmentEvidence: true,
  },
};
