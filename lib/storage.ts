import { RosenbergResult } from "./scoring/rosenberg";
import { BigFiveResult } from "./scoring/bigfive";
import { SelfConceptResult } from "./scoring/selfconcept";
import { Phq9Result } from "./scoring/phq9";
import { SwlsResult } from "./scoring/swls";
import { K6Result } from "./scoring/k6";
import { IndustriousnessResult } from "./scoring/industriousness";

// ============================================================
// Type Definitions
// ============================================================

/**
 * テストの種類
 */
export type TestType = "rosenberg" | "bigfive" | "selfconcept" | "ecrr" | "phq9" | "gad7" | "pss" | "swls" | "k6" | "industriousness";

/**
 * 汎用テスト結果型
 */
export interface TestResult<T = unknown> {
  result: T;
  answers: number[];
  completedAt: string;
  retakeCount: number;
  testVersion?: string; // テストバージョン (例: "mini-ipip-20", "ipip-120")
}

/**
 * Rosenberg 自尊心テスト結果
 */
export type RosenbergTestResult = TestResult<RosenbergResult>;

/**
 * Big Five 結果
 */
export type BigFiveTestResult = TestResult<BigFiveResult>;

/**
 * Self-Concept Clarity 結果
 */
export type SelfConceptTestResult = TestResult<SelfConceptResult>;

/**
 * ECR-R 愛着スタイル結果（未実装）
 */
export interface EcrRResult {
  anxiety: number;
  avoidance: number;
  attachmentStyle: "secure" | "preoccupied" | "dismissive" | "fearful";
  interpretation: string;
}
export type EcrRTestResult = TestResult<EcrRResult>;

/**
 * PHQ-9 結果
 */
export type Phq9TestResult = TestResult<Phq9Result>;

/**
 * SWLS (人生満足度) 結果
 */
export type SwlsTestResult = TestResult<SwlsResult>;

/**
 * K6 (心理的苦痛) 結果
 */
export type K6TestResult = TestResult<K6Result>;

/**
 * Industriousness (勤勉性) 結果
 */
export type IndustriousnessTestResult = TestResult<IndustriousnessResult>;

/**
 * ユーザープロファイル（複数テストの結果を保持）
 */
export interface UserProfile {
  userId?: string; // 将来的なOAuth対応用
  tests: {
    rosenberg?: RosenbergTestResult;
    bigfive?: BigFiveTestResult;
    selfconcept?: SelfConceptTestResult;
    ecrr?: EcrRTestResult;
    phq9?: Phq9TestResult;
    gad7?: TestResult;
    pss?: TestResult;
    swls?: SwlsTestResult;
    k6?: K6TestResult;
    industriousness?: IndustriousnessTestResult;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string; // データスキーマバージョン
  };
}

// ============================================================
// Legacy Types (Backward Compatibility)
// ============================================================

/**
 * @deprecated Use UserProfile instead
 */
export interface UserData {
  results: {
    // SCCS removed - replaced with selfconcept (IPIP public domain alternative)
  };
  userId: string | null;
}

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY = "psychtest_data";
const PROFILE_STORAGE_KEY = "psychtest_profile_v2";
const CURRENT_VERSION = "2.0.0";

// ============================================================
// Migration Utilities
// ============================================================

/**
 * 旧形式のデータを新形式に変換
 */
function migrateFromLegacy(legacyData: UserData): UserProfile {
  const now = new Date().toISOString();

  const profile: UserProfile = {
    userId: legacyData.userId || undefined,
    tests: {},
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: CURRENT_VERSION,
    },
  };

  // SCCS removed - replaced with selfconcept (IPIP public domain alternative)
  // Legacy SCCS data migration is no longer supported

  return profile;
}

/**
 * 自動マイグレーション
 * 旧形式のデータがあれば新形式に変換して保存
 */
