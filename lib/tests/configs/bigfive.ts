import {
  bigFiveQuestions,
  scaleLabels,
  scaleInfo,
} from "@/data/bigfive-questions";
import {
  calculateBigFiveScore,
  validateAnswerPattern,
} from "@/lib/scoring/bigfive";
import type { BigFiveResult } from "@/lib/scoring/bigfive";
import type { TestConfig } from "../types";

/**
 * Big Five (Mini-IPIP) テスト設定
 */
export const bigFiveConfig: TestConfig<BigFiveResult> = {
  id: "bigfive",
  color: "green",
  questions: bigFiveQuestions,
  scaleLabels,
  calculateScore: calculateBigFiveScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
  basePath: "/bigfive",
};
