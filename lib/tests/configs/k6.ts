import { questions, scaleLabels, scaleInfo } from "@/data/k6-questions";
import { getK6Result, type K6Result } from "@/lib/scoring/k6";
import type { TestConfig } from "../types";

/**
 * K6 (Kessler Psychological Distress Scale) テスト設定
 */
export const k6Config: TestConfig<K6Result> = {
  id: "k6",
  color: "cyan",
  questions,
  scaleLabels,
  calculateScore: getK6Result,
  scaleInfo,
  basePath: "/k6",
};
