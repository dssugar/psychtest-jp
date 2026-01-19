import {
  industriousnessQuestions,
  scaleLabels,
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
  questions: industriousnessQuestions,
  scaleLabels,
  calculateScore: calculateIndustriousnessScore,
  scaleInfo,
  basePath: "/industriousness",
};
