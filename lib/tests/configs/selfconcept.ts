import {
  selfConceptQuestions,
  scaleOptions,
  scaleInfo,
} from "@/data/selfconcept-questions";
import {
  calculateSelfConceptScore,
  validateAnswerPattern,
  type SelfConceptResult,
} from "@/lib/scoring/selfconcept";
import type { TestConfig } from "../types";

/**
 * Self-Concept Clarity Scale テスト設定
 */
export const selfConceptConfig: TestConfig<SelfConceptResult> = {
  id: "selfconcept",
  color: "blue",
  basePath: "/selfconcept",
  questions: selfConceptQuestions,
  scaleOptions,
  calculateScore: calculateSelfConceptScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,

  // 結果ページ設定
  scoreDisplay: {
    type: "circle",
    maxScore: 60,
  },
};
