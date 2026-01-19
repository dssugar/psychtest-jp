import { rosenbergConfig } from "./configs/rosenberg";
import { bigFiveConfig } from "./configs/bigfive";
import { selfConceptConfig } from "./configs/selfconcept";
import { phq9Config } from "./configs/phq9";
import { swlsConfig } from "./configs/swls";
import { k6Config } from "./configs/k6";
import type { TestType } from "@/lib/storage";
import type { TestConfig, TestRegistry } from "./types";

/**
 * テストレジストリ
 * 全テストの設定を一元管理
 */
export const testRegistry = {
  rosenberg: rosenbergConfig,
  bigfive: bigFiveConfig,
  selfconcept: selfConceptConfig,
  phq9: phq9Config,
  swls: swlsConfig,
  k6: k6Config,
} as const;

/**
 * テスト設定を取得
 * @param testType テストID
 * @returns テスト設定
 */
export function getTestConfig<T extends keyof typeof testRegistry>(
  testType: T
): (typeof testRegistry)[T] {
  const config = testRegistry[testType];
  if (!config) {
    throw new Error(`Test config not found for: ${testType}`);
  }
  return config;
}

/**
 * 全テスト設定を取得
 * @returns 全テスト設定の配列
 */
export function getAllTestConfigs(): TestConfig<any>[] {
  return Object.values(testRegistry);
}

/**
 * 利用可能なテストIDの一覧を取得
 * @returns テストIDの配列
 */
export function getAvailableTestTypes(): TestType[] {
  return Object.keys(testRegistry) as TestType[];
}