function autoMigrate(): void {
  if (typeof window === "undefined") return;

  try {
    // 新形式が既に存在すればスキップ
    const newData = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (newData) return;

    // 旧形式のデータを確認
    const oldData = localStorage.getItem(STORAGE_KEY);
    if (!oldData) return;

    const legacyData: UserData = JSON.parse(oldData);
    const migratedProfile = migrateFromLegacy(legacyData);

    // 新形式で保存
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(migratedProfile));

    console.log("✅ Data migrated from legacy format to v2");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// ============================================================
// Core Storage API
// ============================================================

/**
 * プロファイル全体を取得
 */
export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  // 自動マイグレーション実行
  autoMigrate();

  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load profile:", error);
    return null;
  }
}

/**
 * プロファイル全体を保存
 */
export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;

  try {
    profile.metadata.updatedAt = new Date().toISOString();
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile:", error);
  }
}

/**
 * テスト結果を保存
 */
export function saveTestResult<T>(
  testType: TestType,
  result: T,
  answers: number[],
  testVersion?: string
): void {
  const profile = getProfile() || createEmptyProfile();

  const existingTest = profile.tests[testType as keyof typeof profile.tests];
  const retakeCount = existingTest ? existingTest.retakeCount + 1 : 0;

  const testResult: TestResult<T> = {
    result,
    answers,
    completedAt: new Date().toISOString(),
    retakeCount,
    testVersion,
  };

  profile.tests[testType as keyof typeof profile.tests] = testResult as any;
  saveProfile(profile);
}

/**
 * 特定のテスト結果を取得
 */
export function getTestResult<T>(testType: TestType): TestResult<T> | null {
  const profile = getProfile();
  if (!profile) return null;

  return (profile.tests[testType as keyof typeof profile.tests] as TestResult<T>) || null;
}

/**
 * 完了済みのテスト一覧を取得
 */
export function getCompletedTests(): TestType[] {
  const profile = getProfile();
  if (!profile) return [];

  // 有効なTestTypeのみをフィルタ（sccsなど古いテストタイプを除外）
  const validTestTypes: TestType[] = ["rosenberg", "bigfive", "selfconcept", "ecrr", "phq9", "gad7", "pss", "swls", "k6", "industriousness"];

  return Object.keys(profile.tests).filter(
    (key) => {
      const isValid = validTestTypes.includes(key as TestType);
      const hasResult = profile.tests[key as keyof typeof profile.tests] !== undefined;
      return isValid && hasResult;
    }
  ) as TestType[];
}

/**
 * プロファイルをクリア
 */
export function clearProfile(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY); // 旧データも削除
}

/**
 * 空のプロファイルを作成
 */
function createEmptyProfile(): UserProfile {
  const now = new Date().toISOString();
  return {
    tests: {},
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: CURRENT_VERSION,
    },
  };
}

// ============================================================
// Export/Import
// ============================================================

/**
 * プロファイルをJSON文字列としてエクスポート
 */
export function exportProfile(): string | null {
  const profile = getProfile();
  if (!profile) return null;

  return JSON.stringify(profile, null, 2);
}

/**
 * JSON文字列からプロファイルをインポート
 */
export function importProfile(jsonData: string): boolean {
  try {
    const profile: UserProfile = JSON.parse(jsonData);

    // バリデーション
    if (!profile.tests || !profile.metadata) {
      throw new Error("Invalid profile format");
    }

    saveProfile(profile);
    return true;
  } catch (error) {
    console.error("Failed to import profile:", error);
    return false;
  }
}

// ============================================================
// Legacy API (Backward Compatibility)
// ============================================================

/**
 * @deprecated Use getProfile() instead
 */
export function loadUserData(): UserData {
  if (typeof window === "undefined") {
    return { results: {}, userId: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { results: {}, userId: null };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load user data:", error);
    return { results: {}, userId: null };
  }
}

/**
 * @deprecated Use saveProfile() instead
 */
export function saveUserData(data: UserData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save user data:", error);
  }
}

/**
 * @deprecated Use getCompletedTests() instead
 * SCCS removed - replaced with selfconcept
 */
export function getAllResults(): Array<never> {
  return [];
}

/**
 * @deprecated Use clearProfile() instead
 */
export function clearAllData(): void {
  clearProfile();
}
