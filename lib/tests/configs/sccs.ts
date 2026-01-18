import { sccsQuestions, scaleLabels, scaleInfo } from "@/data/sccs-questions";
import {
  calculateSccsScore,
  validateAnswerPattern,
} from "@/lib/scoring/sccs";
import type { SccsResult } from "@/lib/scoring/sccs";
import type { TestConfig } from "../types";

/**
 * SCCS (Self-Concept Clarity Scale) テスト設定
 */
export const sccsConfig: TestConfig<SccsResult> = {
  id: "sccs",
  color: "blue",
  questions: sccsQuestions,
  scaleLabels,
  calculateScore: calculateSccsScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
  basePath: "/sccs",
};
