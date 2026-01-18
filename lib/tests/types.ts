import type { TestType } from "@/lib/storage";

/**
 * 心理尺度の学術的情報
 */
export interface ScaleInfo {
  /** 英語名 */
  name: string;
  /** 日本語名 */
  nameJa: string;
  /** 略称 */
  abbreviation: string;
  /** 測定次元（6次元のいずれか） */
  dimension: string;
  /** 説明文 */
  description: string;
  /** 開発者 */
  developer: string;
  /** 信頼性指標 */
  reliability: {
    /** Cronbach's α */
    cronbachAlpha: string;
    /** 再テスト信頼性 */
    testRetest: string;
  };
  /** 引用論文数 */
  citations: string;
  /** 学術的信頼性ティア */
  tier: string;
  /** 学術的参考文献 */
  academicReference: {
    /** 原著論文 */
    original: string;
    /** 日本語版（あれば） */
    japanese?: string;
  };
  /** スコアリング情報 */
  scoring: {
    /** 最小スコア */
    min: number;
    /** 最大スコア */
    max: number;
    /** 中央値（オプション） */
    neutral?: number;
    /** スコア説明 */
    description: string;
  };
  /** 統計情報 */
  stats: {
    /** 質問数 */
    questions: number;
    /** 所要時間（分） */
    minutes: number;
  };
}

/**
 * 質問データの基本型
 */
export interface BaseQuestion {
  id: number;
  text: string;
  reverse?: boolean;
}

/**
 * テスト設定（各テストの統一インターフェース）
 */
export interface TestConfig<TResult, TQuestion extends BaseQuestion = BaseQuestion> {
  /** テストID */
  id: TestType;
  /** テーマカラー */
  color: "blue" | "pink" | "green" | "orange" | "yellow" | "black";

  /** 質問データ */
  questions: TQuestion[];
  /** 回答スケールのラベル */
  scaleLabels: string[];

  /** スコア計算関数 */
  calculateScore: (answers: number[]) => TResult;
  /** 回答パターンのバリデーション（オプション） */
  validateAnswers?: (answers: number[]) => {
    valid: boolean;
    warning?: string;
  };

  /** 尺度情報 */
  scaleInfo: ScaleInfo;

  /** ベースパス（例: "/sccs"） */
  basePath: string;
}

/**
 * テストレジストリの型
 * 各テストのconfigを一元管理
 */
export type TestRegistry = {
  [K in TestType]: TestConfig<any>;
};
