import {
  bigFiveQuestions,
  scaleOptions,
  scaleInfo,
} from "@/data/bigfive-questions";
import {
  calculateBigFiveScore,
  validateAnswerPattern,
} from "@/lib/scoring/bigfive";
import type { BigFiveResult } from "@/lib/scoring/bigfive";
import type { TestConfig } from "../types";

/**
 * Big Five (IPIP-120) テスト設定
 */
export const bigFiveConfig: TestConfig<BigFiveResult> = {
  id: "bigfive",
  color: "green",
  basePath: "/bigfive",
  questions: bigFiveQuestions,
  scaleOptions,
  calculateScore: calculateBigFiveScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
  testVersion: "ipip-120",
};
