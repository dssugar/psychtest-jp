/**
 * OG画像とResultSummaryCardで共有する型定義
 */

import { DIMENSION_ORDER } from './constants';

/**
 * Big Five 次元キー
 */
export type DimensionKey = typeof DIMENSION_ORDER[number];

/**
 * 次元データ（表示用）
 * 汎用的な型。Big Five以外のテストでも使用可能。
 */
export interface DimensionData {
  key: string;        // 次元キー（例: "extraversion", "total"）
  label: string;      // 日本語名（例: "外向性", "総合スコア"）
  score: number;      // 生スコア（テスト依存）
  percentage: number; // パーセンテージ（0-100）
  color: string;      // カラーコード（例: "#3b82f6"）
}

/**
 * Big Five スコアセット
 */
export interface BigFiveScores {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}

/**
 * ResultSummaryCard / OG画像共通Props
 */
export interface ResultSummaryProps {
  /**
   * 次元データ配列（表示順）
   */
  dimensions: DimensionData[];

  /**
   * 英語タイトル（例: "BIG FIVE"）
   * 改行または空白で分割して2行表示
   */
  titleEn?: string;

  /**
   * カテゴリ（例: "性格特性診断"）
   */
  category: string;

  /**
   * 説明文（例: "科学的根拠に基づいた\n5つの主要特性スコアレポート"）
   * \nで改行
   */
  description?: string;

  /**
   * サイト名（例: "PSYCHOMETRIC LAB"）
   * デフォルト: "PSYCHOMETRIC LAB"
   */
  siteName?: string;

  /** @deprecated Use titleEn instead */
  testName?: string;

  // ============================================================================
  // 🆕 単一スコア専用フィールド（2つの指定方法をサポート）
  // ============================================================================

  /**
   * オプション1: 計算済みデータを直接渡す
   */
  levelLabel?: string;
  shortInterpretation?: string;
  scaleMarkers?: {
    min: ScaleMarker;
    avg: ScaleMarker;
    max: ScaleMarker;
  };

  /**
   * オプション2: configとtestResultを渡して内部で計算
   * この方法を使うと、コンポーネント内部で自動的に計算されます
   */
  config?: any;
  testResult?: any;
}

/**
 * スコアを0-100%に変換するヘルパー型
 */
export type ScoreToPercentage = (score: number, min: number, max: number) => number;

/**
 * OG画像レイアウトタイプ
 */
export type OGLayoutType = 'bar' | 'single' | 'radar' | 'category';

/**
 * スコア表示タイプ
 */
export type ScoreDisplayType = 'raw' | 'percentage' | 'category' | 'range';

/**
 * スケール目盛り設定（単一スコア用）
 */
export interface ScaleMarker {
  value: number;
  label: string;
}

/**
 * 区分境界線設定（単一スコア用）
 * 例: 20点と30点に境界線を引き、10-20に「低め」、20-30に「平均的」、30-40に「高め」を表示
 */
export interface ScoreRange {
  min: number;      // 区間の最小値
  max: number;      // 区間の最大値
  label: string;    // 区間のラベル（例: "低め", "平均的", "高め"）
}

/**
 * OG画像設定（TestConfigに統合）
 */
export interface OGImageConfig {
  /** レイアウトタイプ */
  layoutType: OGLayoutType;
  /** 英語タイトル（例: "BIG FIVE"） */
  titleEn?: string;
  /** カテゴリ（例: "性格特性診断"） */
  category: string;
  /** 説明文（左カラム下部） */
  description?: string;
  /** 次元別カラー（barレイアウト用） */
  colors?: Record<string, string>;
  /** 次元の日本語ラベル（barレイアウト用） */
  dimensionLabels?: Record<string, string>;
  /** 免責事項 */
  disclaimer?: string;

  /** スコア表示設定 */
  scoreDisplay?: {
    /** 表示タイプ */
    type: ScoreDisplayType;
    /** 最小値 */
    min?: number;
    /** 最大値 */
    max?: number;
    /** 単位（例: "点"） */
    unit?: string;
  };

  /**
   * スコアからクエリパラメータへの変換関数
   * 例: { extraversion: 72, agreeableness: 80 } => { e: "72", a: "80" }
   */
  scoreToParams?: (result: any) => Record<string, string>;

  /**
   * クエリパラメータからスコアへの変換関数
   * 例: { e: "72", a: "80" } => { extraversion: 72, agreeableness: 80 }
   * または RosenbergResult などのテスト結果型
   */
  paramsToScore?: (params: URLSearchParams) => any;

  // ============================================================================
  // 🆕 単一スコア専用フィールド（dimensions.length === 1の場合に使用）
  // ============================================================================

  /**
   * レベルラベル取得関数（単一スコア用）
   * 例: "高自尊心 (High Self-Esteem)"
   */
  getLevelLabel?: (result: any) => string;

  /**
   * 短い解釈文取得関数（単一スコア用）
   * 例: "肯定的で安定した自己評価を持っています。"
   * OG画像の下段に表示する2行程度のフィードバック
   */
  getShortInterpretation?: (result: any) => string;

  /**
   * スケール目盛り設定（単一スコア用）
   * バーの下に表示する基準点（Min/Avg/Max）
   * @deprecated scoreRangesを使用してください
   */
  scaleMarkers?: {
    min: ScaleMarker;
    avg: ScaleMarker;
    max: ScaleMarker;
  };

  /**
   * 区分範囲設定（単一スコア用）
   * 境界線とラベルを表示します
   * 例: [{min: 10, max: 20, label: "低め"}, {min: 20, max: 30, label: "平均的"}, {min: 30, max: 40, label: "高め"}]
   */
  scoreRanges?: ScoreRange[];
}
