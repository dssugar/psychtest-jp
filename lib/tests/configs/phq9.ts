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
};
