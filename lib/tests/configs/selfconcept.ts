import {
  selfConceptQuestions,
  scaleLabels,
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
  questions: selfConceptQuestions,
  scaleLabels,
  calculateScore: calculateSelfConceptScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
  basePath: "/selfconcept",
};
