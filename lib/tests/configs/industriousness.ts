import {
  industriousnessQuestions,
  scaleOptions,
  scaleInfo,
} from "@/data/industriousness-questions";
import { calculateIndustriousnessScore } from "@/lib/scoring/industriousness";
import type { IndustriousnessResult } from "@/lib/scoring/industriousness";
import type { TestConfig } from "../types";

/**
 * Industriousness (勤勉性) テスト設定
 */
export const industriousnessConfig: TestConfig<IndustriousnessResult> = {
  id: "industriousness",
  color: "green",
  basePath: "/industriousness",
  questions: industriousnessQuestions,
  scaleOptions,
  calculateScore: calculateIndustriousnessScore,
  scaleInfo,

  // 結果ページ設定
  scoreDisplay: {
    type: "matrix",
  },
  resultExtensions: {
    shareButtons: true,
  },
};
