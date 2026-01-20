import {
  rosenbergQuestions,
  scaleOptions,
  scaleInfo,
} from "@/data/rosenberg-questions";
import {
  calculateRosenbergScore,
  validateAnswerPattern,
  type RosenbergResult,
} from "@/lib/scoring/rosenberg";
import type { TestConfig } from "../types";

/**
 * RSES (Rosenberg Self-Esteem Scale) テスト設定
 */
export const rosenbergConfig: TestConfig<RosenbergResult> = {
  id: "rosenberg",
  color: "pink",
  basePath: "/rosenberg",
  questions: rosenbergQuestions,
  scaleOptions,
  calculateScore: calculateRosenbergScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
};
