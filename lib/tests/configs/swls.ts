import {
  swlsQuestions,
  scaleOptions,
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
  basePath: "/swls",
  questions: swlsQuestions,
  scaleOptions,
  calculateScore: calculateSwlsScore,
  validateAnswers: validateAnswerPattern,
  scaleInfo,
  selectedButtonColor: "blue", // SWLSのみ青色ボタン

  // 結果ページ設定
  scoreDisplay: {
    type: "circle",
    maxScore: 35,
  },
  resultExtensions: {
    shareButtons: true,
  },
};
