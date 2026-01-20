import {
  phq9Questions,
  scaleOptions,
  scaleInfo,
} from "@/data/phq9-questions";
import {
  calculatePhq9Score,
  validateAnswerPattern,
  type Phq9Result,
} from "@/lib/scoring/phq9";
import type { TestConfig } from "../types";

/**
 * PHQ-9 (Patient Health Questionnaire-9) テスト設定
 */
export const phq9Config: TestConfig<Phq9Result> = {
  id: "phq9",
  color: "orange", // メンタルヘルス系はorangeで統一
  basePath: "/phq9",
  questions: phq9Questions,
  scaleOptions,
  calculateScore: calculatePhq9Score,
  validateAnswers: validateAnswerPattern,
  scaleInfo,

  // 結果ページ設定
  scoreDisplay: {
    type: "progress",
    maxScore: 27,
  },
  resultAlerts: [
    {
      type: "crisis",
      condition: (result: Phq9Result) => result.suicideRisk === true,
      title: "⚠️ 緊急: 自殺念慮が検出されました",
      message:
        "あなたの回答から、深刻な危機的状況が示唆されています。すぐに専門家に相談するか、以下の相談窓口に連絡してください。",
      contacts: [
        { name: "いのちの電話", number: "0570-783-556" },
        { name: "こころの健康相談統一ダイヤル", number: "0570-064-556" },
      ],
    },
    {
      type: "urgent",
      condition: (result: Phq9Result) => result.requiresUrgentCare === true,
      title: "専門家への相談を推奨します",
      message:
        "あなたのスコアは15点以上です。中等度以上のうつ症状が示唆されています。精神科医または心療内科医への受診をご検討ください。",
    },
  ],
  resultExtensions: {
    shareButtons: true,
  },
};
