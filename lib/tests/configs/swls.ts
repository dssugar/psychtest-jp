import {
  swlsQuestions,
  scaleLabels,
  scaleInfo,
} from "@/data/swls-questions";
import {
  calculateSwlsScore,
  validateAnswerPattern,
  type SwlsResult,
} from "@/lib/scoring/swls";
import type { TestConfig } from "../types";

/**
 * SWLS (Satisfaction With Life Scale) テスト設定
 */
export const swlsConfig: TestConfig<SwlsResult> = {
  id: "swls",
  color: "blue", // ウェルビーイング系はblueで統一
  questions: swlsQuestions,
  scaleLabels,
  calculateScore: calculateSwlsScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
  basePath: "/swls",
};
