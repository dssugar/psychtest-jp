import { SccsResult } from "./scoring/sccs";

// ============================================================
// Type Definitions
// ============================================================

/**
 * テストの種類
 */
export type TestType = "sccs" | "rosenberg" | "bigfive" | "ecrr" | "phq9" | "gad7" | "pss";

/**
 * 汎用テスト結果型
 */
export interface TestResult<T = unknown> {
  result: T;
  answers: number[];
  completedAt: string;
  retakeCount: number;
}

/**
 * SCCS 結果（既存）
 */
export type SccsTestResult = TestResult<SccsResult>;

/**
 * Rosenberg 自尊心テスト結果（未実装）
 */
export interface RosenbergResult {
  rawScore: number;
  percentageScore: number;
  level: "very_low" | "low" | "medium" | "high" | "very_high";
  interpretation: string;
}
export type RosenbergTestResult = TestResult<RosenbergResult>;

/**
 * Big Five 結果（未実装）
 */
export interface BigFiveResult {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
  interpretation: string;
}
export type BigFiveTestResult = TestResult<BigFiveResult>;

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
 * ユーザープロファイル（複数テストの結果を保持）
 */
export interface UserProfile {
  userId?: string; // 将来的なOAuth対応用
  tests: {
    sccs?: SccsTestResult;
    rosenberg?: RosenbergTestResult;
    bigfive?: BigFiveTestResult;
    ecrr?: EcrRTestResult;
    phq9?: TestResult;
    gad7?: TestResult;
    pss?: TestResult;
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
    sccs?: {
      testId: "sccs";
      score: number;
      percentageScore: number;
      answers: number[];
      result: SccsResult;
      timestamp: string;
    };
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

  // SCCS データの移行
  if (legacyData.results.sccs) {
    const legacy = legacyData.results.sccs;
    profile.tests.sccs = {
      result: legacy.result,
      answers: legacy.answers,
      completedAt: legacy.timestamp,
      retakeCount: 0, // 初回として扱う
    };
  }

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
  answers: number[]
): void {
  const profile = getProfile() || createEmptyProfile();

  const existingTest = profile.tests[testType as keyof typeof profile.tests];
  const retakeCount = existingTest ? existingTest.retakeCount + 1 : 0;

  const testResult: TestResult<T> = {
    result,
    answers,
    completedAt: new Date().toISOString(),
    retakeCount,
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

  return Object.keys(profile.tests).filter(
    (key) => profile.tests[key as keyof typeof profile.tests] !== undefined
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
 */
export function getAllResults(): Array<{
  testId: "sccs";
  score: number;
  percentageScore: number;
  answers: number[];
  result: SccsResult;
  timestamp: string;
}> {
  const data = loadUserData();
  return Object.values(data.results).filter(
    (result): result is NonNullable<typeof result> => result !== undefined
  );
}

/**
 * @deprecated Use clearProfile() instead
 */
export function clearAllData(): void {
  clearProfile();
}
