import {
  rosenbergQuestions,
  scaleLabels,
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
  questions: rosenbergQuestions,
  scaleLabels,
  calculateScore: calculateRosenbergScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
  basePath: "/rosenberg",
};
