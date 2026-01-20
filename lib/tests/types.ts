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
  /** 測定カテゴリ（例: 性格特性、自己認識、メンタルヘルスなど） */
  category: string;
  /** 心理学的層（Trait/State/Outcome/Skillのいずれか） */
  psychologicalLayer: "trait" | "state" | "outcome" | "skill";
  /** @deprecated 旧フィールド - categoryを使用してください */
  dimension?: string;
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
 * 回答選択肢（点数付き）
 */
export interface ScaleOption {
  /** 表示ラベル */
  label: string;
  /** この選択肢の点数（学術的定義による） */
  value: number;
}

/**
 * 質問データの基本型
 */
export interface BaseQuestion {
  id: number;
  text: string;
  reverse?: boolean;
  /** 質問固有の選択肢（オプショナル、なければconfig.scaleOptionsを使用） */
  scaleOptions?: ScaleOption[];
}

/**
 * バリデーション結果（統一型）
 */
export interface ValidationResult {
  /** バリデーションが成功したか */
  valid: boolean;
  /** 警告メッセージ（確認ダイアログ用） */
  warning?: string;
  /** エラーメッセージ（ブロック用） */
  message?: string;
}

/**
 * テスト設定（各テストの統一インターフェース）
 */
export interface TestConfig<TResult, TQuestion extends BaseQuestion = BaseQuestion> {
  /** テストID */
  id: TestType;
  /** テーマカラー */
  color: "blue" | "pink" | "green" | "orange" | "yellow" | "black" | "cyan";
  /** ベースパス（例: "/phq9"） */
  basePath: string;

  /** 質問データ */
  questions: TQuestion[];
  /** デフォルトの回答選択肢（質問ごとに上書き可能） */
  scaleOptions: ScaleOption[];

  /** スコア計算関数 */
  calculateScore: (answers: number[]) => TResult;
  /** 回答パターンのバリデーション（オプション） */
  validateAnswers?: (answers: number[]) => ValidationResult;

  /** 尺度情報 */
  scaleInfo: ScaleInfo;

  // ========================================
  // テストレベルの設定（オプショナル）
  // ========================================
  /** ヘッダーの指示文（K6のinstructionTextなど） */
  headerInstruction?: string;
  /** テストバージョン（BigFive "ipip-120"など） */
  testVersion?: string;
  /** 選択ボタンの色バリエーション（デフォルト: "black"） */
  selectedButtonColor?: "black" | "blue";

  // ========================================
  // 後方互換性（非推奨）
  // ========================================
  /** @deprecated Use scaleOptions instead */
  scaleLabels?: string[];
}

/**
 * テストレジストリの型
 * 各テストのconfigを一元管理
 */
export type TestRegistry = {
  [K in TestType]: TestConfig<any>;
};
